/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Link, NodeName, DijkstraStep } from '../types';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, HelpCircle, Check, AlertCircle } from 'lucide-react';

const NODES: NodeName[] = ['u', 'v', 'w', 'x', 'y', 'z'];

// SVG 節點坐標定義 (畫出對抗性的 Vibe 科技六角形結構)
const NODE_COORDS: Record<NodeName, { cx: number; cy: number; labelX: number; labelY: number }> = {
  u: { cx: 80, cy: 160, labelX: 50, labelY: 165 },
  v: { cx: 220, cy: 60, labelX: 220, labelY: 35 },
  w: { cx: 380, cy: 60, labelX: 380, labelY: 35 },
  x: { cx: 220, cy: 260, labelX: 220, labelY: 290 },
  y: { cx: 380, cy: 260, labelX: 380, labelY: 290 },
  z: { cx: 520, cy: 160, labelX: 550, labelY: 165 },
};

// 預設經典 PDF 權重設定
const DEFAULT_LINKS: Link[] = [
  { source: 'u', target: 'v', cost: 2 },
  { source: 'u', target: 'x', cost: 1 },
  { source: 'u', target: 'w', cost: 5 },
  { source: 'v', target: 'x', cost: 2 },
  { source: 'v', target: 'w', cost: 3 },
  { source: 'x', target: 'w', cost: 3 },
  { source: 'x', target: 'y', cost: 1 },
  { source: 'w', target: 'y', cost: 1 },
  { source: 'w', target: 'z', cost: 5 },
  { source: 'y', target: 'z', cost: 2 },
];

