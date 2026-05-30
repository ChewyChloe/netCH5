/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgress } from '../types';
import { Play, Compass, Award, Cpu, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

interface HomeViewProps {
  progress: UserProgress;
  onNavigateToModule: (moduleId: string) => void;
  onNavigateToSimulator: () => void;
}

export default function HomeView({
  progress,
  onNavigateToModule,
  onNavigateToSimulator,
}: HomeViewProps) {
  const completedCount = progress.completedLessons.length;
  const attemptedQuizzes = Object.keys(progress.quizHighScores).length;

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      {/* 英雄版位 (Hero Banner)：資深電腦網路教授、互動教材設計師與 vibe coding 教練人設 */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-slate-950 via-[#0b0f19] to-slate-900 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>VIBE CODING 領航教育系列</span>
          </div>

          <h1 className="text-2xl md:text-3.5xl font-bold font-sans mt-3 tracking-tight leading-tight text-white">
            電腦網路：<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold">控制平面 Control Plane</span> 互動學習系統 
          </h1>

          <p className="text-xs md:text-sm text-gray-400 mt-3 leading-relaxed font-sans">
            「哈囉！我是你們的電腦網路教授、互動教具設計師與 Vibe Coding 教練。這一節課不准死記硬背！我們要透過親手變更權重與點擊圖形算法步進，感受路由器做決策時的動態脈搏。現在就讓我們揚帆啟航！」
          </p>

          <div className="flex flex-wrap gap-3.5 mt-5">
            <button
              onClick={() => onNavigateToModule('module-1')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-blue-500/10"
            >
              <Compass className="w-4 h-4" />
              <span>開始探索 Module 1</span>
            </button>
            <button
              onClick={onNavigateToSimulator}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
            >
              <Play className="w-4 h-4" />
              <span>動態 Dijkstra 模擬器</span>
            </button>
          </div>
        </div>

        {/* 抽象精美 SVG 圖形 (反映網路 Control Plane Vibe 特效) */}
        <div className="relative w-44 h-44 flex items-center justify-center bg-gray-900/10 rounded-full border border-gray-800 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-70">
            <circle cx="50" cy="50" r="4" fill="#38bdf8" />
            <circle cx="20" cy="30" r="3" fill="#10b981" />
            <circle cx="80" cy="30" r="3" fill="#10b981" />
            <circle cx="20" cy="70" r="3" fill="#10b981" />
            <circle cx="80" cy="70" r="3" fill="#10b981" />
            <line x1="20" y1="30" x2="50" y2="50" stroke="#4b5563" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="80" y1="30" x2="50" y2="50" stroke="#4b5563" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="20" y1="70" x2="50" y2="50" stroke="#10b981" strokeWidth="1" />
            <line x1="80" y1="70" x2="50" y2="50" stroke="#10b981" strokeWidth="1" />
            <line x1="20" y1="30" x2="20" y2="70" stroke="#4b5563" strokeWidth="0.5" />
            <line x1="80" y1="30" x2="80" y2="70" stroke="#4b5563" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="8" stroke="#38bdf8" strokeWidth="1" fill="none" className="animate-ping" />
          </svg>
        </div>
      </div>

      {/* 快速概覽 (Quick Stats Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            COMPLETED MODULES
          </div>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1 flex items-baseline gap-1">
            <span>{completedCount}</span>
            <span className="text-xs text-gray-500">/ 10 modules</span>
          </div>
        </div>

        <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            QUIZ DEPLOYED
          </div>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1 flex items-baseline gap-1">
            <span>{attemptedQuizzes}</span>
            <span className="text-xs text-gray-500">/ 10 quizzes</span>
          </div>
        </div>

        <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl col-span-1 md:col-span-2">
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            COACH SUGGESTION (今日學習方針)
          </div>
          <div className="text-xs text-emerald-400/90 font-sans mt-1.5 flex items-start gap-1 leading-relaxed">
            <span>💡</span>
            <span>
              {completedCount === 0
                ? '起點手感極佳。推薦先從「Module 1」建立控制平面的傳統與 SDN 雙核心概念！'
                : completedCount < 10
                ? '研讀功力深厚。繼續征服後續章節，進修 Module 9 (SDN 控制OpenFlow) 與全新的 Module 10 (ICMP 與 Traceroute 遞增探航機制)！'
                : '登峰造極！全部 10 個學術模組、控制選路、SDN 控制面交互，以及 ICMP Traceroute 探孔實驗皆已修畢，您已成為名副其實的電腦網路控制平面大師！'}
            </span>
          </div>
        </div>
      </div>

      {/* 學習模組快遞通道：Module Cards (Grip 1 到 6) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>核心學習軌道 (Curriculum Tracts)</span>
          </h3>
          <span className="text-[11px] text-gray-500 font-bold">2026 學年度精修教材</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div
            onClick={() => onNavigateToModule('module-1')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-blue-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 01
                </span>
                {progress.completedLessons.includes('module-1') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition">
                Control Plane 控制平面總覽
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                研究控制平面大腦如何引導轉發平面。剖析傳統 Per-Router 控制與新興 SDN 集中化控制器之區別。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 1-2</span>
              <span className="text-blue-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 2 */}
          <div
            onClick={() => onNavigateToModule('module-2')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-blue-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 02
                </span>
                {progress.completedLessons.includes('module-2') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition">
                Routing Protocols 與 Graph Abstraction
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                將實體網路對應成圖論！探討如何將路由器抽象化為 Nodes，網路線映射成 Edges，並基於頻寬和時間量化阻力 c。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 3-5</span>
              <span className="text-blue-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 3 */}
          <div
            onClick={() => onNavigateToModule('module-3')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-emerald-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-950/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 03
                </span>
                {progress.completedLessons.includes('module-3') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition">
                Dijkstra Link-State Routing 演算法
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                全網廣播後，如何集中求解最短路徑樹？詳解 N' 拓展與 D 更新公式。本模組內嵌 Dijkstra 互動模擬器！
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 6-10</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 4 */}
          <div
            onClick={() => onNavigateToModule('module-4')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-indigo-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-950/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 04
                </span>
                {progress.completedLessons.includes('module-4') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 transition">
                Distance Vector 選路演算法
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                口耳相傳分布式演算法！解構 Bellman-Ford 公式，解析並互動模擬吉報速動、凶報慢行及 Count-to-Infinity 死結。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-905 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 11-15</span>
              <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 5 */}
          <div
            onClick={() => onNavigateToModule('module-5')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-purple-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-950/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 05
                </span>
                {progress.completedLessons.includes('module-5') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-purple-400 transition">
                LS vs DV 路由演算法深度對決
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                戴克斯特拉與距離向量大決戰！定量分析訊息量、收斂速度、以及路由器遭篡改對全網黑洞（Black-holing）的強韌度衝擊。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 16-18</span>
              <span className="text-purple-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 6 */}
          <div
            onClick={() => onNavigateToModule('module-6')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-cyan-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-950/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 06
                </span>
                {progress.completedLessons.includes('module-6') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition">
                OSPF 自治路由與階層式劃分
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                解解離全球骨幹選路！理解 OSPF 的 LSDB 同步、MD5 認證，並深刻探討 Backbone Area 0 與 Area Border Router 的階層化減負抗環。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 19-24</span>
              <span className="text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 7 */}
          <div
            onClick={() => onNavigateToModule('module-7')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-rose-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-rose-955 text-rose-400 border border-rose-955/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 07
                </span>
                {progress.completedLessons.includes('module-7') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-rose-400 transition">
                BGP 邊界閘道協定與政策選路
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                掌控全球 Internet 的黏著劑！解析 eBGP/iBGP 會話、Path Vector 環路偵測、自私熱馬鈴薯以及商務政策路由宣告。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 25-28</span>
              <span className="text-rose-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 8 */}
          <div
            onClick={() => onNavigateToModule('module-8')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-emerald-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-emerald-955 text-emerald-400 border border-emerald-955/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 08
                </span>
                {progress.completedLessons.includes('module-8') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition">
                流量工程與 SDN 驅動要素
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                突破傳統路徑枷鎖！探討傳統路由在流量工程、分流（Split Traffic）與多條件選路上的痛點，領會 Generalized Forwarding 之美。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 29-33</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 9 */}
          <div
            onClick={() => onNavigateToModule('module-9')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-indigo-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-indigo-955 text-indigo-400 border border-indigo-955/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 09
                </span>
                {progress.completedLessons.includes('module-9') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                    ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 transition">
                SDN 控制器與 OpenFlow 交互
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                主掌軟體定義網路的指揮家！深度剖析 SDN 分層架構、OpenFlow 通訊信道與 9 步走 Link Failure 故障倒接連鎖反應。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF Pages 34-43</span>
              <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 10 */}
          <div
            onClick={() => onNavigateToModule('module-10')}
            className="group bg-[#0f1422] hover:bg-[#12192b] border border-gray-850 hover:border-sky-900/60 p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] bg-sky-955 text-sky-400 border border-sky-955/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MODULE 10
                </span>
                {progress.completedLessons.includes('module-10') && (
                  <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-0.5">
                     ● 已讀完
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-200 group-hover:text-sky-400 transition">
                ICMP 協定與 Traceroute 遞增探航
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                解剖網路探診與出錯回報機制！解構 Echo Request/Reply 訊息，詳解與互動實驗 Traceroute 逐步 TTL 計時逾期回報，體會控制面如何引導終端排除故障。
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-gray-900 pt-3 mt-4 text-gray-500">
              <span className="font-mono">PDF 網路層後半大考點</span>
              <span className="text-sky-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>前往學習</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 設計思考專區：Dijkstra & DV 雙核心模擬器宣傳卡 */}
      <div className="bg-gradient-to-r from-blue-955/20 via-[#0e1629] to-emerald-955/20 border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">
            Interactive Learning Sandbox
          </h4>
          <h3 className="text-sm md:text-base font-bold text-gray-200 mt-1">
            Dijkstra 連結狀態與 Distance Vector 距離向量雙核心互動演練沙盒
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">
            本沙盒百分之百還原教材 PDF 電腦網路大綱。除了 Dijkstra 演算法的逐步更新與公式推算外，更全新整合了 Distance Vector 非同步分布式交換引擎，可即時模擬封包消息飛行、綠/黃邊點擊權重變更、以及經典 Count-to-Infinity 路由環路的崩壞與收斂臨界。
          </p>
        </div>
        <button
          onClick={onNavigateToSimulator}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 transition-all flex-shrink-0"
        >
          <span>進入解算沙盒</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
