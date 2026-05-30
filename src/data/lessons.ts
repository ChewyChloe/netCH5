/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonContent } from '../types';

export const lessonsData: LessonContent[] = [
  {
    id: 'module-1',
    title: 'Module 1: Control Plane 控制平面總覽',
    objectives: [
      '理解電腦網路網路層控制平面 (Control Plane) 的核心功能與職責',
      '學會區分「傳統 Per-Router」與「新型 SDN」兩種控制平面架構的根本差別',
      '掌握控制平面如何影響並建立轉發平面 (Data Plane) 的轉發表'
    ],
    vernacular: '網路就像是各城市間的公路網。「轉發平面」就像是十字路口的路標和警察，負責直接指引開過來的車子往左轉還是右轉；而「控制平面」就像是交通調度總部，負責繪製整張地圖、規劃每一條主要公路、設計指引方針，再將規劃好的「交通規則與地圖」下發給每一個路口的警察和路標。',
    definition: '控制平面 (Control Plane) 是網路層中負責「全局路由決策」的邏輯。它決定封包從源端主機到目的端主機穿越整個網路時，應當採取哪一條路徑。與之相對的是資料/轉發平面 (Data / Forwarding Plane)，後者運行在單個路由器硬體上，僅執行本機的快速轉發業務（輸入端口到輸出端口）。控制平面的主要工作是執行路由演算法，計算並填寫轉發表 (Forwarding Table)。',
    analogy: '當你在使用 Google Map 導航時，Google Server 會根據全台灣的車流量、修路路段，幫你計算並規劃出「高速公路」或「省道」等最佳路線（這在做控制平面的路由決策）；當你開車在十字路口跟著路牌左轉時，你只是在依照既定規則前進（這在做轉發平面的動作）。',
    pdfReference: '對應 PDF 第 1 至 2 頁：控制平面架構圖。展示了傳統路由「每個路由器內部都單獨運行路由算法（Per-router Control）」與現代「軟體定義網路（SDN）將控制平面集中在 Remote Controller，各路由器僅充當簡易交換機」的兩種網路層藍圖。',
    misconceptions: [
      '誤解一：路由器自己內部沒有控制平面。在傳統網路中，每個路由器內部都有獨立的控制平面（執行 OSPF、BGP 等）；而在 SDN 集中式架構中，控制平面才被剝離出路由器本體。',
      '誤解二：控制平面和資料平面是一起工作的，因此速度一樣。實際上，資料平面的轉發在硬體層面（ASIC）進行，速度極快（微秒級級）；而控制平面的路由表計算與同步是由 CPU 軟體處理，速度在毫秒到秒級別。'
    ],
    interactiveTask: {
      description: '【思考小挑戰】請想想看，在 SDN (Software-Defined Networking) 的架構中，控制平面是「集中式 (Centralized)」還是「分散式 (Distributed)」的？而在傳統的 Per-Router 路由中呢？',
      requirement: '請在下方輸入框，輸入 SDN 主要採取的控制方式關鍵字「集中式」或「Centralized」來驗證你的理解。',
      placeholder: '請在此輸入...',
      expectedKeyword: '集中',
      successMessage: '太棒了！答對了。SDN 透過一個集中式的 Remote Controller 統一收集拓撲並計算流表 (Flow Table)，大幅簡化了路由器的構造，並提升了網路管理靈活性！'
    },
    summary: '控制平面是網路層的「大腦」，決定端到端的路徑規劃。它分為傳統的分散式（每台路由器自己跑算法、透過 BGP/OSPF 交換資訊）與新型的 SDN 集中式（獨立的大腦 Controller 統一發配轉發表）。'
  },
  {
    id: 'module-2',
    title: 'Module 2: Routing Protocols 與 Graph Abstraction 圖形抽象化',
    objectives: [
      '學會如何將真實的實體網路拓撲 (Network Topology) 抽象化為圖論 (Graph Theory) 數學模型',
      '理解節點 (Nodes)、邊 (Edges) 與連結成本 (Link Cost) 的定義與計算方式',
      '探討影響連結成本 (c) 的因素，例如頻寬、延遲與壅塞狀況'
    ],
    vernacular: '要把一個複雜的全球網路丟給電腦去算出最優路線，我們必須先幫網路「畫素描」。在圖論的世界裡，我們把每一台「路由器」都簡化成一個個小圈圈（節點，Nodes），把連接路由器之間的「網路線/光纖」簡化成一條條連接線（邊，Edges）。而每一條連線上標註的數字，就是「成本 (Cost)」，可能代表這段路有多難走（頻寬太低、延遲很高、太塞車），數字越小就代表路況越好、傳輸越快。',
    definition: '路由協定 (Routing Protocols) 旨在尋找端到端的「良好路徑 (Good Paths)」。良好通常指「最低成本」、「最快」或「最安全」。「圖形抽象化」將網路建模為 $G = (N, E)$，其中 $N$ 是路由器的集合，包含所有節點；$E$ 是連接節點的邊之集合，每個邊 $e = (u, v)$ 都帶有對應的鏈路成本值 $c(u, v)$。如果兩個路由器不直接相連，則 $c(u, v) = \\infty$。',
    analogy: '捷運路線圖就是最經典的圖形抽象。每座捷運站是一個「節點」，站點之間的軌道是「邊」；而站點之間的搭乘時間（例如 2 分鐘或 3 分鐘）就是這條邊的「成本」。如果你要把乘車費用或轉乘次數加入考量，也可以納入成本計算公式。',
    pdfReference: '對應 PDF 第 3 至 5 頁：探討「Good Path」的衡量標準與 Graph G=(N,E) 的形式化定義。圖形節點包含 u, v, w, x, y, z 六個典型節點，說明了 Link Cost 的靜態配置模式或變動配置模式。',
    misconceptions: [
      '誤解一：Link Cost 只能是固定的。事實上，在一些動態網路中，Link Cost 會隨著當前的連線壅塞度 (Congestion) 或可用頻寬而即時變化，雖然這可能會帶來路由震盪的副作用。',
      '誤解二：圖中的連結一定是雙向對稱的。不一定！在實際的電腦網路中，u 到 v 的傳輸成本 $c(u,v)$ 與 v 到 u 的成本 $c(v,u)$ 在某些非對稱鏈路上可以不相等。'
    ],
    interactiveTask: {
      description: '【拓撲小任務】若有一個網路包含 3 個節點：A、B、C。A到B的成本為 2，B到C的成本為 4，A到C直接相連的成本為 7。請問，若想由 A 送封包到 C，經過 B 的路徑成本 $c(A, B) + c(B, C)$ 是多大？這是否比 A 經由 C 垂直直達成本 7 更划算？',
      requirement: '請輸入計算出來的兩段式路徑成本「數字」來驗證計算。',
      placeholder: '請在此輸入數字 (例如 5)...',
      expectedKeyword: '6',
      successMessage: '答對了！成本為 2 + 4 = 6。雖然走 A->B->C 經過了較多節點 (Hop)，但整體 Link Cost 是 (6)，小於直接連線的 7。路由演算法會偏好選擇總成本為 6 的這條路徑！'
    },
    summary: '路由問題本質上是圖論中的單源最短路徑問題。我們使用 G = (N, E) 將路由器和物理光纖簡化成數學表示，以連結成本 (Link Cost) 綜合反映頻寬、時間和管理策略，做為選路依據。'
  },
  {
    id: 'module-3',
    title: 'Module 3: Dijkstra Link-State 路由演算法',
    objectives: [
      '精通戴克斯特拉 (Dijkstra) 演算法的核心機制、三大變數（D, p, N\'）與更新公式',
      '學會手動列出 Dijkstra 演算法的逐步更新表格（初始化與多趟迭代迭代）',
      '理解 Link-State 演算法運作前的「全網狀態廣播 (Link State Flood)」機制與時間/訊息複雜度分析'
    ],
    vernacular: 'Dijkstra 演算法就像是一個「地平線擴張法」。我們一開始站在起點 u（預設 Source），先把 u 塗色並加入我們「已經探明所有捷徑」的地區（這個地區集合叫作 N\'）。然後，我們觀察跟這個地區緊臨的鄰近站點，寫下他們的距離（D）與是從哪一戰走過來的（p）。接著，在所有「還沒塗色」的站點中，找出其中距離我們起點「距離最短」的那個節點（假設是 v），把它塗色加入 N\'，再站在 v 的肩膀上更新其他鄰近節點的距離。重複這個步驟，直到所有人全都被踩過、塗色完畢！',
    definition: 'Dijkstra 演算法是一種集中式 (Centralized) 的選路演算法。集中式代表在執行演算法前，每個節點都必須先透過「連結狀態泛洪 (Link State Broadcast)」獲得整張網路的完整拓撲與所有鏈路成本。主要符號包括：\n- $c(x,y)$: 節點 x 到 y 的直接成本，如果不鄰接則為 $\\infty$。\n- $D(v)$: 從來源節點到目的節點 v，在當前迭代步驟下估計的最短路徑成本。\n- $p(v)$: 從來源到 v 的最短路徑上，v 的前驅節點（前一個鄰接點）。\n- $N\'$: 已確定最低成本 path 的節點集合。\n\n核心更新公式為：\n$$D(v) = \\min(D(v), D(w) + c(w,v))$$',
    analogy: '這就像是在一個未知的地下迷宮探險。我們在起點處往下注水。水流會以相同的速度沿著通道灌入。每當水波最先碰觸到某個新的交叉路口時，就代表我們找到了通往該路口最快的路（這就是將節點加入 N\'）。接著我們在這個新的交叉口繼續向外流動，去更新其他相連通道的到水時間。',
    pdfReference: '對應 PDF 第 6 至 10 頁：詳解戴克斯特拉 (Dijkstra) 的核心與 6 節點拓撲案例。u 為源點，節點集合 u, v, w, x, y, z。PDF 第 8 頁提供了一個 5 次迴圈的逐步演算矩陣，這是本系統互動模擬器的核心對抗數據。',
    misconceptions: [
      '誤解一：Dijkstra 演算法在每台路由器上各自跑，不需要知道其他地方的資訊。不對！Dijkstra 是 Link State (LS) 演算法，前置條件是大家必須泛洪廣播，各路由器擁有一模一樣、完整的全網拓撲圖，才能各別算出一致的最短路徑樹。',
      '誤解二：Dijkstra 演算法也可以輕鬆解決任何負數權重的邊。實際上，在有負數或流量變動引發震盪的鏈路上，Dijkstra 會退化、算出錯誤結果或陷入無限路由切換，所以網路中一般不允許負權連結，且會透過抖動延遲（Jitter）避免因流量反饋引起的路由震盪。'
    ],
    interactiveTask: {
      description: '【變數大點兵】在 Dijkstra 演算法中，$N\'$ 集合代表什麼？當我們把一個新節點 w 加入 $N\'$ 後，我們會針對不屬於 $N\'$ 的 w 的鄰居 v，使用公式 $D(v) = \\min( D(v), D(w) + c(w, v) )$ 進行更新。請問，此時我們用來更新 w 鄰居的參考指標是？',
      requirement: '請輸入 N\' 集合代表的意義或狀態，此集合代表已確定「最短」或「Least-cost」路徑的節點。請填寫關鍵字「最短路徑」或「確定」或「NPrime」來驗證。',
      placeholder: '請在此輸入...',
      expectedKeyword: '確定',
      successMessage: '完全正確！$N\'$ 集合收集的就是「已確定最低成本路徑」的節點。一開始只有源節點，之後每一步都會選出距離起點最近的未確定節點加入其內。'
    },
    summary: 'Dijkstra 演算法是一種典型 Link State 集中式路由。它藉由反覆選擇 N\' 外部 D(node) 值最小的節點，並基於最小節點向外擴張更新其鄰居的 D 與 p 估計，能在 $O(n^2)$ 複雜度下算出起點到全網所有點的最短路徑，是 OSPF 協定的算術靈魂。'
  },
  {
    id: 'module-4',
    title: 'Module 4: Distance Vector Algorithm 與 Bellman-Ford Equation',
    objectives: [
      '精通距離向量 (Distance Vector, DV) 演算法的核心機制、三大特徵（Distributed, Iterative, Asynchronous）',
      '學會套用 Bellman-Ford 方程式：$D_x(y) = \\min_{v} \\{ c(x,v) + D_v(y) \\}$ 計算最短估計',
      '理解 Link Cost 局部變動時的好消息與壞消息傳播機制（Good news travels fast, bad news travels slow）',
      '剖析 Count-to-infinity（無窮遞增）路由環路的物理因果與自我收斂臨界（Self-stopping）'
    ],
    vernacular: '戴克斯特拉 (Dijkstra) 是每台路由器都拿到「整張完整地圖」後集中計算，而距離向量 (Distance Vector) 則是像「口耳相傳的問路法」。每個路由器手裡只有一張草稿隔壁鄰居透露的消息，大家都不知道整張地圖的宏觀全貌！\n大家口耳相傳道：「從我這裡走到終點 x 需要花費多長？」。只要鄰居 z 回報 D_z(x)=5，且我走到 z 只需花費 1。那我就可以在心裡打小算盤算出說「那我經由 z 走到 x 只需 1 + 5 = 6」。\n當鄰居修路阻力下降（好消息），大家立刻相傳，2 步之內路徑就暴瘦更新完畢！但如果鄰居的路斷了、阻力大增（壞消息），大家因為「不知廬山真面目」，會在小城網格裡打轉，互相欺騙相信對方那裡還有舊的、便宜的小路。cost 於是像雪崩上爬（6、7、8...）直到撞牆（Count-to-infinity），這就是網路中經典的路由欺騙！',
    definition: '距離向量 (Distance Vector, DV) 演算法是基於 Bellman-Ford 方程式的分散式選路演算法：\n$$D_x(y) = \\min_{v} \\{ c(x,v) + D_v(y) \\}$$\n其中變數意義如下：\n- $D_x(y)$: 節點 x 到目的地 y 的最優路徑估算權重值。\n- $v$: 節點 x 直接相鄰的鄰居 (Neighbor v)。\n- $c(x,v)$: 節點 x 到鄰居 v 的直接鏈路成本值 (Local link cost)。\n- $D_v(y)$: 鄰居 v 到目的地 y 的距離估算（由 v 廣播通知給 x 的 DV message）。\n\n其關鍵運作架構包括：\n1. 分散式 (Distributed): 每個節點只需與鄰居交換向量，不需得知全網拓撲。\n2. 迭代式 (Iterative): 重複計算、交換與更新，直到無變化（Convergence）。\n3. 非同步 (Asynchronous): 節點不需在相同節奏下計算，只要收到鄰居的 DV 更新通知便被動執行。\n4. 自我停止 (Self-stopping): 當沒有節點更新其 DV 表時，演算法自動停止，不產生訊息消耗。',
    analogy: '這就像一群沒有指南針的瞎子在客棧裡探聽去往大門口的路。A 扶著牆，只知道自己到 B 走 1 步，同時他聽到 B 喊說「我只要走 4 步就到大門口了」。於是 A 推算自己到大門要 1 + 4 = 5 步。當 B 突然摔倒被推到牆角、自己走到大門變成 60 步，但 B 還來不及通知 A 時，A 還以為 B 依然可以 4 步走過去。B 爬起來時聽到 A 說「我只要 5 步走到」，B 傻傻相信了 A，以為「那我走到 A 的 1 步 + A 宣稱 of 5 步 = 6 步就可以走到」，兩人生出路由環路 (Routing Loop)。這就是 Count-to-Infinity 情境！',
    pdfReference: '對應 PDF 第 11 至 15 頁：距離向量 DV 算法與 Bellman-Ford 方程式。完整解剖了 Link Cost Change（好消息傳播快與壞消息 Count to infinity 之 44 次迭代）。',
    misconceptions: [
      '誤解一：DV 演算法不需要收發廣播。在 DV 中，節點依然需要對「其直接相鄰的鄰居」發送更新通知 (DV Update Message)；它與 Dijkstra 的根本差別在於，Dijkstra 是向「全網所有節點」泛洪路由狀態，而 DV 僅與「隔壁鄰居」交換心得。',
      '誤解二：壞消息會一直數到無限大（電腦當機）。雖然名字叫「Count-to-infinity」，但在實際帶有直接 backup 鏈路（例如 z 到 x 的 c=50）的網路中，當 count 上攀超過 backup 成本時，節點會主動轉移、止步於 backup 權重。故演算法為 Self-stopping！此外，網路管理也會利用 Split Horizon (水平分割) 或 Poison Reverse (毒性逆轉) 抑制環路。'
    ],
    interactiveTask: {
      description: '【公式驗收】在 Bellman-Ford 核心公式中，$D_x(y) = \\min_{v} \\{ c(x,v) + D_v(y) \\}$。若 x 到鄰居 y 的成本 $c(x,y)=4$，而 y 回報其到目的端 z 的距離向量值 $D_y(z)=2$。此時 x 利用與 y 相連這一路徑估算到 z 的總成本應該是多少？',
      requirement: '請輸入計算出來的兩項加總「數字」來驗證。',
      placeholder: '請在此輸入數字 (例如 5)...',
      expectedKeyword: '6',
      successMessage: '完全正確！成本為 $c(x,y) + D_y(z) = 4 + 2 = 6$。若與其他路徑對比此路徑最小，x 便會將 $D_x(z)$ 更新為 6，並隨即向其鄰居廣播發布！'
    },
    summary: 'Distance Vector 是一種分散式 (Distributed) 的非同步選路演算法。基於 Bellman-Ford 方程式，利用「鄰居所通報的 DV」與「本機 local link cost」計算到目的地最優值。好消息更新迅速 (吉報速動)，壞消息在變更時會因為不知全局引發路由環路與 Count-to-infinity。'
  },
  {
    id: 'module-5',
    title: 'Module 5: Link State 與 Distance Vector 演算法之全方位評比',
    objectives: [
      '全面對比 LS (Dijkstra) 與 DV (Bellman-Ford) 演算法在訊息複雜度 (Message Complexity) 的量化差異',
      '比較兩者在收斂速度 (Convergence Speed) 上的不同，包含路由震盪 (Oscillation) 與選路環路 (Routing Loop)',
      '深入剖析強韌度 (Robustness) 的差異，探討惡意/故障路由器 (Malfunctioning or Compromised Router) 如何污染網路',
      '掌握黑洞路由 (Black-holing) 的運作與危害概念'
    ],
    vernacular: '如果把 LS 和 DV 拿來進行大對決，這就像是「直升機上帝視角」 vs. 「口耳相傳問路法」的對決。\n在 LS 裡，每台路由器手裡都有整張精準的地圖（LSDB），雖然這意味著一開始要發很多「連結廣播」（太吵了），但一旦有人出錯，大家看地圖就能很快拆穿謊言。可是，如果 Link Cost 是跟著流量走的，LS 就容易爆發「大家像搶跳折扣季一樣集體大改道，反而塞爆另一條路」的路由震盪 (Oscillation)！\n而在 DV 裡，資訊是鄰居告訴你的，所以不需要發送大量廣播。但是一旦某天有個壞心路由器說「直達羅馬只要 0 步！」，大家信以為真就會把所有信件塞給他，結果全掉進他口袋不見了（Black-holing、黑洞效應）！這在 DV 中是一呼百應的毀滅性灾難。',
    definition: '連結狀態 (Link State) 與距離向量 (Distance Vector) 兩大選路架構有著截然相反的設計哲學。在科學指標上其對比如下：\n\n1. 訊息複雜度 (Message Complexity):\n   - LS: 每個路由器都需要將其連線狀態向「全網」廣播 (Flooding)。如果有 $n$ 個節點，$e$ 條鏈路，訊息複雜度為 $O(n e)$。\n   - DV: 僅與「直接鄰居」交換距離向量，除非鏈路成本改變，否則在無更新時算法自動停止 (Self-stopping)；訊息耗費隨收斂時間變化。\n\n2. 收斂速度與環路 (Convergence and Loops):\n   - LS: 集中式計算所需時間為 $O(n^2)$。因為其基於完整拓撲，所以沒有路由環路 (No routing loops)，但可能因為動態流量成本引發選路震盪 (Oscillation)。\n   - DV: 收斂時間不定。常有「吉報速進、凶報慢行」的非對稱傳播。特別在壞消息（故障）發生時，容易陷入路由環路 (Routing Loops) 並引發 Count-to-infinity（無窮計數），需依靠 Poison Reverse 等機制抑制。\n\n3. 強韌度 (Robustness):\n   - LS: 如果路由器 A 發生故障並廣播了故障資訊，受影響的主要是 A 的直連鄰居。因為每台路由器獨自跑 Dijkstra，損壞範圍有限，強韌度極佳。\n   - DV: 若路由器 A 壞了或被惡意入侵 (Compromised Router)，宣稱 D_A(y) 很小，這假訊息會像病毒般席捲其所有鄰近節點並持續擴散出去，造成災難性的「黑洞路由」(Black-holing) 甚至是流量監聽劫持。',
    analogy: '想像兩個探險家要走出森林：\nLS 探險家（Link State）拿著完整的紙本地圖和對講機。雖然出發前要跟每個同伴對講機大喊，確保大家的圖畫得一模一樣；但如果同伴給了鬼指示「走 A 路最低成本」，LS 探險家看看地圖，很容易就能拆穿他「你在胡扯，A 根本是不通的懸崖」。\nDV 探險家（Distance Vector）沒有地圖，只跟隔壁的人問路。只要隔壁的人吹牛說「直達出口只要 10 分鐘」，DV 探險家完全沒有全局視野能驗證，只能百分之百相信他，並把這個「好消息」也問路地報給後面的人。直到大家都走到懸崖邊摔下去，才發現是個騙局。這就是 DV 容易遭受黑洞路由 (Black-holing) 攻擊的原因！',
    pdfReference: '對應 PDF 第 15 頁：Dijkstra (LS) 與 Distance Vector (DV) 的全方位對比，羅列了 Message Complexity ($O(n e)$ vs. varies)、Convergence Speed 與 Robustness (故障時之錯誤廣播：LS 為 local, DV 為 global 傳播，易演變成 black-holing)。',
    misconceptions: [
      '誤解一：LS 是集中式的，所以需要一個集中的 Controller。錯！在傳統網路中，LS (Dijkstra) 的「集中式」指的是計算前「每台路由器都必須先集中整合成完整的拓撲圖（全網巨觀視野）」，而運行 Dijkstra 計算仍是每台路由器自己本機執行的，並非由單一 Controller 算。不要跟 SDN 混淆！',
      '誤解二：黑洞路由 (Black-holing) 只會因為黑客入侵才發生。實際上，如果路由器因為軟體 Bug 或硬體故障（記憶體位元翻轉），向鄰居宣告了錯誤的超低 Cost 路由向量，也會引發非惡意的黑洞現象，導致周邊流量全部被吸入並丟棄，這就是為什麼 OSPF 引入了嚴格的認證與密碼學檢驗。'
    ],
    interactiveTask: {
      description: '【對比小練習】在 $n=100$ 個路由器、 $e=300$ 條鏈路的網路中，如果使用 Link State (LS) 協定，其在進行全網 LSA 泛洪廣播時，最壞情況下的訊息複雜度數量級（即 $O(n e)$）理論上是多少？',
      requirement: '請輸入計算出來的 $n \\times e$ 數值。',
      placeholder: '請在此輸入數字 (例如 10000)...',
      expectedKeyword: '30000',
      successMessage: '完全正確！30000 次傳送。LS 需要泛洪，每條鏈路都會被雙向廣播，使得訊息量與網路大小及密度呈正比。這就是為什麼在極大型網路中，我們必須依靠 Hierarchical (階層式) 設計來劃分區域 (Area)！'
    },
    summary: 'LS (Dijkstra) 與 DV (Bellman-Ford) 代表了兩種極端的路由思維。LS 擁有地圖、雖然 LSA 泛洪開銷大，但強韌度高，錯誤不易擴大；而 DV 依靠口耳相傳、開銷低，但容易陷入路由環路、Count-to-infinity，且對故障或 compromised 路由器的抵禦能力很差，容易遭黑洞劫持。'
  },
  {
    id: 'module-6',
    title: 'Module 6: OSPF（Open Shortest Path First）選路協定與階層式設計',
    objectives: [
      '理解 OSPF = Open Shortest Path First 協定之定義與「Open」的核心開源公有標準概念',
      '學會 OSPF 的訊息洪泛 (LSA Flooding) 原理，並理解其如何直接封裝在 IP 層（協定 89）而非 TCP/UDP 上運作',
      '精通 OSPF 的鏈路成本度量指標（以頻寬 Bandwidth 為核心，公式為 $10^8 / Link\\,Bandwidth$）',
      '掌握 MD5 雜湊安全性認證 (Message Authentication) 機制',
      '徹底征服階層式 OSPF (Hierarchical OSPF)：理解 Backbone (Area 0)、ABR、ASBR 等各種路由器角色定位與優勢分析'
    ],
    vernacular: 'OSPF 的「Open」可不是說它路門大開、誰都能進來！它的意思是「公有、開放標準」（大家都可以免費實作它，不用給某家商業巨頭交授權費）。它就是經典的 Link-State 協定，運作時，大家像在全網大聲公（LSA Flooding）一樣廣播自己的邊界資訊，保證最後地圖同步得一模一樣！\n而且 OSPF 討厭 TCP/UDP 那種複雜的頭像，他覺得那是在浪費時間，因此它「直接騎在 IP 上跑」！為了確保別人的大聲公不是假冒的，它也支援「裝上密碼鎖」：把訊息混上金鑰經過 MD5 演算法算出一段認證碼發出去（Message Authentication）。\n當網路大到不可思議時，天天大聲公（Flooding）會讓路由器集體當機。這時，我們引入「 Hierarchical 設計」（階層劃分），把全校拆成 Area 1、Area 2，中間由核心 Backbone Area 0 串接。Local Router 只要在自己班上（Local Area）掌握詳細到桌面的地圖就好；想去外班，就交給邊界路由器 ABR（Area Border Router）去宣告就好了。地圖變小，CPU 計算瞬間輕鬆百倍！',
    definition: '開放最短路徑優先 (OSPF, Open Shortest Path First) 是一種基於網格鏈路狀態 (Link State) 的自治系統 (AS) 內部閘道協定 (IGP)。其核心定義與設計亮點包括：\n\n1. 基於鏈路狀態 (LS) 廣播：\n   - 通過 Link-State Advertisement (LSA) 進行洪泛 (Flooding) 廣播，各路由器將收集到的 LSA 存入 LSA 數據庫 (LSDB) 中，保持全網拓撲同步。\n   - 每個路由器隨後在本地執行 Dijkstra 演算法，計算至各目的地最短路徑，以此修正其轉發表與 Forwarding table。\n\n2. 高效傳輸與安全性：\n   - OSPF 直接封裝在 IP 封包中（IP Protocol Number = 89），不使用 TCP 或 UDP，以達到極速反應。\n   - 支援 Message Authentication：利用 MD5 雜湊算法（MD5 Hash 加上共享 Key）避免 LSA 被中途竄改或偽造。\n\n3. 階層式 OSPF (Hierarchical OSPF)：\n   - 劃分為「Backbone Area (Area 0)」與「Local Areas (Area 1, 2, ...)」。\n   - ABR (Area Border Router, 區域邊界路由器): 連接 Local Area 與 Backbone Area，負責彙整 (Summarize) 區域內部的路由資訊，並向 Backbone Area 廣播此 summary distance。\n   - Backbone Router (骨幹路由器): 部署在 Area 0 內的路由器，執行骨幹轉發。\n   - ASBR (AS Boundary Router, 自治系統邊界路由器): 與其他自治系統（例如跑 BGP 或 RIP 的外網）連接，引入外部路由。\n   - Local Router (區域內部路由器): 路由資訊僅侷限在各自的 Area 之中。',
    analogy: '階層式 OSPF 就像是一所超大型綜合大學的行政管理。如果全校一萬名學生每個人一舉一動（例如誰換座位、誰退宿）都要隨時向一萬個人廣播，郵務大樓和大家的耳朵一定會當機（Flooding 災難）。\n解決辦法是將大學分為「文學院」（Area 1）和「工學院」（Area 2），文學院院長和工學院院長就是 Area Border Router (ABR)。\n文學院內的學生（Local Router）只需要知道文學院各系辦的詳細位置。而當工學院的學生要寄信到文學院時，工學院院長（ABR）只需要對外（向 Backbone Area 0）籠統宣告一聲：「文學院在我們這棟大樓，包在我身上！」，而不用細說文學院究竟哪個學生在哪個別墅。這樣，大範圍傳遞只需要在骨幹（Backbone Area 0）傳播彙整後的「區塊摘要」(Route Summarization)，大量節省了記憶體和信件耗費。',
    pdfReference: '對應 PDF 第 16 至 20 頁：OSPF 選路協定深度解析、階層式 OSPF（Backbone, ABR, Boundary, Local Router）的宏觀佈局圖，以及 LSA 廣播更新與 MD5 安全保護認證機制。',
    misconceptions: [
      '誤解一：OSPF 跑在 TCP 上，因為路由很重要。錯！TCP 的建立連接和包確認機制在高頻的鏈路狀態更新下，顯顯得過於笨重。OSPF 直接將其路由封包封裝在 IP Payload 中（協定 IP 89），使用自研的可靠機制（對 LSA 有 Ack 確認）來保證傳播，快速敏捷之至！',
      '誤解二：ABR 會向 Backbone 廣播各個節點的所有詳細 links 拓撲。編！ABR 為防止 flooding 席捲全校，它會進行「路由彙整 (Route Summarization)」，僅向 backbone 宣稱「我 ABR 可以到 Class A，Cost 是總和 20」，它把內部的詳細圖論拓撲，轉換為 Distance Vector 的大略形式包裝出去，所以 Hierarchical OSPF 在骨幹上跑的實質上是 DV 式的消息傳播！'
    ],
    interactiveTask: {
      description: '【階層概念驗收】在 Hierarchical OSPF 網路架構中，如果一個路由器具有連接 Area 2（自訂區域）和 Area 0（骨幹區域）的物理線路，那麼這個路由器在 OSPF 的術語裡被稱作什麼 Router？',
      requirement: '請填入其繁體中文名稱（包含「路由器」三個字，共七個繁體中文字）或輸入其英文縮寫 ABR 來驗證你的理解。',
      placeholder: '請在此輸入...',
      expectedKeyword: 'ABR',
      successMessage: '完全正確！它叫做「區域邊界路由器」，英文縮寫是 ABR (Area Border Router)。它是 local 拓撲與 backbone 的數據樞紐。'
    },
    summary: 'OSPF 是一種強大、經典的公有鏈路狀態 (Link State) 選路協定，直接在 IP 層（協定 89）運行。它使用 Dijkstra 求解轉發表，並支援 MD5 認證保護安全。在大規模網格中，它採用 Hierarchical 雙層區域設計（Backbone Area 0 與 Local Areas），用 ABR 進行路由彙整，防止洪泛癱瘓路由器。'
  },
  {
    id: 'module-7',
    title: 'Module 7: BGP 邊界閘道協定與互聯網政策選路',
    objectives: [
      '理解 BGP (Border Gateway Protocol) 的定義、其作為網際網域間路由 (Inter-domain Routing) 的事實上標準 (de facto standard) 角色，以及「網路黏著劑 (glue that holds the Internet together)」之含意',
      '學會區分 eBGP (External BGP) 與 iBGP (Internal BGP) 的功能本質，以及 Gateway Router 同時跑 eBGP 與 iBGP 的工作模式',
      '掌握 BGP Session 的建立（基於可靠的 TCP Port 179）與 BGP 當作 Path Vector Protocol（路徑向量協定，其路徑 BGP path = AS list）之基礎',
      '精通 BGP 的四種核心訊息種類：OPEN, UPDATE, KEEPALIVE 及 NOTIFICATION',
      '解析 BGP 路由屬性 (Attributes)，包含代表目的網段的 Prefix、代表穿越 AS 列表的 AS-PATH、以及下跳網際網路 IP 的 NEXT-HOP',
      '深入政策選路 (Policy-based Routing)：Import Policy 匯入策略、Route Advertisement 路由宣告，以及多重路徑 (Multiple Paths) 的權衡落實',
      '理解 Forwarding Table Population 以及如何透過宣告政策控制流量（Policy via Advertisements）',
      '分析 Dual-homed Network 雙宿網路的商業宣告策略，以及 Hot Potato Routing (熱馬鈴薯選路) 對本網內部 OSPF Cost 的局部利益極大化思想',
      '精通 BGP 經典選路四大層級條件排序 (BGP Route Selection)：Local Preference → Shortest AS-PATH → Closest NEXT-HOP → 其他條件 (Additional Criteria)'
    ],
    vernacular: '如果把網路世界比喻成一座座高度發達的獨立主權國家（每個國家就是一個 AS，自治系統），那 OSPF 就像是各個國內部的各級省道、捷運規劃（內部 IGP 協定），而 BGP 則是各國的外交部與跨境自由貿易和通車條約（Inter-domain IGP 邊域網協定）。\nBGP 是黏住全球網路的事實標準 (de facto standard)，沒有它，全世界一格網頁都打不開！\n各國透過建立「BGP Session」（基於 TCP Port 179 的可靠外交熱線）來交換路由，並像傳遞羊皮紙條一樣，互相記錄、宣告自己的 AS list。這就是 Path Vector 的魅力──只要看到 AS list 裡赫然寫著自己 AS 的名號，就知道「這封信兜圈了，有 Loop！立刻丟棄！」\n在選路時，BGP 是最現實的外交政策協定，它不只看最短距離，更看「商業合約與錢袋子」。它的選路第一條規定叫 Local Preference（本網偏好，誰給的錢多或優先級高就往那走），再來才是 Shortest AS-PATH（最少邊界跳躍數），接著是 Hot Potato Routing（熱馬鈴薯：誰離我最近就趕快把這燙手山芋丟出本 AS，管它在外頭過得好不好），最後才是各種附加的備用小規則。Policy is king！',
    definition: '邊界閘道協定 (Border Gateway Protocol, BGP) 是運行於網際網路自治系統 (AS, Autonomous System) 之間、事實上最核心且具決定性的網際網域路由協定。其核心物理與邏輯定義如下：\n\n1. 網際網路的黏著劑（The Glue that Holds the Internet Together）：\n   - BGP 作為跨越全球異質 AS (例如 ISP、大學、科技巨頭) 之間唯一的選路標準協定，主要作用是將無數孤立的網路板塊聯網並黏合在一起，實現真正的「全球資料互操作性」。\n\n2. 兩種核心會話連線模式：\n   - eBGP (External BGP): 用於跨越不同 AS 之間的物理與邏輯閘道連線，將邊域外的宣告引導進來或對外廣播。\n   - iBGP (Internal BGP): 用於同一個 AS 內部各個 Gateway Router 與內部成員節點之間的傳播。Gateway Router 同時運行 eBGP 與 iBGP，擔當「將邊域路徑無縫注入本網」的樞紐角色。\n   - BGP Session: 連線基於可靠的 TCP Port 179，透過三次握手建立穩定的外交官會話，而非 OSPF 的直接封裝，這大步提昇了跨 AS 遠程傳訊的抵禦力。\n\n3. 路徑向量 (Path Vector) 與三大核心路由屬性：\n   - BGP 是路徑向量 (Path Vector) 協定，一條路由是由「Prefix + Attributes」構成，例如：\n     a. Prefix (前綴): 目的網路遮罩範圍（例如 128.119.40.0/24）。\n     b. AS-PATH (AS路徑列表): BGP 路由行經之 AS 歷史清單（例如 AS3, AS580, AS229），是解決路由環路 (Loop Detection) 的前線鐵律——當接收路由器在 AS-PATH 中看見自己的 AS 號時，直接丟棄拒絕 (Reject)，消除 Routing Loop。\n     c. NEXT-HOP (下跳): 穿越特定 AS 的具體 IP，指向上游網關直連物理接口。\n\n4. 四大 BGP RFC 訊息格式：\n   - OPEN: 建立 BGP 會話，互相通告 AS 號與協定各項參數。\n   - UPDATE: 核心載物，負責宣告一組新網段路由 (Advertisements) 或撤銷 invalid 路由。\n   - KEEPALIVE: 心跳回報，維持連線並確認對手未斷線（在 BGP 這種長鏈連線中尤為重要）。\n   - NOTIFICATION: 崩潰回報，發現錯誤、引發斷裂 BGP session 時的死亡警報。\n\n5. 豐富的商業政策與路由選擇 (Policy & Route Selection)：\n   - Policy through Advertisements: Import Policy 與 Export Policy，決定接不接受（Import）別人的宣告，或宣不宣告（Export，控制自己的頻寬不被蹭網）。\n   - Dual-homed network: 企業網路雙向連接 ISP，防止自己意外淪為這兩個 ISP 之間的 transit traffic（過路流量，會撐死企業的小水管）。\n   - BGP 經典選路漏斗規則排序（極其重要）：\n     1. Local Preference (本地喜好值): AS 內部管理員權重，越大越好，完全代表商業決策。\n     2. Shortest AS-PATH (最短 AS 路徑): 通過的 AS 數量越少越佳。\n     3. Closest NEXT-HOP (最接近下跳): 執行熱馬鈴薯選路 (Hot Potato Routing)，以本網內部 IGP（如 OSPF）代價最小為指導，將封包儘速踢給最近的出口，寧可犧牲 global 最優解以保全本 AS 負擔。\n     4. 額外條件 (Additional Criteria): 包括 BGP Router ID 大小排位等。',
    analogy: '想像網際網域（AS）是一座座巨大的城邦，城邦裡有自己的法律和私鐵（OSPF 等內網協定）；而 BGP 就像是在城邦與外部荒野之間，以及各城邦領事館之間的「外交電報系統及外貿協定」。\n這套外交規則的核心是「利己主義與合約精神」：\n1. TCP Port 179 與 OPEN/KEEPALIVE：\n   兩國建交，不能用隨便喊個大聲公。必須透過專供大使館的加密長途專線（TCP Port 179）拉好電話。每天互報「平安無事」（KEEPALIVE），一旦斷線，立刻發出悲報（NOTIFICATION）割讓領事關係。\n2. AS-PATH 與防環 loop：\n   外交官向各城邦遞交外貿羊皮紙（UPDATE），上面註明「可至 X 綠洲，本批物資先後蓋了 AS3、AS2 和 AS1 大使印章」。如果 A 城邦的大使發現羊皮紙上竟然已經蓋了我們「A 國（AS1）」的公章，他會大驚失色：「這說明，這批物資兜了一大圈，竟然回到了我們國家，有內鬼，這是一筆無效的轉圈路徑！」立刻無情蓋上 Rejected。這叫 Loop Detection（環路偵測）。\n3. Transit Policy 商業政策：\n   「你是我的金主還是討債的？」如果 customer（客戶城邦）要寄信，ISP 城邦會全力幫他轉送。但如果兩個 Provider 互不相讓，大學城邦（Customer）作為雙宿主（Dual-homed），就絕不會傻乎乎宣稱「Provider A 你可以走我這裡，我幫你轉交到 Provider B！」因為這樣 A 到 B 的大卡車，就會排滿大學那條 10 米寬的精緻花園林蔭道，這會直接癱瘓內部的交通！因此 BGP 的 Export 策略是不對非客戶宣告這條中轉線路的。這叫 Policy via Advertisements。',
    pdfReference: '對應 PDF 第 21 至 28 頁：從 BGP 基本定義（De facto standard, glue of Internet）、iBGP 與 eBGP 的關係與工作細節，到 Path-Vector、BGP Messages、Attributes 宣告。深度對決 BGP Route Selection 的算法流程與 Hot potato routing 與 Customer-Provider Transit Policy 案例。',
    misconceptions: [
      '誤解一：BGP 會找全世界最短的實體光纖跳躍數（Physical Hops）來選路。非也！BGP 是 AS 跳躍數（AS-PATH 裡的長度），即使一個 AS 橫跨了整個歐亞大陸有幾千公里，在 BGP 眼裡也就只是長度 +1 的一個 AS 跳。更重要的是，商業合約 (Policy) 高於一切——只要 Local Preference 與商業利益不合，再短的實體線 BGP 也不屑一顧。',
      '誤解二：Hot Potato Routing 可以計算出全球最佳極致路徑。錯！Hot Potato（熱馬鈴薯）是一種極度利己的選路決策。本 AS 只管「在我家地圖裡，哪家出口最便宜」，一旦發現到出口 A 的 OSPF 成本為 3，出口 B 成本為 15，哪怕封包出了 A 出口後要在浩瀚太平洋繞上 3 圈（Global 最差路徑），本 AS 仍會無情地從 A 出口把馬鈴薯丟出去，這就是熱馬鈴薯的本質——自私而快速消散包壓力。'
    ],
    interactiveTask: {
      description: '【BGP 會話與選路小練習】BGP Session 是建立在極其穩固可靠的哪一個封裝傳輸層協定、以及哪一個 Port 號碼之上呢？而 BGP 的選路過濾漏斗中，哪一個優先權威高於 shortest AS-PATH？',
      requirement: '請輸入可靠連線特徵「TCP 179」或英文前置「Local Preference」來完成這一題的核心概念認證。',
      placeholder: '請在此輸入 (例：TCP 179)...',
      expectedKeyword: '179',
      successMessage: '完全正確！BGP 的外交長途電話是建立在 TCP 179 連接之上。而在選路決策流程中，人為自訂的 Local Preference (本地喜好) 是第一關卡，大於 Shortest AS-PATH 跳躍數！BGP 政策大於一切。'
    },
    summary: 'BGP (邊界閘道協定, Border Gateway Protocol) 是網際網路自治系統 (AS) 間的 de facto 選路標竿與膠合劑。其運行於 TCP 179 會話中，是路徑向量 (Path Vector) 協定，依靠 AS-PATH 自主剔除 Loop。在選路時，嚴格遵守由商業利益決定的 Import/Export Policy，並採用 Local Preference、shortest AS-PATH、Hot Potato Routing (選最近 NEXT-HOP) 等多重機制排序過濾，是全球最大網絡的靈魂。'
  },
  {
    id: 'module-8',
    title: 'Module 8: Traffic Engineering 與 SDN 的革命性驅動',
    objectives: [
      '理解傳統 Destination-Based 路由在流量工程 (Traffic Engineering) 面臨的先天瓶頸與局限',
      '學會如何判定與優化自定義路徑，例如：讓流量在 u 到 z 轉送時指定走 u-v-w-z 而非成本較低的最短路徑 u-x-y-z',
      '掌握流量分流 (Traffic Splitting / Load Balancing) 的技術困境：如何在兩條並行路徑間進行非相等成本負載分流',
      '剖析基於來源 (Source-based) 或多維屬性 (Policy-based / Color-based) 選路的特定路徑配置需求',
      '體會 Generalized Forwarding 通用轉發與 SDN 如何透過匹配多個封包標頭屬性 (Flow-based) 輕鬆解決上述難題'
    ],
    vernacular: '想像你開了一家物流公司。傳統的導航方法（Destination-Based）很刻板：只要卡車去同一個終點 Z，不管你是高價值藍色冷凍車，還是超載紅色砂石車，導航一律強制你們擠在同一條「看起來最短」的公路上！\n如果你想讓載砂石的紅色車繞路走寬敞但稍微遠一點的 u-v-w-z，讓載海鮮的藍色車走捷徑 u-x-y-z，傳統路由完全辦不到！如果要強行調整這段路的權重（Link Weight），又會牽一髮而動全身，連別人的卡車也跟著一起大改道，交通瞬間一團混亂！\n而 SDN（軟體定義網路）就像是在每個十字路口裝上智慧電眼和總控大腦。它不只看「終點是哪」，還能看「這輛車是紅色的還是藍色的」、「它是從哪裡開過來的」。大腦可以直接發射匹配指令（Flow Rule）給路口：「如果是藍色車走左邊，紅色車走右邊！」甚至還能平均分配：「這家公司的五成卡車走國一，五成走國三（Split Traffic）」。這就是網路流量工程 (Traffic Engineering) 的革命！',
    definition: '流量工程 (Traffic Engineering, TE) 是指對網路流量進行合理引導、分配和優化，以最大化網路吞吐量、降低壅塞並提高頻寬利用率的技術。\n傳統分散式 IP 路由採用 Destination-Based Forwarding (按目的地轉發)，路由器僅根據 IP 封包的「目的地址（Destination Address）」查詢轉發表，並在 Dijkstra 算出的最短路徑上轉送。這會引發三個關鍵問題：\n\n1. 難以實現非最短路徑工程：若系統管理員希望將 u 到 z 流量導向較遠的 u-v-w-z（以保留路徑 u-x-y-z 的頻寬給其他敏感業務），在傳統網路中唯有「重新定義、微調各鏈路成本 (Link Weights)」，這極易引發全局路由連鎖震盪及其他點對的非預期漂移。\n2. 難以實現流量分流 (Traffic Splitting)：傳統路由僅為單一 Destination 求出一條最佳出口，無法在多個不等長路徑上等比例分流，易造成一條路塞死、另一條路空置。\n3. 無法執行多條件政策選路：如果節點 w 希望對紅色封包 (Red Traffic) 與藍色封包 (Blue Traffic) 實施不同的路徑規劃，傳統根據 Destination-based 的轉發表是無能為力的。\n\nSDN (軟體定義網路) 與 Generalized Forwarding (通用轉發) 則引入了「Match-Action」匹配流表 (Flow Table) 概念。流表不僅可匹配「目的 IP」，還可自由匹配「源 IP」、「傳輸埠 (Port)」、「VLAN ID」等，並下達 Action（如 Forward、Drop、Rewrite）。這能以極高的彈性直接排除前述工程限制。',
    analogy: '想像在過年的返鄉潮。高速公路局（運作傳統路由）想要分流，但是唯一的控制手段是「改設收費站門檻、調整路費權重」（微調 Link Weight）。這會讓不只台北回高雄（u 到 z）的人、連新竹回台中、林口回泰山的人全都被強行塞路，導致不相干的路段也意外癱瘓。而 SDN 大腦（控制平面）則是在所有匝道、路口裝設即時紅綠燈與車牌匹配鏡頭。他可以對車輛精準發配指令：『台北至高雄且尾數單號者走國道一；尾數雙號走國道三；遊覽車走快速道路（分流與多策略匹配）』。這樣既實現了精準分流，又不影響短途通行的民眾，這就是 generalized forwarding 流量工程的最高境界。',
    pdfReference: '對應 PDF 第 29 至 33 頁：流量工程 (Traffic Engineering) 面臨的三大挑戰方案。圖解 u, v, w, x, y, z 六節點拓撲中，為了引導流量走非最短徑 u-v-w-z 時，調整 weights 的窘境；分析 split traffic 在 destination-based 路由的不可行性；以及 SDN Generalized forwarding 在 Match-Action 下對多維度（Src/Dst/Color）精準導航的功能比對。',
    misconceptions: [
      '誤解一：在傳統 destination-based 網路中調權重（Link Weight）很簡單，調一調就行。實際上，Link Weight 是全域生效的。當你把 u-x 的成本調大以促使流量走 u-v-w-z，很可能導致 y 到 u、v 到 x 的路由也跟著偏折，形成巨大的路由次優解，甚至是自相矛盾的 Routing loop。這種調法宛如盲人摸象，是一門極難設計且代價沉重的「暗黑工程」。',
      '誤解二：SDN Universal matching 只是匹配 IP 的其他位元。不！SDN 的 generalized forwarding 包括 Match-Action 模式：可以匹配物理埠 (Ingress Port)、MAC 來源/目的、IP 來源/目的、TCP/UDP 源/目埠，甚至是應用標籤。Action 除了 forwarding 之外，還能實施丟棄 (Drop)、修改封包（例如 NAT 轉換或 Vlan 修改）、甚至是多點複製 (Multicast)，這就是 OpenFlow 通用轉發的根本。'
    ],
    interactiveTask: {
      description: '【TE 小決策】在 u, v, w, x, y, z 的拓撲中。假設 u-x-y-z 的最短路徑總成本是 5，u-v-w-z 總路徑成本是 8。管理員若在傳統路由下想強迫 u 到 z 的特定流量繞道 u-v-w-z，他必須把 u-x 鏈路的 Cost 權重（假設原本是 1），在原有基礎上至少調高「多少以上」，才能迫使 Dijkstra 演算法改道走 v 路？',
      requirement: '請寫出兩條路徑原始代價的差距「數字」或者調增臨界點，直接輸入數字 3 來完成本題的學術考驗。',
      placeholder: '請在此輸入差額數字...',
      expectedKeyword: '3',
      successMessage: '完全正確！成本差額為 8 - 5 = 3。只要我們把 u-x 提升大於 3 的成本，傳統 Dijkstra 便會不得不放棄 x 軸改走 v 軸。然而，這會波及到其餘所有經過 u-x 選路的無辜非 TE 流量，造成嚴重的副作用！而 SDN 可以直接匹配特定的來源 IP，不痛不癢地實現完美流量工程。'
    },
    summary: '傳統基於 Destination-based 轉發的網路中，進行流量工程（TE）如引導至非最短路徑、負載均衡分流以及多條件特種選路是極限困難的，往往伴隨繁雜的 link weights 牽連震盪。SDN generalized matching 透過 Flow Table 支持 Match-Action 萬能規則匹配（Src, Dst, Ports, MAC 等），輕鬆解決了這三大難題，使 TE 得以程式化高彈性落地。'
  },
  {
    id: 'module-9',
    title: 'Module 9: SDN 控制器與 OpenFlow 交互傳輸及 Link Failure 9步解鎖演練',
    objectives: [
      '全面剖析 SDN 的核心架構：Generalized flow-based forwarding 以及控制平面/資料平面的解耦分離',
      '掌握 Remote Controller 遠端控制器在分佈式狀態管理 (Distributed State Management) 與南北向 APIs 的樞紐角色',
      '深入探討 SDN 控制器的三大關鍵分層組件：通訊層 (Communication Layer)、網路狀態管理層 (State Management Layer)、以及 App 控制接口抽象層 (Interface/Abstractions Layer)',
      '精通 OpenFlow 協定的定義、傳輸層特徵 (TCP Port 6653、可選 TLS 加密) 與三大基本訊息類別',
      '熟練掌握 Controller-to-Switch（READ, CONFIG, MOD-STATE, PACKET-OUT）與 Switch-to-Controller（PACKET-IN, FLOW-REMOVED, PORT-STATUS）交互流程',
      '深研 Link Failure 在 SDN 中的控制面聯動復原 9 步走機制 (PDF 經典鏈路故障 9 步復甦法)'
    ],
    vernacular: '如果 SDN 交換機是在高速公路收費口站崗的小兵，那「SDN Controller（控制器）」就是坐在交控總部裡、掌握上帝視角的大將軍！\n小兵只負責照著「流表（Flow Table）」指揮車輛，一旦遇到沒見過的怪車、或是某條路突然坍塌（Link Failure），他就必須立刻用「OpenFlow 協定（走 TCP Port 6653 的可靠專線）」向上通報。\n當一條連線突然斷掉時，整個 SDN 控制器會運作一連串精彩的「九步走大倒接」：小兵用 PORT-STATUS 密報斷線；控制器收到後修改網路拓撲狀態；交給上層的「路由 App」重新執行 Dijkstra 演算法；App 算出全新沒堵塞的路徑流表；控制器再透過 MODIFY-FLOW 命令把新的行車指南迅速安裝到全網所有交換機。這樣，在一眨眼間，交通就完全復原了！這就是軟體定義網路的極速自動化魅力！',
    definition: '軟體定義網路 (SDN) 透過「控制面 (Control Plane)」與「資料面 (Data Plane)」的徹底分離 (Decoupling)，將智慧集中於獨立運行的遠端控制器。其核心體系包含以下方面：\n\n1. SDN 控制器三大核心架構分層：\n   - 通訊層 (Communication Layer)：處理 Controller 與 Data Plane 交換機之間的通訊協定（如 OpenFlow），執行底層訊息發送與接收。\n   - 網路狀態管理層 (Network-State Management Layer)：記錄並維護最新的主機、交換機、鏈路、流表狀態與拓撲圖（如 Link State Database）。\n   - API 接合/抽象層 (Platform Interface Layer)：向北向 (Northbound) 提供統一的 API 介面，讓控制端 App（如 Routing App、Access Control App、Load Balancer）可以非常簡單地讀取拓撲並寫入流規則。\n\n2. OpenFlow 協定與報文通信特徵：\n   - 基礎機制：運行於 TCP Port 6653 (過去曾使用 6633)，保證通訊高度可靠，可選擇搭配 TLS 證書加密安全傳輸。\n   - 三大類型訊息 (OpenFlow Message Classes)：\n     a. Controller-to-Controller / Controller-to-Switch (控制器向交換機發起): READ-STATE (查詢流表狀態)、PORT-CONFIG (配置物理埠)、MODIFY-STATE (新增/刪除/更新流規則)、PACKET-OUT (命令交換機從某一物理埠原地發出特製封包)。\n     b. Asynchronous / Switch-to-Controller (交換機非同步主動通報): PACKET-IN (收到未知流向封包，交由大腦解析)、FLOW-REMOVED (某流規則超時過期)、PORT-STATUS (物理埠狀態變更，如斷線)。\n     c. Symmetric (對等雙向): HELLO (建立會話)、ECHO (保活/心跳/Ping-Pong)、ERROR (錯誤報告)。\n\n3. SDN Link-Failure 故障自癒九步走機制（PDF 核心必教精髓）：\n   若 Switch 1 與 Switch 2 之間鏈路斷開，SDN 聯動自癒流程如下：\n   - 1步：Switch s1 偵測到實體埠斷線 (L1 Link status down)。\n   - 2步：Switch s1 送出 OpenFlow PORT-STATUS 訊息通知遠端 SDN Controller 斷線。\n   - 3步：SDN Controller 接收 PORT-STATUS，將通訊模組接力，其內部「Link-state 網路狀態管理層」修正鏈路拓撲 graph 數據，宣布此路中斷。\n   - 4步：Controller 狀態更新觸發訂閱了 topology-change 事件的「Dijkstra Routing App (北向控制程式)」。\n   - 5步：Routing App 呼叫介面，讀取全網控制器持有的最新 topological graph、以及各主機鏈路分布狀態。\n   - 6步：App 執行 Dijkstra 求解演算法，重新求出受影響所有流對之「最新阻斷繞道最短路徑」。\n   - 7步：App 向下呼叫 API，呼喊 Controllers table-manager 下達流量安裝修改流表任務。\n   - 8步：SDN Controller 組織 OpenFlow MOD-STATE (MODIFY-FLOW) 報文，通過 TCP 6653 連接，下發新的 Flow Table 條目給全網所有受影響的 Switches。\n   - 9步：Switches 接收 Flow Table，快速刷新本機硬體 Flow Table，繞道機制生效，通訊極速復原！',
    analogy: 'SDN 控制器就像是一艘航空母艦上的「聯合大腦指揮中心」：\n- 第一層：對講機與天線連線（Communication Layer）負責接收所有偵察機和潛艇發回來的無線電（OpenFlow 訊息）。\n- 第二層：海圖沙盤（Network-State Management Layer）有人手動插小旗子，把即時的暗礁、敵軍位置標在地圖上，隨時保持地圖更新。\n- 第三層：北向作戰 API。指揮官（Routing App, Firewall App）不用自己懂怎麼調天線接收訊號，他只需要看著精緻的電子沙盤，下達『從右翼突圍、包抄左軍（流規則）』的出戰指令即可。各司其職，效率極高！\n而 OpenFlow HELLO 與 ECHO 就像是大兵們每三秒高呼一次『班長好，我還活著！』（Keep-alive hello），一旦班長（Controller）三秒沒聽到回話，就知道大兵殉職了（Link down），立刻重新修改兵力地圖佈署（Dijkstra App 重新導航）。',
    pdfReference: '對應 PDF 第 34 至 43 頁：詳細闡釋 SDN 雙平面、Controller 三層內部實體拓撲分佈，以及 OpenFlow TCP 6653 協定報文格式 (Packet-in, Mod-state, Port-status)；詳細講解 9-step Link failure 演算法，將控制/資料面的通訊與重算鏈路實體重現。',
    misconceptions: [
      '誤解一：OpenFlow 就是 SDN 的全部。錯！OpenFlow 只是 SDN 南向介面 (Southbound API) 當中最著名、經典的一種「通訊協定標準」，它規定了交換機和控制器之間怎麼講話。SDN 本身是一個宏觀的「控制與資料分離、網路可編程」體系，南向協定還包括 P4, NETCONF, gRPC 等，不要把 SDN 與 OpenFlow 完全畫上等號。',
      '誤解二：PACKET-IN 每次傳輸人都會把整個封包完整地塞給 Controller，耗費大量帶寬。實際上，為了節省 OpenFlow 頻寬，交換機通常只會將封包的「標頭 (Header)」加上 Buffer ID 發送給控制器；極端情況下才會封裝完整資料。控制器處理完後，用 PACKET-OUT 攜帶 Action 回傳，直接告訴交換機怎麼處理 local 快取的封包，這極大保護了 TCP 連線的能效。'
    ],
    interactiveTask: {
      description: '【SDN OpenFlow 探索小研討】當 SDN 交換機發現某個物理端口（例如 Port 2）發生了光纖線路斷裂（Link Status Down）時，它會向遠端控制器發送哪一種特定的 OpenFlow Asynchronous 報文來報告端口狀態改變？',
      requirement: '請輸入該訊息報文名稱，可帶連字號，如「PORT-STATUS」（大寫、小寫或帶中間橫槓皆可比對驗證）。',
      placeholder: '請在此輸入 OpenFlow 報文名稱...',
      expectedKeyword: 'PORT-STATUS',
      successMessage: '完全正確！交換機會送出非同步的 PORT-STATUS 報文。Controller 收到此報文後，內部的網路狀態管理模組隨即更新拓撲狀態資料，觸發 Routing App 新一輪的 Dijkstra 最短路路徑求解，並將新流表通過 MOD-STATE 流規則傳輸下發。這就是著名的故障自癒 9 步算法中前置關鍵流程！'
    },
    summary: 'SDN 實現了控制與資料的分離，將全網智慧託付給遠程 SDN Controller。控制器由通訊層、網路狀態管理層 and API 介接層組成。OpenFlow 是最經典的南向通訊協定，運行於 TCP 6653，提供 Controller-to-Switch、Asynchronous 與 Symmetric 三大訊息類別。當鏈路發生 Failure，SDN 可透過極具秩序的 9 步倒接機制，由 PORT-STATUS 非同步通報、Dijkstra App 重算、MOD-STATE 下發新流表完整重塑轉發。'
  },
  {
    id: 'module-10',
    title: 'Module 10: ICMP 協定機制與 Traceroute 遞增探測機制剖析',
    objectives: [
      '瞭解 網際網路控制訊息協定 (ICMP) 的通訊職責：主機與路由器回報網路層級狀態與 error reporting',
      '學會 ICMP message 在 IP 封裝層次中的位置（在 IP 載荷載運，邏輯上位在 IP 之上）',
      '掌握 ICMP message 欄位組成（Type、Code、Header 與引起錯誤之 IP 報頭加上前 8 bytes 資料）',
      '深研 Ping (Echo Request/Reply) 的即時往返連線探測原理與 RTT 的量測方式',
      '精通 Traceroute (tracert) 工作機制：TTL 遞增、TTL expire (Type 11 Code 0) 路由器跳步回報與終點 Port Unreachable (Type 3 Code 3) 選路收尾'
    ],
    vernacular: '網路就像一條連鎖快遞網絡，由主機和各路局轉運路由器維護。然而，有時包裹會因为終點不存在、或者在途中因油料（生存時間 TTL）耗盡而被丟棄，這時就需要一個「狀況回報專員」來向寄件人發送錯誤小紙條（ICMP 報文）。而 Traceroute 就是利用這種每到一站就把油（TTL）故意少給一點、強迫每一站轉運員主動回發「沒油爆廢單」（Type 11 Code 0）的巧妙方式，把整條路徑上的全部路由器站點、以及來回延遲（RTT）原形畢露地畫在你的螢幕上！',
    definition: '網際網路控制訊息協定 (Internet Control Message Protocol, ICMP) 專職主機與路由器之間溝通 network-level 狀態資訊或錯誤管理。它的特性與結構如下：\n\n1. 協定層級與封裝位置：\n   - ICMP 屬於網路層協定。\n   - 雖然它屬於網路層，但它「位於 IP 之上」(Above IP)——ICMP bytes 是存放在 IP 數據報 (IP datagram) 的 Payload 當中傳輸的，就像 TCP / UDP 封包那樣被 IP 包裹。\n\n2. 報文基本結構：\n   - Type (8-bit) 與 Code (8-bit)：共同定義了錯誤報文的特徵屬性。\n   - Header (包含 Checksum 校验和與特定資料)。\n   - First 8 bytes of original IP datagram causing error：包含引發錯誤的原始 IP 封包標頭、以及前 8 個位元組內容。這前 8 位元組通常包含了 TCP/UDP header，能讓源端主機準確將此錯誤與特定的 Local Socket (Port 連接埠) 匹配，實施精準的程式異常回饋。\n\n3. 核心 ICMP 故障類別型碼：\n   - Type 0 Code 0：Echo Reply (Ping 響應)\n   - Type 8 Code 0：Echo Request (Ping 請求)\n   - Type 3 Code 0：Destination Network Unreachable (網路不可達)\n   - Type 3 Code 1：Destination Host Unreachable (主機不可達)\n   - Type 3 Code 2：Destination Protocol Unreachable (協定不可達)\n   - Type 3 Code 3：Destination Port Unreachable (連接埠不可達 - Traceroute 結束指標)\n   - Type 11 Code 0：TTL Expired in Transit (傳輸中 TTL 逾期 - Traceroute 核心)\n\n4. Traceroute (tracert) 核心自癒探航算法 (這是一個經典的控制平面探尋協同體系)：\n   - A. Source 向 Destination 的無效 UDP PORT (通常為 33434 以上高危/隨機埠) 連續射出 3 個探針 (Probes) UDP 包。\n   - B. 第一跳把該 UDP 封包的 IP Header 的 TTL 設為 1。當封包抵達第一個 Router 時，Router 執行 TTL-1，變為 0，於是將該封包 Dropped。此時 Router 朝 Source 回覆一個 ICMP Type 11 Code 0 (TTL expired) 報文。Source 收到後，測量發出到收回的時間差，此差額即為 RTT，同時記錄該 Router 的 IP。\n   - C. 第二跳把 TTL 遞增設為 2。封包通過首個 Router (TTL變1)，在抵達第二個 Router 時 TTL 扣減變 0 被 dropped，該 Router 同理回傳 ICMP Type 11 Code 0 報文。Source 得到第二跳 IP 與 RTT。\n   - D. 重複此步驟 (TTL = 3, 4, 5...)，直到 TTL 足以到達 Destination Host。由於該 UDP 探針目的地是隨機關閉的/無效的埠口（UDP Port Unreachable Scenario），終止主機無法將資料分流給應用程式。因此終端主機會回發 Type 3 Code 3 (Port Unreachable) 給 Source。\n   - E. Source 核心一旦檢測到收到 Port Unreachable (Type 3 Code 3) 而非 TTL Expired，即判定「探車已成功抵達終點主機」，隨即完美中止 Traceroute 連線過程！',
    analogy: '當我們用「Ping」主機的時候，就好像對一間房子大喊：「哈囉，家裡有人嗎？」(Echo Request Type 8 Code 0)。如果對方在家，就會回應：「有喔，人在這裡！」(Echo Reply Type 0 Code 0)；如果路途上管理員發現這間門牌不存在，就會塞紙條寫：「查無此地址」(Type 3 Code 1)。\n而「Traceroute」就像是派遣名牌「第一組快遞員」，強行规定他的體力只能走一站 (TTL=1)。快遞員開到第一站郵局就累垮了，第一站郵局局長向你通報「快遞員在我們這累壞了，我是 A 主角」(TTL Expired, Type 11 Code 0)；接著你派「第二組快遞員」規定體力走兩站 (TTL=2)，第二站局長通知你「在 B 主角這累壞了」；最終「第 N 組快遞員」體力充足抵達目的地，在大門口按門鈴時，發現門牌是對的但根本沒有這間公司的這款產品（Port Unreachable, Type 3 Code 3），這款報文通知你「到達終點但沒這項業務」，Traceroute 得以宣告探秘成功！',
    pdfReference: '對應學術 PDF 網路層 ICMP 協定一章。詳細闡述 ICMP 差錯報文在 IP Datagram Payload 中傳入的 8 bytes 附帶原始 datagram 的設計緣由，以及 Traceroute 發射 UDP 專屬封包逐級加碼 TTL 從 1 到最後 Dst 觸碰 Port Unreachable 的兩大回饋機制。',
    misconceptions: [
      '誤解一：Ping 也是利用 UDP 或 TCP 連接進行。錯！Ping 工具有其專屬協定直接就是 ICMP (上面沒有 TCP/UDP)。所以當主機防火牆關閉了全體 TCP/UDP，如果沒有特別禁用 ICMP，Ping 依然能完美穿透回傳！',
      '誤解二：Traceroute 只能用 UDP 探測。大部分的 Linux 預設使用 UDP 大於 33434 埠探測，但 Windows 平台的 tracert 預設使用 ICMP Echo Request (Type 8 Code 0) 進行 TTL=1, 2, 3... 探測！不管用哪種，其中間節點回傳的都是 Type 11 Code 0 TTL Expired；差在 Windows 的終點回傳的是 Type 0 Code 0 (Echo Reply)，而 Linux 終點回傳 Type 3 Code 3 (Port Unreachable)。本次實驗室將深度演練 Linux 預設的經典 UDP 流程。'
    ],
    interactiveTask: {
      description: '【ICMP與Ping/Traceroute 實戰決策】當 Traceroute 發送的第 5 組探針封包，在抵達第 5 個路由器時 TTL 扣減變為 0 被丟棄，該路由器會向 Source 發送哪種類型數字、代碼數字的 ICMP 報文回報？',
      requirement: '請輸入該報文的「Type 編號與 Code 編號」組合，例如代表 TTL Expired 的 Type 11 Code 0 應簡化輸入「11-0」或「type 11 code 0」中的數字組合，直接輸入「11-0」進行學術查驗。',
      placeholder: '請在此輸入數字對 (如 11-0)...',
      expectedKeyword: '11-0',
      successMessage: '太精準了！答對了。在 transit 過程中 TTL exceeded 會觸發 ICMP Type 11 Code 0 異常發送，引導 traceroute 軟體記錄第 5 跳路由器的身份與 RTT！'
    },
    summary: 'ICMP 協定專職網路層狀態與差錯管理。其報文承載於 IP Datagram 中。探測工具 Ping 採用 Echo Request/Reply 機制；而 Traceroute 則整合 TTL 逐步增量探針與 ICMP 兩大報文（中間節點回傳 Type 11 Code 0 逾期，終點 Host 因無此 UDP Port 監聽而回覆 Type 3 Code 3），是網路層最經典的反饋診斷黑科技。'
  }
];
