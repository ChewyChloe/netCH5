/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Network, Server, ArrowRight, CheckCircle2, ChevronRight, Play, RefreshCw, Cpu, ShieldAlert, Radio, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ComponentDetail {
  title: string;
  desc: string;
  details: string;
}

export default function SDNControllerLab() {
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'of-messages' | 'fail-simulation'>('architecture');

  // Layered Architecture state
  const [mountedApps, setMountedApps] = useState<string[]>([]);
  const [selectedArchComp, setSelectedArchComp] = useState<string | null>(null);

  // OpenFlow Messaging Lab state
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [selectedMsgType, setSelectedMsgType] = useState<string>('');
  const [msgScore, setMsgScore] = useState<number>(0);
  const [showMsgFeedback, setShowMsgFeedback] = useState<boolean>(false);
  const [scenariosCompleted, setScenariosCompleted] = useState<boolean>(false);

  // Link Failure 9-step state machine
  const [failStep, setFailStep] = useState<number>(0);
  const [predictionSelected, setPredictionSelected] = useState<string>('');
  const [predictionVerified, setPredictionVerified] = useState<boolean>(false);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean>(false);

  // Constant details for architectural components
  const archComponents: Record<string, ComponentDetail> = {
    'apps': {
      title: '網路控制應用層 (Network-Control Applications)',
      desc: '位於最頂端的軟體大腦。可由第三方或運營商自行編寫，包括 Routing、Firewall、Load Balancer。',
      details: '它們透過控制器提供的「北向 API」獲取全網拓撲圖，隨後執行商業和路由邏輯。Apps 不需要理解底層硬體指令，只要下達高階決策即可！'
    },
    'northbound': {
      title: '北向 API (Northbound API)',
      desc: '控制器提供給上層 App 的軟體框架抽象層 (RESTful 或 Java API)。',
      details: '它將底層複雜的網路狀態（交換機數、端口名）提煉成高階的圖論拓撲對象，是控制程式與控制器大腦之間的極高效率橋樑。'
    },
    'state-management': {
      title: '網路狀態管理層 (Network-State Management Layer)',
      desc: 'SDN 控制器的「記憶中樞」，維護著最新、最即時的全網拓撲沙盤。',
      details: '包含 Link-state Database、Switch 列表、主機 IP / MAC 映射、流規則庫 (Flow Rules) 等，隨時準備響應事件並供給北向 App 查詢。'
    },
    'communication': {
      title: '交換機通訊層 (Communication Layer)',
      desc: '南向通訊代理，運行 OpenFlow, P4 或 NETCONF 等控制協定。',
      details: '負責維護與各 Data Plane 交換機之間的底層通訊。此層需要極高頻、高可靠地運送 HELLO, ECHO, FLOW-MOD 等 Socket 訊息（如 TCP 6653）。'
    },
    'southbound': {
      title: '南向 API (Southbound API)',
      desc: '控制器與實體 Data Plane 交換機交換資料的物理與邏輯通道。',
      details: '通常以 OpenFlow 等南向協定標準為代表。它將上層流規則翻譯成底層硬體晶片可識別的二進位 Match-Action 流表語意。'
    },
    'data-plane': {
      title: '資料转发平面 (Data Plane Switches)',
      desc: '由分散於全網路的硬體交換機構成，速度極快、動作敏捷但沒有獨立思考能力。',
      details: '僅根據控制器預先灌入的 Match-Action 流表（TCAM 暫存器）執行高速硬體轉發。當遇見未知的怪流量時，會主動發送 PACKET-IN 報文求救。'
    }
  };

  // OpenFlow Messaging Scenarios
  const ofScenarios = [
    {
      id: 0,
      title: '場景一：交換機探知新鏈路故障',
      scenarioText: '交換機 s3 連接骨幹網的光纖埠（Port 3）突然發生 L1 Carrier Down 實體斷線。交換機應立即用什麼非同步（Asynchronous）訊息通報控制器狀態變更？',
      options: [
        { label: 'A. FLOW-REMOVED Message', value: 'flow-removed' },
        { label: 'B. PORT-STATUS Message', value: 'port-status', correct: true },
        { label: 'C. MOD-STATE (MODIFY-FLOW) Message', value: 'mod-state' },
        { label: 'D. PACKET-OUT Message', value: 'packet-out' }
      ],
      commentary: '答對了！交換機端口發生狀態變天（Up / Down）時，會主動向控制器非同步推送「PORT-STATUS」訊息報文，以便控制大腦第一時間更新沙盤修補拓撲！'
    },
    {
      id: 1,
      title: '場景二：未知封包抵達 Switch',
      scenarioText: 'Switch s1 的 Ingress Port 1 收到一個前所未見的 IPv6 流。當前 Switch 內部的 Flow Table 條目內完全找不到任何能匹配 (Match) 的轉發規則。此時 Switch 應發送什麼報文求助控制器？',
      options: [
        { label: 'A. PACKET-OUT Message', value: 'packet-out' },
        { label: 'B. HELLO Message', value: 'hello' },
        { label: 'C. PACKET-IN Message', value: 'packet-in', correct: true },
        { label: 'D. READ-STATE Message', value: 'read-state' }
      ],
      commentary: '完全正確！收到野生未匹配封包時，交換機會發送 PACKET-IN，通常只帶標頭與 Buffer ID 節省 OpenFlow 連線頻寬，交由 Controller 來判定接下來去哪邊。'
    },
    {
      id: 2,
      title: '場景三：控制器欲主動下發轉發指南',
      scenarioText: '上層 Dijkstra Routing App 重新計算完了故障繞道後的最新路徑，準備指揮控制器在 S1, S2 交換機硬體上安裝、新增並刷新一條點對點的新 Match-Action 流規則。控制器應發起哪種訊息？',
      options: [
        { label: 'A. MOD-STATE (MODIFY-FLOW) Message', value: 'mod-state', correct: true },
        { label: 'B. PORT-CONFIG Message', value: 'port-config' },
        { label: 'C. ECHO Message', value: 'echo' },
        { label: 'D. FLOW-REMOVED Message', value: 'flow-removed' }
      ],
      commentary: '答對了！控制器欲修改/新增交換機內的流表條目時，會使用 Controller-to-Switch 的「MOD-STATE」（具體是 MODIFY-FLOW 類型）命令來寫入交換機快取晶片！'
    },
    {
      id: 3,
      title: '場景四：控制器心跳檢查',
      scenarioText: '為了偵測控制器與交換機之間的 OpenFlow 物理 Socket 連線是否依然正常保活、或是量化兩端之間的來回延遲（RTT），雙方會對等（Symmetric）定時拋接什麼報文進行 Ping-Pong 心跳探測？',
      options: [
        { label: 'A. HELLO Message', value: 'hello' },
        { label: 'B. ERROR Message', value: 'error' },
        { label: 'C. ECHO Message', value: 'echo', correct: true },
        { label: 'D. PORT-STATUS Message', value: 'port-status' }
      ],
      commentary: '完全正確！ECHO 請求與 ECHO 回覆是標準的對等（Symmetric）心跳包，類似 ICMP ping，用來維持和測量 TCP 6653 通道存活！'
    }
  ];

  const handleSelectMessageOption = (opt: any) => {
    setSelectedMsgType(opt.value);
    setShowMsgFeedback(true);
    setPredictionCorrect(!!opt.correct);
    if (opt.correct) {
      setMsgScore((prev) => prev + 1);
    }
  };

  const handleNextScenario = () => {
    setShowMsgFeedback(false);
    setSelectedMsgType('');
    if (currentScenario < ofScenarios.length - 1) {
      setCurrentScenario((prev) => prev + 1);
    } else {
      setScenariosCompleted(true);
    }
  };

  const resetMessageQuiz = () => {
    setCurrentScenario(0);
    setMsgScore(0);
    setScenariosCompleted(false);
    setShowMsgFeedback(false);
    setSelectedMsgType('');
  };

  // Link Failure 9-Step Animations/Descriptions Data
  const linkFailSteps = [
    {
      step: 1,
      name: '交換機檢知斷線 (S1 Detects Down)',
      desc: '連接 Switch 1 (s1) 與 Switch 2 (s2) 的骨幹實體光纖線路被挖斷，s1 本地的 Port 4 接口電信偵檢模組立即檢測到 L1 Carrier Status Down 物理變。',
      color: 'border-l-rose-500 bg-rose-950/10',
      actionPrompt: '【思考預測】當交換機 s1 檢測到物理物理端口 down 以後，它作出的「下一個」最合理反應應該是什麼？',
      options: [
        { label: '1. 自己執行 Dijkstra 重新改算所有的路徑 (OSPF 模式)', correct: false },
        { label: '2. 透過 TCP 6653 專線發送 Asynchronous OpenFlow PORT-STATUS 訊息向遠端控制器哭訴斷線', correct: true },
        { label: '3. 發送 OPEN 報文強行重啟 BGP 會話', correct: false }
      ]
    },
    {
      step: 2,
      name: 'PORT-STATUS 反饋大腦 (PORT-STATUS Sent)',
      desc: '交換機 s1 運作 OpenFlow 南向協定，組裝 PORT-STATUS Asynchronous 報文。在 TCP Port 6653 連線護航下，發送給遠端的 SDN Controller。',
      color: 'border-l-amber-500 bg-amber-950/10',
      actionPrompt: '【思考預測】當 SDN 控制器收到 s1 的 PORT-STATUS 斷線警報後，其內部的通訊模組接過來，下一個應該幹嘛？',
      options: [
        { label: '1. 去修改「網路狀態管理層 (State Layer)」持有的全網 Topo Graph 沙盤', correct: true },
        { label: '2. 寄發一封 BGP NOTIFICATION 報文宣告斷交', correct: false },
        { label: '3. 裝作沒看見，命令 s1 重新發送 HELLO 心跳包', correct: false }
      ]
    },
    {
      step: 3,
      name: '更新大腦狀態沙盤 (Update Topology DB)',
      desc: 'SDN Controller 接收到警報，將斷線狀態反饋。控制器內部中間層的「Link-state 網路狀態管理模組」收到訊息，修正控制器內部持有的 Global Topological Graph 網絡拓撲模型，將 s1 到 s2 的邊成本宣告為無窮大（中斷斷開）。',
      color: 'border-l-blue-500 bg-blue-950/10',
      actionPrompt: '【思考預測】現在大腦內部的地圖沙盤已經標記了中斷點。接下來，控制器本身要與哪一塊元件進行系統聯動？',
      options: [
        { label: '1. 觸發、喚醒訂閱了 Topology-change 事件的北向「Dijkstra 路由 App」', correct: true },
        { label: '2. 命令 MD5 認證模組重新計算雜湊值', correct: false },
        { label: '3. 向全校學生發送 WiFi 重新分配密碼', correct: false }
      ]
    },
    {
      step: 4,
      name: '路由 App 被觸發喚醒 (Trigger Routing App)',
      desc: '由於沙盤中拓撲特徵被修改，產生事件（Event Notification），觸發位於最頂層網路控制應用層（Apps Layer）訂閱此事件的「Dijkstra Routing App」。',
      color: 'border-l-indigo-500 bg-indigo-950/10',
      actionPrompt: '【思考預測】「Dijkstra 路由 App」睡醒了。它要重新算路，那它要去向誰索取（Query）最新的網絡地圖資料呢？',
      options: [
        { label: '1. 逐台連接 Switch 用 LSA 泛洪 (OSPF Flooding)', correct: false },
        { label: '2. 透過 Northbound API 下調，直接讀取控制器中間層「網路狀態管理層」最新儲存的拓撲 Graph 結構', correct: true },
        { label: '3. 讀取 BGP AS-PATH 屬性表', correct: false }
      ]
    },
    {
      step: 5,
      name: 'App 自北向 API 讀取拓撲 (Read Topographic Graph)',
      desc: 'Routing App 呼叫北向 (Northbound API) 抽象，輕鬆自「狀態管理層」拷貝、讀取了那份帶有 s1-s2 阻斷點、最新更新好的 Graph 拓撲資料、以及所有主機位置。其速度甚至優於傳統 OSPF 的重新泛洪。',
      color: 'border-l-cyan-500 bg-cyan-950/10',
      actionPrompt: '【思考預測】現在 App 手裡擁有了最新破碎了的地圖，那它要執行什麼演算法來解出新路徑？',
      options: [
        { label: '1. 執行 Dijkstra 最短路求值演算法，求取阻斷繞道後的各節點最優出口路徑', correct: true },
        { label: '2. 執行 Bellman-Ford 計算 16 步無窮大收斂', correct: false },
        { label: '3. 執行 AES 加密來產生流規則', correct: false }
      ]
    },
    {
      step: 6,
      name: '執行 Dijkstra 最短徑求解 (Execute Route Computation)',
      desc: '解算開始！Routing App 在本地高效運算 Dijkstra 算法。由于地圖中 S1-S2 已經斷開，算法自動找到了完美的「替代備用繞道路線」（例如走旁邊 S1 → S3 → S2）。Dijkstra 完美求解成功！',
      color: 'border-l-teal-500 bg-teal-950/10',
      actionPrompt: '【思考預測】App 已經在肚子裡算出了最佳新出路：『S1要送去 S2，改走上游 S3。』那接下來它要把算好的新路由，轉換為什麼實體硬體調度條目？',
      options: [
        { label: '1. OSPF LSA 廣播條目', correct: false },
        { label: '2. 轉化為一條條點對點交換機底層適用的 New Flow Table (流規則) 匹配條目', correct: true },
        { label: '3. Web 點對點 HTTPS 選路憑證', correct: false }
      ]
    },
    {
      step: 7,
      name: '產生全新流表指令 (Gen Flow Rules)',
      desc: 'App 調配大腦 API，將這批阻斷避難路由轉化為 concrete 流表條目格式（Match-Action Flow Tuple：例如 Match: Destination=s2_host ➜ Action: Forward Port 5 to s3）。',
      color: 'border-l-emerald-500 bg-emerald-950/10',
      actionPrompt: '【思考預測】流表指令產生完畢。App 手持流指令，要下達給控制器，好讓控制器幫它下發底層。App 應呼叫哪一層介面？',
      options: [
        { label: '1. 向控制器中間層的 Flow Rules Manager 下達安裝流表任务 (利用北向 API 介面寫入)', correct: true },
        { label: '2. 自己連接 eBGP 宣告 Prefix', correct: false },
        { label: '3. 直接透過物理層銅線拉動斷電閥門', correct: false }
      ]
    },
    {
      step: 8,
      name: '控制器組織 MOD-STATE 報文下發 (FLOW-MOD Downlink)',
      desc: '控制器大腦（Communication Layer）依任務打包、組裝 OpenFlow MOD-STATE (MODIFY-FLOW) 行動報文，利用 TCP 6653 可靠信道，狂瀾般精確下發、灌入全網受到影響的交換機，指示它們更新本地流表。',
      color: 'border-l-purple-500 bg-purple-950/10',
      actionPrompt: '【思考預測】交換機（如 S1、S3）收到了 Controller 發來的 MODIFY-FLOW 的 OpenFlow 電報了。最後的收尾第九步是什麼？',
      options: [
        { label: '1. 把這電報廣播給旁邊的 PC，讓 PC 重啟電腦', correct: false },
        { label: '2. 刷寫其硬體 TCAM 流快取，新流規則生效，通訊完美阻斷繞行復原！', correct: true },
        { label: '3. 把電報退回，發送 NOTIFICATION 割讓關係', correct: false }
      ]
    },
    {
      step: 9,
      name: '交換機更新 TCAM 晶片，故障完美繞行自癒 (Healing Completed!)',
      desc: '大功告成！Switches 接收 Flow rules，並以極限速度完成快取更新。從此，後續的 packet 通道流量在經過 S1 時，將自動依新流表「繞道 S3 通往 S2」，通訊在幾微秒內完美復原！經歷控制器到 App、通訊回刷的控制平面聯動大合唱圓滿謝幕！',
      color: 'border-l-violet-500 bg-violet-950/10',
      actionPrompt: '【探索分析】此 9步 SDN 流程，與傳統分散式 OSPF 自癒收斂相比，體現了哪項優勢？',
      options: [
        { label: '1. 不需要全網交換機逐台漫長互相大聲公（Flooding更新），由中央統一一次性精確定位、一鍵重下刷更新，收斂速度與拓撲穩定度極其強勢！', correct: true },
        { label: '2. SDN 模式可以強行在 L1 實體層把斷掉的光纖物理黏合起來', correct: false }
      ]
    }
  ];

  const handleVerifyStepPrediction = (opt: any) => {
    setPredictionSelected(opt.label);
    setPredictionVerified(true);
    setPredictionCorrect(opt.correct);
  };

  const handleNextFailStep = () => {
    setPredictionVerified(false);
    setPredictionSelected('');
    if (failStep < linkFailSteps.length - 1) {
      setFailStep((prev) => prev + 1);
    }
  };

  const resetFailSimulation = () => {
    setFailStep(0);
    setPredictionVerified(false);
    setPredictionSelected('');
  };

  // Mount Application helper function
  const handleToggleApp = (appId: string) => {
    if (mountedApps.includes(appId)) {
      setMountedApps((prev) => prev.filter((a) => a !== appId));
    } else {
      setMountedApps((prev) => [...prev, appId]);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-4 md:p-6 mb-6">
      
      {/* 實驗室子頁面切換控制 */}
      <div className="flex gap-2 mb-5 p-1 bg-gray-950/50 rounded-xl border border-gray-900">
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'architecture'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>SDN 三層架構與 App 介接區</span>
        </button>

        <button
          onClick={() => setActiveSubTab('of-messages')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'of-messages'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>OpenFlow 南向訊息交互診斷</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fail-simulation')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'fail-simulation'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Link-Failure 故障自癒 9步演練</span>
        </button>
      </div>

      {/* 子頁面 A: SDN layered Architecture component explorer */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          <div className="border-b border-gray-900 pb-3">
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>一、SDN 全景三合一分層控制器主架構</span>
            </h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              點擊架構各層組件，即可深入探討其核心職掌。您更可以手動點選下方的「控制端應用 (Apps)」進行解鎖介接：
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Component Stack Diagram (7 columns) */}
            <div className="lg:col-span-7 space-y-3 p-4 bg-gray-950/40 rounded-xl border border-gray-850">
              
              {/* Application layer block */}
              <div
                onClick={() => setSelectedArchComp('apps')}
                className={`p-3.5 rounded-xl border text-center cursor-pointer transition ${
                  selectedArchComp === 'apps'
                    ? 'bg-indigo-950/30 border-indigo-500 scale-[1.01]'
                    : 'bg-indigo-900/5 border-indigo-900/30 hover:border-indigo-800'
                }`}
              >
                <div className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1">
                  <Cpu className="w-4 h-4" />
                  <span>網路控制應用層 (Applications Layer)</span>
                </div>
                {mountedApps.length > 0 ? (
                  <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                    {mountedApps.map(appId => (
                      <span key={appId} className="text-[9px] bg-indigo-900 text-indigo-200 border border-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        {appId === 'routing' ? '✔ 路由 Dijkstra App' : appId === 'firewall' ? '✔ 防火牆 ACL App' : '✔ 負載均衡分流 App'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono block mt-1">
                    ◀ 暫未介接任何功能 Applications（可選取右下方按鈕增設）
                  </span>
                )}
              </div>

              {/* Northbound Bridge Line */}
              <div className="flex flex-col items-center py-1">
                <div className="w-0.5 h-4 bg-gray-700"></div>
                <div
                  onClick={() => setSelectedArchComp('northbound')}
                  className={`text-[9px] font-mono border px-3 py-0.5 rounded-full cursor-pointer transition uppercase ${
                    selectedArchComp === 'northbound'
                      ? 'bg-teal-950 text-teal-300 border-teal-500'
                      : 'bg-gray-950/50 text-gray-500 border-gray-800'
                  }`}
                >
                  北向 API (Northbound API / RESTful API Interface)
                </div>
                <div className="w-0.5 h-4 bg-gray-700"></div>
              </div>

              {/* SDN Controller Block Wrapper */}
              <div className="border border-purple-800/40 rounded-2xl p-3 bg-purple-950/5">
                <div className="text-[10px] text-purple-400 font-mono text-center uppercase tracking-widest font-bold mb-2">
                  SDN Controller 遠程控制器核心分層
                </div>
                
                <div className="space-y-2">
                  {/* State Manager Sublayer */}
                  <div
                    onClick={() => setSelectedArchComp('state-management')}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                      selectedArchComp === 'state-management'
                        ? 'bg-purple-950/30 border-purple-500 scale-[1.01]'
                        : 'bg-purple-900/10 border-purple-900/30 hover:border-purple-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-300">
                      3. 網路狀態管理層 (Network-State Management Layer)
                    </div>
                    <span className="text-[10px] text-purple-400 font-sans block mt-1">
                      (維護拓撲 Graph、連線 Switches、主機與 Link State DB)
                    </span>
                  </div>

                  {/* Communication Sublayer */}
                  <div
                    onClick={() => setSelectedArchComp('communication')}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                      selectedArchComp === 'communication'
                        ? 'bg-purple-950/30 border-purple-500 scale-[1.01]'
                        : 'bg-purple-900/10 border-purple-900/30 hover:border-purple-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-300">
                      2. 交換機通訊協定層 (Communication Layer)
                    </div>
                    <span className="text-[10px] text-purple-400 font-sans block mt-1">
                      (南向核心代理：OpenFlow / P4 - 建立經 TCP 6653 會話通道)
                    </span>
                  </div>
                </div>
              </div>

              {/* Southbound Bridge Line */}
              <div className="flex flex-col items-center py-1">
                <div className="w-0.5 h-4 bg-gray-700"></div>
                <div
                  onClick={() => setSelectedArchComp('southbound')}
                  className={`text-[9px] font-mono border px-3 py-0.5 rounded-full cursor-pointer transition uppercase ${
                    selectedArchComp === 'southbound'
                      ? 'bg-teal-950 text-teal-300 border-teal-500'
                      : 'bg-gray-950/50 text-gray-500 border-gray-800'
                  }`}
                >
                  南向 API (Southbound API / OpenFlow Standard Protocol Channel)
                </div>
                <div className="w-0.5 h-4 bg-gray-700"></div>
              </div>

              {/* Data Plane Block */}
              <div
                onClick={() => setSelectedArchComp('data-plane')}
                className={`p-3.5 rounded-xl border text-center cursor-pointer transition ${
                  selectedArchComp === 'data-plane'
                    ? 'bg-cyan-950/30 border-cyan-500 scale-[1.01]'
                    : 'bg-cyan-900/5 border-cyan-900/30 hover:border-cyan-800'
                }`}
              >
                <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1">
                  <Server className="w-4 h-4" />
                  <span>實體轉發平面交換機 (Data Plane Switches: s1, s2, s3, s4)</span>
                </div>
                <p className="text-[10px] text-cyan-400 font-sans mt-1">
                  (本身無大腦、僅儲存 Match-Action TCAM Flow Tables，負責高速線路硬體轉發)
                </p>
              </div>

            </div>

            {/* Right: Selected Component Detailed Reader (5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Dynamic instruction or info display */}
              <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl min-h-[180px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1.5">
                    Component Insights Reader (大綱導覽器)
                  </div>
                  {selectedArchComp ? (
                    <motion.div
                      key={selectedArchComp}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2.5"
                    >
                      <h4 className="text-sm font-bold text-indigo-300">
                        {archComponents[selectedArchComp].title}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        {archComponents[selectedArchComp].desc}
                      </p>
                      <p className="text-xs text-emerald-400 font-sans leading-relaxed border-t border-gray-900 pt-2.5 mt-2.5">
                        🔍 <strong>核心細節：</strong> {archComponents[selectedArchComp].details}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-xs text-gray-400 flex flex-col items-center justify-center pt-8 text-center leading-relaxed">
                      <span>💡</span>
                      <span className="mt-1">請點按左側架構模型中的任何一個「分層區塊」或「API 接口通道」，即刻為您展開對應 PDF 的精細定義與黑科技講解！</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons to mount Apps */}
              <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-3">
                  北向應用介接工作區 (Mount Applications)
                </span>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mb-3">
                  點選下方想要由控制器北向 (Northbound) 灌入的應用 App：
                </p>
                
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'routing', label: 'Dijkstra 路由 App (Routing Solver App)' },
                    { id: 'firewall', label: '防火牆權限 App (Access Control / ACL App)' },
                    { id: 'balancer', label: '負載均衡 App (Load Balancer App)' }
                  ].map(app => {
                    const isMounted = mountedApps.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleToggleApp(app.id)}
                        className={`py-2 px-3 rounded-lg text-left text-xs font-sans font-bold flex items-center justify-between border transition ${
                          isMounted
                            ? 'bg-teal-950/20 border-teal-500 text-teal-300'
                            : 'bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-800'
                        }`}
                      >
                        <span>{app.label}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40">
                          {isMounted ? '✅ 已載入' : '未介接'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 子頁面 B: OpenFlow Messaging Lab */}
      {activeSubTab === 'of-messages' && (
        <div className="space-y-6">
          <div className="border-b border-gray-900 pb-3">
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>二、OpenFlow 基礎協定南向訊息考驗實驗室</span>
            </h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              OpenFlow 具有 Controller-to-Switch, Asynchronous (交換機主動) 及 Symmetric 三大基本訊息類別。請根據以下場景選出正確報文名稱：
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!scenariosCompleted ? (
              <motion.div
                key={currentScenario}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
              >
                {/* Scenario details (7 columns) */}
                <div className="md:col-span-7 bg-gray-950/40 border border-gray-850 p-5 rounded-2xl">
                  <div className="text-[10px] text-indigo-400 font-mono font-bold uppercase mb-1 flex items-center justify-between">
                    <span>{ofScenarios[currentScenario].title}</span>
                    <span>學術考驗 {currentScenario + 1} / {ofScenarios.length}</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-200 mt-2 mb-3 leading-relaxed font-sans">
                    {ofScenarios[currentScenario].scenarioText}
                  </h4>

                  <div className="flex flex-col gap-2 pt-2">
                    {ofScenarios[currentScenario].options.map((opt) => {
                      const isSelected = selectedMsgType === opt.value;
                      let btnStyle = 'bg-[#0f1422] border-gray-900 text-gray-300 hover:border-gray-800';
                      if (isSelected) {
                        btnStyle = opt.correct 
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-500 text-rose-300';
                      }

                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            if (showMsgFeedback) return;
                            handleSelectMessageOption(opt);
                          }}
                          disabled={showMsgFeedback}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-sans font-bold transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt.label}</span>
                          {showMsgFeedback && opt.correct && (
                            <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                              正確答案
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scenario details column (5 columns) */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl min-h-[180px] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block uppercase mb-2">
                        即時答題診斷 (Diagnostic Feedback)
                      </span>
                      {showMsgFeedback ? (
                        <div className="space-y-2.5">
                          <h5 className={`text-xs font-bold leading-relaxed flex items-center gap-1 ${predictionCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {predictionCorrect ? '✔ 完全正確！' : '❌ 答錯了喔！'}
                          </h5>
                          <p className="text-xs text-gray-300 leading-relaxed font-sans">
                            {ofScenarios[currentScenario].commentary}
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 leading-relaxed text-center pt-8">
                          <span>⏱</span>
                          <p className="mt-1">請在左側點選您認為最契合教材設計大綱的 OpenFlow 協定通訊報文類型代號。</p>
                        </div>
                      )}
                    </div>

                    {showMsgFeedback && (
                      <button
                        onClick={handleNextScenario}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs mt-4 flex items-center justify-center gap-1 transition"
                      >
                        <span>{currentScenario === ofScenarios.length - 1 ? '完成所有交互' : '前進下一題'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">目前累計正確題數:</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">{msgScore} / {ofScenarios.length}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-2xl text-center space-y-4 max-w-xl mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-emerald-300">
                  恭喜修滿 OpenFlow 南向通訊交互學術認證！
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
                  您在本次南向測試中，正確識別了 PORT-STATUS 埠狀態通知、PACKET-IN 未匹配流求救、MOD-STATE 流表改刷命令、以及 ECHO 保活心跳等全方位關鍵通報流程。您在實戰中展現了對 OpenFlow 的絕佳研讀素養！
                </p>
                <div className="text-xs font-mono text-cyan-400">
                  本次考驗得分率： {Math.round((msgScore / ofScenarios.length) * 100)}%
                </div>
                <button
                  onClick={resetMessageQuiz}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>重試考驗</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 子頁面 C: Link Failure step-by-step state machine anim */}
      {activeSubTab === 'fail-simulation' && (
        <div className="space-y-6">
          <div className="border-b border-gray-900 pb-3">
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Network className="w-4 h-4 text-indigo-400" />
              <span>三、SDN 鏈路故障自癒「黃金九步法」深度動態演練</span>
            </h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              點擊「下一步」以驅動狀態演進。請逐一預測控制器各分層與應用 App 如何完成精彩的控制面大對折：
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Flow List (7 columns) */}
            <div className="lg:col-span-7 space-y-3.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {linkFailSteps.map((item, idx) => {
                const isCurrent = failStep === idx;
                const isPast = failStep > idx;

                let borderStyle = 'border-gray-900 opacity-40 scale-[0.98]';
                if (isCurrent) {
                  borderStyle = `${item.color} border-l-4 opacity-100 scale-[1.01] shadow-md shadow-indigo-950/20`;
                } else if (isPast) {
                  borderStyle = 'border-emerald-900/60 border-l-4 border-l-emerald-500 opacity-70';
                }

                return (
                  <div
                    key={item.step}
                    className={`bg-gray-950/50 border p-3 md:p-3.5 rounded-xl transition-all duration-300 ${borderStyle}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isPast ? 'bg-emerald-900/40 text-emerald-400' : 'bg-indigo-950 text-indigo-400'
                        }`}>
                          PHASE 0{item.step}
                        </span>
                        <h4 className={`text-xs md:text-sm font-bold ${
                          isPast ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-gray-500'
                        }`}>
                          {item.name}
                        </h4>
                      </div>
                      {isPast && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">✔ 已通關</span>
                      )}
                    </div>
                    {isCurrent && (
                      <p className="text-[11px] text-gray-300 leading-relaxed font-sans transition">
                        {item.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Interactive Prediction Box (5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1.5 flex items-center justify-between">
                    <span>故障自癒預測解算區</span>
                    <span className="text-cyan-400 font-mono">Step {failStep + 1} / 9</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-300 mb-2 leading-relaxed">
                    {linkFailSteps[failStep].actionPrompt}
                  </h4>

                  <div className="space-y-2 pt-1.5">
                    {linkFailSteps[failStep].options.map((opt) => {
                      const isSelected = predictionSelected === opt.label;
                      let optionStyle = 'bg-gray-950/60 border-gray-900 text-gray-400 hover:border-gray-800';

                      if (predictionVerified && isSelected) {
                        optionStyle = opt.correct
                          ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow shadow-emerald-900/20'
                          : 'bg-rose-950/30 border-rose-500 text-rose-300 shadow shadow-rose-900/20';
                      }

                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            if (predictionVerified) return;
                            handleVerifyStepPrediction(opt);
                          }}
                          disabled={predictionVerified}
                          className={`w-full p-2.5 rounded-xl border text-left text-[11px] font-sans font-bold leading-relaxed transition ${optionStyle}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {predictionVerified && (
                  <div className="mt-4 pt-3 border-t border-gray-900 flex flex-col gap-3">
                    <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
                      {predictionCorrect ? (
                        <span className="text-emerald-400 font-bold block mb-1">✔ 預測精確！</span>
                      ) : (
                        <span className="text-rose-400 font-bold block mb-1">❌ 預測不對喔。</span>
                      )}
                      <span>
                        {predictionCorrect 
                          ? '完全沒錯！完全呼應 PDF 設計流程。快點按下方按鈕推進狀態機前進下一步！'
                          : '沒關係，這是一次自我磨練。請點按下方按鈕觀察控制器與交換機實際上是怎麼聯動的！'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (failStep === linkFailSteps.length - 1) {
                          resetFailSimulation();
                        } else {
                          handleNextFailStep();
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      <span>{failStep === linkFailSteps.length - 1 ? '自癒完成！重新開始' : '確定並推進下一步'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-1.5">
                  故障動畫物理指示器
                </span>
                <div className="relative h-15 bg-gray-950/50 border border-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-2.5">
                  {/* Animation details */}
                  <div className="flex items-center gap-6 z-10 w-full justify-around text-xs font-mono font-bold">
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] ${failStep >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>s1</span>
                      <span className="text-[8px] text-gray-500 uppercase">Switch</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center relative py-1">
                      {/* Line connecting s1 & s2 */}
                      <div className={`w-full h-0.5 ${failStep >= 8 ? 'bg-emerald-500' : failStep >= 1 ? 'bg-gray-800 border-dashed border-gray-850' : 'bg-rose-500 animate-pulse'}`}></div>
                      {/* Broken mark representation */}
                      {failStep < 8 && (
                        <span className="absolute top-[-7px] text-[10px] text-rose-500 animate-ping font-sans">⚡</span>
                      )}
                      <span className="text-[8px] text-gray-500 uppercase mt-1">
                        {failStep >= 8 ? '改行繞道 (Bypassed)' : '實體斷路 (Broken)'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] ${failStep >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>s2</span>
                      <span className="text-[8px] text-gray-500 uppercase">Switch</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
