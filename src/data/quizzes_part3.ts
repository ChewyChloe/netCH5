import { Quiz } from '../types';

export const quizzesPart3: Record<string, Quiz> = {
  'module-7': {
    moduleId: 'module-7',
    questions: [
      {
        id: 'm7-q1',
        type: 'single',
        questionText: '軟體定義網路 (SDN) 官方規範架構自下而上主要區分為哪三層？',
        options: [
          'A. 轉發資料平面 (Data Plane) → 集中控制平面 (Control Plane) → 網路軟體應用層 (Application Plane)',
          'B. 銅纜實體層 → OSPF 層 → BGP 策略層',
          'C. 用戶端前端 → 網頁伺服器後端 → 資料庫層',
          'D. 核心主幹交換器 → 邊緣區域 ABR → 終端電腦層'
        ],
        correctAnswer: 'A',
        explanation: 'ONF 官方定義 SDN 三層架構為 Data Plane (數據轉發、交換機)、Control Plane (控制器)、Application Plane (動態 TE 等商業邏輯應用)。',
        conceptBadge: 'SDN 三層架構',
        reviewSection: 'Module 7：專業定義',
        choicesWrongExplanation: {
          'B': '這是傳統 IP 網路的分層路由抽象，非 SDN 功能層架構。',
          'C': '這是 Web 全端應用的標準三層架構，與網路層控制無關。',
          'D': '這是典型大學園骨幹架構的物理歸類。'
        }
      },
      {
        id: 'm7-q2',
        type: 'boolean',
        questionText: '【是非題】在 SDN 控制架構中，「南向介面 (Southbound Interface)」專為與經營管理、第三方自動化應用系統進行 API 呼叫與政策串接而設計。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'False (錯誤)',
        explanation: '南向介面（如 OpenFlow）用來向下控制實體或虛擬交換機；與上層應用軟體對接的 API 稱為「北向介面（Northbound Interface）」。',
        conceptBadge: '南向與北向差異',
        reviewSection: 'Module 7：專業定義、生活比喻'
      },
      {
        id: 'm7-q3',
        type: 'fill',
        questionText: 'SDN 架構中，控制器下發控制命令給底層交換機最為經典、產業使用最普及的協定其名稱為何？（請填寫包含大寫的英文名 "OpenFlow"）',
        correctAnswer: 'OpenFlow',
        explanation: 'OpenFlow 協定是 SDN 的奠基者，目前也是南向協定的代表，定義了如何變更 Flow Table。',
        conceptBadge: 'OpenFlow 定位',
        reviewSection: 'Module 7：專業定義'
      },
      {
        id: 'm7-q4',
        type: 'scenario',
        questionText: '【情境題】為了滿足對特定 VIP 客戶上傳視訊的高頻寬需求，网管希望開發一個上層 Web App，能夠一鍵偵測拓撲並強制為該使用者開啟備用光纖端口。此 App 應該呼叫 SDN 控制器的哪一個界面？',
        options: [
          'A. 北向界面的 RESTful JSON API',
          'B. 實體交換機的命令行 SSH',
          'C. 自行泛洪 OSPF LSA 封包',
          'D. 網卡驅動程序的硬體暫存器'
        ],
        correctAnswer: 'A',
        explanation: '上層應用（Web App）要與控制器互動，需要直接呼叫控制器的「北向介面（RESTful API）」，從而讓控制器內部控制底層轉發。',
        conceptBadge: 'SDN 北向 API 實踐',
        reviewSection: 'Module 7：SDN 的崛起背景',
        choicesWrongExplanation: {
          'B': '直接連線交换機 SSH 是傳統分散式管理的土法做法，違揹了 SDN 一體化管理的精要。',
          'C': '應用軟體不具有直接構造、宣告 IGP 泛洪的相容能力。',
          'D': '這在作業系統底層，無法控制全網拓撲邊際。'
        }
      },
      {
        id: 'm7-q5',
        type: 'single',
        questionText: 'SDN 的三大核心架構概念不包括下列何者？',
        options: [
          'A. 控制與轉發二分層解耦',
          'B. 集中或分散群組化邏輯控制器 (Remote Controller)',
          'C. 可程式化 (Programmable) 選路政策下發',
          'D. 交換機內 Dijkstra 演算法之全面提速運作'
        ],
        correctAnswer: 'D',
        explanation: 'SDN 將控制面移至主體設備外（Controller 集中），交換機不再運行複雜的 Dijkstra 計算，而是變成單純的流匹配轉發晶片。',
        conceptBadge: 'SDN 核心概念',
        reviewSection: 'Module 7：對應 PDF 內容'
      },
      {
        id: 'm7-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些功能性元件，通常屬於集中式 SDN 控制器的內部核心元件組件？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. 網路全局狀態管理（鏈路狀態拓撲庫、交換機註冊狀態）',
          'B. 流表規則派發編譯器 (Flow Table Compiler)',
          'C. 光纖調頻物理雷射模組',
          'D. 對應北向與南向的 API 驅動端 (OpenFlow 驅動器 & REST-API 通道)'
        ],
        correctAnswer: 'A,B,D',
        explanation: '控制器是控制面大腦，包含拓撲狀態維護、選路決策以及南、北向驅動。實體光纖發射晶片位在資料平面的物理層，非控制器邏輯軟體範圍。',
        conceptBadge: '控制器軟體結構',
        reviewSection: 'Module 7：對應 PDF 內容'
      },
      {
        id: 'm7-q7',
        type: 'matching',
        questionText: '【配對題】請正確配對 SDN 的介面及其對象：\n[左邊項目] 1. 北向 API (Northbound) | 2. 南向 API (Southbound) | 3. 東/西向 API\n[右邊項目] A. 與交換機硬體 (如 OpenFlow) 通訊 | B. 用於控制器叢集 (Cluster) 之間的狀態備份與協調 | C. 對上層商業應用 (REST JSON Web App) 提供程式化控制',
        options: ['A. 1-C, 2-A, 3-B', 'B. 1-A, 2-C, 3-B'],
        correctAnswer: 'A',
        explanation: '北向對應用 C；南向對設備交換 A；東/西向用於多個 Controller 行業備份與叢集通信 B。',
        conceptBadge: 'SDN 介面配對',
        reviewSection: 'Module 7：專業定義'
      },
      {
        id: 'm7-q8',
        type: 'sorting',
        questionText: '【排序題】請排出硬體交換機從通電、到與 OpenFlow 控制器建立安全工作規則之初始步驟順序：\n(0) 交換機通電並取得 IP 地址\n(1) 交換機向配置的 Controller 拋起 TCP 三向握手連接 (Port 6653)\n(2) 兩端交握 OFPT_HELLO 協商 OpenFlow 版本號碼\n(3) 控制器下發 OFPT_FEATURES_REQUEST 取得交换機轉發特徵設定',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '上線建立控制流順序：通電配 IP (0) -> 建立 TCP 端連線 (1) -> HELLO 版本協商 (2) -> 特徵查詢特徵設定 (3)。',
        conceptBadge: 'OpenFlow 控制對話順序',
        reviewSection: 'Module 7：常見誤解'
      },
      {
        id: 'm7-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】SDN 裝載流表規則有兩種哲學。在「主動式模式 (Proactive Mode)」下，下列哪一項是正確的路由處理演算法邏輯？',
        options: [
          'A. 當交換機沒匹配到流表時，拋起 Packet-In，現場請控制器即時計算並回傳安裝流表。',
          'B. 管理者預先設計好全網流量控制策略，控制器在網路啟動時主動把可能的所有流表規則預先推送到交換機中。當新封包抵達交換機時，直接以線速匹配轉送，不產生首包查詢時延。',
          'C. 將所有封包由硬體全數丟棄，直至使用者手動登入交換機逐條安裝。',
          'D. 拋棄 Controller，回復使用 RIP 協議。'
        ],
        correctAnswer: 'B',
        explanation: 'Proactive(主動/預裝模式)會於啟動或設定時將流表全數推至交換機，沒有 reactive (反應式)在首包匹配失敗時引發 Packet-In 所拉長的手續與延遲，適合固定結構、可靠線速轉發表。',
        conceptBadge: 'SDN 主動與被動下發演算法',
        reviewSection: 'Module 7：常見誤解'
      },
      {
        id: 'm7-q10',
        type: 'calculation',
        questionText: '【計算題】某 OpenFlow 交換機硬體流表空間最大僅能裝載 500 條 Flow Entries。在「Reactive」模式下，每秒有 20 個未匹配的新流抵達交換機引發 Packet-In 安裝。假設每條匹配流表具有 30 秒的 Hard Timeout (超期刪除)。此交換機是否會遭遇到流表溢流失效 (Flow Table Exhaustion)？',
        options: [
          'A. 是（穩態下將耗用 600 條空間，超出交換機承受能力 500）',
          'B. 否（穩態下耗用僅 150 條空間，低於 500 限制）',
          'C. 否（超速在 3ms 內即自動清空）',
          'D. 兩者與過期時間無涉'
        ],
        correctAnswer: 'A',
        explanation: '穩態下累積流表條數 = 每秒新安裝 20 條 * 存活時間 30 秒 = 600 條。由於交換機最大僅支持 500 條，600 > 500，這將導致硬體流表空間溢出耗盡，使得後續的新封包無法被順暢匹配或發生 Packet Loss，答案為是。',
        conceptBadge: '流表空間量算',
        reviewSection: 'Module 7：常見誤解'
      },
      {
        id: 'm7-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 OpenFlow 轉發表規則：\n優先級 100：Match: IP_Dst = 10.0.0.1; Action: Forward Port 1\n優先級 50：Match: IP_Dst = 10.0.0.0/24; Action: Forward Port 2\n優先級 10：Match: ALL; Action: Drop\n若一封包 IP_Dst 為 10.0.0.1 抵達交換機，依此流表判讀，該封包將依照何種規矩被轉送？',
        options: [
          'A. 從 Port 1 轉發（因為優先級 100 最高）',
          'B. 從 Port 2 轉發（因為遮罩匹配最長）',
          'C. 封包將直接被丟棄 (Drop)',
          'D. 同時發送往 Port 1 與 Port 2'
        ],
        correctAnswer: 'A',
        explanation: '雖然目的地 10.0.0.1 既符合優先級 100 的精確 IP，也符合優先級 50 的 /24 網段，但在 OpenFlow 中，是嚴格比對優先級 (Priority) 數值。100 大於 50，所以採取優先級 100 的 Action：轉向 Port 1。這與傳統 destination-based 最長匹配不同（雖然此處最長匹配也是 A）。',
        conceptBadge: '流表判讀準則',
        reviewSection: 'Module 7：對應 PDF 內容'
      },
      {
        id: 'm7-q12',
        type: 'boolean',
        questionText: '【是非題】OpenFlow 規格中规定，交換機與控制器南向連線時，預設使用 TLS 加密或一般純 TCP，其採用的官方專屬 Port 號碼主要為 6653。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'IANA 將 6653 分配給 OVS/OpenFlow 交換機控制安全通訊連接。',
        conceptBadge: 'OpenFlow 常識協定',
        reviewSection: 'Module 7：專業定義'
      }
    ]
  },
  'module-8': {
    moduleId: 'module-8',
    questions: [
      {
        id: 'm8-q1',
        type: 'single',
        questionText: '傳統 Destination-based 轉送在流量工程 (Traffic Engineering, TE) 選路最致命的缺陷是什麼？',
        options: [
          'A. 只能依據 IP 目的地查找最長匹配，無法動態根據來源、協定或 TCP 埠號將特定連線分流繞過擁擠的直通鏈。',
          'B. 轉算延時太低',
          'C. 完全不支援在 10Gbps 的實體光纖上走 OSPF',
          'D. 具有自毀傾向'
        ],
        correctAnswer: 'A',
        explanation: '傳統轉發只根據目標 IP (Destination) 做最長匹配轉送。如果 A 出去某骨幹有一寬、一窄兩線路，目標 IP 都相同，傳統手段就必須全部擠在同一條路上，無法分散負載，這也是流量工程 (TE) 呼喚 SDN 多欄位調度的出發點。',
        conceptBadge: 'TE 目的由來',
        reviewSection: 'Module 8：對應 PDF 內容',
        choicesWrongExplanation: {
          'B': '傳統硬體轉送延遲極低。主要是靈活性（而非延宕）嚴重不足。',
          'C': 'OSPF 廣泛適用於高速骨幹上。',
          'D': '這純粹是誇張、不合理的文學形容詞。'
        }
      },
      {
        id: 'm8-q2',
        type: 'boolean',
        questionText: '【是非題】藉由集中式 SDN 控制器，我們可以主動根據即時流量指標對特定邊際路由器下發規則，直接推翻、覆蓋並重整傳統 OSPF 及 BGP 預設的最短路徑。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'SDN 的一大賣點就是提供全網動態、可程式的可見度。可以直接覆蓋傳統 IGP/EGP 計算出的路徑來避免特定線路擁堵不均。',
        conceptBadge: 'SDN 流量覆寫覆蓋',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構'
      },
      {
        id: 'm8-q3',
        type: 'fill',
        questionText: '在網際網路骨幹管理中，網路工程師透過分析即時效能，主動調整控制排程政策、優化全網出口配額並防止特定鏈路充溢，通常通稱為「流量工程」，其英文縮寫為何？（請填寫兩個大寫字母，如 TE）',
        correctAnswer: 'TE',
        explanation: '流量工程英文為 Traffic Engineering，簡稱 TE。',
        conceptBadge: '流量工程縮寫',
        reviewSection: 'Module 8：對應 PDF 內容'
      },
      {
        id: 'm8-q4',
        type: 'scenario',
        questionText: '【情境題】某大學對外有兩家固網線路 ISP1 與 ISP2。平时所有人看 Youtube 把聯接 ISP1 的線路徹底塞滿。管理員希望設定「凡是去看 Youtube (特定 IP 列表) 走便宜的 ISP1；其餘選課與學術網站一律走更穩定的 ISP2」。傳統 destination-based 找不到方法，他如何基於 SDN 快速實現？',
        options: [
          'A. 設定 OpenFlow 具備 Destination IP = Youtube 的匹配走 Port 1，其餘 Wildcard（Type-miss）走 Port 2',
          'B. 直接斷開 ISP1，全部人走 ISP2',
          'C. 將所有學術網站的 IP 改編至 Youtube 的 DNS 下',
          'D. 強制所有人不許看 Youtube 否則鎖卡'
        ],
        correctAnswer: 'A',
        explanation: '藉由 SDN controller，工程師可於交換機下發帶有條件目的匹配 (Youtube Dst-IP) 的流規則走向 Port 1，而其他流量命中 Table-miss 進而導向 Port 2，達成策略分流。',
        conceptBadge: 'SDN 選路策略',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構',
        choicesWrongExplanation: {
          'B': '直接物理中斷會造成便宜的頻寬浪費、造成學術網站也極端擠在昂貴的 ISP2。',
          'C': 'IP 不可能如此改編對應。這在原理上不可行。',
          'D': '這是人為行政管制，非控制平面工程技術手段。'
        }
      },
      {
        id: 'm8-q5',
        type: 'single',
        questionText: '為何集中式 SDN 控制平台可以克服传统 IGP（如 OSPF/IS-IS）在跨區域多商品流量調度分配時的局限性？',
        options: [
          'A. 集中式大腦（Controller）具備全局實時觀測性與動態可程式化多欄位調度機制',
          'B. SDN 完全不受光纖物理距離衰減的限制',
          'C. SDN 路由器比普通路由器大十倍',
          'D. SDN 控制器可以將封包加速至超光速'
        ],
        correctAnswer: 'A',
        explanation: '傳統 IGP 是自主分散計算，每台只有本地局部的鏈路成本，只能算出各自的最短路。SDN 集中大腦具有全局拓撲與流特徵（Global View）並採用程式化下發，容易做複雜的多點分流與全局最優優化（動態 TE）。',
        conceptBadge: 'SDN 集中優勢',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構'
      },
      {
        id: 'm8-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些參數在 BGP 自治系統邊界上通常被稱為「TE 引流控制旋鈕 (Control Knobs)」，可用以微調出/入網流量配比？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. Local Preference (本地偏好, 控制出流量)',
          'B. MED (Multi-Exit Discriminator, 控制入流量建議)',
          'C. AS-PATH prepending (人为塞長路徑, 使外部降低走此進口之意願)',
          'D. 路由器的實體主板出廠序號'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'Local Pref, MED 還有 AS-PATH Prepending（故意增加 AS-PATH 步長）都是 BGP 極限 TE 的經典引流旋鈕。硬體序號無法用作路由策略宣告。',
        conceptBadge: 'BGP TE 旋鈕工具',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構'
      },
      {
        id: 'm8-q7',
        type: 'matching',
        questionText: '【配對題】請配對 BGP 的引流技術操作與其作用：\n[左邊項目] 1. AS-Path Prepending | 2. Local Preference | 3. Anycast BGP\n[右邊項目] A. 在路徑屬性中人为重複填充自己的 AS 號，引誘外部不要從該接口入站 | B. 設定較高值，強制本 AS 內部所有去往該目的地的流量選定此出口 | C. 將同一個 IP 分配給多個地理位置設備，使外部依最短路徑就近存取',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: 'Prepending 是故意塞長 AS-PATH（1-A）；Local Pref 是自豪高出口權重（2-B）；Anycast BGP 利用近鄰宣告、就近訪問（3-C）。',
        conceptBadge: 'BGP 手機引流配對',
        reviewSection: 'Module 8：對應 PDF 內容'
      },
      {
        id: 'm8-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 SDN 動態 Traffic Engineering 在重新分流超額鏈路時之控制循環步驟：\n(0) 控制器定期收集各交換機統計計數器 (Stats)\n(1) 檢測到某鏈路負載超過 80% 預警極限\n(2) 在集中大腦中運行多主體最短路徑或最大流重排優化演算法\n(3) 把新的流規則 (Flow-Mod) 安裝至受影響的交換機，完成流量無感移撥',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '閉環控制順序：收集 Stats 統計 (0) -> 研判過載 (1) -> 動態算法求得最優流 (2) -> 下發流表完成重調 (3)。',
        conceptBadge: 'SDN 流量監測調整機制',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構'
      },
      {
        id: 'm8-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當一個 SDN 動態流量工程平台，試圖在有兩條併行一寬、一窄鏈路的拓撲中分配流量，為求解全網最優解且避免局部劇烈震盪，最底層常用的古典運算規劃通常涉及哪一類演算法？',
        options: [
          'A. 線性規劃演算法 (Linear Programming / 多商品流最大流優化)',
          'B. 隨機猜測暴力穷舉法',
          'C. 將所有流一律在每毫秒強制拆線',
          'D. 隨機丟棄 50% 所有的資料包'
        ],
        correctAnswer: 'A',
        explanation: '大規模 Traffic Engineering 通常可以建構為多商品網路流優化（Multi-commodity Flow Problem）並透過線性規劃（LP, 或者是 Mixed Integer Linear Programming）等優化演算法在 Controller 內計算出最優分配流方案。',
        conceptBadge: '流量最優化規劃演算法',
        reviewSection: 'Module 8：對應 PDF 內容'
      },
      {
        id: 'm8-q10',
        type: 'calculation',
        questionText: '【計算題】已知 TPE 到 SFO 有兩條路。一條直飛線 A 頻寬為 100Mbps，一條繞行線 B 頻寬為 50Mbps。今有 120Mbps 的資料需要在兩條路同時傳輸。若採取依照 A、B 頻寬容量比率分配的「等價/非等價多路徑 (UCMP)」流量分配工程，則應分配多少 Mbps 流量到線路 A，多少 Mbps 到線路 B，才能使兩線負載率 (Congestion Factor) 完全等比？',
        options: [
          'A. 線路A: 80Mbps, 線路B: 40Mbps',
          'B. 線路A: 60Mbps, 線路B: 60Mbps',
          'C. 線路A: 100Mbps, 線路B: 20Mbps',
          'D. 線路A: 120Mbps, 線路B: 0Mbps'
        ],
        correctAnswer: 'A',
        explanation: '兩邊頻寬比 = 100:50 = 2:1。總流量 120Mbps 按照 2:1 的权重比列分配，線路 A 分配 $120 \\times (2/3) = 80$ Mbps，線路 B 分配 $120 \\times (1/3) = 40$ Mbps。此時兩邊的負載率都是 80%，完美均衡。',
        conceptBadge: 'UCMP 流量調度手算',
        reviewSection: 'Module 8：SDN 驅動要素與工程架構'
      },
      {
        id: 'm8-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一雙出口拓撲：出口 1 的 OSPF 鏈路 cost = 10，出口 2 的 cost = 20。若在傳統 IP 控制面下，所有往返海外的流量都全部鎖定經由出口 1 運送，導致其嚴重擁堵。若引入 SDN 控制器，偵測到出口 1 擁堵度為 95%、出口 2 擁堵度為 5%。控制器將如何進行流量微調？',
        options: [
          'A. 控制器透過南向 flow_mod 下發規則，強行將特定的、非實時性上傳大封包流重分配轉向出口 2，使出口 1 擁塞比大降',
          'B. 直接斷電關閉出口 1，全體路由器轉用出口 2',
          'C. 將出口 1 的 OSPF Cost 改為 0',
          'D. 改良兩路由器的實體金屬防靜電接地線'
        ],
        correctAnswer: 'A',
        explanation: 'SDN 可以不理會 OSPF Cost、在轉發層直接透過南向指令，精準篩選特定協定的大封包流流向出口 2，快速消除出口 1 瓶頸。',
        conceptBadge: '動態 TE 判讀',
        reviewSection: 'Module 8：常見誤解'
      },
      {
        id: 'm8-q12',
        type: 'boolean',
        questionText: '【是非題】BGP 決策中 MED 數值由鄰近 AS 發送過來。若本地收到了兩條 MED 分別為 50 與 150 的通告，在其他條件相同時，本地更偏好選取 MED = 50 的進口路徑將流量發送過去。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'MED 代表 Metric。值越小越代表相鄰自治域宣告的偏好度，所以在 BGP 評比比對中，MED 較小（如 50）的路徑會勝出。',
        conceptBadge: 'BGP MED 計量特質',
        reviewSection: 'Module 8：對應 PDF 內容'
      }
    ]
  }
};
