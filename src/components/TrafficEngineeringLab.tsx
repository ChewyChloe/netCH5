/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Route, Undo, ShieldAlert, Cpu, Layers, Play, RefreshCw, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Link {
  id: string;
  source: string;
  target: string;
  cost: number;
}

export default function TrafficEngineeringLab() {
  const [activeTab, setActiveTab] = useState<'traditional' | 'sdn'>('traditional');
  const [selectedGoal, setSelectedGoal] = useState<'goal_upper' | 'goal_split' | 'goal_colored'>('goal_upper');
  
  // Link Weights (OSPF Costs)
  const [weights, setWeights] = useState<Record<string, number>>({
    'u-v': 2,
    'v-w': 3,
    'w-z': 3,
    'u-x': 1,
    'x-y': 2,
    'y-z': 2,
  });

  // Flow Rules for SDN Mode
  const [sdnRules, setSdnRules] = useState<{
    u: string;
    w: string;
    x: string;
  }>({
    u: 'dest_z_short',
    w: 'forward_z',
    x: 'forward_z',
  });

  // Animation states
  const [animating, setAnimating] = useState(false);
  const [animationPacketType, setAnimationPacketType] = useState<'all' | 'colored'>('all');
  const [simulatedPaths, setSimulatedPaths] = useState<string[][]>([]);

  // Node coordinates for beautiful custom SVG mapping
  const nodes = {
    u: { x: 80, y: 150, name: 'u (Origin)' },
    v: { x: 260, y: 60, name: 'v' },
    w: { x: 440, y: 60, name: 'w' },
    x: { x: 260, y: 240, name: 'x' },
    y: { x: 440, y: 240, name: 'y' },
    z: { x: 620, y: 150, name: 'z (Destination)' },
  };

  // Helper mapping: links array
  const linksList = [
    { id: 'u-v', source: 'u', target: 'v' },
    { id: 'v-w', source: 'v', target: 'w' },
    { id: 'w-z', source: 'w', target: 'z' },
    { id: 'u-x', source: 'u', target: 'x' },
    { id: 'x-y', source: 'x', target: 'y' },
    { id: 'y-z', source: 'y', target: 'z' },
  ];

  // Recalculate traditional shortest paths for display
  const [shortestPath, setShortestPath] = useState<string[]>([]);
  const [upperCost, setUpperCost] = useState(8);
  const [lowerCost, setLowerCost] = useState(5);

  useEffect(() => {
    const up = weights['u-v'] + weights['v-w'] + weights['w-z'];
    const down = weights['u-x'] + weights['x-y'] + weights['y-z'];
    setUpperCost(up);
    setLowerCost(down);

    if (up < down) {
      setShortestPath(['u', 'v', 'w', 'z']);
    } else if (down < up) {
      setShortestPath(['u', 'x', 'y', 'z']);
    } else {
      // Tie: both are equal
      setShortestPath(['u', 'v', 'w', 'z', 'u', 'x', 'y', 'z']); // represents parallel
    }
  }, [weights]);

  // Adjust cost helper
  const handleModifyCost = (linkId: string, amount: number) => {
    setWeights((prev) => {
      const nextVal = Math.max(1, Math.min(15, prev[linkId] + amount));
      return { ...prev, [linkId]: nextVal };
    });
  };

  // Run simulation
  const triggerSimulation = () => {
    if (animating) return;
    setAnimating(true);

    if (activeTab === 'traditional') {
      setAnimationPacketType('all');
      // Single path or split if cost is equal
      if (upperCost < lowerCost) {
        setSimulatedPaths([['u', 'v', 'w', 'z']]);
      } else if (lowerCost < upperCost) {
        setSimulatedPaths([['u', 'x', 'y', 'z']]);
      } else {
        setSimulatedPaths([['u', 'v', 'w', 'z'], ['u', 'x', 'y', 'z']]);
      }
    } else {
      // SDN Rules
      if (selectedGoal === 'goal_upper') {
        setAnimationPacketType('all');
        setSimulatedPaths([['u', 'v', 'w', 'z']]);
      } else if (selectedGoal === 'goal_split') {
        setAnimationPacketType('all');
        setSimulatedPaths([['u', 'v', 'w', 'z'], ['u', 'x', 'y', 'z']]);
      } else if (selectedGoal === 'goal_colored') {
        setAnimationPacketType('colored');
        // Blue takes u-x-y-z, Red takes u-v-w-z
        setSimulatedPaths([
          ['u', 'x', 'y', 'z'], // Blue path
          ['u', 'v', 'w', 'z'], // Red path
        ]);
      }
    }

    setTimeout(() => {
      setAnimating(false);
    }, 4000);
  };

  // Helper to reset traditional weights to initial state
  const resetTraditionalWeights = () => {
    setWeights({
      'u-v': 2,
      'v-w': 3,
      'w-z': 3,
      'u-x': 1,
      'x-y': 2,
      'y-z': 2,
    });
  };

  // Check goal fulfillment
  const checkGoalResult = () => {
    const isGoalUpper = selectedGoal === 'goal_upper';
    const isGoalSplit = selectedGoal === 'goal_split';
    const isGoalColored = selectedGoal === 'goal_colored';

    if (activeTab === 'traditional') {
      if (isGoalUpper) {
        // Goal: u to z via u-v-w-z (upper path must be strictly cheaper)
        const ok = upperCost < lowerCost;
        return {
          status: ok ? 'success' : 'failed',
          message: ok 
            ? '配置成功！藉由調大下路徑權重，使 OSPF 選路被迫改走上路徑。但請注意：這可能已經嚴重干擾了經過下路徑的其他無辜節點！'
            : `目標未達成。目前最短路徑仍然是低成本的下路徑 (${lowerCost} < ${upperCost})。請點擊上方調節鏈路成本，調高下路成本，或調低上路成本。`
        };
      } else if (isGoalSplit) {
        // Goal: Split. Traditional Destination-based routing can only split if costs are exactly equal (using ECMP)
        const ok = upperCost === lowerCost;
        return {
          status: ok ? 'warning' : 'failed',
          message: ok
            ? '警告性達成：當 OSPF 上下路徑成本完全一致時（目前大約是共同成本 ' + upperCost + '），可啟動 ECMP (Equal Cost Multi-Path) 進行對稱分流。然而這種分流是硬性的且极易破碎——一旦任何一條路徑的成本稍微偏折，平衡就會立刻瓦解，且無法進行 60/40 等非對稱精準分流！'
            : `目標未達成。傳統目的選路一次只能選取「一條」絕對最短路。目前上路成本是 ${upperCost}，下路是 ${lowerCost}，流量會 100% 灌入更划算的那一邊。請嘗試將兩條路整為相等 costs 數值以目睹 ECMP 的勉強分流效果。`
        };
      } else if (isGoalColored) {
        // Goal: Blue takes u-x-y-z, Red takes u-v-w-z
        return {
          status: 'failed',
          message: '傳統架構物理上不可能達成！因為經典 Internet 路由器仅檢查封包 Destination (都是到 z)。去往 z 的封包，不論是由藍色還是紅色應用層發出的，在同一塊 IP 轉發表上只能得到一個相同的 next-hop。無論你怎麼在右邊調整鏈路 cost 數值，都無法將兩種顏色拆開路徑！'
        };
      }
    } else {
      // SDN Mode
      if (isGoalUpper) {
        const configuredOk = sdnRules.u === 'dest_z_upper' || sdnRules.u === 'split_50_50';
        return {
          status: configuredOk ? 'success' : 'pending',
          message: configuredOk 
            ? 'SDN 配置成功！流表下發成功，Switch u 根據流規則直接將去往 Destination z 的全體流量強行導向上路引腳（轉送至 v），完全不管下路徑成本比它更便宜。流量工程完美達成！'
            : '配置中。請在「SDN 控制器流表配置區」將 Switch u 的規則調整為「目的地 z：強制走上路 [轉送給 v]」來實現流量工程。'
        };
      } else if (isGoalSplit) {
        const configuredOk = sdnRules.u === 'split_50_50';
        return {
          status: configuredOk ? 'success' : 'pending',
          message: configuredOk 
            ? 'SDN 配置成功！在大腦控制器的流指令下，Switch u 運作 Generalized Forwarding，以輪詢（Round Robin）或等比例哈希算法將去往 z 的封包完美對折，一條走 v、一條走 x。這根本不需要路徑成本強行相等！'
            : '配置中。請在控制器配置區將 Switch u 指配流表更動為「目的地 z：分流模式 [50% 上路, 50% 下路]」。'
        };
      } else if (isGoalColored) {
        const configuredOk = sdnRules.u === 'match_color_flow';
        return {
          status: configuredOk ? 'success' : 'pending',
          message: configuredOk 
            ? 'SDN 史詩級配置成功！控制器下發了 Match-Action Generalized rules。當匹配到「目的為 z 且來源為藍色」時則轉送給 x；匹配到「紅色」時則轉送給 v。這就是 policy-based routing！传统網路可望而不可即的功能，在軟體定義網路下輕描淡寫完成。'
            : '配置中。請修改 Switch u 流規則，套入「目的為 z 且多條件匹配紅色與藍色」流。'
        };
      }
    }
    return { status: 'failed', message: '' };
  };

  const currentResult = checkGoalResult();

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-4 md:p-6 mb-6">
      
      {/* 階段簡介 / 三大目標選擇 */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-2 font-mono flex items-center gap-1.5">
          <Route className="w-4 h-4 text-emerald-400" />
          <span>流量工程目標面板 (TE Goals)</span>
        </h4>
        <p className="text-xs text-gray-400 mb-4">
          請於下方點選想要在拓撲中達成的「網路流量引導目標」，隨後比較傳統和 SDN 的實作難易度差距：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => { setSelectedGoal('goal_upper'); }}
            className={`text-left p-3 rounded-xl border text-xs transition duration-200 ${
              selectedGoal === 'goal_upper'
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300'
                : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40">目標 A</span>
              <span>全走上行路徑</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              強迫所有 $u \to z$ 的特定業務流量，被迫改走較遠、非最優的上行通道 $u-v-w-z$。
            </p>
          </button>

          <button
            onClick={() => { setSelectedGoal('goal_split'); }}
            className={`text-left p-3 rounded-xl border text-xs transition duration-200 ${
              selectedGoal === 'goal_split'
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300'
                : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40">目標 B</span>
              <span>50/50 流量等比分流</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              將 $u \to z$ 的流，對稱拆分：一半流走上路、另一半流走下路分擔負載。
            </p>
          </button>

          <button
            onClick={() => { setSelectedGoal('goal_colored'); }}
            className={`text-left p-3 rounded-xl border text-xs transition duration-200 ${
              selectedGoal === 'goal_colored'
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300'
                : 'bg-gray-950/40 border-gray-900 hover:border-gray-800 text-gray-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/40">目標 C</span>
              <span>依封包顏色政策選路</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              依據封包類型政策：<span className="text-blue-400">藍色(特快)</span>走下路；<span className="text-red-400">紅色(一般)</span>走上路。
            </p>
          </button>
        </div>
      </div>

      {/* 傳統與 SDN 雙控制模式切換核 */}
      <div className="flex border-b border-gray-850 mb-5">
        <button
          onClick={() => { setActiveTab('traditional'); }}
          className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 text-center transition ${
            activeTab === 'traditional'
              ? 'border-blue-500 text-blue-400 bg-blue-950/10'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Cpu className="w-4 h-4" />
            <span>傳統選路模型 (OSPF Link Weights)</span>
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('sdn'); }}
          className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 text-center transition ${
            activeTab === 'sdn'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>SDN 萬能控制模式 (Flow Tables)</span>
          </div>
        </button>
      </div>

      {/* 實驗室主工作區：左側 SVG 拓撲，右側控制 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG UI (7 Columns) */}
        <div className="lg:col-span-7 bg-gray-950/50 border border-gray-850 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          
          <div className="absolute top-2 left-2 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            {activeTab === 'traditional' ? 'TRADITIONAL DESTINATION-BASED TOPOLOGY' : 'SDN CONTROLLED TOPOLOGY'}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400">上路 Costs 總和: <span className="text-cyan-400 font-bold">{upperCost}</span></span>
            <span className="text-[10px] font-mono text-gray-400">|</span>
            <span className="text-[10px] font-mono text-gray-400">下路 Costs 總和: <span className="text-amber-400 font-bold">{lowerCost}</span></span>
          </div>

          {/* SVG 畫布 */}
          <div className="w-full max-w-[660px] aspect-[660/300] relative mt-4">
            <svg 
              viewBox="0 0 700 300" 
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 發亮箭頭 */}
                <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5563" />
                </marker>
                <marker id="arrow-shortest" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-sdn" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 繪製線條 (Links) */}
              {linksList.map((lk) => {
                const s = nodes[lk.source as keyof typeof nodes];
                const t = nodes[lk.target as keyof typeof nodes];
                const linkId = lk.id;
                const cost = weights[linkId];

                // 判斷是否在傳統最短路徑中
                const isShortest = activeTab === 'traditional' && 
                  shortestPath.join('-').includes(`${lk.source}-${lk.target}`) &&
                  (selectedGoal !== 'goal_split' || upperCost !== lowerCost);

                // SDN 模式下高亮線條
                const isSdnActive = activeTab === 'sdn' && (
                  (selectedGoal === 'goal_upper' && ['u-v', 'v-w', 'w-z'].includes(linkId)) ||
                  (selectedGoal === 'goal_split' && ['u-v', 'v-w', 'w-z', 'u-x', 'x-y', 'y-z'].includes(linkId)) ||
                  (selectedGoal === 'goal_colored' && ['u-v', 'v-w', 'w-z', 'u-x', 'x-y', 'y-z'].includes(linkId))
                );

                let strokeColor = '#1f2937';
                let strokeWidth = '2';
                let markerId = 'arrow';

                if (isShortest) {
                  strokeColor = '#1d4ed8'; // 藍色
                  strokeWidth = '4.5';
                  markerId = 'arrow-shortest';
                } else if (isSdnActive) {
                  strokeColor = '#047857'; // 綠色
                  strokeWidth = '4.5';
                  markerId = 'arrow-sdn';
                }

                // 畫背景粗透明線，方便滑鼠選取
                return (
                  <g key={linkId}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="transparent"
                      strokeWidth="15"
                      className="cursor-pointer"
                    />
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      markerEnd={`url(#${markerId})`}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {/* 繪製動態飛行包 (Packet Stream Animation) */}
              {animating && (
                <>
                  {simulatedPaths.map((p, pathIdx) => {
                    // Packet Color Selection: Red or Blue or generic green
                    let packetColor = '#3b82f6'; // Blue default
                    if (animationPacketType === 'colored') {
                      packetColor = pathIdx === 0 ? '#60a5fa' : '#ef4444'; // blue for path 1 (lower), red for path 2 (upper)
                    } else if (activeTab === 'sdn') {
                      packetColor = '#10b981'; // Green for sdn
                    }

                    // Keyframe key IDs
                    return p.map((nodeName, index) => {
                      if (index === p.length - 1) return null;
                      const nextNodeName = p[index + 1];
                      const currentCoord = nodes[nodeName as keyof typeof nodes];
                      const nextCoord = nodes[nextNodeName as keyof typeof nodes];

                      // Define dynamic animation using motion inside SVG
                      return (
                        <g key={`anim-${pathIdx}-${nodeName}-${nextNodeName}`}>
                          <motion.circle
                            r="6"
                            fill={packetColor}
                            filter="url(#glow)"
                            initial={{ cx: currentCoord.x, cy: currentCoord.y }}
                            animate={{ cx: nextCoord.x, cy: nextCoord.y }}
                            transition={{
                              duration: 1.0,
                              delay: index * 1.0,
                              repeat: Infinity,
                              repeatDelay: p.length * 1.0 - 1.0,
                              ease: 'linear',
                            }}
                          />
                        </g>
                      );
                    });
                  })}
                </>
              )}

              {/* 繪製頂點 (Nodes Window) */}
              {Object.entries(nodes).map(([key, value]) => {
                // Determine node highlight
                let fillBg = '#0b0f19';
                let strokeColor = '#374151';
                
                if (activeTab === 'traditional' && shortestPath.includes(key)) {
                  fillBg = '#0c2340';
                  strokeColor = '#1d4ed8';
                } else if (activeTab === 'sdn') {
                  fillBg = '#022c22';
                  strokeColor = '#10b981';
                }

                // Make origins and destinations shiny
                const hasLabel = key === 'u' || key === 'z';

                return (
                  <g key={key} transform={`translate(${value.x}, ${value.y})`}>
                    <circle
                      r="18"
                      fill={fillBg}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      className="transition-all duration-300 filter drop-shadow"
                    />
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill="#e5e7eb"
                      fontSize="12"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {key}
                    </text>

                    {/* Node Special Annotation for Origin/Dest */}
                    {hasLabel && (
                      <text
                        textAnchor="middle"
                        y={key === 'u' ? '-26' : '32'}
                        fill="#9ca3af"
                        fontSize="9.5"
                        fontWeight="600"
                        className="font-sans tracking-wide uppercase"
                      >
                        {key === 'u' ? 'Origin (來源)' : 'Dest (終點)'}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 繪製 Link Weights (中間數值標籤，方便直觀調節) */}
              {linksList.map((lk) => {
                const s = nodes[lk.source as keyof typeof nodes];
                const t = nodes[lk.target as keyof typeof nodes];
                const cost = weights[lk.id];

                // Calculate midpoint
                const mx = (s.x + t.x) / 2;
                const my = (s.y + t.y) / 2;

                return (
                  <g key={`cost-lbl-${lk.id}`} transform={`translate(${mx}, ${my})`}>
                    {/* Circle Background */}
                    <rect
                      x="-14"
                      y="-12"
                      width="28"
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      stroke="#4b5563"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="2"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      className="font-mono cursor-default"
                      title="Link Cost"
                    >
                      {cost}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Controls to verify simulator or observe current paths */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-2 p-3 bg-gray-900/30 rounded-xl border border-gray-850">
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                Active Simulation Trace
              </span>
              <div className="text-xs text-gray-300 font-sans flex items-center gap-1.5 flex-wrap">
                {activeTab === 'traditional' ? (
                  <>
                    <span>目前計算最短選路:</span>
                    {upperCost === lowerCost ? (
                      <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                        u-v-w-z 及 u-x-y-z (ECMP 等價分流中)
                      </span>
                    ) : (
                      <span className="bg-blue-950/50 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded font-mono font-bold">
                        {shortestPath.join(' → ')}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span>SDN 流量工程路徑:</span>
                    {selectedGoal === 'goal_upper' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                        u → v → w → z (強制定向)
                      </span>
                    )}
                    {selectedGoal === 'goal_split' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                        上路 u-v-w-z (50%) 與 下路 u-x-y-z (50%)
                      </span>
                    )}
                    {selectedGoal === 'goal_colored' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                        藍色 走 u-x-y-z | 紅色 走 u-v-w-z
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={triggerSimulation}
              disabled={animating}
              className={`py-2 px-5 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition ${
                animating
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${animating ? 'animate-spin' : ''}`} />
              <span>{animating ? '串流模擬進行中...' : '重置並發起測試封包'}</span>
            </button>
          </div>
        </div>

        {/* 控制面板 (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* A. 傳統控制模式面板 */}
          {activeTab === 'traditional' && (
            <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
              <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>OSPF 連結成本調控台</span>
              </h5>
              
              <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
                傳統 Destination-Based 路由僅仰賴 OSPF Link Cost。您可以調整每個鏈路的 Cost：
              </p>

              <div className="space-y-2.5">
                {/* Upper Links */}
                <div className="space-y-2">
                  <div className="text-[10px] text-cyan-400 font-bold font-mono uppercase tracking-wide">
                    ▲ 上方路徑鏈路：
                  </div>
                  {linksList.filter(l => ['u-v', 'v-w', 'w-z'].includes(l.id)).map(link => (
                    <div key={link.id} className="flex items-center justify-between bg-[#0b0f19] border border-gray-900 px-3 py-1.5 rounded-lg text-xs">
                      <span className="font-mono text-gray-400 font-bold">鏈路 {link.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModifyCost(link.id, -1)}
                          className="bg-gray-800 hover:bg-gray-700 font-mono px-2 py-0.5 rounded-l text-xs font-bold text-cyan-400"
                        >
                          -
                        </button>
                        <span className="font-mono text-cyan-300 font-bold w-5 text-center">{weights[link.id]}</span>
                        <button
                          onClick={() => handleModifyCost(link.id, 1)}
                          className="bg-gray-800 hover:bg-gray-700 font-mono px-2 py-0.5 rounded-r text-xs font-bold text-cyan-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lower Links */}
                <div className="space-y-2 mt-3">
                  <div className="text-[10px] text-amber-500 font-bold font-mono uppercase tracking-wide">
                    ▼ 下方路徑鏈路：
                  </div>
                  {linksList.filter(l => ['u-x', 'x-y', 'y-z'].includes(l.id)).map(link => (
                    <div key={link.id} className="flex items-center justify-between bg-[#0b0f19] border border-gray-900 px-3 py-1.5 rounded-lg text-xs">
                      <span className="font-mono text-gray-400 font-bold">鏈路 {link.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModifyCost(link.id, -1)}
                          className="bg-gray-800 hover:bg-gray-700 font-mono px-2 py-0.5 rounded-l text-xs font-bold text-amber-500"
                        >
                          -
                        </button>
                        <span className="font-mono text-amber-400 font-bold w-5 text-center">{weights[link.id]}</span>
                        <button
                          onClick={() => handleModifyCost(link.id, 1)}
                          className="bg-gray-800 hover:bg-gray-700 font-mono px-2 py-0.5 rounded-r text-xs font-bold text-amber-500"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-900">
                <span className="text-[10px] text-gray-500 uppercase font-mono">
                  All costs editable
                </span>
                <button
                  onClick={resetTraditionalWeights}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 border border-gray-800 hover:border-gray-700 px-2.5 py-1 rounded-lg"
                >
                  <Undo className="w-3 h-3" />
                  <span>恢復預設 Cost</span>
                </button>
              </div>
            </div>
          )}

          {/* B. SDN 控制模式面板 */}
          {activeTab === 'sdn' && (
            <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
              <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>SDN 控制器流表配置區 (Match-Action rules)</span>
              </h5>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
                在 SDN 中，您不需改動鏈路權重。請直接代表 Remote Controller 將對應的選路流規則（Flow Rules）灌入 Switch u 中！
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold font-mono uppercase tracking-wide block mb-1.5">
                    1. 設置 Switch u 的去往 目的地 z 的匹配轉發規則：
                  </label>
                  <select
                    value={sdnRules.u}
                    onChange={(e) => {
                      setSdnRules((prev) => ({ ...prev, u: e.target.value }));
                    }}
                    className="w-full bg-[#0b0f19] border border-gray-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-200"
                  >
                    <option value="dest_z_short">目的地為 z ➜ 按傳統捷徑轉發 [轉送至 x] (OSPF預設值)</option>
                    <option value="dest_z_upper">目的地為 z ➜ 強制走上路 [轉送至 v]</option>
                    <option value="split_50_50">目的地為 z ➜ 通用轉發 [50% 轉至 v, 50% 轉至 x]</option>
                    <option value="match_color_flow">
                      目的地為 z 且 來源為藍色 ➜ 轉至 x | 來源為紅色 ➜ 轉至 v (Color multi-match)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[9px] text-gray-500 font-mono block mb-1 uppercase">Switch w 流表規則</label>
                    <select
                      value={sdnRules.w}
                      onChange={(e) => {
                        setSdnRules((prev) => ({ ...prev, w: e.target.value }));
                      }}
                      className="w-full bg-gray-950/60 border border-gray-900 text-[10px] py-1.5 px-2 rounded-lg text-gray-400 focus:outline-none"
                    >
                      <option value="forward_z">Match (Dst=z) ➜ Action (Fwd Port Z)</option>
                      <option value="drop_z">Match (Dst=z) ➜ Action (Drop)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 font-mono block mb-1 uppercase">Switch x 流表規則</label>
                    <select
                      value={sdnRules.x}
                      onChange={(e) => {
                        setSdnRules((prev) => ({ ...prev, x: e.target.value }));
                      }}
                      className="w-full bg-gray-950/60 border border-gray-900 text-[10px] py-1.5 px-2 rounded-lg text-gray-400 focus:outline-none"
                    >
                      <option value="forward_z">Match (Dst=z) ➜ Action (Fwd Port Y)</option>
                      <option value="drop_z">Match (Dst=z) ➜ Action (Drop)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/10 border border-emerald-900/30 p-2.5 rounded-xl text-[10px] text-emerald-400/90 leading-relaxed font-sans mt-4">
                💡 <strong>SDN 面板啟示：</strong> 在此模式下，控制平面位於 Switch 外部。管理者只需輕點下拉選單，即可發布多維流匹配策略，不需要像傳統模式那樣盲目、牽連性地猜測/微調每個實體 link weight 阻尼！
              </div>
            </div>
          )}

          {/* C. 驗證結果提示盒 (Result Diagnostics Card) */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed font-sans ${
            currentResult.status === 'success'
              ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
              : currentResult.status === 'warning'
              ? 'bg-amber-950/20 border-amber-800 text-amber-300'
              : 'bg-rose-950/20 border-rose-900 text-rose-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1.5">
              <span>{currentResult.status === 'success' ? '✅ 目標調試無誤！' : currentResult.status === 'warning' ? '⚠️ 等價警告' : '❌ 目標尚未達成'}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                {activeTab.toUpperCase()} MODE
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {currentResult.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
