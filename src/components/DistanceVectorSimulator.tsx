/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, HelpCircle, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

type NodeName = 'x' | 'y' | 'z';

interface Link {
  source: NodeName;
  target: NodeName;
  cost: number;
}

interface DVTable {
  // node -> dest -> cost
  vectors: Record<NodeName, Record<NodeName, number>>;
  // node -> neighbor -> dest -> cost
  neighborVectors: Record<NodeName, Partial<Record<NodeName, Record<NodeName, number>>>>;
}

interface DVStep {
  round: number;
  tables: DVTable;
  explanation: string;
  formulaSubstitution: string;
  activeMessages: { from: NodeName; to: NodeName; val: Record<NodeName, number> }[];
  changedNodes: NodeName[];
}

// Node positions inside the SVG
const NODE_POSITIONS: Record<NodeName, { cx: number; cy: number; lx: number; ly: number; color: string; bg: string; border: string }> = {
  x: { cx: 120, cy: 120, lx: 90, ly: 125, color: '#3b82f6', bg: 'bg-blue-950/40', border: 'border-blue-500' },
  y: { cx: 300, cy: 240, lx: 300, ly: 280, color: '#10b981', bg: 'bg-emerald-950/40', border: 'border-emerald-500' },
  z: { cx: 480, cy: 120, lx: 510, ly: 125, color: '#ec4899', bg: 'bg-pink-950/40', border: 'border-pink-500' },
};

