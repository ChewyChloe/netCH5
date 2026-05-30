/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Network, Server, Volume2, ShieldAlert, BadgeHelp, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface PairingCard {
  id: string;
  category: 'message' | 'convergence' | 'robustness' | 'failure';
  title: string;
  desc: string;
  type: 'LS' | 'DV';
}

export default function LSvsDVLab() {
  // 1. Network Siz & Edge Complexity Controls
  const [nodes, setNodes] = useState<number>(6);
  const [edges, setEdges] = useState<number>(8);

  const calculateMaxEdges = (n: number) => (n * (n - 1)) / 2;
  const currentMaxEdges = calculateMaxEdges(nodes);

  const handleNodesChange = (newVal: number) => {
    setNodes(newVal);
    // Secure edges count does not exceed max edges allowed mathematically
    const maxE = calculateMaxEdges(newVal);
    if (edges > maxE) {
      setEdges(maxE);
    }
  };

  const isDense = edges > currentMaxEdges * 0.6;
  const lsMessageComplexity = nodes * edges;

  // 2. Corrupt Router Simulation
  const [lieProtocol, setLieProtocol] = useState<'LS' | 'DV'>('LS');
  const [lieStep, setLieStep] = useState<number>(0);
  const [compromisedNode, setCompromisedNode] = useState<string>('C');

  // Network state logs
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    '系統就緒。請點擊上方按鈕，選擇協定種類並點擊「發動作惡謠言廣播」進行模擬。'
  ]);

  const handleTriggerLie = () => {
    setLieStep(1);
    if (lieProtocol === 'LS') {
      setSimulationLogs([
        `[t=0] 惡意路由器 [${compromisedNode}] 在 Link State 網路中起口。向鄰居宣告它與 B 點直接連接的鏈路成本為 1。`,
        `[t=1] 鄰居 A、D 收到 LSA 封包，並立刻向周邊廣播。LSA 內註明了這是來自 ${compromisedNode} 的「鄰近連結聲明」。`,
        `[t=2] 全網所有路由器（A, B, D, E, F）收到該訊息之 LSA。更新本地 LSDB 的 [${compromisedNode} ─ B] 鏈路。`,
        `[t=3] 收斂。大家在計算 Dijkstra 時發現該單一邊異常。其影響範圍局限在連接 [${compromisedNode}] 的鄰近鏈路上，${compromisedNode} 無法謊稱「A 到 F 斷線了」，其餘全網路結構保持真實可靠！`
      ]);
    } else {
      setSimulationLogs([
        `[t=0] 惡意路由器 [${compromisedNode}] 在 Distance Vector 網路中開始向鄰居廣播：「我到任何目的地（包括 A, B, D, E, F）的總成本都是 0！」`,
        `[t=1] 鄰居 A 收到這份超級便宜的 DV updates。基於 Bellman-Ford，A 計算：D_A(dest) = min { c(A, ${compromisedNode}) + D_${compromisedNode}(dest) } = 10 + 0 = 10。A 相信了，並修正自己的 DV。`,
        `[t=2] 鄰居 A 向它的鄰居 D 與 E 發送更新：「我到 dest 的成本是 10！」E 套用後也把封包指向 A，從而把原本的真實路徑洗掉。`,
        `[t=3] 錯誤感染全網！所有節點紛紛將對目標的下跳 (Next Hop) 設為此惡意節點。全網封包全部流向 [${compromisedNode}]。`,
        `[t=4] 黑洞（Black-holing）成型：所有到 A, B, D 的封包抵達 [${compromisedNode}] 後全部被丟棄 (Drop) 或竊聽！這證實了距離向量口耳相傳「撒謊感染全球」的脆弱性！`
      ]);
    }
  };

  const handleNextLieStep = () => {
    if (lieStep < (lieProtocol === 'LS' ? 3 : 4)) {
      setLieStep(prev => prev + 1);
    }
  };

  // 3. Pairing Game
  const INITIAL_PAIRINGS: PairingCard[] = [
    { id: '1', category: 'message', title: '訊息複雜度：O(n × e)', desc: '每次鏈路成本(Edge Cost)改變時，都需要全網廣播泛洪(Flooding)最新的 LSA。', type: 'LS' },
    { id: '2', category: 'message', title: '訊息複雜度：只與鄰居交換', desc: '口耳相傳。只有在計算出自己的 DV 向量發生變更時，才向直接相連的鄰居廣播更新。', type: 'DV' },
    { id: '3', category: 'convergence', title: '收斂速度：毫秒級極速重算', desc: '一旦收到 LSA，各點立刻在本地運算 Dijkstra 算法計算最短路，反應極為敏捷。', type: 'LS' },
    { id: '4', category: 'convergence', title: '收斂速度：視拓撲而變動，恐有環路', desc: '容易面臨 Count-to-Infinity 環路慢收斂。遭遇故障故障時，坏消息可能需要經過多次交換才收斂。', type: 'DV' },
    { id: '5', category: 'robustness', title: '強韌度：高 (局部故障隔離)', desc: '路由器謊報只能影響其相連線。各點自行建地圖，作惡路由器無法篡改其他非直連線的狀態。', type: 'LS' },
    { id: '6', category: 'robustness', title: '強韌度：低 (作惡謊言感染全網)', desc: '節點可虛報到任何點的核心成本。一旦謊稱 D(y)=0 且發布，全網將盲目信任將轉向指向它。', type: 'DV' },
    { id: '7', category: 'failure', title: '故障行為：產生短暫 Oscillation 震盪', desc: '若鏈路成本隨負載即時變動，流量在多條便宜路徑來回轉換，導致選路劇烈震盪。', type: 'LS' },
    { id: '8', category: 'failure', title: '故障行為：Count-to-Infinity 或 Black-holing', desc: '遭遇骨幹損壞時，兩相鄰路由器互相借道造成環路，或故障路由器宣稱低價吸引流量進入黑洞。', type: 'DV' },
  ];

  const [selectedCards, setSelectedCards] = useState<{ [id: string]: 'LS' | 'DV' }>({});
  const [gameResult, setGameResult] = useState<string | null>(null);

  const handleCardMatch = (cardId: string, choice: 'LS' | 'DV') => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: choice
    }));
  };

  const checkGame = () => {
    let correct = 0;
    INITIAL_PAIRINGS.forEach(card => {
      if (selectedCards[card.id] === card.type) {
        correct += 1;
      }
    });

    if (correct === INITIAL_PAIRINGS.length) {
      setGameResult('🎉 太棒了！你完美配對了 Link State (Dijkstra) 與 Distance Vector (Bellman-Ford) 的物理權衡特徵！考試 100 分！');
    } else {
      setGameResult(`❌ 答對了 ${correct} 題（共 ${INITIAL_PAIRINGS.length} 題）。別氣餒，答案就在本章的學術對比表格中，微調一下試試！`);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="ls-vs-dv-lab">
      
      {/* SECTION 1: 網路規模與訊息複雜度分析儀 */}
      <div className="bg-[#0f1422] border border-gray-850 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <Network className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-gray-200">
            實驗一：拓撲密度與 O(n × e) 訊息發送量預測儀
          </h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          拖動下方滑桿調節網路中路由器的節點數量 $n$ 與邊鏈路 (Edge Link) 的數量 $e$。
          系統會為你自動分析當前網路拓撲屬於<strong>稀疏網路 (Sparse)</strong> 還是<strong>密集網路 (Dense)</strong>，並依照電腦網路標準，估算在鏈路狀態改變時 LS 演算法為達到地圖同步所造成的泛洪訊息交互總量 O(n × e)。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950/40 p-4 rounded-xl border border-gray-900 mt-1">
          <div className="flex flex-col gap-4 justify-center">
            {/* 節點 Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>節點數 (Nodes) n</span>
                <span className="text-purple-400 font-bold">{nodes} 台路由器</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                value={nodes}
                onChange={(e) => handleNodesChange(parseInt(e.target.value))}
                className="w-full mt-1.5 accent-purple-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 邊數 Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>鏈路數 (Edges) e</span>
                <span className="text-purple-400 font-bold">{edges} 條雙向線路</span>
              </div>
              <input
                type="range"
                min={nodes - 1}  // Guarantee connectable graph min edges
                max={Math.min(currentMaxEdges, 45)}
                value={edges}
                onChange={(e) => setEdges(parseInt(e.target.value))}
                className="w-full mt-1.5 accent-purple-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[10px] text-gray-500 mt-1 flex justify-between font-mono">
                <span>連通下限 (樹狀): {nodes - 1} 邊</span>
                <span>完全聯通上限: {currentMaxEdges} 邊</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/10 border border-purple-900/30 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">當前拓撲密度：</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isDense 
                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' 
                  : 'bg-blue-950/40 text-blue-400 border-blue-900/40'
              }`}>
                {isDense ? 'Dense Network (密集網)' : 'Sparse Network (稀疏網)'}
              </span>
            </div>

            <div className="my-3">
              <div className="text-[10px] text-gray-500 font-mono">ESTIMATED LS FLOODING COST</div>
              <div className="text-2xl font-mono font-bold text-purple-400 mt-1 flex items-baseline gap-1.5">
                <span>{lsMessageComplexity}次訊息</span>
                <span className="text-xs text-paragraph text-gray-405 font-sans">(O(n × e))</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
              {isDense 
                ? '💡 在密集網路中，LS 洪泛的 LSA 封包會在交錯的環路中大量轉發，訊息複雜度 O(n × e) 相當高。如果這是大規模全球骨幹，路由器將不堪重負！因此 OSPF 需要劃分 Area 階層來降低 flooding 範疇。'
                : '💡 在稀疏網路中，通訊線路較精簡，泛洪碰撞的次數較少。但一旦某個主幹鏈路（Bridge）斷線，全網必須重新同步地圖並執行二次 Dijkstra 選路。'
              }
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: 惡意路由謠言擴散沙盒 */}
      <div className="bg-[#0f1422] border border-gray-850 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-bold text-gray-200">
            實驗二：惡意路由器 (Compromised Router) 撒謊擴散動態模擬器
          </h4>
        </div>
        <p className="text-xs text-gray-405 leading-relaxed font-sans">
          <strong>名詞解釋「強韌度 (Robustness) 對決」：</strong>
          如果某台路由器遭人駭入，向整個網路宣示虛假的路徑資訊。
          利用下方沙盒，切換 <strong>Link State (LS)</strong> 與 <strong>Distance Vector (DV)</strong> 協定，觀測謊言是以什麼物理機制傳遞，以及它對於其餘未妥協點產生的安全危害！
        </p>

        {/* 交互 Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-950/40 p-3.5 rounded-xl border border-gray-900">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">選擇當前協定：</span>
            <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-xs">
              <button
                onClick={() => { setLieProtocol('LS'); setLieStep(0); }}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  lieProtocol === 'LS'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Link State (OSPF)
              </button>
              <button
                onClick={() => { setLieProtocol('DV'); setLieStep(0); }}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  lieProtocol === 'DV'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Distance Vector (RIP)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">作惡節點設定：</span>
            <span className="text-xs px-2.5 py-1 bg-rose-950/50 text-rose-400 border border-rose-900/40 rounded-lg font-mono font-bold">
              NODE [{compromisedNode}] 中毒路由器
            </span>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={handleTriggerLie}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
            >
              🔥 發動惡意謠言廣播
            </button>

            {lieStep > 0 && lieStep < (lieProtocol === 'LS' ? 3 : 4) && (
              <button
                onClick={handleNextLieStep}
                className="bg-gray-800 hover:bg-gray-750 text-gray-200 font-bold px-3 py-1.5 rounded-xl text-xs border border-gray-700 transition"
              >
                步進下一步 Round
              </button>
            )}
          </div>
        </div>

        {/* 渲染圖形抽象比喻與文字歷程 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
          {/* 左側 5 格：圖示 */}
          <div className="lg:col-span-5 bg-gray-950 rounded-xl p-4 border border-gray-900 flex flex-col justify-between min-h-[220px]">
            <div className="text-[10px] text-gray-500 font-mono mb-2">DYNAMIC TOPO AND VIRUS SPREADING</div>
            
            {/* 抽象網格畫布 */}
            <div className="flex-1 flex items-center justify-center relative">
              
              {/* 繪製 5 個路由器圈 (仿 A, B, C, D, E) */}
              <div className="w-full max-w-[260px] h-[160px] relative">
                
                {/* Node C (Compromised) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-all duration-500 z-10 ${
                  lieStep > 0 
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-lg shadow-rose-950/40 animate-pulse' 
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}>
                  {compromisedNode}
                </div>

                {/* Node A (Neighbor 1) */}
                <div className={`absolute top-4 left-6 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 ${
                  lieStep >= 1 
                    ? 'bg-amber-950 text-amber-400 border-amber-500 shadow-md' 
                    : 'bg-gray-900 text-gray-305 border-gray-800'
                }`}>
                  A
                </div>

                {/* Node D (Neighbor 2) */}
                <div className={`absolute bottom-4 left-6 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 ${
                  lieStep >= 1 
                    ? 'bg-amber-950 text-amber-400 border-amber-500 border border-amber-700' 
                    : 'bg-gray-900 text-gray-305 border-gray-800'
                }`}>
                  D
                </div>

                {/* Node B (Non-Neighbor 1) */}
                <div className={`absolute top-4 right-6 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 ${
                  lieStep >= 2
                    ? lieProtocol === 'LS' 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500' // LS is healthy 
                      : 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse' // DV gets infected
                    : 'bg-gray-900 text-gray-305 border-gray-800'
                }`}>
                  B
                </div>

                {/* Node E (Non-Neighbor 2) */}
                <div className={`absolute bottom-4 right-6 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 ${
                  lieStep >= 3
                    ? lieProtocol === 'LS' 
                      ? 'bg-emerald-950 text-emerald-450 border-emerald-500' 
                      : 'bg-rose-950 text-rose-450 border-rose-700 animate-pulse' 
                    : 'bg-gray-900 text-gray-305 border-gray-800'
                }`}>
                  E
                </div>

                {/* 連線 SVG (背景細線) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current text-gray-800" strokeWidth="1">
                  {/* C-A */}
                  <line x1="130" y1="80" x2="45" y2="35" className={lieStep >= 1 ? 'text-rose-500 stroke-[1.5px]' : ''} />
                  {/* C-D */}
                  <line x1="130" y1="80" x2="45" y2="125" className={lieStep >= 1 ? 'text-rose-500 stroke-[1.5px]' : ''} />
                  {/* A-B */}
                  <line x1="45" y1="35" x2="215" y2="35" className={lieStep >= 2 ? (lieProtocol === 'LS' ? 'text-emerald-500' : 'text-rose-500 stroke-[1.5px]') : ''} />
                  {/* D-E */}
                  <line x1="45" y1="125" x2="215" y2="125" className={lieStep >= 3 ? (lieProtocol === 'LS' ? 'text-emerald-500' : 'text-rose-500 stroke-[1.5px]') : ''} />
                  {/* B-E */}
                  <line x1="215" y1="35" x2="215" y2="125" className={lieStep >= 3 ? 'text-gray-700' : ''} />
                </svg>
              </div>

            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-2 border-t border-gray-900/60 pt-2">
              <span>灰色：未受感染 ⚪</span>
              <span>黃色：接收比對中 🟡</span>
              <span className="text-rose-400 font-bold">紅色/綠色：最終收斂結果 🔴🟢</span>
            </div>
          </div>

          {/* 右側 7 格：歷史紀錄與教學分析 */}
          <div className="lg:col-span-7 flex flex-col gap-3 justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-[#818cf8] font-bold tracking-widest font-mono">STEP-BY-STEP SIMULATION LOGS</span>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-900 font-mono text-xs text-gray-300 flex flex-col gap-2.5 max-h-[190px] overflow-y-auto">
                {simulationLogs.map((log, index) => {
                  const isCurrent = index === lieStep;
                  return (
                    <div
                      key={index}
                      className={`p-1.5 rounded transition ${
                        isCurrent 
                          ? 'bg-purple-950/40 text-purple-300 border-l-2 border-purple-500 pl-2.5' 
                          : index < lieStep 
                          ? 'text-gray-500' 
                          : 'text-gray-600 opacity-60'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 教練結論分析 */}
            <div className="bg-purple-950/20 border border-purple-900/30 p-3.5 rounded-xl">
              <span className="text-[10px] text-purple-400 font-bold font-mono block">COACH’S SUMMARY REPORT：</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans mt-1">
                {lieStep === 0 && '👉 發動謠言看看！你會發現：Link State 需要全網泛洪，但因「各人自主算出地圖」，危害被限制住；而 Distance Vector 口耳相傳，謊言會自動像是傳染病引誘全網指向，極易形成黑洞路由！'}
                {lieStep > 0 && lieProtocol === 'LS' && '👉 評鑑結果（Link State）：你可以看到訊息散播了，但大家只是把它作爲地圖上屬於 C-B 之間成本變更，C 的謊言無法捏造 A 與 D 之間的物理關係，安全強韌度高。'}
                {lieStep > 0 && lieProtocol === 'DV' && '👉 評鑑結果（Distance Vector）：因為 A 盲目相信了 C 的謊言，進而把此謊言乘載自己向量宣傳給鄰居，謊言在網路上一點點蔓延污染。最終全部節點的 routing 被完全打亂，形成大規模 Black-holing 面癱！簡直是災難。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: 雙網特性對比互動配對卡 (Pairing Game) */}
      <div className="bg-[#0f1422] border border-gray-850 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold text-gray-200">
            實驗三：Link State (LS) 與 Distance Vector (DV) 學術特徵配對評測
          </h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          下面有 8 張帶有電腦網路核心特徵的說法，請在每張卡片上選擇它到底是屬於 <strong>Link State (LS/Dijkstra)</strong> 還是 <strong>Distance Vector (DV/Bellman-Ford)</strong> 的特徵特寫。
          完全答對，代表您在學術考核上具備極高的理論理解！
        </p>

        {/* 比較卡片網格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
          {INITIAL_PAIRINGS.map((card) => {
            const isSelected = selectedCards[card.id] !== undefined;
            const currentChoice = selectedCards[card.id];

            return (
              <div
                key={card.id}
                className={`bg-gray-950 p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                  isSelected 
                    ? 'border-gray-800' 
                    : 'border-purple-900/20 hover:border-purple-900/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                      {card.category} 特徵
                    </span>
                    <BadgeHelp className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <h5 className="text-xs font-bold text-gray-200 mb-1">{card.title}</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{card.desc}</p>
                </div>

                {/* 選擇按鈕組 */}
                <div className="flex gap-2 border-t border-gray-900 pt-2.5">
                  <button
                    onClick={() => handleCardMatch(card.id, 'LS')}
                    className={`flex-1 py-1 px-2.5 text-center text-[10.5px] font-bold rounded-md transition ${
                      currentChoice === 'LS'
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-900 text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    Link State (LS)
                  </button>
                  <button
                    onClick={() => handleCardMatch(card.id, 'DV')}
                    className={`flex-1 py-1 px-2.5 text-center text-[10.5px] font-bold rounded-md transition ${
                      currentChoice === 'DV'
                        ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/30'
                        : 'bg-gray-900 text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    Distance Vector (DV)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 驗證按扭與結果反饋 */}
        <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-950 p-4 rounded-xl border border-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">當前作答進度：</span>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-900/30">
              已填寫 {Object.keys(selectedCards).length} / 8 張
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCards({})}
              className="text-xs text-gray-400 hover:text-white transition font-bold"
            >
              全部重設定
            </button>
            <button
              onClick={checkGame}
              disabled={Object.keys(selectedCards).length < 8}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-55 disabled:hover:bg-purple-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1 transition"
            >
              檢定答案吻合性
            </button>
          </div>
        </div>

        {gameResult && (
          <div className={`p-4 rounded-xl text-xs leading-relaxed font-sans border ${
            gameResult.startsWith('🎉')
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
              : 'bg-rose-950/20 border-rose-900/40 text-rose-450'
          }`}>
            {gameResult}
          </div>
        )}
      </div>

    </div>
  );
}
