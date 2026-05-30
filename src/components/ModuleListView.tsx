/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgress } from '../types';
import { BookOpen, Check, Award, ArrowRight, Play } from 'lucide-react';

interface ModuleListViewProps {
  progress: UserProgress;
  onNavigateToModule: (id: string) => void;
  onNavigateToQuiz: (id: string) => void;
}

export default function ModuleListView({
  progress,
  onNavigateToModule,
  onNavigateToQuiz,
}: ModuleListViewProps) {
  const modules = [
    {
      id: 'module-1',
      title: 'Module 1: Control Plane 控制平面總覽',
      desc: '深入探討網路層控制平面的核心機制。對比傳統分散式 Per-Router 路由計算與現代新型 SDN 集中控制器架構，理解轉發表如何推演產生。',
      pages: 'PDF 第 1 - 2 頁',
      time: '約 15 分鐘'
    },
    {
      id: 'module-2',
      title: 'Module 2: Routing Protocols 與 Graph Abstraction',
      desc: '學會如何將真實世界的實體路由器與光纖連結，轉換抽象化為圖論數學模型。量化「連結成本 (Link Cost)」，考量頻寬、延遲與排隊壅塞等多維指標。',
      pages: 'PDF 第 3 - 5 頁',
      time: '約 25 分鐘'
    },
    {
      id: 'module-3',
      title: 'Module 3: Dijkstra Link-State 路由演算法',
      desc: '詳解戴克斯特拉單源最短路徑演算法之核心。剖析 N\' 集合、D(v) 距離與 p(v) 前驅節點的三變數矩陣求解更新，並手動演練 6 節點經典拓撲。',
      pages: 'PDF 第 6 - 10 頁',
      time: '約 40 分鐘'
    },
    {
      id: 'module-4',
      title: 'Module 4: Distance Vector 距離向量演算法與 Bellman-Ford 核心公式',
      desc: '詳解分散式 (Distributed) 的距離向量選路機制。深入解析 Bellman-Ford 方程式、鄰居 DV 更新消息交換，並還原吉報速動、凶報慢行以及經典的 Count-to-infinity 路由環路病態現象。',
      pages: 'PDF 第 11 - 15 頁',
      time: '約 50 分鐘'
    },
    {
      id: 'module-5',
      title: 'Module 5: Comparison of Link State and Distance Vector',
      desc: '深入定量對決 Link State (LS) 與 Distance Vector (DV) 兩大王牌演算法。比較它們的訊息複雜度、收斂速度、路由震盪 (Oscillation)、環路風險以及在路由器異常時的強韌度對比，並剖析黑洞選路 (Black-holing) 攻擊威脅。',
      pages: 'PDF 第 16 - 18 頁',
      time: '約 30 分鐘'
    },
    {
      id: 'module-6',
      title: 'Module 6: OSPF（Open Shortest Path First）選路協定與階層式設計',
      desc: '詳解最著名、廣泛部署於企業與骨幹網路中的 OSPF 自治選路協定。拆解其 LSDB 同步、MD5 加密認證，並說明為了因應大規模網路而規劃的階層式（Area-based）中樞骨幹網路（Backbone Area 0）與 ABR 邊界隔音設計。',
      pages: 'PDF 第 19 - 24 頁',
      time: '約 45 分鐘'
    },
    {
      id: 'module-7',
      title: 'Module 7: BGP（Border Gateway Protocol）自主宣告與政策選路實戰',
      desc: '詳解作為網際網路黏合劑、跨 AS 事實標準之 BGP（eBGP / iBGP）核心。深入路徑向量（Path Vector）兩大防環屬性（AS-PATH, NEXT-HOP）、TCP 179 會話四大消息、自私自利的熱馬鈴薯選路（Hot Potato），以及基於 Transit & Dual-homed 的政策選路規則。',
      pages: 'PDF 第 25 - 28 頁',
      time: '約 50 分鐘'
    },
    {
      id: 'module-8',
      title: 'Module 8: Traffic Engineering 流量工程與 SDN 驅動要素',
      desc: '深入傳統 Destination-Based 路由做流量工程 (TE) 的棘手瓶頸（難以導流非最短路徑、不易等比例拆分分流，以及無法實施多條件策略選路），透析 Generalized Forwarding 與 Match-Action 萬能匹配如何完美破解前述挑戰。',
      pages: 'PDF 第 29 - 33 頁',
      time: '約 35 分鐘'
    },
    {
      id: 'module-9',
      title: 'Module 9: SDN 控制器與 OpenFlow 交互協定與鏈路異常倒接 9 步算法',
      desc: '全面拆解 SDN 核心體系。剖析 Remote Controller 遠端控制器分層結構、OpenFlow TCP 6653 通訊信道報文、三大訊息類別，並演練 SDN 鏈路故障中，由 Data Plane 通知、OSPF/Dijkstra 改算直至 Flow Table 重下發的 9 步走黃金倒接環節。',
      pages: 'PDF 第 34 - 43 頁',
      time: '約 55 分鐘'
    },
    {
      id: 'module-10',
      title: 'Module 10: ICMP 協定機制與 Traceroute 遞增探測機制剖析',
      desc: '詳解 ICMP 協定在 IP Payload 中嵌套的結構。剖析 Echo Request/Reply 查詢 (Ping) 與各種差錯回報 (Unreachable Net/Host/Port, TTL Expired)。並深研 Traceroute 如何藉由 TTL 自 1 遞增觸發 Type 11 Code 0 逾期回郵以及最終觸發 Type 3 Code 3 埠項不可達而完美收尾的狀態閉環。',
      pages: 'PDF 網路層後半章',
      time: '約 45 分鐘'
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>電腦網路控制平面 · 課綱中心 (Syllabus)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          本精修課綱涵蓋傳統控制架構、網路圖論抽象、Dijkstra 連結狀態選路與 Distance Vector 距離向量演算法，附帶各隨堂測試評估。
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {modules.map((m) => {
          const isCompleted = progress.completedLessons.includes(m.id);
          const highScore = progress.quizHighScores[m.id] !== undefined ? progress.quizHighScores[m.id] : null;

          return (
            <div
              key={m.id}
              className="bg-[#0f1422] border border-gray-850 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-gray-800 transition"
            >
              <div className="max-w-2xl flex-1">
                <div className="flex flex-wrap items-center gap-3.5 mb-2.5">
                  <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                    {m.id.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {m.pages}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    研讀耗時 {m.time}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-100 mb-2">
                  {m.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {m.desc}
                </p>
              </div>

              {/* 進度與操控右專區 */}
              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-900 pt-4 md:pt-0 gap-4 flex-shrink-0">
                {/* 狀態標籤 */}
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      研讀已完畢
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gray-900 text-gray-500 px-2 py-1 rounded">
                      未閱讀
                    </span>
                  )}

                  {highScore !== null ? (
                    <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-900/50 px-2 py-1 rounded font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      測驗最高: {highScore}%
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gray-900 text-gray-500 px-2 py-1 rounded">
                      測驗未考
                    </span>
                  )}
                </div>

                {/* 操控通道按鍵組 */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => onNavigateToModule(m.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <span>開始學習</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToQuiz(m.id)}
                    className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>挑戰評測</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