export default function DistanceVectorSimulator() {
  const [scenario, setScenario] = useState<'normal' | 'good' | 'bad'>('normal');
  const [links, setLinks] = useState<Link[]>([
    { source: 'x', target: 'y', cost: 4 },
    { source: 'y', target: 'z', cost: 1 },
    { source: 'x', target: 'z', cost: 50 },
  ]);

  const [selectedInspectNode, setSelectedInspectNode] = useState<NodeName>('y');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Editable Link State
  const [editingLink, setEditingLink] = useState<{ source: NodeName; target: NodeName; cost: number } | null>(null);

  // Mini Quiz state built into simulator
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // All pre-computed rounds
  const [steps, setSteps] = useState<DVStep[]>([]);

  // Calculate links helper
  const getLinkCost = (a: NodeName, b: NodeName, currentLinks: Link[]): number => {
    if (a === b) return 0;
    const found = currentLinks.find(
      (l) => (l.source === a && l.target === b) || (l.source === b && l.target === a)
    );
    return found ? found.cost : Infinity;
  };

  // Generate steps based on active scenario and link costs
  useEffect(() => {
    const listSteps: DVStep[] = [];
    const getCost = (a: NodeName, b: NodeName) => getLinkCost(a, b, links);

    // Initial tables at t = 0
    const vectors: Record<NodeName, Record<NodeName, number>> = {
      x: { x: 0, y: Infinity, z: Infinity },
      y: { x: Infinity, y: 0, z: Infinity },
      z: { x: Infinity, y: Infinity, z: 0 },
    };

    const neighborVectors: Record<NodeName, Partial<Record<NodeName, Record<NodeName, number>>>> = {
      x: {
        y: { x: Infinity, y: Infinity, z: Infinity },
        z: { x: Infinity, y: Infinity, z: Infinity },
      },
      y: {
        x: { x: Infinity, y: Infinity, z: Infinity },
        z: { x: Infinity, y: Infinity, z: Infinity },
      },
      z: {
        x: { x: Infinity, y: Infinity, z: Infinity },
        y: { x: Infinity, y: Infinity, z: Infinity },
      },
    };

    if (scenario === 'normal') {
      // Standard initial state: nodes only know direct neighbor costs
      vectors.x = { x: 0, y: getCost('x', 'y'), z: getCost('x', 'z') };
      vectors.y = { x: getCost('y', 'x'), y: 0, z: getCost('y', 'z') };
      vectors.z = { x: getCost('z', 'x'), y: getCost('z', 'y'), z: 0 };

      listSteps.push({
        round: 0,
        tables: { vectors: JSON.parse(JSON.stringify(vectors)), neighborVectors: JSON.parse(JSON.stringify(neighborVectors)) },
        explanation: '【初始化 t=0】每個節點僅透過直接連接的鏈路（Local Links）得知與鄰接節點的成本。此時，它們對其他間接節點（例如 x 與 z 之間雖藉由 y 連接，但在初始化時互相不知情）的距離估計為無限大 (∞)。隨後，各節點會向鄰居廣播自己目前的距離向量 (Distance Vector)。',
        formulaSubstitution: 'D_y(x) = c(y,x) = 4, D_y(z) = c(y,z) = 1。x、z 直接距離為 50。',
        activeMessages: [
          { from: 'x', to: 'y', val: { x: 0, y: 4, z: 50 } },
          { from: 'y', to: 'x', val: { x: 4, y: 0, z: 1 } },
          { from: 'y', to: 'z', val: { x: 4, y: 0, z: 1 } },
          { from: 'z', to: 'y', val: { x: 50, y: 1, z: 0 } },
        ],
        changedNodes: ['x', 'y', 'z'],
      });

      // Simple loop to convergence
      let round = 1;
      let hasChange = true;
      const curVectors = JSON.parse(JSON.stringify(vectors));
      const curNeighborVectors = JSON.parse(JSON.stringify(neighborVectors));

      while (hasChange && round < 8) {
        hasChange = false;
        const prevVectors = JSON.parse(JSON.stringify(curVectors));
        const changedInThisRound: NodeName[] = [];

        // Apply DV updates from previous round's messages
        if (round === 1) {
          // Nodes update neighbor estimates with Round 0 advertisements
          curNeighborVectors.x.y = { x: 4, y: 0, z: 1 };
          curNeighborVectors.y.x = { x: 0, y: 4, z: 50 };
          curNeighborVectors.y.z = { x: 50, y: 1, z: 0 };
          curNeighborVectors.z.y = { x: 4, y: 0, z: 1 };
        } else if (round === 2) {
          curNeighborVectors.x.z = { x: 5, y: 1, z: 0 };
          curNeighborVectors.z.x = { x: 0, y: 4, z: 5 };
        }

        // Compute new tables
        const newVectors = JSON.parse(JSON.stringify(curVectors));

        // Node x recalculate
        // D_x(z) = min { c(x,y) + D_y(z), c(x,z) + D_z(z) } = min { 4+1, 50+0 } = 5
        const dxz = Math.min(getCost('x', 'y') + curNeighborVectors.x.y.z, getCost('x', 'z') + 0);
        if (dxz !== curVectors.x.z) {
          newVectors.x.z = dxz;
          hasChange = true;
          changedInThisRound.push('x');
        }

        // Node y recalculate
        // D_y(x) = min { c(y,x)+0, c(y,z)+D_z(x) } = min { 4+0, 1+50 } = 4
        // D_y(z) = min { c(y,z)+0, c(y,x)+D_x(z) } = min { 1+0, 4+Infinity } = 1

        // Node z recalculate
        // D_z(x) = min { c(z,y) + D_y(x), c(z,x) + 0 } = min { 1+4, 50+0 } = 5
        const dzx = Math.min(getCost('z', 'y') + curNeighborVectors.z.y.x, getCost('z', 'x') + 0);
        if (dzx !== curVectors.z.x) {
          newVectors.z.x = dzx;
          hasChange = true;
          changedInThisRound.push('z');
        }

        for (const n of ['x', 'y', 'z'] as NodeName[]) {
          for (const d of ['x', 'y', 'z'] as NodeName[]) {
            curVectors[n][d] = newVectors[n][d];
          }
        }

        let explStr = '';
        let formulaStr = '';
        if (round === 1) {
          explStr = '【選路計算 t=1】路由器收到鄰居傳來的 DV，套用 Bellman-Ford 核心公式展開。以節點 x 為例，欲到 z 的最短估計更新為 min{ c(x,y) + D_y(z), c(x,z) + D_z(z) } = min{ 4 + 1, 50 + 0 } = 5。同理，z 到 x 更新為 min{ c(z,y) + D_y(x), c(z,x) + D_x(x) } = min{ 1 + 4, 50 + 0 } = 5。資訊成功擴散，路徑收窄！';
          formulaStr = 'D_x(z) = min { 4 + D_y(z), 50 + 0 } = 5 \nD_z(x) = min { 1 + D_y(x), 50 + 0 } = 5';
        } else {
          explStr = `【穩定收斂 t=${round}】演算法完成了資訊交換。所有的距離估算均已與真實拓撲相符：x 到 z 的最佳為 x-y-z (Cost 5)，y 到 x 為 y-x (Cost 4)，沒有任何節點的 DV 在此計算輪中發生變化。演算法自我停止 (Self-stopping)，完成收斂！`;
          formulaStr = 'D_x(z) = 5 (經由 y), D_z(x) = 5 (經由 y), D_y(x) = 4。無任何 DV 變化。';
        }

        listSteps.push({
          round,
          tables: { vectors: JSON.parse(JSON.stringify(curVectors)), neighborVectors: JSON.parse(JSON.stringify(curNeighborVectors)) },
          explanation: explStr,
          formulaSubstitution: formulaStr,
          activeMessages: hasChange ? [
            { from: 'x', to: 'y', val: { x: 0, y: 4, z: 5 } },
            { from: 'z', to: 'y', val: { x: 5, y: 1, z: 0 } },
          ] : [],
          changedNodes: changedInThisRound,
        });

        round++;
      }
    } else if (scenario === 'good') {
      // Scenario B: Good News.
      // Initially converged state: x-y = 4 (drops to 1), y-z = 1, x-z = 50.
      vectors.x = { x: 0, y: 4, z: 5 };
      vectors.y = { x: 4, y: 0, z: 1 };
      vectors.z = { x: 5, y: 1, z: 0 };

      neighborVectors.x = {
        y: { x: 4, y: 0, z: 1 },
        z: { x: 5, y: 1, z: 0 },
      };
      neighborVectors.y = {
        x: { x: 0, y: 4, z: 5 },
        z: { x: 5, y: 1, z: 0 },
      };
      neighborVectors.z = {
        x: { x: 0, y: 4, z: 5 },
        y: { x: 4, y: 0, z: 1 },
      };

      listSteps.push({
        round: 0,
        tables: { vectors: JSON.parse(JSON.stringify(vectors)), neighborVectors: JSON.parse(JSON.stringify(neighborVectors)) },
        explanation: '【吉報前夜 t=0】原本系統處於穩定狀態（x-y 為 4 ）。突然，x-y 之間的鏈路成本 (Link Cost) 從 4 大幅下降（Good News 降到 1）！y 偵測到了這次 Local Link 變化，準備根據 Bellman-Ford 計算並廣播好消息。',
        formulaSubstitution: 'c(y,x) 由 4 更新為 1。 D_y(x) 變為其計算對象。',
        activeMessages: [],
        changedNodes: ['y'],
      });

      // Round 1
      const v1 = JSON.parse(JSON.stringify(vectors));
      const nv1 = JSON.parse(JSON.stringify(neighborVectors));
      v1.y.x = 1; // y immediately updates its direct cost to x
      v1.x.y = 1; // x also updates

      listSteps.push({
        round: 1,
        tables: { vectors: JSON.parse(JSON.stringify(v1)), neighborVectors: JSON.parse(JSON.stringify(nv1)) },
        explanation: '【迅速反應 t=1】節點 y 與 x 察覺與鄰居鏈路直接成本下降為 1。y 計算最新 D_y(x) = min { c(y,x) + 0, c(y,z) + D_z(x) } = min { 1 + 0, 1 + 5 } = 1。y 立即更新為 1 並廣播此「好消息」給鄰居 z。這說明了「Good news travels fast」的極速反應！',
        formulaSubstitution: 'D_y(x) = min { 1+0, 1+5 } = 1 (有變化！)\nD_x(y) = min { 1+0, 50+1 } = 1 (有變化！)',
        activeMessages: [
          { from: 'y', to: 'z', val: { x: 1, y: 0, z: 1 } },
          { from: 'x', to: 'y', val: { x: 0, y: 1, z: 5 } },
        ],
        changedNodes: ['x', 'y'],
      });

      // Round 2
      const v2 = JSON.parse(JSON.stringify(v1));
      const nv2 = JSON.parse(JSON.stringify(nv1));
      nv2.z.y = { x: 1, y: 0, z: 1 }; // z hears y's update
      v2.z.x = Math.min(1 + 1, 50 + 0); // z re-evaluates D_z(x) = c(z,y) + D_y(x) = 1 + 1 = 2

      listSteps.push({
        round: 2,
        tables: { vectors: JSON.parse(JSON.stringify(v2)), neighborVectors: JSON.parse(JSON.stringify(nv2)) },
        explanation: '【鄰居同步 t=2】節點 z 收到 y 傳來的最新 DV：D_y(x) = 1。z 進行 Bellman-Ford 計算更新 D_z(x) = min{ c(z,y) + D_y(x), c(z,x)+0 } = min{ 1 + 1, 50 + 0 } = 2。z 隨即更新並廣播給 y。整個系統再次快速獲得完美收斂，資訊擴散完全無延誤。',
        formulaSubstitution: 'D_z(x) = min { 1 + 1, 50 + 0 } = 2 (更新，從原先 5 降至 2)',
        activeMessages: [
          { from: 'z', to: 'y', val: { x: 2, y: 1, z: 0 } },
        ],
        changedNodes: ['z'],
      });

      // Round 3
      const v3 = JSON.parse(JSON.stringify(v2));
      const nv3 = JSON.parse(JSON.stringify(nv2));
      nv3.y.z = { x: 2, y: 1, z: 0 }; // y received z's update but no change to y's DV

      listSteps.push({
        round: 3,
        tables: { vectors: JSON.parse(JSON.stringify(v3)), neighborVectors: JSON.parse(JSON.stringify(nv3)) },
        explanation: '【穩定收斂 t=3】y 收到 z 的 DV，經 re-evaluation 後自身向量無任何變化，演算法自動進入靜態休止期。吉報迅速完成了 2 步擴散、3 步驟全局收斂，充分實證「Good News Travels Fast」！',
        formulaSubstitution: 'D_y(x) = min { 1+0, 1+2 } = 1 (無變化，穩定)',
        activeMessages: [],
        changedNodes: [],
      });

    } else if (scenario === 'bad') {
      // Scenario C: Count to infinity
      // Initial state: x-y = 4. Drops to 1 in previous, but now x-y link jumps from 4 to 60!
      // Old vectors at convergent stable state (x-y=4):
      vectors.x = { x: 0, y: 4, z: 5 };
      vectors.y = { x: 4, y: 0, z: 1 };
      vectors.z = { x: 5, y: 1, z: 0 };

      neighborVectors.x = {
        y: { x: 4, y: 0, z: 1 },
        z: { x: 5, y: 1, z: 0 },
      };
      neighborVectors.y = {
        x: { x: 0, y: 4, z: 5 },
        z: { x: 5, y: 1, z: 0 },
      };
      neighborVectors.z = {
        x: { x: 0, y: 4, z: 5 },
        y: { x: 4, y: 0, z: 1 },
      };

      listSteps.push({
        round: 0,
        tables: { vectors: JSON.parse(JSON.stringify(vectors)), neighborVectors: JSON.parse(JSON.stringify(neighborVectors)) },
        explanation: '【災難降臨 t=0】這原本是穩妥的世界，但突然，x-y 的連結成本從 4 暴漲至 60（或者突發斷線中斷）！這稱作「壞消息 Bad News」。接下來，我們將目睹「Bad News Travels Slow」與著名的「Count-to-infinity」路由環路地獄。',
        formulaSubstitution: 'c(y,x) 躍升為 60。但此時 y 的鄰接表裡，其鄰居 z 對 x 的距離向量仍然是 D_z(x) = 5。',
        activeMessages: [],
        changedNodes: [],
      });

      // We will trace the count to infinity up to cost 50!
      // Let's manually generate these rounds so that we can show detailed formula substitution in traditional Chinese!
      let currentYtoX = 4;
      let currentZtoX = 5;

      const limits = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // truncate display for speed, then jump to 50 in step 15
      
      let stepI = 1;
      for (let costY = 6; costY <= 51; costY += 2) {
        if (stepI > 12) break; // Keep steps reasonable for interface display

        const nextY = costY;       // y calculates min(60, 1 + currentZ)
        const nextZ = costY + 1;   // z calculates min(50, 1 + nextY)

        const vRoundy = JSON.parse(JSON.stringify(vectors));
        vRoundy.y.x = nextY;
        vRoundy.z.x = currentZtoX; // doesn't update yet in the same microstep, or we simulate round by round:
        
        // At t = odd (y updates)
        const vStepT = JSON.parse(JSON.stringify(vectors));
        vStepT.y.x = nextY;
        vStepT.z.x = currentZtoX;
        
        const nStepT = JSON.parse(JSON.stringify(neighborVectors));
        nStepT.y.z.x = currentZtoX; 
        
        listSteps.push({
          round: stepI * 2 - 1,
          tables: { vectors: JSON.parse(JSON.stringify(vStepT)), neighborVectors: JSON.parse(JSON.stringify(nStepT)) },
          explanation: `【環路成型 t=${stepI * 2 - 1}】節點 y 偵測到直接連線 c(y,x)=60，套用 Bellman-Ford 計算。它詢問鄰居 z，由於 z 尚未得知斷線，回報 D_z(x) = ${currentZtoX}。y 便一廂情願相信此路可行，計算出 D_y(x) = min { 60 + 0, 1 + ${currentZtoX} } = ${nextY}。此時出現了 y -> z -> y 的【路由環路】！y 將此「最新」估算通報給 z。`,
          formulaSubstitution: `D_y(x) = min { c(y,x) + 0, c(y,z) + D_z(x) } \n       = min { 60, 1 + ${currentZtoX} } = ${nextY} (更新！)`,
          activeMessages: [
            { from: 'y', to: 'z', val: { x: nextY, y: 0, z: 1 } }
          ],
          changedNodes: ['y']
        });

        // Update y's value for z to receive
        currentYtoX = nextY;

        // At t = even (z updates)
        const vStepT2 = JSON.parse(JSON.stringify(vStepT));
        vStepT2.z.x = Math.min(50, 1 + nextY);
        
        const nStepT2 = JSON.parse(JSON.stringify(nStepT));
        nStepT2.z.y.x = nextY;

        const isCapped = vStepT2.z.x === 50;

        listSteps.push({
          round: stepI * 2,
          tables: { vectors: JSON.parse(JSON.stringify(vStepT2)), neighborVectors: JSON.parse(JSON.stringify(nStepT2)) },
          explanation: isCapped 
            ? `【衝破泡沫 t=${stepI * 2}】此時 D_y(x) = ${nextY}，z 計算 D_z(x) = min { c(z,x) + 0, c(z,y) + D_y(x) } = min { 50, 1 + ${nextY} }。由於 1 + ${nextY} = ${1 + nextY} 大於了 z-x 直接鏈路的極限值 50，z 【終於清醒】！它重新將路徑指向直接連結（c(z,x)=50），其值在 50 處止步，並將 D_z(x)=50 廣播給 y！`
            : `【彼此欺騙 t=${stepI * 2}】z 收到 y 最新的估算 D_y(x) = ${nextY}。z 蒙在鼓裡，套用公式計算 D_z(x) = min { 50 + 0, 1 + ${nextY} } = ${nextZ}。z 以為透過 y 能夠以更便宜的成本 ${nextZ} 走到 x。兩者重演了「互相欺騙」的慢速收斂，cost 又向上爬升！`,
          formulaSubstitution: `D_z(x) = min { c(z,x) + 0, c(z,y) + D_y(x) } \n       = min { 50, 1 + ${nextY} } = ${vStepT2.z.x} (更新！)`,
          activeMessages: [
            { from: 'z', to: 'y', val: { x: vStepT2.z.x, y: 1, z: 0 } }
          ],
          changedNodes: ['z']
        });

        currentZtoX = vStepT2.z.x;
        stepI++;

        if (isCapped) {
          // Final convergence round where y learns z capped at 50, so y settles at 51
          const finalY = 51;
          const vStepFinal = JSON.parse(JSON.stringify(vStepT2));
          vStepFinal.y.x = finalY;

          const nStepFinal = JSON.parse(JSON.stringify(nStepT2));
          nStepFinal.y.z.x = 50;

          listSteps.push({
            round: stepI * 2 - 1,
            tables: { vectors: JSON.parse(JSON.stringify(vStepFinal)), neighborVectors: JSON.parse(JSON.stringify(nStepFinal)) },
            explanation: `【最終收斂 t=穩定點】y 收到 z 傳來的 D_z(x) = 50。y 終於醒悟，得知透過 z 只能拿到 1 + 50 = 51 的路徑，這小於其直接鏈路 c(y,x)=60。y 與 z 同時停止發布不實信息，此時整個網路終於完全收斂。`,
            formulaSubstitution: `D_y(x) = min { 60 + 0, 1 + 50 } = 51 \nD_z(x) = 50 (經由 x 直達)，路由環路完全瓦解。`,
            activeMessages: [],
            changedNodes: ['y']
          });
          break;
        }
      }
    }

    setSteps(listSteps);
    setCurrentStepIndex(0);
    setQuizAnswered(false);
    setSelectedQuizOption(null);
    setQuizFeedback(null);
  }, [scenario, links]);

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, steps]);

  const currentStep = steps[currentStepIndex];

  // Set scenario wrapper
  const handleScenarioChange = (type: 'normal' | 'good' | 'bad') => {
    setScenario(type);
    if (type === 'normal') {
      setLinks([
        { source: 'x', target: 'y', cost: 4 },
        { source: 'y', target: 'z', cost: 1 },
        { source: 'x', target: 'z', cost: 50 },
      ]);
    } else if (type === 'good') {
      setLinks([
        { source: 'x', target: 'y', cost: 1 }, // link drops from 4 to 1
        { source: 'y', target: 'z', cost: 1 },
        { source: 'x', target: 'z', cost: 50 },
      ]);
    } else if (type === 'bad') {
      setLinks([
        { source: 'x', target: 'y', cost: 60 }, // link jumps to 60
        { source: 'y', target: 'z', cost: 1 },
        { source: 'x', target: 'z', cost: 50 },
      ]);
    }
  };

  // Custom link cost modification
  const handleSaveCost = () => {
    if (editingLink) {
      setLinks((prev) =>
        prev.map((l) =>
          (l.source === editingLink.source && l.target === editingLink.target) ||
          (l.source === editingLink.target && l.target === editingLink.source)
            ? { ...l, cost: editingLink.cost }
            : l
        )
      );
      setEditingLink(null);
    }
  };

  // Quiz evaluation
  const handleQuizAnswerSubmit = (option: string) => {
    setSelectedQuizOption(option);
    setQuizAnswered(true);

    if (scenario === 'bad') {
      if (option === 'B') {
        setQuizFeedback('🎉 太厲害了！完全答對。在 t=1 中，節點 y 聽信 z 舊的回報 D_z(x) = 5，便計算 min{ 60, 1 + 5 } = 6。隨後 z 收到 y 傳來的 D_y(x) = 6，便毫不懷疑直接套用 1 + 6 = 7。這就是兩個人反覆遞增、互相傷害的經典機制！');
      } else {
        setQuizFeedback('❌ 不對喔。想一下，在 Count-to-infinity 中，z 是根據 D_z(x) = min { c(z,x), c(z,y) + D_y(x) } 來算，此時 D_y(x) 剛剛變成了 6，所以 z 計算出來應該是 1 + 6 = 7！');
      }
    } else if (scenario === 'good') {
      if (option === 'A') {
        setQuizFeedback('🎉 完全答對！好消息 (吉報) 傳播極為迅速。y 發現 c(y,x) 降到 1，直接更新 D_y(x)=1。隔天 z 聽到後直接 1 + 1 = 2，僅僅 2 步便實現全網收斂。');
      } else {
        setQuizFeedback('❌ 再想一下！好消息降價至 1 後，y 可以直接以直接成本 1 抵達 x，這比之前的好太多了，所以 z 的值也會瞬間受到拉低作用！');
      }
    } else {
      if (option === 'C') {
        setQuizFeedback('🎉 答對了！在初始化 t=0 後，y、x、z 互相通報 direct cost，不一會兒 x-z 就會發覺走 y 更快 (4+1=5)；z 也是 (5)。');
      } else {
        setQuizFeedback('❌ 選錯了。正常初始化下，節點會直接藉由最優的躍點收斂到 c(x,y) + c(y,z) = 5。');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Presets, Controllers, and Graph View (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Preset scenario selection card */}
        <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">場景沙盒預設 (Interactive Presets)</h3>
            <p className="text-[11px] text-gray-500">選擇以下經典實驗場景，立即自動加載鏈路權重變更實例。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleScenarioChange('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                scenario === 'normal'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm'
                  : 'bg-gray-950/40 text-gray-400 border-gray-850 hover:bg-gray-900'
              }`}
            >
              🌱 1. 一般收斂計算
            </button>
            <button
              onClick={() => handleScenarioChange('good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                scenario === 'good'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                  : 'bg-gray-950/40 text-gray-400 border-gray-850 hover:bg-gray-900'
              }`}
            >
              🚀 2. 吉報吉速 (Good News Fast)
            </button>
            <button
              onClick={() => handleScenarioChange('bad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                scenario === 'bad'
                  ? 'bg-rose-600/20 text-rose-450 border-rose-500/50 shadow-sm shadow-rose-950/10'
                  : 'bg-gray-950/40 text-gray-400 border-gray-850 hover:bg-gray-900'
              }`}
            >
              🔄 3. 無窮計數環 (Count-to-Infinity)
            </button>
          </div>
        </div>

        {/* Dynamic Topology Chart Card */}
        <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-5 relative flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-200">Distance Vector 網路學術圖形 (G = N, E)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10.5px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> x
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> y
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> z
              </span>
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="relative aspect-[16/9] w-full bg-gray-950/30 rounded-xl overflow-hidden border border-gray-900 flex items-center justify-center">
            
            {/* SVG Graph Drawing */}
            <svg viewBox="0 0 600 320" className="w-full h-full select-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Edge line x <-> z (Cost 50) */}
              <g className="cursor-pointer group" onClick={() => setEditingLink({ source: 'x', target: 'z', cost: getLinkCost('x', 'z', links) })}>
                <line
                  x1={NODE_POSITIONS.x.cx}
                  y1={NODE_POSITIONS.x.cy}
                  x2={NODE_POSITIONS.z.cx}
                  y2={NODE_POSITIONS.z.cy}
                  stroke={scenario === 'bad' ? '#374151' : '#4b5563'}
                  strokeWidth={2}
                  className="group-hover:stroke-blue-400 transition"
                />
                <circle cx={300} cy={120} r={14} className="fill-gray-950 stroke-gray-800 transition group-hover:stroke-blue-400" />
                <text x={300} y={124} textAnchor="middle" className="text-[11px] font-mono font-bold fill-gray-400 group-hover:fill-blue-400">
                  {getLinkCost('x', 'z', links)}
                </text>
              </g>

              {/* Edge line x <-> y (Cost 4 / 1 / 60) */}
              <g className="cursor-pointer group" onClick={() => setEditingLink({ source: 'x', target: 'y', cost: getLinkCost('x', 'y', links) })}>
                <line
                  x1={NODE_POSITIONS.x.cx}
                  y1={NODE_POSITIONS.x.cy}
                  x2={NODE_POSITIONS.y.cx}
                  y2={NODE_POSITIONS.y.cy}
                  stroke={scenario === 'bad' ? '#f43f5e' : (scenario === 'good' ? '#10b981' : '#3b82f6')}
                  strokeWidth={scenario === 'bad' ? 3.5 : 2.5}
                  className="group-hover:stroke-emerald-400 transition"
                  strokeDasharray={scenario === 'bad' ? '4 2' : undefined}
                />
                <circle cx={210} cy={180} r={14} className="fill-gray-950 stroke-gray-800 transition group-hover:stroke-emerald-400" />
                <text x={210} y={184} textAnchor="middle" className="text-[11px] font-mono font-bold fill-gray-150 group-hover:fill-emerald-400">
                  {getLinkCost('x', 'y', links)}
                </text>
              </g>

              {/* Edge line y <-> z (Cost 1) */}
              <g className="cursor-pointer group" onClick={() => setEditingLink({ source: 'y', target: 'z', cost: getLinkCost('y', 'z', links) })}>
                <line
                  x1={NODE_POSITIONS.y.cx}
                  y1={NODE_POSITIONS.y.cy}
                  x2={NODE_POSITIONS.z.cx}
                  y2={NODE_POSITIONS.z.cy}
                  stroke="#10b981"
                  strokeWidth={2}
                  className="group-hover:stroke-pink-400 transition"
                />
                <circle cx={390} cy={180} r={14} className="fill-gray-950 stroke-gray-800 transition group-hover:stroke-pink-400" />
                <text x={390} y={184} textAnchor="middle" className="text-[11px] font-mono font-bold fill-gray-150 group-hover:fill-pink-400">
                  {getLinkCost('y', 'z', links)}
                </text>
              </g>

              {/* Active messages path projection visualizer (Mote animation) */}
              {currentStep && currentStep.activeMessages.map((msg, idx) => {
                const srcPos = NODE_POSITIONS[msg.from];
                const destPos = NODE_POSITIONS[msg.to];
                return (
                  <g key={idx}>
                    <line
                      x1={srcPos.cx}
                      y1={srcPos.cy}
                      x2={destPos.cx}
                      y2={destPos.cy}
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="5, 5"
                      className="animate-[dash_10s_linear_infinite]"
                    />
                    <circle cx={(srcPos.cx + destPos.cx) / 2} cy={(srcPos.cy + destPos.cy) / 2} r={6} className="fill-sky-400 stroke-white stroke-2 animate-bounce" />
                    <text x={(srcPos.cx + destPos.cx) / 2} y={(srcPos.cy + destPos.cy) / 2 - 10} textAnchor="middle" className="text-[8px] font-mono font-bold fill-sky-300">
                      DV 發送
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes x, y, z */}
              {(['x', 'y', 'z'] as NodeName[]).map((name) => {
                const pos = NODE_POSITIONS[name];
                const isSelected = selectedInspectNode === name;
                const isChanged = currentStep?.changedNodes.includes(name);

                return (
                  <g key={name} className="cursor-pointer" onClick={() => setSelectedInspectNode(name)}>
                    {/* Ring highlight when checked or updated */}
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={isSelected ? 28 : (isChanged ? 26 : 22)}
                      fill="none"
                      stroke={pos.color}
                      strokeWidth={isSelected ? 4 : (isChanged ? 2 : 1)}
                      className="transition-all duration-300 opacity-80"
                      strokeDasharray={isChanged ? '2 2' : undefined}
                    />
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={20}
                      fill="#070a13"
                      stroke={pos.color}
                      strokeWidth={2}
                    />
                    <text
                      x={pos.cx}
                      y={pos.cy + 5}
                      textAnchor="middle"
                      className="text-white font-mono font-bold text-sm select-none"
                    >
                      {name}
                    </text>
                    <text x={pos.lx} y={pos.ly} className="text-[10px] font-sans font-bold fill-gray-400">
                      節點 {name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Quick Helper Floating Overlay */}
            <div className="absolute top-3 left-3 bg-gray-900/95 backdrop-blur border border-gray-800 p-2 rounded-lg text-[10px] text-gray-400 leading-normal pointer-events-none">
              <span>💡 點選<b>節點</b>切換觀察 DV 表。</span>
              <br />
              <span>👉 點選<b>連線數字</b>可自訂 Cost。</span>
            </div>

            {/* Floating Banner for loop count in Scenario C */}
            {scenario === 'bad' && currentStepIndex > 0 && (
              <div className="absolute bottom-3 right-3 bg-rose-950/90 border border-rose-800 p-2 rounded-lg text-[10px] text-rose-300 font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span>⚠️ 路由環路 (Routing Loop): {currentStep.formulaSubstitution.includes('min') ? 'y -> z -> y' : 'z -> y -> z'}</span>
              </div>
            )}
          </div>

          {/* Edit Cost Dialog Popup Built in-place */}
          {editingLink && (
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
              <div className="bg-[#0f1422] border border-gray-800 p-5 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-xl">
                <h4 className="text-sm font-bold text-gray-200">修改手動鏈路成本 ({editingLink.source} ↔ {editingLink.target})</h4>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-mono">Cost 數值：</span>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={editingLink.cost}
                    onChange={(e) => setEditingLink({ ...editingLink, cost: parseInt(e.target.value) || 1 })}
                    className="flex-1 accent-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editingLink.cost}
                    onChange={(e) => setEditingLink({ ...editingLink, cost: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-16 bg-gray-950 border border-gray-800 p-1 rounded font-mono text-xs text-center text-emerald-400"
                  />
                </div>
                <p className="text-[10px] text-gray-500">注意：大於 50 的值在 Count-to-infinity 情境中可讓節點 z 清醒改走直連路徑。</p>
                <div className="flex gap-2 self-end">
                  <button
                    onClick={() => setEditingLink(null)}
                    className="bg-gray-900 border border-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs"
                  >
                    取消 Close
                  </button>
                  <button
                    onClick={handleSaveCost}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold"
                  >
                    確認套用 Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Controllers */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/40 p-3 rounded-xl border border-gray-900">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-gray-450 uppercase">動態進程輪次:</span>
              <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-mono font-bold text-xs">
                t = {currentStep?.round ?? 0}
              </span>
              <span className="text-xs text-gray-500">
                ({currentStepIndex + 1} / {steps.length})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                disabled={currentStepIndex === 0}
                className="p-1.5 rounded bg-gray-900 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                title="重設"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                  setIsPlaying(false);
                }}
                disabled={currentStepIndex === 0}
                className="p-1.5 rounded bg-gray-900 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                title="上一步"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 py-1 px-3 rounded font-bold text-xs bg-slate-100 text-slate-900 hover:bg-white"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-slate-900" />
                    <span>暫停 Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-slate-900" />
                    <span>自動播 Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                  setIsPlaying(false);
                }}
                disabled={currentStepIndex === steps.length - 1}
                className="p-1.5 rounded bg-gray-900 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                title="下一步"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Explain Logs Box */}
        <div className="bg-[#0f1422] border border-gray-855 rounded-2xl p-4 flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between border-b border-gray-900 pb-2">
            <span className="text-[11px] text-emerald-400 uppercase tracking-widest font-mono font-bold">
              [SYSTEM LIVE LOG] t={currentStep?.round ?? 0} 白話解碼說明
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Formula trace: Bellman-Ford equation
            </span>
          </div>
          
          <div className="text-xs leading-relaxed text-gray-300">
            {currentStep?.explanation}
          </div>

          <div className="bg-gray-950 border border-gray-900 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] text-amber-500 font-mono font-bold uppercase">本輪物理公式代入 trace：</span>
            <pre className="text-[11px] font-mono text-gray-100 whitespace-pre-wrap leading-relaxed">
              {currentStep?.formulaSubstitution}
            </pre>
          </div>
        </div>
      </div>

      {/* RIGHT: DV Table Inspect Panel & Prediction Mini Quiz (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Dynamic Distance Vector Table for inspected Node */}
        <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <span className="text-[8.5px] bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Selected Monitor Panel
            </span>
            <h3 className="text-sm font-bold text-gray-200 mt-1 flex items-center gap-1.5">
              <span>節點 {selectedInspectNode.toUpperCase()} 本機視角資訊表</span>
            </h3>
            <p className="text-[10.5px] text-gray-550 leading-relaxed mt-0.5">
              D_{selectedInspectNode}(d) 代表此節點估計到目的地 d 的最短路徑權重之集合。
            </p>
          </div>

          {/* Node's own vector table */}
          {currentStep && (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden border border-gray-900 rounded-xl">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-950 text-gray-400 border-b border-gray-900">
                      <th className="p-2 py-1.5 text-[10px] font-bold">目的地 d</th>
                      <th className="p-2 py-1.5 text-[10px] font-bold">估計路徑 D_{selectedInspectNode}(d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['x', 'y', 'z'] as NodeName[]).map((dest) => {
                      const cost = currentStep.tables.vectors[selectedInspectNode][dest];
                      return (
                        <tr key={dest} className="border-b border-gray-950 bg-gray-900/10">
                          <td className="p-2 py-1.5 font-bold flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: NODE_POSITIONS[dest].color }}></span>
                            <span>{dest.toUpperCase()}</span>
                          </td>
                          <td className="p-2 py-1.5 font-bold text-emerald-400">
                            {cost === Infinity ? '∞ (未知/無限)' : cost}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Neighbor vectors stored inside this audited node */}
              <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-900 flex flex-col gap-2">
                <span className="text-[10px] text-gray-400 font-bold">● 節點 {selectedInspectNode.toUpperCase()} 儲存的「鄰居 DV」向量：</span>
                
                {Object.keys(currentStep.tables.neighborVectors[selectedInspectNode]).map((nb) => {
                  const nbName = nb as NodeName;
                  const vals = currentStep.tables.neighborVectors[selectedInspectNode][nbName];
                  
                  // Only display real neighbors of selectedInspectNode in the topology
                  const isNeighbor = getLinkCost(selectedInspectNode, nbName, links) !== Infinity;
                  if (!isNeighbor) return null;

                  return (
                    <div key={nb} className="bg-gray-950 p-2 rounded border border-gray-900/60 flex flex-col gap-1 text-[11px] font-mono">
                      <span className="text-blue-400 font-bold">D_{nbName}(d) (來自鄰居 {nbName.toUpperCase()}) :</span>
                      <div className="grid grid-cols-3 gap-1 pl-2 text-[10px] text-gray-350">
                        <span>x: <b className="text-gray-100">{vals.x === Infinity ? '∞' : vals.x}</b></span>
                        <span>y: <b className="text-gray-100">{vals.y === Infinity ? '∞' : vals.y}</b></span>
                        <span>z: <b className="text-gray-100">{vals.z === Infinity ? '∞' : vals.z}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Prediction Game/Quiz Embedded */}
        <div className="bg-gradient-to-b from-[#1c142b] to-[#0f1422] border border-fuchsia-900/50 rounded-2xl p-5 flex flex-col gap-3.5 shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-fuchsia-950 pb-2">
            <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-widest font-mono">💡 Simulator Prediction Quiz</span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-200 leading-normal">
              【隨堂考驗】當前的模擬場景為<b>「{scenario === 'bad' ? 'Count-to-Infinity' : (scenario === 'good' ? '好消息吉速' : '一般初始化')}」</b>：
            </h4>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed font-sans">
              {scenario === 'bad' 
                ? '在 t=1 中，節點 y 聽信 z 舊的回報 D_z(x)=5 宣稱可以走到 x，而更新其 D_y(x)=6。此時 z 收到此新回報，z 將如何預測其 D_z(x) 值？'
                : (scenario === 'good'
                  ? '當 link cost 下降到 1 後，節點 z 的最優 D_z(x) 最終在 t=2 會有何變化？'
                  : '在正常 initialization 收斂完畢後，x、y、z 所有路由器是否具有「完全一致且相同」的 Distance Vector 數值？'
                )}
            </p>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-2">
            {scenario === 'bad' && (
              <>
                <button
                  onClick={() => handleQuizAnswerSubmit('A')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'A' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>A. 50。</b> z 本能懷疑 y，並直接啟用 c(z,x)=50 的物理線路。
                </button>
                <button
                  onClick={() => handleQuizAnswerSubmit('B')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'B' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>B. 7。</b> z 仍然不知斷線，套用 1 + D_y(x) = 1 + 6 = 7 得出。
                </button>
                <button
                  onClick={() => handleQuizAnswerSubmit('C')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'C' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>C. 60。</b> 因為 y 重置了線路值。
                </button>
              </>
            )}

            {scenario === 'good' && (
              <>
                <button
                  onClick={() => handleQuizAnswerSubmit('A')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'A' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>A. 2。</b> y 通報 D_y(x)=1 後，z 更新為 min(50, 1+1) = 2
                </button>
                <button
                  onClick={() => handleQuizAnswerSubmit('B')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'B' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>B. 5。</b> z 保持不變，因為 5 本來就很小。
                </button>
              </>
            )}

            {scenario === 'normal' && (
              <>
                <button
                  onClick={() => handleQuizAnswerSubmit('A')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'A' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>A. 是的，完完全全一模一樣。</b> 畢竟大家都收斂了。
                </button>
                <button
                  onClick={() => handleQuizAnswerSubmit('B')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'B' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>B. 不是。</b> 大家的目的地都不一樣，所以各自的路由向量都不同。
                </button>
                <button
                  onClick={() => handleQuizAnswerSubmit('C')}
                  className={`w-full py-2 px-3 text-left rounded-xl border text-[11px] font-sans transition ${
                    selectedQuizOption === 'C' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300' : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-300'
                  }`}
                >
                  <b>C. 不是，目的地向量不同，但在穩定狀態下，大家量測的最佳路徑與前驅都是對稱匹配的。</b>
                </button>
              </>
            )}
          </div>

          {quizFeedback && (
            <div className="bg-[#220c3a]/50 border border-fuchsia-900/40 p-3 rounded-xl text-[10.5px] leading-relaxed text-fuchsia-200">
              {quizFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