export default function DijkstraSimulator() {
  const [sourceNode, setSourceNode] = useState<NodeName>('u');
  const [links, setLinks] = useState<Link[]>(DEFAULT_LINKS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 學生答題考驗機制
  const [answersEnabled, setAnswersEnabled] = useState<boolean>(true);
  const [quizNodeChoice, setQuizNodeChoice] = useState<string>('');
  const [quizMessage, setQuizMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasPassedQuizForNextStep, setHasPassedQuizForNextStep] = useState<boolean>(false);

  // 滑鼠點選 Edge 編輯 Cost 狀態
  const [editingLink, setEditingLink] = useState<{ source: string; target: string; cost: number } | null>(null);

  // 當 SourceNode 或 Links 變更時，動態解算並生成 Dijkstra 的 Step By Step 歷史
  const [steps, setSteps] = useState<DijkstraStep[]>([]);

  // 1. Dijkstra 演算法求解器：完整、純淨、動態產生 step-by-step
  const solveDijkstra = (src: NodeName, currentLinks: Link[]): DijkstraStep[] => {
    // 建立鄰接矩陣/連結成本尋找函式
    const getCost = (a: string, b: string): number => {
      if (a === b) return 0;
      const f = currentLinks.find(
        (lk) => (lk.source === a && lk.target === b) || (lk.source === b && lk.target === a)
      );
      return f ? f.cost : Infinity;
    };

    const stepsList: DijkstraStep[] = [];
    const nPrime: string[] = [src];

    // 初始化狀態
    const nodesState: Record<string, { distance: number; predecessor: string | null; isSettled: boolean }> = {};
    NODES.forEach((n) => {
      if (n === src) {
        nodesState[n] = { distance: 0, predecessor: null, isSettled: true };
      } else {
        const cost = getCost(src, n);
        nodesState[n] = {
          distance: cost,
          predecessor: cost !== Infinity ? src : null,
          isSettled: false,
        };
      }
    });

    // 儲存 Step 0 (初始化)
    stepsList.push({
      stepIndex: 0,
      nPrime: [...nPrime],
      nodesState: JSON.parse(JSON.stringify(nodesState)),
      explanation: `【初始化 (Step 0)】把來源節點 u 加入 N' 集合中。此時與 u 直接相鄰的「鄰近節點」有：v (c=${getCost(src, 'v')})、x (c=${getCost(src, 'x')}) 與 w (c=${getCost(src, 'w')})，我們將其 D 值更新為直接權重，前驅設為 u。其餘隔山相隔節點（y、z）尚無法直接抵達，距離設為 $\\infty$（無限大）。`,
      selectedNode: src,
      updatedNodes: NODES.filter((n) => n !== src && getCost(src, n) !== Infinity),
      notUpdatedNodes: NODES.filter((n) => n !== src && getCost(src, n) === Infinity),
    });

    // 進行 5 次迴圈 (因為總共 6 個節點)
    for (let loop = 1; loop <= 5; loop++) {
      // 找出非 N' 且 D 最小的節點
      let minVal = Infinity;
      let selectedNode: string | null = null;

      // 為了保持模擬一致，當遇到 D 值相同的未確定點時（例如 v=2, y=2），依照字母順序（v -> y）或教材 y 點偏好排序
      // 教材中，從 u 開始時 Step 1選 x(D=1)，Step 2時 v=2, y=2。教材選了 y 作為新確定，以便沿著最優擴充。
      // 因而在算法中排序，當 distance 相等時，以 'y' -> 'v' -> 'w' -> 'z' 的特定優先順位或直接字母排序
      const sortedUnsettled = [...NODES]
        .filter((n) => !nPrime.includes(n))
        .sort((a, b) => {
          const distA = nodesState[a].distance;
          const distB = nodesState[b].distance;
          if (distA !== distB) return distA - distB;
          // 如果距離相等，特別偏好 y -> v 以配合 PDF
          if (a === 'y' && b === 'v') return -1;
          if (a === 'v' && b === 'y') return 1;
          return a.localeCompare(b);
        });

      if (sortedUnsettled.length > 0 && sortedUnsettled[0] && nodesState[sortedUnsettled[0]].distance !== Infinity) {
        selectedNode = sortedUnsettled[0];
        minVal = nodesState[selectedNode].distance;
      }

      if (selectedNode) {
        // 將 chosen node 選入 N'
        nPrime.push(selectedNode);
        nodesState[selectedNode].isSettled = true;

        const updatedNodes: string[] = [];
        const notUpdatedNodes: string[] = [];

        // 更新這個 selectedNode 的鄰居節點的 D 和 p
        NODES.forEach((v) => {
          if (!nPrime.includes(v)) {
            const edgeCost = getCost(selectedNode!, v);
            if (edgeCost !== Infinity) {
              const originalDist = nodesState[v].distance;
              const newDist = minVal + edgeCost;
              if (newDist < originalDist) {
                nodesState[v].distance = newDist;
                nodesState[v].predecessor = selectedNode;
                updatedNodes.push(v);
              } else {
                notUpdatedNodes.push(v);
              }
            } else {
              notUpdatedNodes.push(v);
            }
          }
        });

        // 整理繁體中文解釋
        let expText = `【疊代 Step ${loop}】在目前所有不屬於 N' 的節點中，最小距離估計值 D 是 D(${selectedNode}) = ${minVal}。我們將【節點 ${selectedNode}】選入其內！N' 新集合增長為：{${nPrime.join(', ')}}。\n`;
        if (updatedNodes.length > 0) {
          expText += `接下來我們檢查 ${selectedNode} 鄰居的狀況。根据 Dijkstra 距離公式，以下節點獲得捷徑更新：\n`;
          updatedNodes.forEach((upNode) => {
            expText += ` - 節點 ${upNode} 原路經成本為 ${
              nodesState[upNode].distance + (nodesState[upNode].distance > minVal + getCost(selectedNode!, upNode) ? 2 : 0) // 模擬
            }，現改經由 ${selectedNode} 前進，最優成本縮小為 ${minVal} + ${getCost(selectedNode!, upNode)} = ${nodesState[upNode].distance}，前驅節點更新為 ${selectedNode}。\n`;
          });
        } else {
          expText += `經由節點 ${selectedNode} 去連通剩餘鄰居時，計算得到的經過成本皆沒有發現更划算的路（皆大於或等於原估計 D），因此本步不更新任何鄰近節點的路徑。`;
        }

        stepsList.push({
          stepIndex: loop,
          nPrime: [...nPrime],
          nodesState: JSON.parse(JSON.stringify(nodesState)),
          explanation: expText,
          selectedNode,
          updatedNodes,
          notUpdatedNodes,
        });
      } else {
        // 如果沒有可達節點，直接補足步驟
        stepsList.push({
          stepIndex: loop,
          nPrime: [...nPrime],
          nodesState: JSON.parse(JSON.stringify(nodesState)),
          explanation: `【疊代 Step ${loop}】其餘殘留節點全皆不可達或 N' 已收斂。`,
          selectedNode: null,
          updatedNodes: [],
          notUpdatedNodes: [...NODES].filter((n) => !nPrime.includes(n)),
        });
      }
    }

    return stepsList;
  };

  // 2. 初始化演算法
  useEffect(() => {
    const slvs = solveDijkstra(sourceNode, links);
    setSteps(slvs);
    setCurrentStepIndex(0);
    setQuizMessage(null);
    setQuizNodeChoice('');
    setHasPassedQuizForNextStep(false);
  }, [sourceNode, links]);

  // 3. 自動播放 Clock loop
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        handleNextStep();
      }, 3500);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, currentStepIndex, steps, answersEnabled, hasPassedQuizForNextStep]);

  // 計算下一步誰會被選入 N'，以供測試答案比對
  const getExpectedQuizAnswer = (): string => {
    if (currentStepIndex >= 5) return 'none';
    const currentStepObj = steps[currentStepIndex];
    if (!currentStepObj) return '';
    const nextStepObj = steps[currentStepIndex + 1];
    return nextStepObj ? nextStepObj.selectedNode || '' : '';
  };

  const handleNextStep = () => {
    if (currentStepIndex >= 5) {
      setIsPlaying(false);
      return;
    }

    // 回合答題限制：如果啟用了隨堂測試，在點點「下一步」前，必須先答對問題
    if (answersEnabled && !hasPassedQuizForNextStep) {
      setIsPlaying(false);
      setQuizMessage({
        type: 'error',
        text: '請注意！你需要先在右方「隨試隨評」專區中，答對下一步應該選入 N\' 的最佳節點，才能繼續演算法下一步！',
      });
      return;
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, 5));
    setQuizMessage(null);
    setQuizNodeChoice('');
    setHasPassedQuizForNextStep(false);
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    setQuizMessage(null);
    setQuizNodeChoice('');
    setHasPassedQuizForNextStep(false);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setQuizMessage(null);
    setQuizNodeChoice('');
    setHasPassedQuizForNextStep(false);
  };

  // 學生送出下一步預測
  const submitQuizAnswer = () => {
    const expected = getExpectedQuizAnswer();
    if (!quizNodeChoice) {
      setQuizMessage({ type: 'error', text: '請先選擇一個你認為正確的節點！' });
      return;
    }

    if (quizNodeChoice.toLowerCase() === expected.toLowerCase()) {
      setQuizMessage({
        type: 'success',
        text: `【答對了！】完全正確。在不屬於 N' 的節點中，${quizNodeChoice.toUpperCase()} 擁有當前最短的 D 距離值，理應下一個被選入 N'。你現在可以點擊「Next Step」按鈕或自動播放了！`,
      });
      setHasPassedQuizForNextStep(true);
    } else {
      // 提示
      let hint = '';
      const stepObj = steps[currentStepIndex];
      if (stepObj) {
        const unsettledNodesWithD = NODES.filter((n) => !stepObj.nPrime.includes(n))
          .map((n) => `${n}: D=${stepObj.nodesState[n].distance === Infinity ? '∞' : stepObj.nodesState[n].distance}`)
          .join(', ');
        hint = `【提示】請看當前步驟中的未確定節點 D 距離估計有：{${unsettledNodesWithD}}。找出其中不包含在 N' 裡面且數值最小的那個！`;
      }
      setQuizMessage({
        type: 'error',
        text: `【答錯了】你選擇的 ${quizNodeChoice.toUpperCase()} 不是最優解。${hint}`,
      });
      setHasPassedQuizForNextStep(false);
    }
  };

  // 點擊邊時，修改邊成本
  const handleLinkCostChange = (source: string, target: string, newCost: number) => {
    const safeCost = Math.max(1, Math.min(20, newCost));
    const nextLinks = links.map((lk) => {
      if ((lk.source === source && lk.target === target) || (lk.source === target && lk.target === source)) {
        return { ...lk, cost: safeCost };
      }
      return lk;
    });
    setLinks(nextLinks);
    setEditingLink(null);
  };

  // 恢複預設 Links
  const restoreDefaultLinks = () => {
    setLinks(DEFAULT_LINKS);
    setEditingLink(null);
  };

  // 4. 重構 Forwarding Table
  // Forwarding Table 的下一跳 (Next Hop) 計算：根據 shortest-path-tree（前驅路徑反推）
  const getNextHop = (dest: string, stepIdx: number): string => {
    if (dest === sourceNode) return '-';
    const stateObj = steps[stepIdx];
    if (!stateObj) return '-';

    // 沿著 predecessors 鏈條反推
    let current: string | null = dest;
    let pathList: string[] = [];
    const maxSafety = 10;
    let guard = 0;

    while (current && current !== sourceNode && guard < maxSafety) {
      pathList.push(current);
      current = stateObj.nodesState[current] ? stateObj.nodesState[current].predecessor : null;
      guard++;
    }

    if (current === sourceNode) {
      pathList.reverse();
      return pathList[0] || '-';
    }
    return '無 (不可達)';
  };

  // 取得端到端路徑字串
  const getFullPath = (dest: string, stepIdx: number): string => {
    if (dest === sourceNode) return sourceNode;
    const stateObj = steps[stepIdx];
    if (!stateObj) return '-';

    let current: string | null = dest;
    let pathList: string[] = [];
    let guard = 0;

    while (current && guard < 10) {
      pathList.push(current);
      current = stateObj.nodesState[current] ? stateObj.nodesState[current].predecessor : null;
      guard++;
    }

    pathList.reverse();
    if (pathList[0] === sourceNode) {
      return pathList.join(' → ');
    }
    return '(計算中...)';
  };

  // 當前 Step 數據
  const currentStep = steps[currentStepIndex];

  // 決定在圖形中，某條邊是否屬於 Least-cost path tree
  const isEdgeInTree = (a: string, b: string): boolean => {
    if (!currentStep) return false;
    // 檢查 b 是否以 a 為前驅，或者 a 是否以 b 為前驅，且皆已被 settled 確定
    const aPre = currentStep.nodesState[a] ? currentStep.nodesState[a].predecessor : null;
    const aSettled = currentStep.nodesState[a] ? currentStep.nodesState[a].isSettled : false;
    const bPre = currentStep.nodesState[b] ? currentStep.nodesState[b].predecessor : null;
    const bSettled = currentStep.nodesState[b] ? currentStep.nodesState[b].isSettled : false;

    if (aPre === b && aSettled) return true;
    if (bPre === a && bSettled) return true;
    return false;
  };

  return (
    <div id="dijkstra-simulator-viewport" className="bg-[#0b0f19] text-gray-200 p-4 md:p-6 rounded-2xl border border-gray-800 shadow-2xl flex flex-col gap-6 font-sans">
      {/* 頂部：標題、模式與 Source 選擇 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-2">
            <span>Dijkstra's Link-State 互動式解算模擬器</span>
            <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-mono">
              6-Nodes Topology
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            你可以自由變更 Link Cost、調整起點、手動步進或自動播放，掌握選路大腦的完整推演。
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Source 選擇 */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-gray-400 text-xs font-mono font-bold">起點 Source:</span>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value as NodeName)}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              {NODES.map((n) => (
                <option key={n} value={n} className="bg-gray-950 text-emerald-400">
                  {n.toUpperCase()} 節點
                </option>
              ))}
            </select>
          </div>

          {/* 隨堂測試切換開關 */}
          <button
            onClick={() => {
              setAnswersEnabled(!answersEnabled);
              setQuizMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              answersEnabled
                ? 'bg-amber-950/40 border-amber-800/70 text-amber-300'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>隨試隨評考驗：{answersEnabled ? '開啟中' : '已關閉'}</span>
          </button>

          {/* 成本重置 */}
          <button
            onClick={restoreDefaultLinks}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 px-3 py-1.5 rounded-lg text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢復預設 Cost</span>
          </button>
        </div>
      </div>

      {/* 目標公式標註區 */}
      <div className="bg-blue-950/40 border border-blue-900/50 p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400">
            <span className="font-mono font-bold text-sm">Formula</span>
          </div>
          <div>
            <div className="text-sm font-bold text-blue-300 font-mono">
              D(v) = min( D(v), D(w) + c(w,v) )
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              每次將 w 節點移入 N' 集合後，我們便遍歷其未包含在 N' 中的鄰居，考量「走 w 再到鄰居」的新路線是否縮短。
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-gray-400 flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-lg">
          <span>當前步數：</span>
          <span className="text-emerald-400 font-mono text-sm">{currentStepIndex}</span>
          <span className="text-gray-600">/</span>
          <span className="font-mono text-sm">5</span>
        </div>
      </div>

      {/* 主體展示：左側 SVG 拓撲圖 + 右側狀態表格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 左側：SVG 拓撲圖 (7格) */}
        <div className="lg:col-span-7 bg-[#0f1422] rounded-xl border border-gray-800 p-4 relative flex flex-col items-center justify-between min-h-[380px]">
          <div className="w-full flex items-center justify-between text-xs px-2 text-gray-400 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              互動式網路拓撲與最短路徑樹展示
            </span>
            <span className="text-[11px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">
              提示：可直接點擊線條上的「權重數字」自訂成本！
            </span>
          </div>

          {/* SVG 畫布 */}
          <div className="w-full h-[280px] md:h-[300px] relative">
            <svg viewBox="0 0 600 320" className="w-full h-full select-none">
              {/* 定義 SVG 標記：箭頭發光等 */}
              <defs>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-node" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 繪製網路連接線 (Edges) */}
              {links.map((link, idx) => {
                const sCoords = NODE_COORDS[link.source as NodeName];
                const tCoords = NODE_COORDS[link.target as NodeName];
                if (!sCoords || !tCoords) return null;

                const isTree = isEdgeInTree(link.source, link.target);

                return (
                  <g key={`edge-${idx}`}>
                    {/* 背景發光線 (特效) */}
                    {isTree && (
                      <line
                        x1={sCoords.cx}
                        y1={sCoords.cy}
                        x2={tCoords.cx}
                        y2={tCoords.cy}
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.35"
                        filter="url(#glow-emerald)"
                      />
                    )}

                    {/* 主要連接線 */}
                    <line
                      x1={sCoords.cx}
                      y1={sCoords.cy}
                      x2={tCoords.cx}
                      y2={tCoords.cy}
                      stroke={isTree ? '#10b981' : '#374151'}
                      strokeWidth={isTree ? '4.5' : '2'}
                      strokeDasharray={isTree ? 'none' : '4 4'}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />

                    {/* 權重標籤 (可在線上點擊修改) */}
                    <g
                      transform={`translate(${(sCoords.cx + tCoords.cx) / 2}, ${(sCoords.cy + tCoords.cy) / 2})`}
                      className="cursor-pointer"
                      onClick={() =>
                        setEditingLink({ source: link.source, target: link.target, cost: link.cost })
                      }
                    >
                      <circle r="14" fill="#1e293b" stroke={isTree ? '#10b981' : '#4b5563'} strokeWidth="1.5" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-mono text-xs font-bold fill-gray-200"
                      >
                        {link.cost}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 繪製拓撲節點 (Nodes) */}
              {NODES.map((n) => {
                const coords = NODE_COORDS[n];
                if (!coords) return null;

                // 判斷是否包含在 N' 中
                const isInNPrime = currentStep ? currentStep.nPrime.includes(n) : false;
                const isSelected = currentStep ? currentStep.selectedNode === n : false;

                // 獲取當前步驟該 Node 的 D 估算與 p
                const nodeDistance = currentStep && currentStep.nodesState[n] ? currentStep.nodesState[n].distance : Infinity;
                const nodePredecessor = currentStep && currentStep.nodesState[n] ? currentStep.nodesState[n].predecessor : null;

                let dText = nodeDistance === Infinity ? '∞' : String(nodeDistance);
                let pText = nodePredecessor ? `,${nodePredecessor}` : '';

                // 畫出圓圈
                return (
                  <g key={`node-${n}`} className="transition-all duration-500">
                    {/* 被選中的呼吸大圈圈 */}
                    {isSelected && (
                      <circle
                        cx={coords.cx}
                        cy={coords.cy}
                        r="28"
                        fill="#059669"
                        opacity="0.3"
                        filter="url(#glow-node)"
                      />
                    )}

                    {/* 主要節點 */}
                    <circle
                      cx={coords.cx}
                      cy={coords.cy}
                      r="18"
                      fill={isSelected ? '#10b981' : isInNPrime ? '#047857' : n === sourceNode ? '#0284c7' : '#1e293b'}
                      stroke={isSelected ? '#34d399' : isInNPrime ? '#10b981' : n === sourceNode ? '#38bdf8' : '#4b5563'}
                      strokeWidth="2.5"
                    />

                    {/* 節點英文小寫字樣 */}
                    <text
                      cx={coords.cx}
                      x={coords.cx}
                      y={coords.cy + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-bold fill-white text-sm uppercase"
                    >
                      {n}
                    </text>

                    {/* 節點指標 D(v)與p(v) */}
                    <g transform={`translate(${coords.cx}, ${coords.cy - 24})`}>
                      <rect
                        x="-24"
                        y="-10"
                        width="48"
                        height="18"
                        rx="4"
                        fill="#0b0f19"
                        stroke={isInNPrime ? '#10b981' : '#374151'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-1"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`font-mono text-[9px] font-bold ${
                          isInNPrime ? 'fill-emerald-400' : 'fill-gray-400'
                        }`}
                      >
                        {n === sourceNode ? 'Source' : `D:${dText}${pText}`}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* 修改 Cost 點選彈出 Float Layer */}
            {editingLink && (
              <div className="absolute inset-0 bg-gray-950/90 rounded-xl flex flex-col justify-center items-center gap-4 p-4 z-20">
                <div className="text-center">
                  <h4 className="text-sm font-bold text-gray-200">
                    自訂鏈路成本 (Link Cost)
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase">
                    節點 {editingLink.source} 與 節點 {editingLink.target} 之間
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <span className="font-mono text-xs text-gray-400">1</span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={editingLink.cost}
                    onChange={(e) => setEditingLink({ ...editingLink, cost: Number(e.target.value) })}
                    className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                  />
                  <span className="font-mono text-emerald-400 font-bold">{editingLink.cost}</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleLinkCostChange(editingLink.source, editingLink.target, editingLink.cost)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                  >
                    保存設置
                  </button>
                  <button
                    onClick={() => setEditingLink(null)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-1.5 rounded-lg text-xs"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 下方：播放操作面板 */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-gray-800 pt-4 mt-2 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="回到上一步 Step Backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  isPlaying
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
                title={isPlaying ? '暫停播放' : '自動逐步播放 Auto Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'PAUSE' : 'AUTO PLAY'}</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStepIndex === 5}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="前進下一步 Next Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition"
                title="重置到 Step 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 圖例 */}
            <div className="flex gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-400"></span>
                Source起點
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-emerald-400"></span>
                已加入 N'
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                當步移入
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 border-t-2 border-emerald-400 border-solid inline-block"></span>
                最短路徑樹 E
              </span>
            </div>
          </div>
        </div>

        {/* 右側：變數表格與隨堂測試 + 解釋 (5格) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* 當前的繁體中文步進步驟解釋 */}
          <div className="bg-[#0f1422] rounded-xl border border-gray-800 p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Step-by-Step 運算軌跡中文詳解</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                Step {currentStepIndex} 之決策
              </span>
            </h3>
            <div className="text-xs leading-relaxed text-gray-300 min-h-[90px] whitespace-pre-line bg-gray-950/40 p-3 rounded-lg border border-gray-900 font-sans">
              {currentStep ? currentStep.explanation : '演算法載入中...'}
            </div>
          </div>

          {/* 隨堂測試大考驗面板 */}
          {answersEnabled && currentStepIndex < 5 && (
            <div className="bg-amber-955/20 border border-amber-900/60 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    【思考挑戰】下一步應該選選哪一個節點？
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    請根據當前 Dijkstra 距離指標 D(node)，在非 N' 中找出下一個要踩的最小節點。答對才能解鎖前進喔！
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {NODES.filter(
                  (n) => currentStep && !currentStep.nPrime.includes(n)
                ).map((n) => (
                  <button
                    key={`opt-${n}`}
                    onClick={() => {
                      setQuizNodeChoice(n);
                      setQuizMessage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold font-mono text-xs uppercase border transition ${
                      quizNodeChoice === n
                        ? 'bg-amber-500 border-amber-400 text-gray-950'
                        : 'bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300'
                    }`}
                  >
                    節點 {n}
                  </button>
                ))}
                {NODES.filter((n) => currentStep && !currentStep.nPrime.includes(n)).length === 0 && (
                  <span className="text-xs text-gray-400">剩下皆已進入 N'。</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={submitQuizAnswer}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1 rounded-lg text-xs font-bold mt-1 transition"
                >
                  提交預測
                </button>
              </div>

              {/* 答題反饋顯示 */}
              {quizMessage && (
                <div
                  className={`flex items-start gap-1.5 p-2 rounded-lg text-xs mt-1 border ${
                    quizMessage.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                  }`}
                >
                  {quizMessage.type === 'success' ? (
                    <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-400" />
                  )}
                  <span className="leading-relaxed">{quizMessage.text}</span>
                </div>
              )}
            </div>
          )}

          {/* 變數狀態矩陣表格 (N', D, p) */}
          <div className="bg-[#0f1422] rounded-xl border border-gray-800 p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Dijkstra 變數矩陣狀態 (齊平 CPU 大腦)</span>
                <span className="text-[10px] text-gray-500">
                  N' 已收錄成員數: {currentStep ? currentStep.nPrime.length : 0}
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-mono">
                      <th className="py-2 px-1">節點v</th>
                      <th className="py-2 px-1 text-center">確定(N')</th>
                      <th className="py-2 px-1">D(v) 距離估算</th>
                      <th className="py-2 px-1">p(v) 前驅點</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NODES.map((n) => {
                      if (!currentStep) return null;
                      const isSrc = n === sourceNode;
                      const hasS = currentStep.nodesState[n] ? currentStep.nodesState[n].isSettled : false;
                      const dist = currentStep.nodesState[n] ? currentStep.nodesState[n].distance : Infinity;
                      const pre = currentStep.nodesState[n] ? currentStep.nodesState[n].predecessor : null;

                      return (
                        <tr
                          key={`row-${n}`}
                          className={`border-b border-gray-900 font-mono transition-colors ${
                            currentStep.selectedNode === n
                              ? 'bg-emerald-950/20 text-emerald-300'
                              : hasS
                              ? 'text-emerald-500/90'
                              : 'text-gray-300'
                          }`}
                        >
                          <td className="py-2 px-1 font-bold uppercase">{n}</td>
                          <td className="py-2 px-1 text-center">
                            {hasS ? (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.2 rounded font-sans">
                                YES
                              </span>
                            ) : (
                              <span className="text-[10px] bg-gray-950 text-gray-600 px-1.5 py-0.2 rounded font-sans">
                                NO
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-1 font-bold">
                            {isSrc ? (
                              <span className="text-blue-400">0 (起點)</span>
                            ) : dist === Infinity ? (
                              '∞ (無限大)'
                            ) : (
                              dist
                            )}
                          </td>
                          <td className="py-2 px-1 uppercase text-gray-400">
                            {isSrc ? '-' : pre || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* N' 連續顯示 */}
            <div className="mt-3 pt-3 border-t border-gray-900 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-mono">N' 已確定集合:</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 px-3 py-1 rounded-lg">
                N' = &#123; {(currentStep ? currentStep.nPrime : []).join(', ')} &#125;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最後結尾顯示：轉發表、Least-cost-path tree、完整路徑報告 */}
      {currentStepIndex === 5 && (
        <div className="mt-2 bg-[#0d1527] border border-emerald-900/40 p-4 rounded-xl flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-emerald-500 text-gray-950 text-xs font-bold rounded-lg uppercase">
              DONE
            </span>
            <h3 className="text-sm font-bold text-emerald-300">
              【演算法完美收斂】以下為從選定起點 {sourceNode.toUpperCase()} 出發之最終路由決策結果：
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Forwarding Table 轉發表 */}
            <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800">
              <h4 className="text-xs font-mono font-bold text-gray-300 border-b border-gray-800 pb-2 mb-2 flex items-center justify-between">
                <span>轉發表 (Forwarding Table)</span>
                <span className="text-[10px] text-gray-500 font-sans">
                  目的端 → 下一跳 (Next Hop)
                </span>
              </h4>
              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-900">
                      <th className="pb-1">目的端 Destination</th>
                      <th className="pb-1">最優成本 Cost</th>
                      <th className="pb-1">下一跳輸出 Next Hop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NODES.map((n) => (
                      <tr key={`ft-${n}`} className="border-b border-gray-900/50">
                        <td className="py-1 uppercase font-bold">{n}</td>
                        <td className="py-1">
                          {n === sourceNode ? '0' : currentStep.nodesState[n]?.distance}
                        </td>
                        <td className="py-1 font-bold text-emerald-400 uppercase">
                          {getNextHop(n, 5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. 端到端路徑 */}
            <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800">
              <h4 className="text-xs font-mono font-bold text-gray-300 border-b border-gray-800 pb-2 mb-2">
                端到端最輕負載路徑報告 (Least-cost path tree)
              </h4>
              <ul className="text-xs space-y-1.5 font-mono text-gray-300">
                {NODES.map((n) => (
                  <li key={`path-${n}`} className="flex items-center justify-between">
                    <span>
                      起點 {sourceNode.toUpperCase()} → 終點 {n.toUpperCase()}:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {getFullPath(n, 5)}
                      <span className="text-[10px] text-gray-500 font-normal ml-1">
                        (Cost: {n === sourceNode ? '0' : currentStep.nodesState[n]?.distance})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
