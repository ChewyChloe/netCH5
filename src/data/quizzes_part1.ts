import { Quiz } from '../types';

export const quizzesPart1: Record<string, Quiz> = {
  'module-1': {
    moduleId: 'module-1',
    questions: [
      {
        id: 'm1-q1',
        type: 'single',
        questionText: '下列何者是網路層控制平面 (Control Plane) 的最核心職責？',
        options: ['A. 規劃端到端 (End-to-End) 封包路徑', 'B. 將封包從輸入端口移動到本機輸出端口', 'C. 緩衝佇列調度與封包排隊', 'D. 交換矩陣的線路轉換'],
        correctAnswer: 'A',
        explanation: '控制平面職責在於全域路由路徑規劃；B、C、D 等均屬於資料平面的本機轉發範疇。',
        conceptBadge: '控制平面定位',
        reviewSection: 'Module 1：專業定義',
        choicesWrongExplanation: {
          'B': '屬於資料平面 (Data Plane) 的本機轉發 (Forwarding) 行為。',
          'C': '屬於資料平面的緩衝區排隊調度。',
          'D': '屬於路由器內部交換架構的硬體層級處理。'
        }
      },
      {
        id: 'm1-q2',
        type: 'boolean',
        questionText: '【是非題】在 SDN (軟體定義網路) 架構中，每個交換機內部依然自主計算、維護著完整的分散式選路演算法（如 Dijkstra）。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'False (錯誤)',
        explanation: 'SDN 將控制與轉發分離，選路運算由外部集中的遙控控制器 (Remote Controller) 運算後下發流表，交換機不自主跑 Dijkstra 演算法。',
        conceptBadge: 'SDN 控制與轉發分離',
        reviewSection: 'Module 1：SDN 的崛起背景'
      },
      {
        id: 'm1-q3',
        type: 'fill',
        questionText: '控制平面會運算路由演算法，並將結果下發寫入路由器硬體的高速查詢表以供資料平面使用。此表繁體中文稱為何？（三個字，包含「表」字，或英文 Forwarding Table）',
        correctAnswer: '轉發表',
        explanation: '路由演算法計算出的路徑最終被編譯為轉發表 (Forwarding Table)，硬體 ASIC 晶片據此進行極速轉發。',
        conceptBadge: '轉發表功能',
        reviewSection: 'Module 1：專業定義'
      },
      {
        id: 'm1-q4',
        type: 'scenario',
        questionText: '【情境題】IT主管希望能在單一集中主控台上根據科學運算研究動態修改全校上百台設備的轉送規則，不需逐台連線修改，應選擇何種架構？',
        options: ['A. 傳統分散式控制 (Per-Router Control)', 'B. 軟體定義網路集中控制 (SDN)', 'C. 實體層手動插拔光纖', 'D. 點對點 Ad-hoc 有線網'],
        correctAnswer: 'B',
        explanation: 'SDN 的集中控制器擁有全網狀態，其北向 API 可提供程式化策略下發，不需逐台變更設定。',
        conceptBadge: '集中式控制優勢',
        reviewSection: 'Module 1：SDN 的崛起背景',
        choicesWrongExplanation: {
          'A': '分散式架構需登入每台路由器個別調控，在集中大範圍管理上极为繁瑣。',
          'C': '實體層操作無法做到軟體動態、可程式化的控制。',
          'D': 'Ad-hoc 是無固定基建的無線網路拓撲，不符校園固定骨幹管理需求。'
        }
      },
      {
        id: 'm1-q5',
        type: 'single',
        questionText: '相較於「資料平面 (Data Plane)」的微秒級處理，「控制平面」的時間尺度通常在何種範圍？',
        options: ['A. 毫秒 (ms) 至秒 (seconds) 級別的軟體運算', 'B. 皮秒 (picoseconds) 級別', 'C. 完全即時不產生任何運算時延', 'D. 以天 (days) 為單位的排程運作'],
        correctAnswer: 'A',
        explanation: '控制平面涉及路由訊息交換。軟體計算（Dijkstra）通常耗時數毫秒至數秒。',
        conceptBadge: '控制平面效能特徵',
        reviewSection: 'Module 1：常見誤解'
      },
      {
        id: 'm1-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些項目屬於軟體定義網路 (SDN) 二分層架構中，控制與轉發分離所帶來的顯著優勢？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: ['A. 轉發交換機可簡化為定製 ASIC 晶片的低成本硬體', 'B. 可避免集中式控制器單點毀壞的物理風險', 'C. 集中控制器可實施超越傳統 Destination-based 的彈性多欄位調度', 'D. 完全不需要任何網路實體線路連接即可通訊'],
        correctAnswer: 'A,C',
        explanation: 'SDN 可簡化轉發硬體為標準白牌交換機，且利於集中式流量工程與多欄位匹配。但集中控制器確實存在單點毀壞風險，且依然需要實體線路。',
        conceptBadge: 'SDN 架構優缺點',
        reviewSection: 'Module 1：SDN 的崛起背景'
      },
      {
        id: 'm1-q7',
        type: 'matching',
        questionText: '【配對題】請將控制平面架構與其技術特徵正確配對：\n[左邊項目] 1. 傳統每路由控制 (Per-Router) | 2. 集中式控制 (SDN)\n[右邊項目] A. 控制與轉發在同台設備內，彼此交疊 | B. 控制平面位於外部分離的 Controller 中',
        options: ['A. 1-A, 2-B', 'B. 1-B, 2-A'],
        correctAnswer: 'A',
        explanation: '傳統分散式選路中，OSPF/Dijkstra 在單台路由器自主運行，故選 1-A；SDN 則解耦控制，選 2-B。',
        conceptBadge: '控制平面架構配對',
        reviewSection: 'Module 1：專業定義'
      },
      {
        id: 'm1-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 SDN 架構下，全新網包抵達、到流表規則成功安裝的標準生命流程順序：\n(0) 交換機收到無匹配流表的封包\n(1) 封包封裝為 Packet-In 送往 Controller\n(2) Controller 計算並產生 Flow-Mod 修改規則\n(3) 交換機安裝新流流表，後續同類包高速硬體轉發',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '標準流程為：無流表匹配觸發 Miss -> 送出 Packet-In 諮詢控制器 -> 控制器下發 Flow-Mod 流表 -> 完成安裝並轉發。',
        conceptBadge: 'SDN 面板流處理順序',
        reviewSection: 'Module 1：SDN 的崛起背景'
      },
      {
        id: 'm1-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】在傳統分散式路由計算中，以下四個步驟的正確計算次序為何？\n(0) 各路由器建立並宣告本機鏈路狀態\n(1) 全網漫遊交換，使每台路由器都取得完整的 Link-State 資料庫\n(2) 在本地端獨立執行 Dijkstra 核心演算法\n(3) 為本機填入轉發表（Forwarding Table）的最優下一躍點',
        options: ['A. (0)→(1)→(2)→(3)', 'B. (1)→(0)→(2)→(3)', 'C. (0)→(2)→(1)→(3)', 'D. (2)→(0)→(1)→(3)'],
        correctAnswer: 'A',
        explanation: '傳統 Link-State 先主動宣告 (0) -> 收集 LSDB (1) -> 執行演算法 (2) -> 寫入硬體轉發表 (3)。',
        conceptBadge: '分散式路由演算法流程',
        reviewSection: 'Module 1：對應 PDF 內容'
      },
      {
        id: 'm1-q10',
        type: 'calculation',
        questionText: '【計算題】若某交換機上有 50 條併行流規則。每條規則每分鐘平均耗用 SDN 北向心跳指令 (Flow-Mod 以及 Packet-In) 計 4 個封包。若控制平面單封包處理時效為 2ms，則控制器每分鐘為此交換機付出多少毫秒 (ms) 的運算開銷？',
        correctAnswer: '400',
        explanation: '處理開銷 = 50 條流 * 4 * 2ms = 400ms。',
        conceptBadge: '控制平面開銷計算',
        reviewSection: 'Module 1：常見誤解'
      },
      {
        id: 'm1-q11',
        type: 'chart',
        questionText: '【圖表判讀題】觀察以下控制平面拓撲：一遙控 SDN 控制器 C 同時連線交換機 S1, S2, S3，且 S1 與 S2 之間有備接線路。若控制器 C 與 S1 的連線因光纖斷裂失效，S1 如何更新其路由規則？',
        options: [
          'A. S1 斷開連線，無法再進行任何轉發',
          'B. S1 透過 S2 轉送 Out-of-band 或 In-band 控制封包與控制器 C 通訊，完成流表更新',
          'C. S1 降級跑傳統 RIP 並完全放棄 SDN 控制面',
          'D. 控制器 C 自動發射無線微波繞過斷線處'
        ],
        correctAnswer: 'B',
        explanation: '若 C 與 S1 的直接控制鏈路斷線，系統可利用鄰居交換機 S2 (In-band Control) 作為覆蓋中繼，將 S1 的控制需求轉發給 C。',
        conceptBadge: 'SDN 帶內控制拓撲',
        reviewSection: 'Module 1：常見誤解'
      },
      {
        id: 'm1-q12',
        type: 'single',
        questionText: '在 SDN 架構中，北向界面的最核心功能是？',
        options: [
          'A. 控制器與底層交換晶片之間，發射流表修改 (Flow-Mod) 指令',
          'B. 允許網絡管理人員或第三方上層網路應用程式，動態命令控制器並提取拓撲資訊',
          'C. 路由器與路由器之間，宣告 OSPF 資料包',
          'D. 用於在應用層提供加密 HTTPS 用戶端上傳服務'
        ],
        correctAnswer: 'B',
        explanation: '北向 API 端對上層應用。南向 API (如 OpenFlow) 提供底層控制器對硬體交換機的命令功能。',
        conceptBadge: '北向介面目的',
        reviewSection: 'Module 1：專業定義'
      }
    ]
  },
  'module-2': {
    moduleId: 'module-2',
    questions: [
      {
        id: 'm2-q1',
        type: 'single',
        questionText: '在圖形理論抽象化記號 $G = (N, E)$ 之中，英文字母「N」與「E」分別代表什麼物理意涵？',
        options: [
          'A. N 是節點（Node）集合代表路由器；E 是邊（Edge）集合代表鏈路線纜',
          'B. N 是網路（Network）層編號；E 是終端（End）個數',
          'C. N 是名稱系統；E 是出錯碰撞概率',
          'D. N 是子網掩碼；E 代表網際乙太接口'
        ],
        correctAnswer: 'A',
        explanation: '圖的抽象化中，N 代指 Nodes (網路中的路由器，即節點)，E 代指 Edges (實體鏈路，即邊)。',
        conceptBadge: '網路圖論基礎',
        reviewSection: 'Module 2：專業定義'
      },
      {
        id: 'm2-q2',
        type: 'boolean',
        questionText: '【是非題】在電腦網路鏈路成本規劃中，一條實體光纖線的 cost (w, v) 成本數值必須恆定為正整數，完全不允許負數或零值存在。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: '若是 0 成本會導致不耗損無限循環選路，且 Dijkstra 等主要網路路由演算法在設定上要求邊權重為正值 (通常大於等於常規 1)。負邊在實際運算可能造成無止盡的負環路。',
        conceptBadge: '鏈路成本特性',
        reviewSection: 'Module 2：白話解釋'
      },
      {
        id: 'm2-q3',
        type: 'fill',
        questionText: '如果節點 v 與節點 w 之間有實體線相連，其成本用 c(v, w) 表示；若兩者完全失聯、不具任何直接連線，則在路由演算演算法中，其鏈路成本一般宣告為「何種數值」？（中文兩個字，或符號 ♾️ / Infinity）',
        correctAnswer: '無限大',
        explanation: '無相連線的兩節點，預設初始距離或成本值均視作無限大 (Infinity)。',
        conceptBadge: '無連線成本',
        reviewSection: 'Module 2：白話解釋'
      },
      {
        id: 'm2-q4',
        type: 'scenario',
        questionText: '【情境題】台北到東京段的實體光纖原本設定 c(TPE, TYO) = 10。如果因跨海地震導致光纖高損耗、延遲暴增 50 倍，網路管理員最好如何快速在控制平面進行鏈路成本調校？',
        options: [
          'A. 放棄該邊，設定其 c(TPE, TYO) 為無限大，迫使流量重新分流繞道',
          'B. 維持原成本，在 TPE 增加路由器',
          'C. 修改其成本為零，讓更多人優先使用以減輕延遲',
          'D. 拔起網路線不理會'
        ],
        correctAnswer: 'A',
        explanation: '當特定鏈路損耗不堪使用，將其 cost 設置為無限大能最快讓 OSPF/Dijkstra 改算，繞開此通道。零成本只會造成相反效果（更多流量擁堵）。',
        conceptBadge: '鏈路成本動態調整',
        reviewSection: 'Module 2：生活比喻',
        choicesWrongExplanation: {
          'B': '增設路由器並不能洗刷或降低原有劣化鏈路上的阻礙。',
          'C': '如果調成 0 會形成吸鐵效應，促使更多流量往劣化線路上衝，造成更恐怖的崩潰。',
          'D': '拔起不修改控制面宣告，會發生資料包丟棄盲區 (Blackhole)。'
        }
      },
      {
        id: 'm2-q5',
        type: 'single',
        questionText: '在圖論中，一個節點與其相鄰實體邊的總個數，一般稱為該節點的什麼？',
        options: ['A. 度 (Degree)', 'B. 權 (Weight)', 'C. 徑 (Path)', 'D. 流 (Flow)'],
        correctAnswer: 'A',
        explanation: '在無向圖中，一節點相連的邊數稱為度數 (Degree)，有向圖中則區分入度與出度。',
        conceptBadge: '節點度定義',
        reviewSection: 'Module 2：專業定義'
      },
      {
        id: 'm2-q6',
        type: 'multi',
        questionText: '【多選題】在路由器的鏈路成本設定中，管理人員通常會參考哪些實體效能指標來綜合決定 Edge Cost 數值？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. 實體線路的可用頻寬 (Bandwidth) 的倒數',
          'B. 測試所得的雙向實時傳輸延遲延宕 (Delay)',
          'C. 路由器的外殼烤漆顏色',
          'D. 線路商的經濟和約成本造價'
        ],
        correctAnswer: 'A,B,D',
        explanation: '頻寬倒數（如 OSPF 參考頻寬/100M）、傳輸時延與經濟造價都是主流的 Edge Cost 考量。烤漆與此無關。',
        conceptBadge: '鏈路成本衡量因子',
        reviewSection: 'Module 2：白話解釋'
      },
      {
        id: 'm2-q7',
        type: 'matching',
        questionText: '【配對題】請配對圖論中的詞彙與在 IP 網路中的實體元件：\n[左邊項目] 1. 頂點 (Vertices/Nodes) | 2. 邊 (Edges) | 3. 路徑成本 (Path Cost)\n[右邊項目] A. 光纖、雙絞線 | B. 路由器 | C. 端到端延遲或線路代價之和',
        options: ['A. 1-B, 2-A, 3-C', 'B. 1-A, 2-B, 3-C'],
        correctAnswer: 'A',
        explanation: '頂點為路由器 (Nodes)，邊為線規 (Edges)，路徑成本為總成本 (c1 + c2 ...)。',
        conceptBadge: '圖論對應配對',
        reviewSection: 'Module 2：專業定義'
      },
      {
        id: 'm2-q8',
        type: 'sorting',
        questionText: '【排序題】以下是從多條並行路徑中，手動找尋最優路徑之排序步驟：\n(0) 列出起點到終點所有無環路的候選路徑\n(1) 將各路徑上所有的 Edge Cost 連續加總\n(2) 在所得路徑分數列表中，找出總 cost 最小的路徑\n(3) 將最優下一跳寫入本機轉發表',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (2)-(1)-(0)-(3)', 'D. (0)-(2)-(1)-(3)'],
        correctAnswer: 'A',
        explanation: '基本加權路徑找法是先列出候選 -> 加總其成本 -> 比選最小 -> 填入本機表。',
        conceptBadge: '最優路徑尋覓法',
        reviewSection: 'Module 2：專業定義'
      },
      {
        id: 'm2-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】如果有一不帶權重的圖形拓撲（所有邊成本均視作 1）。我們要取得從 A 到 F 的最少跳數最優路徑，使用下列哪一種經典搜索演算法，步驟在時效上最少？',
        options: [
          'A. 廣度優先搜索 (BFS)',
          'B. 深度優先搜索 (DFS)',
          'C. 貝爾曼-福特公式無腦推導',
          'D. A* 啟發式搜索'
        ],
        correctAnswer: 'A',
        explanation: '無權重時成本等同於跳數。此時廣度優先搜索 (BFS) 可以最快速找到最少跳數（最短）路徑。',
        conceptBadge: '無權重最短路徑',
        reviewSection: 'Module 2：常見誤解'
      },
      {
        id: 'm2-q10',
        type: 'calculation',
        questionText: '【計算題】一條路徑包含 A-B-C-D。已知 c(A,B) = 3, c(B,C) = 15, c(C,D) = 40。如果管理者優化了 B-C 線路，使其損耗成本降低了 5，則優化後該 Path 的 A-D 端到端總路徑成本為何？',
        correctAnswer: '53',
        explanation: '原本 A-D 的 Path Cost = 3 + 15 + 40 = 58。優化降低了 5，所以 58 - 5 = 53。',
        conceptBadge: '路徑成本運算',
        reviewSection: 'Module 2：白話解釋'
      },
      {
        id: 'm2-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 3 節點圈形 A-B-C。成本 c(A,B)=2, c(B,C)=3, c(A,C)=6。若要在 A 路由器的轉發表中設定去往目的地 C 的下一跳躍，哪一個是最低成本的最優轉發方向？',
        options: [
          'A. 直接經由下一跳 C 轉送 (成本 6)',
          'B. 先繞經下一跳 B 轉送 (成本 5)',
          'C. 兩者成本相同，直接進行等價多路負載 (ECMP)',
          'D. 封包無法抵達目的地 C'
        ],
        correctAnswer: 'B',
        explanation: '雖然直接去 C (AC) 只要 1 跳，但成本是 6。繞經 B 到 C (A->B->C) 成本只要 2+3=5。更短但高 cost 的直連會被捨棄，故選擇經由 B。',
        conceptBadge: '拓撲路徑選擇',
        reviewSection: 'Module 2：白話解釋'
      },
      {
        id: 'm2-q12',
        type: 'boolean',
        questionText: '【是非題】在非連通圖中，若從 A 路由器到 F 電腦完全沒有任何實體線路相通，則在此兩節點在路由控制演算法中算出的連通路徑成本為 ♾️ (無限大)。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: '非連通圖代表實體線路完全中斷或無通道，在演算法上以「無限大」成本來完美表徵。',
        conceptBadge: '非連通性特徵',
        reviewSection: 'Module 2：專業定義'
      }
    ]
  },
  'module-3': {
    moduleId: 'module-3',
    questions: [
      {
        id: 'm3-q1',
        type: 'single',
        questionText: 'Dijkstra 演算法在電腦網絡選路中，被視為何種類別的路由演算法？',
        options: [
          'A. 全域性連結狀態路由演算法 (Link State, LS)',
          'B. 分散式距離向量路由演算法 (Distance Vector, DV)',
          'C. 主觀靜態靜態政策路由演算法',
          'D. 漫遊網路深度神經網路選路'
        ],
        correctAnswer: 'A',
        explanation: 'Dijkstra 為 Link-State 代表演算法，要求每個節點在計算路徑前都具備完整的 LS 拓撲資料庫。',
        conceptBadge: 'Dijkstra 分類歸屬',
        reviewSection: 'Module 3：專業定義'
      },
      {
        id: 'm3-q2',
        type: 'boolean',
        questionText: '【是非題】Dijkstra 演算法若遭遇負鏈路成本 (Negative Edge Weights)，仍然能 100% 準確、無誤差地計算出最優路徑。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'False (錯誤)',
        explanation: 'Dijkstra 有貪婪特性，一旦將節點加入 $N\'$，即假設到該點的最短距離已確認。如果存在負成本鏈路，會使已確定的節點被更長但包含負值的路徑推翻，導致結果錯誤。',
        conceptBadge: 'Dijkstra 限制條件',
        reviewSection: 'Module 3：常見誤解'
      },
      {
        id: 'm3-q3',
        type: 'fill',
        questionText: 'Dijkstra 演算法以迭代方式運算。在演算法中，用來表示「已被確認找到端到端最短路徑、已定錨的節點集合」之專有名詞記號為何？（請填入大寫字母加一個符號，例如 N\'）',
        correctAnswer: "N'",
        explanation: '在 Dijkstra 的推導公式中，一般使用 $N\'$ 代表目前已經確定最短路徑的節點集合，每個步驟會吸納一個不在 $N\'$ 中且 D 估計值最小的節點。',
        conceptBadge: 'N-prime 集合記號',
        reviewSection: 'Module 3：專業定義'
      },
      {
        id: 'm3-q4',
        type: 'scenario',
        questionText: '【情境題】工程師部署 OSPF 後，觀測到當有新網路連入時，雖然 Dijkstra 正確，但中途路由器在 LS 庫尚未交換同步的數毫秒短暫空檔內，封包發生了自體旋轉 (Routing Loop)。這最可能是什麼問題造成的？',
        options: [
          'A. Dijkstra 本身有結構缺陷，不支持任何拓撲變更',
          'B. 分散式 LSDB 短期不同步，兩節點各以不同時態的拓撲計算了轉發表，形成短暫環路',
          'C. 路由器感染了物理病毒',
          'D. 光訊號傳輸過快'
        ],
        correctAnswer: 'B',
        explanation: 'Link-State 在泛洪泛洪擴散拓撲變更時，各節點重新執行本地 Dijkstra 是獨立的。如果 A 已算完新轉發表而 B 尚未收到變更、仍按舊表發送，就會產生短暫的選路環路。',
        conceptBadge: 'LSDB 同步環路問題',
        reviewSection: 'Module 3：對應 PDF 內容',
        choicesWrongExplanation: {
          'A': 'Dijkstra 是嚴謹的圖形最短路徑算法，並非其自身缺陷，而是系統異步造成的。',
          'C': '這是典型的網際協定異步暫態問題，與電腦病毒無直接關係。',
          'D': '時效差是由於 CPU 計算和協定資料包擴散延遲（非訊號過快）。'
        }
      },
      {
        id: 'm3-q5',
        type: 'single',
        questionText: '對於具備 $n$ 個節點的網路拓撲，在最樸素的無堆疊優化 Dijkstra 下，其運算時間複雜度為何？',
        options: ['A. $O(n^2)$', 'B. $O(n \\log n)$', 'C. $O(n^3)$', 'D. $O(1)$'],
        correctAnswer: 'A',
        explanation: '樸素 Dijkstra 的每一輪均要對全部不在 $N\'$ 的頂點做比選，需搜索 $n$ 次，每次做過濾，時間複雜度為 $O(n^2)$。使用 Fibonacci Heap 等優化科可達 $O(m + n \\log n)$。',
        conceptBadge: 'Dijkstra 複雜度',
        reviewSection: 'Module 3：專業定義'
      },
      {
        id: 'm3-q6',
        type: 'multi',
        questionText: '【多選題】在進行 Dijkstra 演算法的每一輪迭代（Step）時，下列哪些變數需要被更新與記錄？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. 已定錨的最短路徑節點集合 $N\'$',
          'B. 當前從來源到每個節點的當前距離估計值 $D(v)$',
          'C. 沿最短路徑指向該節點的前一個前驅節點（前瞻節點）$p(v)$',
          'D. 鄰居路由器的物理硬體 MAC 儲存表'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'Dijkstra 的迭代涉及更新 N-prime、各頂點暫存累加 cost $D(v)$ 以及其最優前驅路徑記錄 $p(v)$。MAC 轉發屬資料鏈結層，非網路層路徑演算的變量。',
        conceptBadge: 'Dijkstra 迭代變數',
        reviewSection: 'Module 3：對應 PDF 內容'
      },
      {
        id: 'm3-q7',
        type: 'matching',
        questionText: '【配對題】請配對 Dijkstra 公式中常見的符號與其表示意義：\n[左邊項目] 1. $u$ | 2. $D(v)$ | 3. $p(v)$\n[右邊項目] A. 起始來源節點 (Source Node) | B. 目前從 source 到 v 最低成本路徑之代價 | C. 路徑上到 v 的前驅節點 (Predecessor)',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: 'u 為源起點，D(v) 是當前估計成本值，p(v) 是最短路徑樹中的 A 後置前驅。',
        conceptBadge: 'Dijkstra 符號意義',
        reviewSection: 'Module 3：專業定義'
      },
      {
        id: 'm3-q8',
        type: 'sorting',
        questionText: '【排序題】請排序 Dijkstra 進入迴圈後的 4 個處理步驟：\n(0) 找出目前不屬於 $N\'$ 且 $D(v)$ 值最小的節點 $w$\n(1) 將該節點 $w$ 納入已確認集合 $N\'$\n(2) 對於所有 $w$ 的鄰接且不在 $N\'$ 中的節點 $v$，以 $D(v) = \\min(D(v), D(w) + c(w, v))$ 式進行鬆弛 (Relaxation) 更新\n(3) 檢查是否所有節點均已納入 $N\'$，若是則退出，否則重複迴圈',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '標準贪婪鬆弛流程為：找最小估計 w -> 加入 N-prime -> 更新其鄰接節點 v 距離 -> 檢查迴圈邊界。',
        conceptBadge: 'Dijkstra 虛擬演算步驟',
        reviewSection: 'Module 3：生活比喻'
      },
      {
        id: 'm3-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當我們在進行 Dijkstra 演算法，若目前 $N\' = \\{u, v, y\\}$。發現下一個不屬於 $N\'$ 且距離值最小的節點是 $x$。在將 $x$ 納入 $N\'$ 並對其所有未定錨鄰居做鄰居鏈路更新時，此步驟公式被稱為何？',
        options: [
          'A. 邊鬆弛 (Edge Relaxation)',
          'B. 鏈路加和 (Link Accumulation)',
          'C. 路由環路裁剪 (Cycle Pruning)',
          'D. 貝爾曼矩陣迭代'
        ],
        correctAnswer: 'A',
        explanation: '利用 $D(v) = \\min(D(v), D(w) + c(w,v))$ 調整鄰接頂點距離估計的動作，在圖形演算法中通稱為「邊鬆弛（Edge Relaxation）」。',
        conceptBadge: '邊鬆弛概念',
        reviewSection: 'Module 3：對應 PDF 內容'
      },
      {
        id: 'm3-q10',
        type: 'calculation',
        questionText: '【計算題】從節點 u 起算。起始 D(u)=0。已知鄰接 $c(u,v)=2, c(u,w)=5$。其餘點距離為 ♾️。第一輪選取 v 納入 $N\'$。已知 $c(v,w)=2, c(v,x)=10$。鬆弛更新後，節點 w 與 x 的當前距離估計值 $D(w)$ 及 $D(x)$ 分別代表多少？',
        options: [
          'A. D(w) = 4; D(x) = 12',
          'B. D(w) = 5; D(x) = 10',
          'C. D(w) = 4; D(x) = 10',
          'D. D(w) = 7; D(x) = 12'
        ],
        correctAnswer: 'A',
        explanation: '更新 $D(w) = \\min(5, D(v)+c(v,w)) = \\min(5, 2+2) = 4$；更新 $D(x) = \\min(\\infty, D(v)+c(v,x)) = \\min(\\infty, 2+10) = 12$。',
        conceptBadge: 'Dijkstra 手算演練',
        reviewSection: 'Module 3：對應 PDF 內容'
      },
      {
        id: 'm3-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 4 頂點對稱網狀：u-v (成本 1), v-x (成本 2), u-x (成本 4), u-y (成本 8), x-y (成本 1)。起算點為 u。在算完 Dijkstra 之後，去到終點節點 y 的最優最短路徑（前驅指針回溯）為何？',
        options: [
          'A. u → y (成本 8)',
          'B. u → v → x → y (成本 4)',
          'C. u → x → y (成本 5)',
          'D. u → v → y (成本 9)'
        ],
        correctAnswer: 'B',
        explanation: '路徑 u-y 成本為 8。路徑 u-x-y 成本為 4+1=5。路徑 u-v-x-y 成本為 1+2+1=4。故最短路徑是由 u 經 v 和 x 到達 y，成本為最小的 4。',
        conceptBadge: '圖形最短路徑判讀',
        reviewSection: 'Module 3：白話解釋'
      },
      {
        id: 'm3-q12',
        type: 'fill',
        questionText: '在 Dijkstra 計算完成後，A 路由器可以沿著一條由各節點指向其前一步驟者的指標鏈，反向推導回起點 A。此指標在程式設計中，一般儲存在哪一個拼音欄位中（請寫英文 lowercase，例如 p(v) 括碼內的主體字母）？',
        correctAnswer: 'predecessor',
        explanation: '前驅指標或前驅結點稱為 predecessor（通常縮寫為 p(v)），用來保存最短路徑樹的樹枝結構。',
        conceptBadge: 'Dijkstra 狀態欄',
        reviewSection: 'Module 3：專業定義'
      }
    ]
  }
};
