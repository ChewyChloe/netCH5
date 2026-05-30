/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Network, HelpCircle, HardDrive, Check, Radio, Play, ChevronRight, AlertTriangle } from 'lucide-react';

interface RouterNode {
  id: string;
  name: string;
  area: 0 | 1 | 2;
  role: 'Local' | 'ABR' | 'Backbone';
  status: 'active' | 'flooding' | 'received-summary' | 'shielded';
}

export default function OSPFHierarchicalLab() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedLinkCost, setSelectedLinkCost] = useState<number>(5);

  // Define routers state
  const [routers, setRouters] = useState<RouterNode[]>([
    // Local Area 1
    { id: 'L1a', name: 'L1a (Local R)', area: 1, role: 'Local', status: 'active' },
    { id: 'L1b', name: 'L1b (Local R)', area: 1, role: 'Local', status: 'active' },
    // Area Border Routers (ABRs)
    { id: 'ABR1', name: 'ABR-1 (Border)', area: 0, role: 'ABR', status: 'active' },
    { id: 'ABR2', name: 'ABR-2 (Border)', area: 0, role: 'ABR', status: 'active' },
    // Local Area 2 (Right Area)
    { id: 'L2a', name: 'L2a (Local R)', area: 2, role: 'Local', status: 'active' },
    { id: 'L2b', name: 'L2b (Local R)', area: 2, role: 'Local', status: 'active' },
  ]);

  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    '🔴 正常狀態下：Area 1 內的小路由器在運作。請在下方變更 [L1a ↔ L1b] 連結阻力或發動斷線...再點擊「啟動 LSA 局部演化」步進觀摩！'
  ]);

  // Handle Cost Update & Reset Simulation Steps
  const handleCostChange = (newCost: number) => {
    setSelectedLinkCost(newCost);
    setActiveStep(0);
    // Reset status
    setRouters(prev => prev.map(r => ({ ...r, status: 'active' })));
    setSimulationLogs([
      `⚡ L1a ↔ L1b 的連結成本更改為 ${newCost}。這是在 Local Area 1 內部的微小變動。點擊「啟動 LSA 局部演化」看詳細廣播阻擋機制。`
    ]);
  };

  const runSimulationStep = () => {
    const nextS = activeStep + 1;
    setActiveStep(nextS);

    if (nextS === 1) {
      // Step 1: L1a triggers Link Cost Change, flooding is restricted to Area 1
      setRouters(prev => prev.map(r => {
        if (r.area === 1) return { ...r, status: 'flooding' };
        return { ...r, status: 'active' };
      }));
      setSimulationLogs(prev => [
        ...prev,
        `[Step 1 ── LSA 泛洪限制] L1a 發覺鄰居連線成本改寫為 ${selectedLinkCost}。它立刻發送「Link-State Advertisement (LSA)」增量通知。LSA 沿著 Area 1 快速泛洪（Flooding），此處的 L1b 與 ABR1 均收到 LSA 封包（呈現亮黃色），並原地觸發本地 Dijkstra 重算！`
      ]);
    } else if (nextS === 2) {
      // Step 2: ABR1 shields the detailed topology changed LSA. It converts it to Summary Route
      setRouters(prev => prev.map(r => {
        if (r.id === 'ABR1') return { ...r, status: 'flooding' };
        if (r.id === 'ABR2') return { ...r, status: 'received-summary' };
        if (r.area === 1) return { ...r, status: 'active' }; // Finished flooding
        return r;
      }));
      setSimulationLogs(prev => [
        ...prev,
        `[Step 2 ── ABR 隔噪與彙整廣播] 關鍵角色 Area Border Router [ABR1] 收到了 L1a 的 LSA。身為 ABR，它做了一件非常有智慧的事：「它絕對不把 L1a 的詳細 LSA 拓撲轉發進 Backbone Area 0 骨幹裡！」這徹底阻絕了微觀雜訊。取而代之的是，它計算了 Area 1 到 Backbone 網段的總成本，並向 Backbone Area 0 發送了一條「彙整路由消息 (Summary LSA Update)」── ABR2 收到該彙整向量，更新其路由表。`
      ]);
    } else if (nextS === 3) {
      // Step 3: Area 2 sees routing changes in summary but is completely shielded from O(n*e) flooding noise.
      setRouters(prev => prev.map(r => {
        if (r.area === 2) return { ...r, status: 'shielded' };
        if (r.id === 'ABR2') return { ...r, status: 'active' };
        if (r.id === 'ABR1') return { ...r, status: 'active' };
        return r;
      }));
      setSimulationLogs(prev => [
        ...prev,
        `[Step 3 ── Area 2 同步與屏蔽結論] ABR2 彙總向 Area 2 內部的 L2a, L2b 宣告：「如果要到 Area 1（L1a, L1b 網段），成本調整為 ${selectedLinkCost + 4}。」L2a與L2b更新了各自 Fowarding table 對該網段的總 Cost（呈現翠綠色），但自始至終，它們「連一個微觀的 O(n*e) LSA 封包都沒收到」，也完全沒觸發到 Area 1 大幅度的 Dijkstra 計算！兩層防護成功！`
      ]);
    }
  };

  const handleResetSimulation = () => {
    setActiveStep(0);
    setRouters(prev => prev.map(r => ({ ...r, status: 'active' })));
    setSimulationLogs([
      '🔴 演示已重設：此演示完整展示 OSPF 巨觀在階層式雙層網路中（Backbone 0, Area 1, Area 2）的雜訊遮蔽機制。'
    ]);
  };

  return (
    <div className="flex flex-col gap-5" id="ospf-hierarchical-lab">
      
      {/* 概念與引導 */}
      <div className="bg-[#0f1422] border border-gray-850 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-gray-250">
            實驗：OSPF 階層式拓撲（ABR 隔噪與 Summary 彙整）動態實驗室 🌐
          </h4>
        </div>
        <p className="text-xs text-paragraph text-gray-400 leading-relaxed font-sans">
          大範圍的 Link-State 網路若只有一層，<strong>LSDB 會極大無比，且任何一條微小網線斷開，都會引發全網瘋狂二次 Dijkstra 計算</strong>。
          為了解決此痛點，OSPF 採取<strong>兩層階層化 Area 設計</strong>。
          下面架構展示了三個邏輯區：<strong>Local Area 1 ── Backbone Area 0 ── Local Area 2</strong>，由 ABR 自主相接。變更下方的連結狀態並一步步啟動演化，親眼觀看 ABR 它是如何遮蔽吵雜的 LSA L3 封包！
        </p>

        {/* 互動觸發 controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-gray-950/40 p-4 rounded-xl border border-gray-900">
          <div className="md:col-span-5 flex flex-col justify-center gap-2.5">
            <label className="text-xs text-gray-400 font-bold block">
              1. 控制變更 [L1a ↔ L1b] 連結成本：
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCostChange(3)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex-1 border ${
                  selectedLinkCost === 3
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                變為超快: Link Cost = 3
              </button>
              <button
                onClick={() => handleCostChange(12)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex-1 border ${
                  selectedLinkCost === 12
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                塞車：Link Cost = 12
              </button>
              <button
                onClick={() => handleCostChange(99)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex-1 border ${
                  selectedLinkCost === 99
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                ❌ 直接物理斷線
              </button>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center gap-2">
            <span className="text-xs text-gray-400 font-bold">2. 觀察 LSA 收斂演示進度 (階層示範)：</span>
            <div className="flex flex-wrap gap-2.5 items-center mt-0.5">
              <button
                onClick={runSimulationStep}
                disabled={activeStep >= 3}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Play className="w-4.5 h-4.5" />
                <span>{activeStep === 0 ? '啟動 LSA 局部演化' : 'LSA 演化 Step-by-Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleResetSimulation}
                className="text-xs text-gray-450 hover:text-gray-200 transition font-mono border border-gray-800 hover:border-gray-700 px-3 py-1.5 rounded-lg"
              >
                重置
              </button>

              <span className="text-xs font-mono font-bold text-cyan-400">
                🚀 進度軌跡: STEP {activeStep} / 3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 演示拓撲視覺化 & LOGS 輸出 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 左 7 格 拓撲圖 */}
        <div className="lg:col-span-7 bg-gray-950 p-5 rounded-2xl border border-gray-900 flex flex-col justify-between min-h-[300px]">
          <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between">
            <span>OSPF HIERARCHICAL TOPOLOGY SCHEMATIC</span>
            <span className="text-xs text-gray-400 font-mono">Area-based partition</span>
          </div>

          {/* 繪製三區域的容器 */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <div className="relative w-full max-w-[500px] h-[190px] flex justify-between items-center px-4">
              
              {/* Region Label: Area 1 */}
              <div className="absolute top-1 left-2 underline decoration-gray-800 text-[10px] text-gray-500 font-mono tracking-wider font-bold">
                LOCAL AREA 1
              </div>

              {/* Region Label: Backbone Area 0 */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 underline decoration-purple-900 text-[10px] text-purple-500 font-mono tracking-wider font-bold">
                BACKBONE AREA 0
              </div>

              {/* Region Label: Area 2 */}
              <div className="absolute top-1 right-2 underline decoration-gray-800 text-[10px] text-gray-500 font-mono tracking-wider font-bold">
                LOCAL AREA 2
              </div>

              {/* AREA BOUNDARY BOXES BACKGROUNDS */}
              <div className="absolute top-6 bottom-4 left-0 w-[140px] bg-slate-900/10 border border-dashed border-gray-900 rounded-xl pointer-events-none -z-10" />
              <div className="absolute top-6 bottom-4 left-[155px] right-[155px] bg-purple-900/[0.03] border border-dashed border-purple-900/15 rounded-xl pointer-events-none -z-10" />
              <div className="absolute top-6 bottom-4 right-0 w-[140px] bg-slate-900/10 border border-dashed border-gray-900 rounded-xl pointer-events-none -z-10" />

              {/* AREA 1 LOCAL ROUTERS */}
              <div className="flex flex-col gap-6">
                {/* L1a -> triggers cost change */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-300 ${
                  routers[0].status === 'flooding'
                    ? 'bg-amber-950 text-amber-300 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}>
                  <HardDrive className="w-4 h-4 mb-1 text-gray-400" />
                  <span>{routers[0].name}</span>
                </div>

                {/* L1b */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-300 ${
                  routers[1].status === 'flooding'
                    ? 'bg-amber-950 text-amber-300 border-amber-500 ring-2 ring-amber-500/30 font-medium'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}>
                  <HardDrive className="w-4 h-4 mb-1 text-gray-400" />
                  <span>{routers[1].name}</span>
                </div>
              </div>

              {/* AREA BORDER ROUTER 1 (ABR-1) */}
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-500 ${
                routers[2].status === 'flooding'
                  ? 'bg-amber-950 text-amber-400 border-amber-500 ring-2 ring-amber-500/40 animate-pulse'
                  : 'bg-slate-900 text-purple-300 border-purple-800/80 shadow-md shadow-purple-900/5'
              }`}>
                <Radio className="w-5 h-5 mb-1 text-purple-400" />
                <span>{routers[2].name}</span>
                <span className="text-[7.5px] scale-90 font-mono font-bold text-gray-300 mt-0.5">ABR_01</span>
              </div>

              {/* AREA BORDER ROUTER 2 (ABR-2) */}
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-500 ${
                routers[3].status === 'received-summary'
                  ? 'bg-blue-950 text-blue-300 border-blue-500 ring-2 ring-blue-500/30 animate-bounce'
                  : 'bg-slate-900 text-purple-305 border-purple-800/80'
              }`}>
                <Radio className="w-5 h-5 mb-1 text-purple-400" />
                <span>{routers[3].name}</span>
                <span className="text-[7.5px] scale-90 font-mono font-bold text-gray-350 mt-0.5">ABR_02</span>
              </div>

              {/* AREA 2 LOCAL ROUTERS */}
              <div className="flex flex-col gap-6">
                {/* L2a */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-300 ${
                  routers[4].status === 'shielded'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}>
                  <HardDrive className="w-4 h-4 mb-1 text-gray-400" />
                  <span>{routers[4].name}</span>
                  {routers[4].status === 'shielded' && <span className="text-[8px] font-mono text-emerald-500 mt-0.5">🟢 已隔噪</span>}
                </div>

                {/* L2b */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] border font-bold transition-all duration-300 ${
                  routers[5].status === 'shielded'
                    ? 'bg-emerald-950 text-emerald-450 border-emerald-500 shadow-md'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}>
                  <HardDrive className="w-4 h-4 mb-1 text-gray-400" />
                  <span>{routers[5].name}</span>
                  {routers[5].status === 'shielded' && <span className="text-[8px] font-mono text-emerald-500 mt-0.5">🟢 已屏障</span>}
                </div>
              </div>

              {/* 連線 SVG 指引 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current text-gray-800" strokeWidth="1">
                {/* L1a ─ L1b (可控連線) */}
                <line x1="55" y1="50" x2="55" y2="135" className={selectedLinkCost === 99 ? 'stroke-rose-900 stroke-dashed' : 'stroke-cyan-500 stroke-[2px]'} />
                
                {/* L1a ─ ABR1 */}
                <line x1="55" y1="50" x2="165" y2="95" className={routers[0].status === 'flooding' ? 'stroke-amber-400 stroke-2' : 'stroke-gray-800'} />
                {/* L1b ─ ABR1 */}
                <line x1="55" y1="135" x2="165" y2="95" className={routers[1].status === 'flooding' ? 'stroke-amber-400 stroke-2' : 'stroke-gray-850'} />
                
                {/* ABR1 ─ ABR2 (Backbone Link 0) */}
                <line x1="225" y1="95" x2="275" y2="95" className={routers[2].status === 'flooding' ? 'stroke-blue-400 stroke-[2.5px] stroke-dashed' : 'stroke-purple-900'} />
                
                {/* ABR2 ─ L2a */}
                <line x1="335" y1="95" x2="445" y2="50" className={routers[4].status === 'shielded' ? 'stroke-emerald-600' : 'stroke-gray-850'} />
                {/* ABR2 ─ L2b */}
                <line x1="335" y1="95" x2="445" y2="135" className={routers[5].status === 'shielded' ? 'stroke-emerald-600' : 'stroke-gray-850'} />
              </svg>

              {/* 線上成本值標示 */}
              <div className="absolute top-[80px] left-[25px] bg-slate-900 text-[9.5px] font-mono px-1 border border-gray-800 rounded text-cyan-400">
                {selectedLinkCost === 99 ? '∞ (斷)' : `w=${selectedLinkCost}`}
              </div>

            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono border-t border-gray-900 pt-2.5">
            <span>🔴 Area 0 骨幹區域</span>
            <span>🟡 LSA L3 泛洪區域（只限 Local Area）</span>
            <span className="text-emerald-400">🟢 僅做 Summary 同步（免泛洪/免重算）</span>
          </div>
        </div>

        {/* 右 5 格：日誌與理論總結 */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-cyan-400 font-bold tracking-widest font-mono">SIMULATED STEPPING EVENTS</span>
            <div className="bg-gray-950 p-4 border border-gray-900 rounded-xl font-mono text-xs text-gray-300 flex flex-col gap-3 min-h-[180px] max-h-[220px] overflow-y-auto">
              {simulationLogs.map((log, index) => {
                const isCurrent = index === activeStep;
                return (
                  <div
                    key={index}
                    className={`p-1.5 rounded transition ${
                      isCurrent
                        ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-500 pl-2.5'
                        : index < activeStep
                        ? 'text-gray-500 opacity-70'
                        : 'text-gray-650 opacity-40'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 教練之大局觀觀摩報告 */}
          <div className="bg-cyan-950/10 border border-cyan-900/30 p-4 rounded-xl flex flex-col gap-1.5">
            <span className="font-bold text-xs text-cyan-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span> Vibe Coding 教授筆記 ── 層級設計的科學之美：</span>
            </span>
            <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
              在大規模 OSPF 中，如果沒有 ABR。若 Area 1 內一條線路的 Cost 從 3 變 12，全體一萬台路由器都會被迫收下這個詳細 LSA，並重算一遍耗時的 Dijkstra 最短路徑。
              <br />
              現在有了層級化 Area，<strong>LSA 洪泛百分之百被隔絕在 Area 1 內部</strong>！
              ABR1 像是降噪牆，只對 Area 0 發送簡單的 Summary（距離向量宣告）。
              Area 2 的 L2a 與 L2b 路由器得以存活，不需要清空自己的 LSDB，也完全不需要重算 Dijkstra！這即是 <strong>LS (區域內) 與 DV (區域間) 兩大哲學完美交融的最頂尖工程方案！</strong>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
