import { Quiz } from '../types';

export const quizzesPart2: Record<string, Quiz> = {
  'module-4': {
    moduleId: 'module-4',
    questions: [
      {
        id: 'm4-q1',
        type: 'single',
        questionText: '距離向量 (Distance Vector, DV) 路由演算法的核心代數數學公式基礎為何？',
        options: ['A. 戴克斯特拉 (Dijkstra) 最短路徑定理', 'B. 貝爾曼-福特 (Bellman-Ford) 方程式', 'C. 普林 (Prim) 最小生成樹演算法', 'D. 福特-富爾克森 (Ford-Fulkerson) 最大流定理'],
        correctAnswer: 'B',
        explanation: 'Distance Vector (DV) 仰賴 Bellman-Ford 方程式，以疊代、非同期的本地估計加總，尋找鄰居最短路標。',
        conceptBadge: 'DV 演算法基礎',
        reviewSection: 'Module 4：專業定義',
        choicesWrongExplanation: {
          'A': 'Dijkstra 演算法屬於 Link-State，需要全局拓撲資料。',
          'C': 'Prim 演算法用於計算無向圖的最小生成樹，並不用於網路路徑選路規劃。',
          'D': 'Ford-Fulkerson 用於計算網路最大流容量，非網路單流最短路徑。'
        }
      },
      {
        id: 'm4-q2',
        type: 'boolean',
        questionText: '【是非題】在距離向量 (DV) 協議中，每個節點都必須在硬體中儲存、維護全網所有路由器之間的實體線路與完整鏈路狀態。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'False (錯誤)',
        explanation: '在 DV 中，節點只需要知道「去往各目的地的最短距離」以及其對應「下一跳（鄰居）」，不需知道中間經過的具體完整拓撲。',
        conceptBadge: 'DV 分散式特徵',
        reviewSection: 'Module 4：專業定義、生活比喻'
      },
      {
        id: 'm4-q3',
        type: 'fill',
        questionText: '距離向量演算法採用分散式運算。當相鄰路由器發來新通告，節點會依據哪一個經典方程式更新本地距離？（請填入包含底線的英文名 "Bellman-Ford" 或繁體中文縮寫「貝爾曼福特」）',
        correctAnswer: 'Bellman-Ford',
        explanation: 'Bellman-Ford 公式為 $D_x(y) = \\min_v \\{ c(x,v) + D_v(y) \\}$，是 DV 的數學支撐。',
        conceptBadge: 'Bellman-Ford 運用',
        reviewSection: 'Module 4：專業定義'
      },
      {
        id: 'm4-q4',
        type: 'scenario',
        questionText: '【情境題】當某條鏈路中斷成本變成無限大，在不使用毒性逆轉的情形下，A與B路由器因異步不停交換過時向量，使到目的地成本反覆遞增，這種經典故障稱為？',
        options: ['A. 數到無限大問題 (Count-to-Infinity)', 'B. 轉發表死鎖 (Deadlock)', 'C. 黑色漏洞 (Blackhole Window)', 'D. 資料平面緩衝區溢流'],
        correctAnswer: 'A',
        explanation: 'Count-to-Infinity 是距離向量路由中最經典的缺點，容易發生在網路出現「壞消息」時，兩節點各以對方作為去目的地的前軀，交互遞增造成環路。',
        conceptBadge: 'Count-to-Infinity 原理',
        reviewSection: 'Module 4：對應 PDF 內容',
        choicesWrongExplanation: {
          'B': '死鎖代表行程因爭奪資源陷入無限等待，並不形容此路由遞增名詞。',
          'C': '黑色漏洞指丟包，而本題主要描述成本無限遞增。',
          'D': '緩衝區溢流是佇列耗盡，並非選路演算向量自旋。'
        }
      },
      {
        id: 'm4-q5',
        type: 'single',
        questionText: '為解決 DV 兩節點互繞的壞消息慢傳遞問題，引入「毒性逆轉 (Poison Reverse)」。其運作機制為何？',
        options: [
          'A. 若 Z 依賴 Y 抵達 X，則 Z 向 Y 宣稱其到 X 的距離為無限大 (♾️)',
          'B. 直接拔除 Y 到 Z 的實體線路',
          'C. 將 Y 的 IP 位置宣告為黑名單',
          'D. 強制限制所有最短路徑最多為 2 跳'
        ],
        correctAnswer: 'A',
        explanation: 'Poison Reverse 規定：若 Z 去往 X 的路徑被算出來必須經過它的鄰居 Y，那麼 Z 便要欺騙 Y 說它的 $D_z(x) = \\infty$，打破 Y 從 Z 這裡繞回 X 的幻想環路。',
        conceptBadge: '毒性逆轉機制',
        reviewSection: 'Module 4：常見誤解'
      },
      {
        id: 'm4-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些因子是導致距離向量演算法（如傳統 RIP）在超大型 Internet 骨幹中不再適用的主因？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. 容易發生 Count-to-Infinity 環路，且收斂速度較 Link-State 慢',
          'B. 控制訊息宣告大小會隨全網目的地的增加而急遽膨脹',
          'C. RIP 協定預設最大跳數僅限於 15，16 即視作無限大，限制了網路規模',
          'D. BGP 強制要求所有 AS 內部全部直接使用 SDN 控制平面'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'DV 收斂慢、流體消息隨目的地呈線性膨脹，且 hops 限制在 15 限制了大規模基建。BGP 並不限制 AS 內部的自治。',
        conceptBadge: 'DV 與 RIP 局限性',
        reviewSection: 'Module 4：對應 PDF 內容'
      },
      {
        id: 'm4-q7',
        type: 'matching',
        questionText: '【配對題】請正確配對距離向量演算法與其功能術語：\n[左邊項目] 1. 毒性逆轉 | 2. 距離向量表格 (DV Table) | 3. 鄰居通告\n[右邊項目] A. 用來防止相鄰雙向節點互播劣化路徑 | B. 保存自己去往各個目的地以及各鄰居發來的代價矩陣 | C. 當本地狀態調整時，僅向直接相鄰節點發送更新',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: '毒性逆轉防止環路（1-A）；備份鄰居矩陣即為 DV Table（2-B）；仅向相鄰路由器通告（3-C）。',
        conceptBadge: 'DV 字典術語配對',
        reviewSection: 'Module 4：專業定義'
      },
      {
        id: 'm4-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 DV 演算法中，某路由器 A 發生鏈路更新到全網重新收斂的核心週期：\n(0) 本地鏈路 c(A, B) 阻抗變化\n(1) A 重新計算本地 $D_A(y)$ 最短路徑估算並發現產生異動\n(2) A 向其物理直接物理鄰接點發送全新向量通告\n(3) 鄰近節點收到 A 宣告後重行計算，必要時再行通告擴散',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: '事件觸發順序為：邊成本更迭 (0) -> 本地重算 D 值 (1) -> 異動通告給直接鄰居 (2) -> 鄰居串接動態收斂 (3)。',
        conceptBadge: 'DV 收斂生命流程',
        reviewSection: 'Module 4：常見誤解'
      },
      {
        id: 'm4-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當執行距離向量更新時，若 x 收到了鄰居 v 的通告向量。x 運作 Bellman-Ford 鬆弛，其代數推導邏輯是什麼？',
        options: [
          'A. $D_x(y) = \\min \\{ c(x,v) + D_v(y) \\}$ 之最值合併',
          'B. $D_x(y) = c(x,v) \\times D_v(y)$ 之累積乘績',
          'C. $D_x(y) = \\max \\{ c(x,v) + D_v(y) \\}$ 之最大安全寬裕度',
          'D. $D_x(y) = D_x(u) + D_u(y)$ 間接疊加'
        ],
        correctAnswer: 'A',
        explanation: 'Bellman-Ford 方程式依賴選取所有相鄰 v 的最小成本合組：$D_x(y) = \\min_v \\{ c(x,v) + D_v(y) \\}$。',
        conceptBadge: 'Bellman-Ford 核心公式',
        reviewSection: 'Module 4：專業定義'
      },
      {
        id: 'm4-q10',
        type: 'calculation',
        questionText: '【計算題】主機 X 連接鄰接點 A 與 B。已知 $c(X,A)=2, c(X,B)=5$。A 發送其向量矩陣宣稱到 Y 的最短距離為 4；B 先前宣稱到 Y 的最短距離為 2。請以 Bellman-Ford 計算出主機 X 到 Y 最短成本 $D_X(Y)$ 為何？',
        correctAnswer: '6',
        explanation: '$D_X(Y) = \\min \\{ c(X,A)+D_A(Y), c(X,B)+D_B(Y) \\} = \\min \\{ 2+4, 5+2 \\} = \\min(6, 7) = 6$。',
        conceptBadge: 'DV 數值演算',
        reviewSection: 'Module 4：對應 PDF 內容'
      },
      {
        id: 'm4-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 3 點直線拓撲 X - Y - Z。原本所有邊成本為 1，已經完全收斂。當 X 與 Y 之間的鏈路瞬間損壞（成本設為無限大且不使用毒性逆轉）。此時 Y 去往 X 將先詢問直接鄰居 Z 的最新宣告值，Z 去往 X 的舊估計為 2。此時 Y 會算出新去往 X 的距離估估值為何？',
        options: [
          'A. 3（經由 Z 的舊路徑）',
          'B. 無限大',
          'C. 2',
          'D. 1'
        ],
        correctAnswer: 'A',
        explanation: '當 X-Y 線路斷開，Y 會看向其鄰居 Z。Z 因為此時仍尚未重算，仍通告到 X 的舊成本是 2。Y 便誤以為可以通過 Z 到達 X，更新自估值 $D_Y(X) = c(Y,Z) + D_Z(X) = 1 + 2 = 3$。這就是 Count-to-Infinity 的端緒。',
        conceptBadge: 'DV 壞消息遞增失效判讀',
        reviewSection: 'Module 4：對應 PDF 內容'
      },
      {
        id: 'm4-q12',
        type: 'boolean',
        questionText: '【是非題】在標準網際網路由 RIP 協定中，「16」是其極限距離。也就是說，任何大於或等於 16 跳數的目的地，在該控制平面中都被定義為「無限大、不可達」。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'RIP 為防止 Count-to-Infinity 無限漫遊，折衷將最大 metric 跳數上限設為 15，因此 16 就是不可達的無限極。',
        conceptBadge: 'RIP 骨幹特質',
        reviewSection: 'Module 4：對應 PDF 內容'
      }
    ]
  },
  'module-5': {
    moduleId: 'module-5',
    questions: [
      {
        id: 'm5-q1',
        type: 'single',
        questionText: 'OSPF 協定（開放最短路徑優先）在 AS (自治系統) 的控制平面架構中，通常屬於哪一種類別？',
        options: [
          'A. 自治系統內部路由協定 (Intra-AS Routing Protocol / IGP)',
          'B. 自治系統外部路徑向量協定 (Inter-AS / EGP)',
          'C. 軟體定義集中式流匹配協定',
          'D. 靜態預設網關轉發協定'
        ],
        correctAnswer: 'A',
        explanation: 'OSPF、IS-IS 或 RIP 均為 AS 內部運行的 IGP (Interior Gateway Protocol)。',
        conceptBadge: 'OSPF 定位',
        reviewSection: 'Module 5：專業定義',
        choicesWrongExplanation: {
          'B': 'BGP 才是典型的自治系統外部協定 (Inter-AS)。',
          'C': 'OpenFlow 或 Netconf 屬於 SDN 南向集中協定，而非 OSPF 分散式 IGP。',
          'D': 'OSPF 是動態鏈路狀態協定，並非靜態手動網關。'
        }
      },
      {
        id: 'm5-q2',
        type: 'boolean',
        questionText: '【是非題】OSPF 的 LSA（鏈路狀態通告）封包，在傳輸層中會先嵌入 UDP 封包以確保存輸的相容性。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'False (錯誤)',
        explanation: 'OSPF 直接基於 IP 協定承載（IP Protocol 號為 89），不需要、也未使用傳輸層的 UDP 或 TCP 封組進行封裝。',
        conceptBadge: 'OSPF 封裝特點',
        reviewSection: 'Module 5：常見誤解'
      },
      {
        id: 'm5-q3',
        type: 'fill',
        questionText: '由單一管理機構（如各大學、企業或 ISP）所控制與維護的完整路由器集合，在網際網路選路中稱為「自治系統」，其英文縮寫為何？（請填兩個大寫字母）',
        correctAnswer: 'AS',
        explanation: '這個管理單位簡稱為 AS (Autonomous System)。內部跑 IGP，外部跑 BGP。',
        conceptBadge: '自治系統定義',
        reviewSection: 'Module 5：專業定義'
      },
      {
        id: 'm5-q4',
        type: 'scenario',
        questionText: '【情境題】某中大型跨國企業總部路由器與多個分部路由器如果全部跑單一 OSPF 區塊，當個別辦公室一條網線時常抖動，全網上千台路由均反覆重算 Dijkstra，造成高 CPU 空載。其主要優化方案為何？',
        options: [
          'A. 停用全球骨幹，改用手工一對一配靜態路由',
          'B. 將 OSPF 網路劃分為 Hierarchical Area（多層級區域），限縮 LSA 泛洪擴散界限',
          'C. 將連線設備物理降速至 10kbps',
          'D. 全網重啟，重置所有路由器的 IP 配置'
        ],
        correctAnswer: 'B',
        explanation: 'OSPF 的分層區域設計（Area 0 骨幹、其餘常規 Area 邊界）能建立邊界 ABR，聚合路由，限縮新變更 LSA 泛洪，使局部抖動不會影響外部 Area 的機器。',
        conceptBadge: 'OSPF 區域限縮',
        reviewSection: 'Module 5：生活比喻',
        choicesWrongExplanation: {
          'A': '超大規模網路靜態路由是不切實際的，會引發浩劫級的維護代價。',
          'C': '物理降速到慢速不僅無助於解決演算重算，反而更劣化用戶頻寬。',
          'D': '純粹重啟路由器無法解決根本的拓撲泛洪震盪問題。'
        }
      },
      {
        id: 'm5-q5',
        type: 'single',
        questionText: '在 OSPF 多區域層級架構中，同時連接著 Area 0 骨幹區域以及其他非骨幹區域、負責在兩者轉送邊界信息的特定路由器角色稱為？',
        options: [
          'A. 區域邊界路由器 (ABR)',
          'B. 自治系統邊界路由器 (ASBR)',
          'C. 內部常規路由器',
          'D. 中心流控制器 (Controller)'
        ],
        correctAnswer: 'A',
        explanation: 'ABR (Area Border Router) 連接多個區域，其最核心工作就是將某區域的 LSA 資訊摘要聚合後轉發入 Area 0，避免全網震盪。',
        conceptBadge: 'OSPF 路由器分類',
        reviewSection: 'Module 5：專業定義'
      },
      {
        id: 'm5-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些封包類型，屬於 OSPF 連線協商與狀態同步時涉及的官方規定封包？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. Hello Packet (用來建立與維持鄰居鄰近性)',
          'B. Database Description (DBD, 用於摘要拓撲核對)',
          'C. Link State Request / Update (LSR/LSU, 用於請求與傳遞詳細拓撲)',
          'D. SYN/ACK 握手數據包'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'OSPF 定義了 Hello, DBD, LSR, LSU 以及 LSAck 五種實體封包。SYN/ACK 是傳輸層 TCP 專屬。',
        conceptBadge: 'OSPF 封包類型',
        reviewSection: 'Module 5：對應 PDF 內容'
      },
      {
        id: 'm5-q7',
        type: 'matching',
        questionText: '【配對題】請配對 OSPF 常見術語角色與其物理特質：\n[左邊項目] 1. Area 0 | 2. ASBR | 3. LSA 泛洪\n[右邊項目] A. OSPF 分層結構中的核心骨幹區域 | B. 解耦其他非 OSPF 自治協定（如 BGP 或靜態路徑）的邊界接口裝置 | C. 鏈路信息爆發漫遊擴散至全域庫的過程',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: 'Area 0 固定為核心骨幹（1-A）；ASBR 在自治系統最外緣、用於引入其他自治域系統（2-B）；LSA 泛洪是全網通告更新同步資料庫的手段（3-C）。',
        conceptBadge: 'OSPF 術語配對',
        reviewSection: 'Module 5：專業定義'
      },
      {
        id: 'm5-q8',
        type: 'sorting',
        questionText: '【排序題】請排出兩台 OSPF 路由器初次經由實體線路相連、到成功同步 LSDB 的相鄰狀態機演進順序：\n(0) Down 狀態 (1) Attempt / Init 啟動階段 (2) ExStart / Exchange 交換階段 (3) Full 完全定錨同步狀態',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: 'OSPF 狀態機順序為：Down -> Init -> 雙向雙邊驗證 -> ExStart -> Exchange -> Loading -> Full (3)。',
        conceptBadge: 'OSPF 鄰居狀態機演進',
        reviewSection: 'Module 5：對應 PDF 內容'
      },
      {
        id: 'm5-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當 OSPF 路由器 A 的鏈路發生失效。其控制平面運作何種演算法將消息宣傳至整個區域？',
        options: [
          'A. 泛洪演算法 (Flooding / Link-State Broadcast) 對外宣告 LSA',
          'B. 異步距離估計宣告',
          'C. 由 A 直接私密連線 ABR，禁止同區域常規路由知曉',
          'D. 利用 DNS 交換特定協議'
        ],
        correctAnswer: 'A',
        explanation: '當 Link-State 有任何變化，路由器立即以可靠的 LSA 泛洪（Flooding）向所有有相鄰路由器發出通告，直至區域內所有資料庫完全一致。',
        conceptBadge: 'OSPF 拓撲廣播邏輯',
        reviewSection: 'Module 5：生活比喻'
      },
      {
        id: 'm5-q10',
        type: 'calculation',
        questionText: '【計算題】OSPF 的預設鏈路 cost 是以公式 $\\text{Cost} = 10^8 / \\text{可用頻寬 (bps)}$ 計算。如果某光纖介面帶寬為 10Gbps ($10^{10}$ bps)，而另一個千兆乙太網介面帶寬為 1Gbps ($10^9$ bps)。在不手動調整的狀況下，這兩個介面在 OSPF 預設機制下會被分配為什麼 Cost 值（均四捨五入取常規下限值 1）？',
        options: [
          'A. 兩者均為 1',
          'B. 10G 介面 Cost 0.1; 1G 介面 Cost 1',
          'C. 10G 介面 Cost 1; 1G 介面 Cost 10',
          'D. 兩者均為 10'
        ],
        correctAnswer: 'A',
        explanation: '因為公式為 $10^8 / \\text{bandwidth}$。對於 1G 頻寬 $10^9$，計算結果是 0.1；對於 10G 頻寬 $10^{10}$，計算結果是 0.01。由於 OSPF Cost 最小值必須為 1（無小數点），因此在不修改參考頻寬的情形下，兩者都會被強制定為 1。這也是現代 10G 網需要手動修改 Reference Bandwidth 的緣由。',
        conceptBadge: 'OSPF 鏈路開銷計算',
        reviewSection: 'Module 5：白話解釋'
      },
      {
        id: 'm5-q11',
        type: 'chart',
        questionText: '【圖表判讀題】考慮一個 OSPF 組態：Area 1 內包括 A、B 兩路由器。其中 B 充當 OSPF ABR、與骨幹區域 Area 0 主幹光纖相連。若 Area 1 內增設一台與 B 直連的新路由器 C，在 A 的本機 Link State Database 中會增加哪一個 LSA 項？',
        options: [
          'A. 由 C 動態廣播生成的 Type 1 LSA (Router LSA)',
          'B. B 與 C 共同宣告的 Type 5 LSA (External AS)',
          'C. 控制器下發的流表指令',
          'D. DNS 快取'
        ],
        correctAnswer: 'A',
        explanation: '同區域內所有常規路由器都會泛洪 Router LSA (Type 1)，A 在同區域所以其 LSDB 會接收到 C 廣播的 Type 1 LSA，獲得其直接鏈路狀態情報。',
        conceptBadge: 'LSA 類型判讀',
        reviewSection: 'Module 5：常見誤解'
      },
      {
        id: 'm5-q12',
        type: 'fill',
        questionText: 'OSPF 路由器用來封裝與散播鏈路狀態（Link-State）底層元資訊的結構性實體，稱為 LSA，其完整的英文全稱為何？（三個單字，首字母大寫，以空格隔開，如 Link State Advertisement）',
        correctAnswer: 'Link State Advertisement',
        explanation: 'LSA 意為 Link State Advertisement（鏈路狀態通告），包含拓撲節點與邊的更新數值。',
        conceptBadge: 'LSA 術語',
        reviewSection: 'Module 5：專業定義'
      }
    ]
  },
  'module-6': {
    moduleId: 'module-6',
    questions: [
      {
        id: 'm6-q1',
        type: 'single',
        questionText: '邊界網關協定 (Border Gateway Protocol, BGP) 作為自治系統外部路由，其最主要且獨一無二的本質分類為何？',
        options: [
          'A. 鏈路狀態 (Link State) 選路協定',
          'B. 路徑向量 (Path Vector) 選路協定',
          'C. 本地距離向量 (Distance Vector) IGP',
          'D. SDN 集中式的流分配協定'
        ],
        correctAnswer: 'B',
        explanation: 'BGP 是 Path-Vector 協定。為防止環路並攜帶策略，其宣告中完整包含了沿途各 AS 標識序列的 AS-PATH 屬性，以此定奪路徑。',
        conceptBadge: 'BGP 的分類',
        reviewSection: 'Module 6：專業定義',
        choicesWrongExplanation: {
          'A': 'OSPF 才是 Link-State 協定。',
          'C': 'BGP 用於跨 AS 選路且攜帶豐富屬性與政策，非本地 IGP。',
          'D': 'BGP 是分散式 EGP 自治協定，而非集中式單控制器協定。'
        }
      },
      {
        id: 'm6-q2',
        type: 'boolean',
        questionText: '【是非題】為防範封包丟棄、確保高可靠，BGP 自治路由器之間必須經由傳輸層的 TCP Port 179 首先連接，隨後方能展開路由交換宣告。',
        options: ['True (正確)', 'False (錯誤)'],
        correctAnswer: 'True (正確)',
        explanation: 'BGP 自身不設計複雜的確認重傳機制。它依靠可靠的 TCP (Port 179) 親和連線，省去在路由協定層實現流控和校對的麻煩。',
        conceptBadge: 'BGP 與傳輸層關係',
        reviewSection: 'Module 6：常見誤解'
      },
      {
        id: 'm6-q3',
        type: 'fill',
        questionText: 'BGP 自治路由分為兩類：其中，運行在同一個 Autonomous System 內部、用於散佈邊緣路徑消息的協議，在專有名詞中其附加在 BGP 前方的小寫字母為何？（只能填寫一個小寫英文字母）',
        correctAnswer: 'i',
        explanation: '跨 AS 運行的是 eBGP (external)；在同 AS 內部運行的為 iBGP (internal)。',
        conceptBadge: 'eBGP/iBGP 定位',
        reviewSection: 'Module 6：專業定義'
      },
      {
        id: 'm6-q4',
        type: 'scenario',
        questionText: '【情境題】大學網路管理員發現，當使用骨幹網 ISP 接收外部 BGP 表時，去往某個科學站，如果經由便宜的大陸路由，會產生高丟包，所以他希望強行設定路徑：凡是去往該科學站子網，本校首選美商頂級專線路口出去。BGP 決策流程中，他應該首先調校哪一個最優先的屬性參數？',
        options: [
          'A. 本地偏好屬性 (Local Preference)',
          'B. 跨 AS 行徑跳數 AS-PATH',
          'C. 最低 MED 預期宣告值',
          'D. 隨機最優下一躍點'
        ],
        correctAnswer: 'A',
        explanation: 'Local Preference（本地偏好，預設100，越高越優先）是 BGP 路由決策流程中的最頂級指標，用來命令本 AS 內部所有路由器如何統一選擇去往外部 AS 的出口。其權重大於 AS-PATH。',
        conceptBadge: 'BGP 屬性調優',
        reviewSection: 'Module 6：常見誤解',
        choicesWrongExplanation: {
          'B': 'AS-PATH 指標優先次序劣於 Local Preference，若有 Local Preference 條目會首先被忽略。',
          'C': 'MED 通常用來建議外部 AS 如何進來本 AS，且判定序位極後。',
          'D': '隨機選項不是確定性 BGP 策略的有效手段。'
        }
      },
      {
        id: 'm6-q5',
        type: 'single',
        questionText: '當前 AS 有多個出口，去往某外部目的路由。若選取「本自治系統內部 IGP Cost 最低、花銷最少、能最快被推出本地 AS 的那個邊界出口」，這種利己路由策略稱為？',
        options: [
          'A. 熱土豆路由 (Hot-Potato Routing)',
          'B. 冷血路由 (Cold-Potato Routing)',
          'C. 負載均衡等多段選路 (ECMP)',
          'D. 軟體定義全域優化流量工程'
        ],
        correctAnswer: 'A',
        explanation: 'Hot-Potato Routing（熱土豆選路/熱薯路由）就像手拿燙手山芋一樣，本 AS 控制器在外部開銷相同的情形下，會最自私地選擇本地 IGP cost 最低的出口把資料推出 AS。',
        conceptBadge: '熱土豆選路定規',
        reviewSection: 'Module 6：白話解釋'
      },
      {
        id: 'm6-q6',
        type: 'multi',
        questionText: '【多選題】以下哪些屬性項目，是 BGP 為實現複雜的多因政策控制、隨路由封裝廣播的路徑屬性（Path Attributes）？（選出所有正確選項，以逗號區隔，如 A,B）',
        options: [
          'A. AS-PATH (路徑沿途經過的 AS 號清單)',
          'B. NEXT-HOP (用於告知出口特定的實體 IP 位置)',
          'C. Local Preference (本地 AS 內部的統一出口特徵指標)',
          'D. 路由器實體開口數值'
        ],
        correctAnswer: 'A,B,C',
        explanation: 'BGP 選路極端依賴 AS-PATH、NEXT-HOP、Local Preference 和 MED。物理端口數不屬於 BGP 屬性宣告。',
        conceptBadge: 'BGP 核心 path 屬性',
        reviewSection: 'Module 6：對應 PDF 內容'
      },
      {
        id: 'm6-q7',
        type: 'matching',
        questionText: '【配對題】請配對 BGP 的核心功能性屬性特徵：\n[左邊項目] 1. AS-PATH | 2. NEXT-HOP | 3. Policy routing\n[...說明]\nA. 包含一串 AS 序號，可用於在接收時檢測自身 AS 號，若有重疊立即丟棄防環路 | B. 指出起運往特定目的之前驅出界邊際接口之 IP | C. 藉由自訂 Local Preference / MED 控制入流量或出流量方向',
        options: ['A. 1-A, 2-B, 3-C', 'B. 1-B, 2-A, 3-C'],
        correctAnswer: 'A',
        explanation: 'AS-PATH 檢測重疊號丟棄可預防 Inter-AS 環路（1-A）；NEXT-HOP 標示邊界 IP（2-B）；Policy routing 可透過本機宣告屬性做引流控制（3-C）。',
        conceptBadge: 'BGP 屬性字典配對',
        reviewSection: 'Module 6：專業定義'
      },
      {
        id: 'm6-q8',
        type: 'sorting',
        questionText: '【排序題】請排出 BGP 路由決策流程 (Decision Process) 的選路判定優先級順序（由最優先遞降至後備決策）：\n(0) 選擇具備最高 Local Preference 的路徑\n(1) 在上述同值下，選擇具備最短 AS-PATH 鏈長度的路徑\n(2) 在上述同值下，選擇具備最低 MED（Multi-Exit Discriminator）的路徑\n(3) 在上述同值下，選擇 IGP 到 NEXT-HOP 開銷最低（熱土豆）的路徑',
        options: ['A. (0)-(1)-(2)-(3)', 'B. (1)-(0)-(2)-(3)', 'C. (0)-(2)-(1)-(3)', 'D. (3)-(0)-(1)-(2)'],
        correctAnswer: 'A',
        explanation: 'BGP 決策鏈：自豪最高本地偏好 (Local Pref) -> 極短 AS-PATH 步長 -> 最低 MED 提議 -> 最速熱土豆 (IGP cost)。',
        conceptBadge: 'BGP 決策判定鏈順序',
        reviewSection: 'Module 6：生活比喻'
      },
      {
        id: 'm6-q9',
        type: 'algorithm',
        questionText: '【演算法步驟題】當 AS 200 的 BGP 路由器收到了來自 AS 100 宣告的一條路由，發現該路由的 AS-PATH 屬性值為「AS 300, AS 200, AS 100」。AS 200 路由器控制平面端在演算法流程中將會如何處理？',
        options: [
          'A. 檢測到自己的 AS 號（AS 200）已包含在此路徑清單中，懷疑有環路風險，直接忽略、拒收此路由',
          'B. 正常收錄，不需要任何防環驗證',
          'C. 將此消息重新加密發回 AS 300',
          'D. 通知本機重新重啟'
        ],
        correctAnswer: 'A',
        explanation: '這是 BGP 環路預防機制的精髓：只要路由器發現收到的 AS-PATH 內容含有本自治域本身的 AS 號，即能判定存在 Inter-AS 循環回授，會立刻將該路由宣告丟棄、不導入轉發表。',
        conceptBadge: 'BGP 路徑環路裁剪演算法',
        reviewSection: 'Module 6：對應 PDF 內容'
      },
      {
        id: 'm6-q10',
        type: 'calculation',
        questionText: '【計算題】已知自治系統 AS 500 有兩組出口。去目的地 X：\n路徑A 屬性為 Local Pref = 200, AS-PATH 長度 = 4\n路徑B 屬性為 Local Pref = 150, AS-PATH 長度 = 2\n若在此策略設定下，BGP 計算出的最優出口路徑會是哪一條？',
        options: [
          'A. 路徑A（因為 Local Pref 較高 200 優先）',
          'B. 路徑B（因 AS-PATH 長度僅為 2 較短優先）',
          'C. 兩者相同，隨機做 ECMP 負載均衡',
          'D. 無法選出，控制平面死鎖運算'
        ],
        correctAnswer: 'A',
        explanation: 'BGP 決策中 Local Preference 是凌駕於 AS-PATH 步長之前的最尊貴參數。即使路徑 A 的 AS-PATH 較長，因為其 Local Pref (200) 大於路徑 B (150)，決策演算法會毫不犹豫地指定路徑 A 為最優路徑。',
        conceptBadge: 'BGP 權重手算',
        reviewSection: 'Module 6：白話解釋'
      },
      {
        id: 'm6-q11',
        type: 'chart',
        questionText: '【圖表判讀題】觀察以下骨幹網 BGP 家居拓撲：自治系統 AS1 連接 AS2 (Transit AS)，AS2 連接 AS3；AS1 另外直接透過另一條昂貴的商業光纖連接 AS3。已知 AS3 打算對外宣告子網路 IP。若 AS2 收取高昂轉送稅，AS1 的網管如何在 BGP 表內排除從 AS2 繞過 AS3 而是直連？',
        options: [
          'A. 在 AS1 入站路由上，將所有經由 AS2 的通告設定 Local Preference 數值大降（例如調為 50，小於常規的 100）',
          'B. 關閉 AS1 與 AS3 之間直連的 TCP Port 179',
          'C. 將 AS1 的 AS 號改編為中繼 AS',
          'D. 完全降速該骨幹介面'
        ],
        correctAnswer: 'A',
        explanation: '藉由刻意調低從 AS2 入站通告的 Local Preference，可使 AS1 内部的所有路由器都在選路决策流程中把經由 AS2 出口的權重設為最劣，從而迫使出站流量自動偏向直連 AS3 的那條線路。',
        conceptBadge: 'BGP 多出口引流控制判讀',
        reviewSection: 'Module 6：常見誤解'
      },
      {
        id: 'm6-q12',
        type: 'single',
        questionText: 'BGP 的 MED 屬性（多出口鑑別器 Multi-Exit Discriminator）在實際政策控制中，其主要的作用方向是？',
        options: [
          'A. 提議並暗示「相鄰的外邊 AS」應該首選從哪一個指定的物理口送流量進入本 AS 內部。',
          'B. 命令自家 AS 內部的路由器全部把流量推出至特定邊際',
          'C. 在 eBGP 宣告中無限複製 AS 序號防環',
          'D. 設定轉發層面流規則的超時上限'
        ],
        correctAnswer: 'A',
        explanation: 'MED 用於暗示「相鄰 AS」的首選入口：值越低越希望對方從該物理口把流量遞交給自己。而 Local Preference 則是純粹控制自己 AS 的「出口流量」方向。',
        conceptBadge: 'MED 與 Local-Pref 方向差異',
        reviewSection: 'Module 6：專業定義'
      }
    ]
  }
};
