import { Quiz } from '../types';

export const quizzesPart4: Record<string, Quiz> = {
  'module-9': {
    moduleId: 'module-9',
    questions: [
      {
        id: 'm9-q1',
        type: 'single',
        questionText: '在 OpenFlow 1.0 規格中，定義了多少個可以用作匹配的封包標頭欄位（俗稱 12 元組 12-tuple）？',
        options: ['A. 12 個欄位', 'B. 5 個欄位', 'C. 40 個欄位', 'D. 無限多個'],
        correctAnswer: 'A',
        explanation: 'OpenFlow 1.0 定義了 12 元組（12-tuple），涵蓋 L1 物理端口、L2 MAC/VLAN、L3 IP/協定類型、L4 傳輸端口等 12 個主要封包匹配欄位。',
        conceptBadge: 'OpenFlow 匹配欄位',
        reviewSection: 'Module 9：專業定義',
        choicesWrongExplanation: {
          'B': '5 元組主要是 L3/L4 匹配。OpenFlow 1.0 支援到更全面的 12 元組。',
          'C': '40 屬 OpenFlow 1.3+ 往後版本或 P4 高級自訂，非 1.0。',
          'D': '任何實體規約不可能有無限匹配，其硬體 TCAM 高速匹配欄位是有限的。'
        }
      },
      {
        id: 'm9-q2',
        type: 'boolean',
        questionText: '【是非題】在 OpenFlow 的流表動作 (Actions) 中，除了「Forward (轉發)」以外，亦完全支援「Drop (丟棄)」與「Modify Header (修改封包欄位)」等動作。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'OpenFlow 支援豐富 Actions：轉發 (Forward)、丟棄 (Drop)、修改標頭、排隊 (Queue)、多路宣告（如用於群組選路）。',
        conceptBadge: '流表 Action 分類',
        reviewSection: 'Module 9：專業定義、白話解釋'
      },
      {
        id: 'm9-q3',
        type: 'fill',
        questionText: '一條完整的 OpenFlow 流表項目 (Flow Entry) 必須包含三大主體：匹配欄位 (Match Fields)、計數器 (Counters) 以及什麼？（請填寫英文 "Action" 或繁體中文兩個字「動作」）',
        correctAnswer: 'Action',
        explanation: '流表有「匹配-動作」架構。匹配字段成功命中，即執行其指定的「動作 (Actions)」，並同步更新計數器 (Counters)。',
        conceptBadge: '流表構成結構',
        reviewSection: 'Module 9：專業定義'
      },
      {
        id: 'm9-q4',
        type: 'scenario',
        questionText: '【情境題】為了阻擋來自惡意 IP（180.2.3.4）黑客對學校網站 SQL 資料庫的 TCP 3306 攻擊。管理員應該如何在 OpenFlow 交換機上設定最精準的 Match 和 Action？',
        options: [
          'A. Match: IP_Src = 180.2.3.4, IP_Proto = 6 (TCP), Port_Dst = 3306; Action: Drop',
          'B. Match: IP_Dst = 180.2.3.4; Action: Forward Port 1',
          'C. Match: ALL; Action: Drop',
          'D. 直接重啟控制器安全模組'
        ],
        correctAnswer: 'A',
        explanation: '選項 A 匹配了精確的來源 IP、TCP 協定以及目的地 3306 埠，Action 設為 Drop 丟棄。這能在最少影響常規上網的情形下完成防護。B 會導致普通人也連不到該 IP；C 會關閉全網。',
        conceptBadge: '多欄位流表控制',
        reviewSection: 'Module 9：對應 PDF 內容',
        choicesWrongExplanation: {
          'B': '將目的地為黑客 IP 的數據包轉發，並不能攔阻由黑客發往學校的 TCP 攻擊流。',
          'C': 'Match ALL-Drop 會拒絕全網的所有通信，等同自斷連線，極其不合理。',
          'D': '重啟並不能下發具體的防護流規則。'
        }
      },
      {
        id: 'm9-q5',
        type: 'single',
        questionText: '當一個封包同時符合交換機中多個不同優先級的 Flow Entries 時，交換機將依據何種原則執行 Action？',
        options: [
          'A. 嚴格執行 Priority 優先級數值最大者的那一條 Entry 動作',
          'B. 執行優先級數值最低的那一條 Entry 動作',
          'C. 同時執行所有命中條目的累加動作',
          'D. 將封包暫存並發送給控制器現場重選'
        ],
        correctAnswer: 'A',
        explanation: '交換機在匹配流規則時，如果有重複命中，會依優先次序 (Priority) 排比。Priority 數值最大（最高優先級）的那一項會被套用並執行動作，其餘忽略。',
        conceptBadge: '優先級判定機制',
        reviewSection: 'Module 9：對應 PDF 內容'
      },
      {
        id: 'm9-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些項目，屬於 OpenFlow 南向核心協定所明文規定的控制器對交換機下行訊息 (Controller-to-Switch Messages)？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. Flow-Mod (修改/安裝/刪除交換機的流表項)',
          'B. Packet-Out (命令交換機將特定包從指定端口發射出去)',
          'C. Packet-In (交換機上傳的新流量首包諮詢宣告)',
          'D. Features-Request (控制器查詢交換機支援的功能特性)'
        ],
        correctAnswer: 'A,B,D',
        explanation: 'Flow-Mod, Packet-Out, Features-Request 屬於控制器向下發送的指令。Packet-In 是交换機主動「向上」拋送的上行訊息 (Asynchronous Message)，不屬於下行指令。',
        conceptBadge: 'OpenFlow 訊息方向',
        reviewSection: 'Module 9：對應 PDF 內容'
      },
      {
        id: 'm9-q7',
        type: 'matching',
        questionText: '【配對題】請配對 OpenFlow 的訊息與其核心工作定位：\n[左邊項目] 1. Packet-In | 2. Packet-Out | 3. Flow-Mod\n[右邊項目] A. 當包不中流表，交換機將該包（或摘要）封裝上拋給控制器 | B. 控制器下傳資料包，命令交換機往指定 Port 發射 | C. 控制器命令交換機動態安裝或更迭一條指定的匹配與動作條目',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: 'Packet-In 上拋（1-A）；Packet-Out 下傳包發射（2-B）；Flow-Mod 修改流規則（3-C）。',
        conceptBadge: 'OpenFlow 訊息字典匹配',
        reviewSection: 'Module 9：專業定義'
      },
      {
        id: 'm9-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 Reactive 模式下，流規則匹配、建立到後續包轉送的處理順序：\n(0) 交換機收到無匹配（Table-Miss）的封包\n(1) 交換機向控制器發送 Packet-In\n(2) 控制器接收 Packet-In、並用 Flow-Mod 與 Packet-Out 響應安裝\n(3) 後續抵達的同類資料包直接命中，由 ASICs 晶片以線速完成轉發',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '經典事件順序：無匹配 (0) -> 上舉 Packet-In (1) -> 響應安裝 (2) -> 下載命線速轉發 (3)。',
        conceptBadge: 'Reactive 工作生命序次',
        reviewSection: 'Module 9：常見誤解'
      },
      {
        id: 'm9-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當我們在設計一個 OpenFlow 轉發匹配系統，關於 Wildcard（萬用字元匹配）匹配。若有多個含有遮罩萬用欄位的 Entry，如何避免多重衝突？',
        options: [
          'A. 為每條 Wildcard Entry 附加明確的 Priority（優先級），數值大者优先執行。',
          'B. 隨機隨意挑選一條執行',
          'C. 將萬用規則完全拆分成 42 億條精確規則分別安裝',
          'D. 凡是用到 Wildcard 的封包一律丟棄'
        ],
        correctAnswer: 'A',
        explanation: '當採用萬用匹配（如 Subnet 遮罩、或者是 Port 萬用），多條 Entry 恐生交疊。OpenFlow 藉由 Priority (優先級碼) 來進行衝突解塊，數值高者勝出。',
        conceptBadge: 'OpenFlow 衝突避免演算法',
        reviewSection: 'Module 9：對應 PDF 內容'
      },
      {
        id: 'm9-q10',
        type: 'calculation',
        questionText: '【計算題】已知某 OpenFlow 交換機硬體 TCAM 流表容量限制為 100 條。今採用萬用匹配將網段 A（含有 64 台主機，/26）、網段 B（含有 32 台主機，/27）分組匹配轉送。若不使用 CIDR 聚合路徑，而是為兩網段下的每一台主機都宣告一條專屬 flow-table entry，則該交換機共需耗用多少條 Entry 空間？是否突破 TCAM 臨界容量？',
        options: [
          'A. 共需 96 條，低於 100 限制，未突破 TCAM 空間。',
          'B. 共需 128 條，高於 100，突破 TCAM 空間。',
          'C. 共需 2 條，未突破',
          'D. 兩者皆為無限大'
        ],
        correctAnswer: 'A',
        explanation: '若為每台主機宣告一條精確 Entry，共需 64 (網段 A) + 32 (網段 B) = 96 條 Entry。這依然低於交換機 100 條的容量，故答案為 A。若能使用 CIDR 聚合，則僅需 2 條。',
        conceptBadge: '流表 Entries 量算',
        reviewSection: 'Module 9：白話解釋'
      },
      {
        id: 'm9-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 3-Table 串行處理 OpenFlow 機制（Vlan Table → IP Table → Action Table）。一封包进入後，在 Vlan Table 將 VLAN 標記改為 10，隨即利用 GoTo 導向 IP Table 同步匹配。此時在 IP Table，其遮罩匹配到 Port 4，Action Table 把 TCP TTL 減 1。此種將一個大流表拆分為多個小表、一級級跳躍處理的先進機制在 OpenFlow 稱為什麼？',
        options: [
          'A. 多層級管線流表 (Multi-Table Pipeline)',
          'B. 分散式 RIP 單表',
          'C. 隨機表格跳躍 (Random Table)',
          'D. DNS 快取查找法'
        ],
        correctAnswer: 'A',
        explanation: '自 OpenFlow 1.1 起，為了解決單一流表过大、TCAM 負荷過重的問題，引入了「多級流表管線（Multi-Table Pipeline）」架構。封包根據指令（如 GoTo）可在多張表之間按順序匹配、修改修改，這正是本題描述的架構。',
        conceptBadge: '多層級流表管線判讀',
        reviewSection: 'Module 9：常見誤解'
      },
      {
        id: 'm9-q12',
        type: 'boolean',
        questionText: '【是非題】根據 OpenFlow 規定，若交換機上的流表沒有匹配到任何規則，預設會觸發一條被稱為 Table-miss 的兜底流Entry。其預設的 default Action 通常是將該包封裝送往 Controller（Packet-In）。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'Table-miss 的常見兜底不二動作就是將包送給控制器 (Packet-In) 尋求轉向決策。或者在特定安全設置下也可以設為直接 Drop 丟棄。',
        conceptBadge: 'Table-miss 與 Table-miss 規則',
        reviewSection: 'Module 9：專業定義'
      }
    ]
  },
  'module-10': {
    moduleId: 'module-10',
    questions: [
      {
        id: 'm10-q1',
        type: 'single',
        questionText: '網際網路控制訊息協定 (ICMP) 雖然負責完成網路診斷與出報診報工作，但在 IP 封組結構中，它實體上被封裝在何處？',
        options: [
          'A. 直接作為 IP 封包的 Payload（承載物）',
          'B. 封裝在 TCP 握手數據段內',
          'C. 封裝在應用層 DNS 的 TXT 快照中',
          'D. 位於實體層光纖信號的光束中'
        ],
        correctAnswer: 'A',
        explanation: 'ICMP 屬於網路層協議。但它的訊息會被放入 IP 資料包（IP Datagram）的 Data / Payload 區域。類似 IP protocol 1。',
        conceptBadge: 'ICMP 封裝層級',
        reviewSection: 'Module 10：專業定義',
        choicesWrongExplanation: {
          'B': 'TCP 是傳輸層。而 ICMP 依然屬於 L3 網路層控制面診斷，不包在 TCP 內。',
          'C': 'DNS 是應用層，其 TXT 記錄和 L3 ICMP 無直接關係。',
          'D': '實體光電訊號封裝 L1。ICMP 則在 L3 邏輯層。'
        }
      },
      {
        id: 'm10-q2',
        type: 'boolean',
        questionText: '【是非題】我們日常在終端機運行的「Ping」工具，主要是藉由發射 ICMP Echo Request 以及接收 ICMP Echo Reply 這兩種特定訊息類型，來測試雙向主機的連通程度。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'Ping 的本質即為 ICMP Type 8 (Echo Request) 與 Type 0 (Echo Reply) 的往返收發，藉此推算延遲與是否連通。',
        conceptBadge: 'Ping 計算機制',
        reviewSection: 'Module 10：專業定義、白話解釋'
      },
      {
        id: 'm10-q3',
        type: 'fill',
        questionText: '網際網路中，Traceroute 工具能探查沿途的各級路由器。它是利用在 IP 標頭中哪一個特定的 8-bit 計數器、透過逐次遞增發射來引發路由器過期報錯？（請填英文 3 個大寫字母）',
        correctAnswer: 'TTL',
        explanation: 'Traceroute 是通過將 IP 標頭的 TTL (Time to Live) 數值由 1 遞增到 30 來逐跳探测沿途的路由器。',
        conceptBadge: 'Traceroute 原理',
        reviewSection: 'Module 10：專業定義'
      },
      {
        id: 'm10-q4',
        type: 'scenario',
        questionText: '【情境題】工程師對一個服務站點運行 Traceroute，探查前幾跳路由器（10.0.0.1, 203.2.1.2）都顯示延時，但在第 4 跳之後，輸出一片「* * * (Request Timed Out)」。但直接開啟網頁卻完好無損。這最可能是下列何種原因造成的？',
        options: [
          'A. 第 4 跳及其後續的路由器/防火牆過濾丟棄了 ICMP TTL-Expired 出錯回報訊息',
          'B. 整個 Internet 自第 4 跳後完全癱瘓斷網',
          'C. 路由器的 CPU 被燒毀了',
          'D. 台北到美西段的光纖被海豚咬斷了'
        ],
        correctAnswer: 'A',
        explanation: '許多自治網的安全防火牆、路由器，為了安全或防禦 DDoS，會故意過濾、阻擋「ICMP 出錯回報數據包（Type 11 Code 0）」。因此 Traceroute 的 TTL 過期包會遭遇超時「* * *」警告，而不影響正常攜帶 TCP 資料的大包。',
        conceptBadge: 'Traceroute 阻隔分析',
        reviewSection: 'Module 10：對應 PDF 內容',
        choicesWrongExplanation: {
          'B': '因為網網頁依然可以順快存取，代表物理 Internet 完全暢通無阻。',
          'C': '若燒毀會連網頁也一併中斷崩坍。',
          'D': '如果是光纖斷裂，用戶網頁絕對不可暢讀，此敘述顯屬無稽。'
        }
      },
      {
        id: 'm10-q5',
        type: 'single',
        questionText: '當路由器收到了 IP 數據包，並將其 TTL 計數器遞減為 0。路由器會將該封包丟棄，並向原發射發送哪一個特定的 ICMP 訊息說明？',
        options: [
          'A. ICMP Type 11, Code 0 (TTL expired in transit / 傳輸中超期)',
          'B. ICMP Type 8, Code 0 (Echo request)',
          'C. ICMP Type 3, Code 3 (Port Unreachable)',
          'D. DNS Reply'
        ],
        correctAnswer: 'A',
        explanation: '當數據包 TTL 在中途遞減為 0，路由器丟棄包，並發回 ICMP Type 11, Code 0 (Time Exceeded)，原主機據此得知中途路由器的 IP。',
        conceptBadge: 'ICMP TTL 逾期',
        reviewSection: 'Module 10：專業定義'
      },
      {
        id: 'm10-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些 ICMP code 代表「目的地不可達 (Destination Unreachable / Type 3)」下的故障原因代碼？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. Code 0 (Network Unreachable / 網路不可達)',
          'B. Code 1 (Host Unreachable / 主機不可達)',
          'C. Code 3 (Port Unreachable / 連接埠不可達)',
          'D. Code 8 (Echo Request)'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'ICMP Type 3 的 Code 0, 1, 3 都是 Destination Unreachable 的經典子代碼。Code 8 是 Echo Request，非 Type 3 物體。',
        conceptBadge: 'ICMP 不可達代碼',
        reviewSection: 'Module 10：常見誤解'
      },
      {
        id: 'm10-q7',
        type: 'matching',
        questionText: '【配對題】請配對 ICMP Type / Code 號碼與其表示的故障意涵：\n[左邊項目] 1. Type 8 | 2. Type 0 | 3. Type 11 Code 0 | 4. Type 3 Code 3\n[...說明]\nA. Echo Request 發射要求 | B. Echo Reply 回應答覆 | C. TTL 減至歸零過期報警 | D. 目的地 Port 不堪回應不可達',
        options: ['A. 1-A, 2-B, 3-C, 4-D', 'B. 1-B, 2-A, 3-C, 4-D'],
        correctAnswer: 'A',
        explanation: '8 對 A；0 對 B；11 逾期對 C；Type 3 Code 3 對 D。',
        conceptBadge: 'ICMP 配對字典',
        reviewSection: 'Module 10：專業定義'
      },
      {
        id: 'm10-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 Traceroute 主機探測由首發、到測得第 2 跳中途路由器 IP 的正向步驟：\n(0) 送出一組 TTL = 2 的偵測 UDP/ICMP 封包射往目標主機\n(1) 封包越過第 1 跳路由器，其寫入之 TTL 由 2 安全扣減為 1\n(2) 封包抵達第 2 跳路由器，其寫入之 TTL 扣減由 1 變 0\n(3) 第 2 跳路由器丟棄封包，發送 ICMP Type 11 Code 0 回報給探測主機，主機藉此截獲並記錄第 2 跳之實體 IP',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: 'Traceroute 第二跳週期順序：發 TTL=2 包 (0) -> 越過第一跳變 1 (1) -> 到第二跳遞減為 0 (2) -> 拋 Type 11 截獲 (3)。',
        conceptBadge: 'Traceroute 逐步探針週期',
        reviewSection: 'Module 10：生活比喻'
      },
      {
        id: 'm10-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當 Traceroute 探測包（在 Unix 等預設使用高埠 UDP）抵達最後的「終點主機」時。終點主機控制面演算法，將會判定何種特定動作並報警、從而讓原探測器得知終點已安全到達而結束迴圈？',
        options: [
          'A. 發現此包目的地是它自己、但該高埠 UDP（例如 33434）沒有任何應用程式監聽，退回一條 ICMP Type 3 Code 3 (Port Unreachable)，宣告循環安全退出',
          'B. 將 TTL 再次遞增 500 次並回發',
          'C. 將封包保存不做任何回應',
          'D. 返回一條 TCP RST'
        ],
        correctAnswer: 'A',
        explanation: '對於 UDP Traceroute，探測端會故意選擇極端偏僻的高端連接埠 (如 33434+)。當包到終點，終點因為包的 IP 是自己，便不發 Type 11 (TTL=0) 報錯，而會因為沒程式聽這偏高埠而退回 Port Unreachable（Type 3 Code 3）。探測端看見 Port Unreachable 即可曉得本歷程已完美登頂。',
        conceptBadge: 'Traceroute 結束機制演算法',
        reviewSection: 'Module 10：對應 PDF 內容'
      },
      {
        id: 'm10-q10',
        type: 'calculation',
        questionText: '【計算題】一主機 Z 進行 Traceroute。當 TTL = 3 時發送了 3 次探測包。收到來自第三躍路由的 3 次 ICMP Type 11 答復，其中記錄的主機時間戳記與回發時間差分別如下：\nRound 1: 40ms\nRound 2: 45ms\nRound 3: 35ms\n請問主機 Z 在控制看板上呈現該 Router 跳的平均往返時間 (Average RTT) 為何？',
        correctAnswer: '40',
        explanation: '平均 RTT = (40 + 45 + 35) / 3 = 120 / 3 = 40ms。',
        conceptBadge: 'RTT 往返手算',
        reviewSection: 'Module 10：白話解釋'
      },
      {
        id: 'm10-q11',
        type: 'chart',
        questionText: '【圖表判讀題】觀察以下本機 Traceroute 出力日誌：\n1  10.0.0.1  1.2 ms  0.9 ms  1.1 ms\n2  *  *  *\n3  140.112.5.3  12.5 ms  11.2 ms  12.1 ms\n此輸出日誌中，對於第二跳（row 2）的「* * *」資訊，正確的判讀為何？',
        options: [
          'A. 第二跳路由器存活，但在策略上其防火牆配置禁用了 ICMP 逾期封包發射以策安全',
          'B. 整個網路在第二跳被切斷，包根本到不了第三跳的 140.112.5.3',
          'C. 這是第二跳路由器超光速的專屬表示方式',
          'D. 主機第二跳丟失了'
        ],
        correctAnswer: 'A',
        explanation: '第三跳 (140.112.5.3) 能正常回報 RTT，表示封包早已安然跨過第二躍，所以第二躍的線路是通畅的。第二躍路由器顯示 * * * 只是因為該台實體設備在控制平面上被禁用了 ICMP Type 11 回覆。',
        conceptBadge: 'Traceroute 管線排錯判讀',
        reviewSection: 'Module 10：常見誤解'
      },
      {
        id: 'm10-q12',
        type: 'boolean',
        questionText: '【是非題】ICMP Type 3 意指「Destination Unreachable」。而其中的 Code 3 則代表「Port Unreachable」，是探量終端判斷 UDP Traceroute 已完美收工的必備標誌。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: '沒錯。ICMP 目的地不可通 (Type 3) 連接埠不可達 (Code 3) 正是被用來當作高埠 UDP Traceroute 的完美句點指示器。',
        conceptBadge: 'ICMP 特殊訊號',
        reviewSection: 'Module 10：專業定義'
      }
    ]
  }
};
