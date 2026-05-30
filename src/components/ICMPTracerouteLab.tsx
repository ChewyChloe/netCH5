/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Send,
  Sliders,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Play,
  HelpCircle,
  Activity,
  Info,
  Network,
  Award,
  ArrowRight,
  Check,
  AlertTriangle,
  Flame,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

// ============================================
// Types and Mock Data
// ============================================

interface ICMPTypeDefinition {
  type: number;
  code: number;
  name: string;
  category: 'error' | 'informational';
  description: string;
  usage: string;
  sender: string;
}

const icmpDatabase: ICMPTypeDefinition[] = [
  {
    type: 8,
    code: 0,
    name: 'Echo Request (Ping 請求)',
    category: 'informational',
    description: '詢問目標主機是否在線，請求對方回傳 Echo Reply 報文。',
    usage: 'Ping 工具的發起主動指令。',
    sender: '發起 Ping 的 Source Host'
  },
  {
    type: 0,
    code: 0,
    name: 'Echo Reply (Ping 回應)',
    category: 'informational',
    description: '回應先前的 Echo Request 請求，向發送端證明自己完全在線且協定棧正常。',
    usage: 'Ping 工具成功連通的最終確認標誌。',
    sender: '接收到 Ping 請求的 Destination Host'
  },
  {
    type: 11,
    code: 0,
    name: 'TTL Expired in Transit (傳輸中 TTL 逾期)',
    category: 'error',
    description: '封包在經過路由器時，IP 標頭內的 TTL 減為 0 被丟棄，防堵全網陷入無限路由環路。',
    usage: 'Traceroute (tracert) 用以紀錄中間中繼路由器 IP 的最關鍵核心報文。',
    sender: '拋棄該逾期數據包的中途 Router'
  },
  {
    type: 3,
    code: 3,
    name: 'Destination Port Unreachable (連接埠不可達)',
    category: 'error',
    description: '封包抵達最終目的主機，但目標傳輸埠 (Socket Port) 並未開啟任何程序監聽而拒絕接收。',
    usage: 'Traceroute UDP 探針成功到站、停止發射的最主要標誌性報文。',
    sender: 'Destination Host (最終目的主機本體)'
  },
  {
    type: 3,
    code: 1,
    name: 'Destination Host Unreachable (主機不可達)',
    category: 'error',
    description: '中途路由器已送達最後子網，但透過底層 ARP 廣播卻完全喚不醒該目標 IP，代表主機關機或 IP 錯誤。',
    usage: '回報目標子網路在線但主機根本不存在（失聯）。',
    sender: '目標子網所在的 Edge Router (邊界閘道)'
  },
  {
    type: 3,
    code: 0,
    name: 'Destination Network Unreachable (網路不可達)',
    category: 'error',
    description: '中繼路由器的全域路由表中找不到去往該 IP 目的網段的任何路由，直接丟棄並報錯。',
    usage: '回報路由器沒有可以轉送此網域的 Forwarding Table 條目。',
    sender: '查無此路由條目的中途 Router'
  },
  {
    type: 3,
    code: 2,
    name: 'Destination Protocol Unreachable (協定不可達)',
    category: 'error',
    description: '目標主機的 IP 協定棧不支援此類別的上層通訊協定（非 TCP、UDP 等常規封裝）。',
    usage: '回報目的地不認識該特定的 IP 承載協定。',
    sender: 'Destination Host'
  }
];

interface MatchingGameRound {
  id: string;
  question: string;
  correctType: number;
  correctCode: number;
}

const matchingGameRounds: MatchingGameRound[] = [
  {
    id: 'mg-1',
    question: '第一關：Ping 檢測工具在啟航時探尋對方主機狀態所發射的初始化查詢封包是？',
    correctType: 8,
    correctCode: 0
  },
  {
    id: 'mg-2',
    question: '第二關：Traceroute 探航封包在經過第三個路由器時生命值 (TTL) 耗盡變 0，路由器丟棄該包並送回哪種報文？',
    correctType: 11,
    correctCode: 0
  },
  {
    id: 'mg-3',
    question: '第三關：Traceroute 探針成功安全扣門目的地主機，但由於其向隨機的 33434 埠頭射入，主機回報何種異常以宣告 Traceroute 成功達陣？',
    correctType: 3,
    correctCode: 3
  },
  {
    id: 'mg-4',
    question: '第四關：遠端目的主機成功收到 Ping 包，它將其按規定簽收，回復哪種報文以在源端形成 "Reply from" 標記？',
    correctType: 0,
    correctCode: 0
  },
  {
    id: 'mg-5',
    question: '第五關：中途骨幹路由器在自己最新的 Routing Table 中瘋狂比對，發現徹底沒有前往 19.9.9.9 的路由路徑，此時回送？',
    correctType: 3,
    correctCode: 0
  },
  {
    id: 'mg-6',
    question: '第六關：網閘已穿透至最終 LAN 端，但發射 ARP 敲門卻死不應答（目標主機已拔線關機），邊界路由器回覆？',
    correctType: 3,
    correctCode: 1
  }
];

// Traceroute 拓撲節點定義
interface TracerouteNode {
  id: string;
  name: string;
  ip: string;
  description: string;
}

const tracerouteNodes: TracerouteNode[] = [
  { id: 'src', name: 'Source Host', ip: '192.168.1.100', description: '你的學生本機電腦' },
  { id: 'r1', name: 'Router 1 (台北閘道)', ip: '10.0.1.1', description: '本地 ISP 台北接入邊緣閘道器' },
  { id: 'r2', name: 'Router 2 (大阪骨幹)', ip: '202.97.12.14', description: '跨海光纖接入大阪骨幹路由器' },
  { id: 'r3', name: 'Router 3 (東京中繼)', ip: '210.150.9.33', description: '東京 BGP 政策核心中轉站' },
  { id: 'r4', name: 'Router 4 (雲端邊緣)', ip: '108.177.3.2', description: '終端雲資料中心高速機房閘道器' },
  { id: 'dst', name: 'Cloud Server', ip: '8.8.8.8', description: '終點 Google Public DNS 主機' }
];

export default function ICMPTracerouteLab() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'ping' | 'traceroute'>('explorer');

  // ============================================
  // Tab 1: Explorer State
  // ============================================
  const [selectedIcmp, setSelectedIcmp] = useState<ICMPTypeDefinition>(icmpDatabase[0]);
  const [mgIndex, setMgIndex] = useState<number>(0);
  const [mgScore, setMgScore] = useState<number>(0);
  const [mgFeedback, setMgFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  // ============================================
  // Tab 2: Ping Simulator State
  // ============================================
  const [pingTarget, setPingTarget] = useState<string>('8.8.8.8');
  const [pingScenario, setPingScenario] = useState<'normal' | 'unreachable' | 'timeout'>('normal');
  const [isPingRunning, setIsPingRunning] = useState<boolean>(false);
  const [pingConsoleLines, setPingConsoleLines] = useState<string[]>([]);
  const [pingStep, setPingStep] = useState<'idle' | 'sending' | 'at_target' | 'returning' | 'timeout' | 'error'>('idle');

  // ============================================
  // Tab 3: Traceroute State
  // ============================================
  const [trMode, setTrMode] = useState<'normal' | 'unresponsive_r3' | 'unreachable_dst'>('normal');
  const [trCurrentTtl, setTrCurrentTtl] = useState<number>(0);
  const [trHops, setTrHops] = useState<any[]>([]);
  const [isTrRunning, setIsTrRunning] = useState<boolean>(false);
  const [isTrCompleted, setIsTrCompleted] = useState<boolean>(false);
  const [trStep, setTrStep] = useState<'idle' | 'probing' | 'carrier_ttl_expired' | 'carrier_port_unreachable' | 'carrier_dropped'>('idle');
  const [activeProbePackets, setActiveProbePackets] = useState<number[]>([]); // 飛行中的 3 探包
  const [prediction, setPrediction] = useState<'ttl_expire' | 'port_unreachable' | 'asterisk' | 'host_unreachable' | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [showPredictionQuestion, setShowPredictionQuestion] = useState<boolean>(false);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pingConsoleLines, trHops]);

  // Handle ICMP matching game guess
  const handleMgGuess = (def: ICMPTypeDefinition) => {
    if (mgFeedback) return; // 避免連擊

    const round = matchingGameRounds[mgIndex];
    const isCorrect = def.type === round.correctType && def.code === round.correctCode;

    if (isCorrect) {
      setMgScore((s) => s + 1);
      setMgFeedback({
        isCorrect: true,
        text: `【完全正確！】這款 ICMP 報文正是 Type ${def.type} Code ${def.code} (${def.name})。解析：${def.description}`
      });
    } else {
      setMgFeedback({
        isCorrect: false,
        text: `【答錯了！】你選擇了 Type ${def.type} Code ${def.code} (${def.name})。\n正確答案應是 Type ${round.correctType} Code ${round.correctCode}。解析：${
          icmpDatabase.find((x) => x.type === round.correctType && x.code === round.correctCode)?.description
        }`
      });
    }
  };

  const nextMgRound = () => {
    setMgFeedback(null);
    if (mgIndex < matchingGameRounds.length - 1) {
      setMgIndex((i) => i + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const resetMgGame = () => {
    setMgIndex(0);
    setMgScore(0);
    setMgFeedback(null);
    setGameCompleted(false);
  };

  // ============================================
  // Ping Simulation Run
  // ============================================
  const runPingSimulation = async () => {
    if (isPingRunning) return;
    setIsPingRunning(true);
    setPingConsoleLines([]);
    setPingStep('idle');

    // Terminal Init lines
    setPingConsoleLines([
      `PING ${pingTarget} (${pingTarget}): 56 data bytes`,
    ]);

    const runSeq = async (seq: number) => {
      setPingStep('sending');
      await new Promise((r) => setTimeout(r, 600));

      if (pingScenario === 'timeout') {
        setPingStep('timeout');
        await new Promise((r) => setTimeout(r, 600));
        setPingConsoleLines((prev) => [
          ...prev,
          `Request timeout for icmp_seq ${seq}`
        ]);
      } else if (pingScenario === 'unreachable') {
        setPingStep('error');
        await new Promise((r) => setTimeout(r, 600));
        setPingConsoleLines((prev) => [
          ...prev,
          `From 10.0.1.1 (Router 1) icmp_seq=${seq}: Destination Host Unreachable (ICMP Type 3 Code 1)`
        ]);
      } else {
        // Normal success Reply
        setPingStep('at_target');
        await new Promise((r) => setTimeout(r, 450));
        setPingStep('returning');
        await new Promise((r) => setTimeout(r, 450));

        const rtt = (10 + Math.random() * 8).toFixed(1);
        const ttl = 64 - 2; // Source local TTL typically starts at 64, intermediate default decrements
        setPingConsoleLines((prev) => [
          ...prev,
          `64 bytes from ${pingTarget}: icmp_seq=${seq} ttl=${ttl} time=${rtt} ms`
        ]);
      }
    };

    // run 4 probes sequentially
    for (let i = 1; i <= 4; i++) {
      await runSeq(i);
      await new Promise((r) => setTimeout(r, 300));
    }

    // Finished Statistics
    setPingStep('idle');
    setIsPingRunning(false);

    if (pingScenario === 'timeout') {
      setPingConsoleLines((prev) => [
        ...prev,
        ``,
        `--- ${pingTarget} ping statistics ---`,
        `4 packets transmitted, 0 packets received, 100.0% packet loss`
      ]);
    } else if (pingScenario === 'unreachable') {
      setPingConsoleLines((prev) => [
        ...prev,
        ``,
        `--- ${pingTarget} ping statistics ---`,
        `4 packets transmitted, 0 packets received, 100.0% packet loss (host unreachable)`
      ]);
    } else {
      setPingConsoleLines((prev) => [
        ...prev,
        ``,
        `--- ${pingTarget} ping statistics ---`,
        `4 packets transmitted, 4 packets received, 0.0% packet loss`,
        `round-trip min/avg/max = 10.1/12.8/17.4 ms`
      ]);
    }
  };

  // ============================================
  // Traceroute Simulation Run
  // ============================================
  const startTraceroute = () => {
    setTrCurrentTtl(0);
    setTrHops([]);
    setIsTrCompleted(false);
    setIsTrRunning(true);
    setTrStep('idle');
    setActiveProbePackets([]);
    setPrediction(null);
    setPredictionFeedback(null);
    setShowPredictionQuestion(true); // 讓使用者預測第一步
  };

  const handlePredict = (pType: 'ttl_expire' | 'port_unreachable' | 'asterisk' | 'host_unreachable') => {
    setPrediction(pType);
    const nextTtl = trCurrentTtl + 1;
    let expected: typeof pType = 'ttl_expire';

    if (trMode === 'unresponsive_r3' && nextTtl === 3) {
      expected = 'asterisk';
    } else if (trMode === 'unreachable_dst' && nextTtl === 4) {
      expected = 'host_unreachable';
    } else if (nextTtl === 5) {
      expected = 'port_unreachable';
    }

    if (pType === expected) {
      setPredictionFeedback('🎉 預測完全正確！你對 ICMP 的底層報文特徵瞭若指掌！');
    } else {
      const explainText = {
        'ttl_expire': 'TTL Expired (Type 11 Code 0) ── 路由器發現 TTL=0 予以丟棄回報。',
        'port_unreachable': 'Port Unreachable (Type 3 Code 3) ── 終點主機拒絕隨機 UDP 連接埠。',
        'asterisk': '星號 * * * ── 中繼路由器防火牆阻絕 ICMP 回送。',
        'host_unreachable': 'Host Unreachable (Type 3 Code 1) ── 路由器找不到 LAN 端的主機。'
      }[expected];
      setPredictionFeedback(`❌ 預測錯誤。正確應為「${explainText}」`);
    }
  };

  const executeNextHop = async () => {
    if (!isTrRunning || isTrCompleted) return;

    setShowPredictionQuestion(false);
    const nextTtl = trCurrentTtl + 1;
    setTrCurrentTtl(nextTtl);
    setTrStep('probing');

    // 啟動 3 個探針飛行
    setActiveProbePackets([1, 2, 3]);

    // 延遲模擬封包前進
    await new Promise((r) => setTimeout(r, 800));

    let hopInfo: any = {};
    const routerIndex = nextTtl; // TTL 1 corresponds to Router 1 (index 1)

    // Scenario logic
    if (trMode === 'unresponsive_r3' && nextTtl === 3) {
      // Router 3 is unresponsive, dropping and not replying
      setTrStep('carrier_dropped');
      await new Promise((r) => setTimeout(r, 600));
      hopInfo = {
        ttl: nextTtl,
        nodeName: 'Router 3 (東京中繼)',
        ip: '* * *',
        rtts: ['*', '*', '*'],
        icmpCode: 'Request Timeout',
        icmpDesc: '路由器防火牆限制或高負載下丟棄 ICMP 回報，只顯示 asterisks',
        isStar: true
      };
    } else if (trMode === 'unreachable_dst' && nextTtl === 4) {
      // Router 4 finds Host Unreachable, drops and stops
      setTrStep('carrier_dropped');
      await new Promise((r) => setTimeout(r, 600));
      hopInfo = {
        ttl: nextTtl,
        nodeName: 'Router 4 (雲端邊緣)',
        ip: tracerouteNodes[4].ip,
        rtts: ['18.2 ms', '19.4 ms', '17.8 ms'],
        icmpCode: 'Type 3, Code 1',
        icmpDesc: 'Destination Host Unreachable ── 邊緣閘道找不到目標設備而退件',
        isError: true
      };
      setIsTrCompleted(true);
      setIsTrRunning(false);
    } else if (nextTtl === 5) {
      // Safely arrived at Destination 8.8.8.8
      setTrStep('carrier_port_unreachable');
      await new Promise((r) => setTimeout(r, 850));
      hopInfo = {
        ttl: nextTtl,
        nodeName: 'Cloud Server (終點)',
        ip: tracerouteNodes[5].ip,
        rtts: ['21.4 ms', '22.8 ms', '19.9 ms'],
        icmpCode: 'Type 3, Code 3',
        icmpDesc: 'Destination Port Unreachable ── 成功抵達主機，宣告探航成功！',
        isTarget: true
      };
      setIsTrCompleted(true);
      setIsTrRunning(false);
    } else if (nextTtl > 5) {
      // Safety guard
      setIsTrCompleted(true);
      setIsTrRunning(false);
      return;
    } else {
      // Normal middle router Hop-by-hop (TTL Expired)
      setTrStep('carrier_ttl_expired');
      await new Promise((r) => setTimeout(r, 650));
      const targetNode = tracerouteNodes[nextTtl];
      const baseRtt = nextTtl * 5 + 4;
      hopInfo = {
        ttl: nextTtl,
        nodeName: targetNode.name,
        ip: targetNode.ip,
        rtts: [
          `${(baseRtt + Math.random() * 2).toFixed(1)} ms`,
          `${(baseRtt + Math.random() * 3).toFixed(1)} ms`,
          `${(baseRtt + Math.random() * 2 - 1).toFixed(1)} ms`
        ],
        icmpCode: 'Type 11, Code 0',
        icmpDesc: 'TTL Expired in Transit ── TTL減零丟棄，回傳時序 IP',
        isTtlExpired: true
      };
    }

    setTrHops((prev) => [...prev, hopInfo]);
    setActiveProbePackets([]);
    setTrStep('idle');
    setPrediction(null);
    setPredictionFeedback(null);

    // 判斷是否還要繼續，若是正常中游，則提示新的一步預測
    if (nextTtl < 5 && !isTrCompleted && !(trMode === 'unreachable_dst' && nextTtl === 4)) {
      setShowPredictionQuestion(true);
    }
  };

  const handleAutoTraceroute = async () => {
    startTraceroute();
    // 預先模擬不帶交互預測
    setShowPredictionQuestion(false);

    let currentTtl = 0;
    let completed = false;

    while (!completed && currentTtl < 5) {
      currentTtl++;
      setTrCurrentTtl(currentTtl);
      setTrStep('probing');
      setActiveProbePackets([1, 2, 3]);

      await new Promise((r) => setTimeout(r, 500));

      let hopInfo: any = {};
      if (trMode === 'unresponsive_r3' && currentTtl === 3) {
        setTrStep('carrier_dropped');
        await new Promise((r) => setTimeout(r, 300));
        hopInfo = {
          ttl: currentTtl,
          nodeName: 'Router 3 (東京中繼)',
          ip: '* * *',
          rtts: ['*', '*', '*'],
          icmpCode: 'Request Timeout',
          icmpDesc: '中途節點静默丟包，返回 asterrisks',
          isStar: true
        };
      } else if (trMode === 'unreachable_dst' && currentTtl === 4) {
        setTrStep('carrier_dropped');
        await new Promise((r) => setTimeout(r, 350));
        hopInfo = {
          ttl: currentTtl,
          nodeName: 'Router 4 (雲端邊緣)',
          ip: tracerouteNodes[4].ip,
          rtts: ['17.4 ms', '18.9 ms', '18.1 ms'],
          icmpCode: 'Type 3, Code 1',
          icmpDesc: 'Destination Host Unreachable ── 找不到主機，被迫斷尾阻絕',
          isError: true
        };
        completed = true;
      } else if (currentTtl === 5) {
        setTrStep('carrier_port_unreachable');
        await new Promise((r) => setTimeout(r, 550));
        hopInfo = {
          ttl: currentTtl,
          nodeName: 'Cloud Server (終點)',
          ip: tracerouteNodes[5].ip,
          rtts: ['21.1 ms', '20.9 ms', '22.4 ms'],
          icmpCode: 'Type 3, Code 3',
          icmpDesc: 'Destination Port Unreachable ── 敲擊關閉埠口達陣成功！',
          isTarget: true
        };
        completed = true;
      } else {
        setTrStep('carrier_ttl_expired');
        await new Promise((r) => setTimeout(r, 450));
        const targetNode = tracerouteNodes[currentTtl];
        const baseRtt = currentTtl * 5 + 4;
        hopInfo = {
          ttl: currentTtl,
          nodeName: targetNode.name,
          ip: targetNode.ip,
          rtts: [
            `${(baseRtt + Math.random() * 2).toFixed(1)} ms`,
            `${(baseRtt + Math.random() * 2).toFixed(1)} ms`,
            `${(baseRtt + Math.random() * 2).toFixed(1)} ms`
          ],
          icmpCode: 'Type 11, Code 0',
          icmpDesc: 'TTL Expired in Transit ── TTL 扣減為 0 被丟棄',
          isTtlExpired: true
        };
      }

      setTrHops((prev) => [...prev, hopInfo]);
      setActiveProbePackets([]);
      setTrStep('idle');
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsTrCompleted(true);
    setIsTrRunning(false);
  };

  const getCarrierXPosition = () => {
    // 根據當前 TTL 位置給予飛行器百分比 X 座標
    if (activeProbePackets.length === 0) return '0%';
    const totalSlots = 5;
    const progress = (trCurrentTtl / totalSlots) * 100;
    return `${progress}%`;
  };

  return (
    <div id="icmp-traceroute-lab-container" className="bg-[#0b0f19] border border-gray-850 rounded-2xl overflow-hidden w-full text-gray-200 shadow-2xl flex flex-col">
      {/* 頂部 Panel 標題與說明 */}
      <div className="bg-gradient-to-r from-slate-950 to-[#101423] p-5 border-b border-gray-850 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-900/50 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
            Control Plane Sandbox
          </span>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 mt-1.5 font-sans">
            <Network className="w-5 h-5 text-sky-400" />
            <span>ICMP 協定機制與 Traceroute 遞增探測實驗室</span>
          </h2>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-gray-400 font-bold block">實驗模組：Module 10</span>
          <span className="text-[10px] text-gray-500 font-mono">ICMP & TRACEROUTE CORE</span>
        </div>
      </div>

      {/* 目錄 Tab 控制欄 */}
      <div className="flex bg-slate-950/70 border-b border-gray-900 gap-1 p-1">
        <button
          id="icmp-tab-explorer"
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'explorer'
              ? 'bg-sky-600/15 text-sky-400 border border-sky-500/35'
              : 'text-gray-400 hover:text-gray-250 hover:bg-gray-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Type/Code 字典與配對</span>
        </button>

        <button
          id="icmp-tab-ping"
          onClick={() => setActiveTab('ping')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ping'
              ? 'bg-sky-600/15 text-sky-400 border border-sky-500/35'
              : 'text-gray-400 hover:text-gray-255 hover:bg-gray-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Ping 終端模擬器</span>
        </button>

        <button
          id="icmp-tab-traceroute"
          onClick={() => setActiveTab('traceroute')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'traceroute'
              ? 'bg-sky-600/15 text-sky-400 border border-sky-500/35'
              : 'text-gray-400 hover:text-gray-250 hover:bg-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Traceroute 遞增探航</span>
        </button>
      </div>

      {/* 箱體 Content 分流區 */}
      <div className="p-5 flex-1 min-h-[480px]">
        {/* ====================================================
            TAB 1: ICMP Type/Code Explorer & Matching Game
            ==================================================== */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左：ICMP 字典表與詳解 */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  ICMP 類型/代碼 核心字典查詢 (Type/Code Lookup)
                </h3>
              </div>

              {/* ICMP Table */}
              <div className="border border-gray-850 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-gray-850 text-gray-400">
                      <th className="py-2.5 px-3 text-center font-bold font-mono">Type</th>
                      <th className="py-2.5 px-3 text-center font-bold font-mono">Code</th>
                      <th className="py-2.5 px-3 font-bold">報文特徵名稱</th>
                      <th className="py-2.5 px-3 text-center font-bold">類別</th>
                    </tr>
                  </thead>
                  <tbody>
                    {icmpDatabase.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedIcmp(item)}
                        className={`border-b border-gray-900/50 hover:bg-slate-900/50 cursor-pointer transition ${
                          selectedIcmp.type === item.type && selectedIcmp.code === item.code
                            ? 'bg-sky-950/20 text-sky-300 font-bold'
                            : 'text-gray-300'
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono text-xs">{item.type}</td>
                        <td className="py-3 px-3 text-center font-mono text-xs">{item.code}</td>
                        <td className="py-3 px-3 font-medium flex items-center gap-1.5">{item.name}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.category === 'error'
                                ? 'bg-rose-950/90 text-rose-400 border border-rose-900/40'
                                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40'
                            }`}
                          >
                            {item.category === 'error' ? 'Error 回報' : '資訊查詢'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Detail Panel */}
              {selectedIcmp && (
                <div className="bg-slate-950/40 border border-gray-850 p-4 rounded-xl flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <span>📌 Type {selectedIcmp.type} / Code {selectedIcmp.code} 詳解</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      發出者: {selectedIcmp.sender}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-100">{selectedIcmp.name}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                    <strong className="text-gray-300">功能介紹：</strong>
                    {selectedIcmp.description}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    <strong className="text-gray-300">真實網路應用：</strong>
                    {selectedIcmp.usage}
                  </p>
                </div>
              )}
            </div>

            {/* 右：ICMP 配對挑戰 (Matching Game) */}
            <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 border-gray-850 pt-5 lg:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                  ICMP Type和Code 配對挑戰競技場
                </h3>
              </div>

              <div className="bg-[#0b1021] border border-amber-900/30 p-5 rounded-2xl flex flex-col gap-4 min-h-[360px] justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                {!gameCompleted ? (
                  <>
                    {/* Header Game info */}
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                      <span>挑戰進度: {mgIndex + 1} / {matchingGameRounds.length}</span>
                      <span className="text-amber-400">當前得分: {mgScore} 分</span>
                    </div>

                    {/* Question block */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-gray-900 min-h-[80px] flex items-center">
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                        {matchingGameRounds[mgIndex].question}
                      </p>
                    </div>

                    {/* Feedback block */}
                    {mgFeedback && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed font-sans ${
                          mgFeedback.isCorrect
                            ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                            : 'bg-rose-955/20 border-rose-900/40 text-rose-400'
                        }`}
                      >
                        {mgFeedback.isCorrect ? '✅ ' : '❌ '}
                        {mgFeedback.text}
                      </div>
                    )}

                    {/* Footer Actions / Choices */}
                    <div className="mt-2 text-center">
                      {!mgFeedback ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 block uppercase tracking-widest text-left font-mono font-bold">
                            請在下方選擇最精確相符的 ICMP 報文型碼：
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {icmpDatabase.map((choice, i) => (
                              <button
                                key={i}
                                onClick={() => handleMgGuess(choice)}
                                className="bg-slate-950/80 hover:bg-slate-900/80 text-gray-300 p-2 rounded-lg text-[11px] text-left border border-gray-850 hover:border-amber-900/50 transition cursor-pointer flex flex-col gap-0.5 justify-center"
                              >
                                <span className="font-bold text-amber-400/90 font-mono text-[10px]">
                                  Type {choice.type} / Code {choice.code}
                                </span>
                                <span className="truncate block max-w-[150px]">{choice.name.split(' (')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={nextMgRound}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <span>下一關挑戰</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                    <div className="p-4 bg-amber-955/30 border border-amber-900/50 rounded-full text-amber-400">
                      <Award className="w-12 h-12 animate-bounce" />
                    </div>
                    <h4 className="text-base font-bold text-white">配對挑戰大功告成！</h4>
                    <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-sans">
                      你成功答對了 <span className="text-amber-400 font-bold font-mono text-sm">{mgScore}</span> 題配對關卡（共 {matchingGameRounds.length} 題）。這證明你對於 ICMP 錯誤回報、TTL 耗盡與 Ping 回傳機制已有高段理解！
                    </p>
                    <button
                      onClick={resetMgGame}
                      className="bg-slate-900 hover:bg-slate-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 transition mt-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>再挑戰一次</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: Ping Simulator
            ==================================================== */}
        {activeTab === 'ping' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左：控制設定與極速動態傳輸 */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Ping 傳輸診斷選項與參數配置
                </h3>
              </div>

              {/* Target Input card */}
              <div className="bg-[#101423] border border-gray-850 p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex gap-2 text-xs">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">
                      請設定 Destination Host 目的位址
                    </span>
                    <input
                      type="text"
                      value={pingTarget}
                      onChange={(e) => setPingTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-gray-800 rounded-lg p-2 text-xs text-emerald-400 font-mono tracking-wide focus:border-sky-500 focus:outline-none"
                      placeholder="e.g. 8.8.8.8"
                    />
                  </div>
                </div>

                {/* Preset target templates */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-sans uppercase tracking-wider font-bold">
                    快速位址快捷欄 :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['8.8.8.8', '192.168.1.1', '10.0.0.9'].map((ip) => (
                      <button
                        key={ip}
                        onClick={() => setPingTarget(ip)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono border transition ${
                          pingTarget === ip
                            ? 'bg-sky-950/20 text-sky-400 border-sky-500/50'
                            : 'bg-slate-950 text-gray-400 border-gray-900 hover:border-gray-800'
                        }`}
                      >
                        {ip === '8.8.8.8' && '8.8.8.8 (Google DNS)'}
                        {ip === '192.168.1.1' && '192.168.1.1 (Gateway)'}
                        {ip === '10.0.0.9' && '10.0.0.9 (失聯主機)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenario Toggle */}
                <div className="flex flex-col gap-1.5 border-t border-gray-900 pt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">
                    請選定傳輸場景 (Scenario)
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setPingScenario('normal')}
                      className={`flex-1 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        pingScenario === 'normal'
                          ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 font-bold'
                          : 'bg-slate-950 text-gray-400 border-gray-900 hover:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>正常在線 (Normal)</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                        對方安全回復 ICMP Type 0 Code 0
                      </span>
                    </button>

                    <button
                      onClick={() => setPingScenario('unreachable')}
                      className={`flex-1 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        pingScenario === 'unreachable'
                          ? 'bg-rose-955/20 border-rose-500/50 text-rose-400 font-bold'
                          : 'bg-slate-950 text-gray-400 border-gray-900 hover:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>主機失聯 (Unreachable)</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                        閘道退件回報 Type 3 Code 1 錯誤
                      </span>
                    </button>

                    <button
                      onClick={() => setPingScenario('timeout')}
                      className={`flex-1 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        pingScenario === 'timeout'
                          ? 'bg-amber-955/20 border-amber-500/50 text-amber-400 font-bold'
                          : 'bg-slate-950 text-gray-400 border-gray-900 hover:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Flame className="w-3.5 h-3.5" />
                        <span>請求超時 (Timeout)</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                        封包中途佚失，無接收任何回傳
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={runPingSimulation}
                  disabled={isPingRunning || !pingTarget}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-sky-500/10 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPingRunning ? '正在診斷 Ping 傳輸...' : '發射 Ping (Send Echo Request)'}</span>
                </button>
              </div>

              {/* Ping Visual Flight Deck */}
              <div className="bg-[#101423] border border-gray-850 p-4 rounded-2xl flex flex-col justify-center gap-5 min-h-[160px] relative overflow-hidden">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest font-bold">
                  網段實體封包傳飛行進度面板
                </span>

                <div className="flex items-center justify-between px-6 relative">
                  {/* Background Link Line */}
                  <div className="absolute left-10 right-10 top-5 h-0.5 bg-gray-800" />

                  {/* Host Icon */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="p-3 bg-blue-955 border border-blue-800 rounded-full text-blue-400 shadow-md">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono leading-none">Source Host</span>
                    <span className="text-[9px] text-gray-500 font-mono">192.168.1.100</span>
                  </div>

                  {/* Flying packet animation */}
                  {pingStep !== 'idle' && (
                    <div className="absolute left-12 right-12 top-5">
                      <div className="relative w-full h-1">
                        {pingStep === 'sending' && (
                          <motion.div
                            initial={{ left: '0%' }}
                            animate={{ left: '100%' }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeIn' }}
                            className="absolute -top-1.5 p-1 bg-sky-500 rounded-full text-white shadow-md shadow-sky-500/50"
                          >
                            <span className="text-[8px] bg-sky-600/20 px-1 py-0.5 rounded font-mono font-bold">
                              Echo Req (T8 C0)
                            </span>
                          </motion.div>
                        )}
                        {pingStep === 'at_target' && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 p-1.5 bg-emerald-500 rounded-full shadow-md shadow-emerald-500/50 text-white font-bold" />
                        )}
                        {pingStep === 'returning' && (
                          <motion.div
                            initial={{ right: '0%' }}
                            animate={{ right: '100%' }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute -top-1.5 p-1 bg-emerald-500 rounded-full text-white shadow-md shadow-emerald-500/50"
                          >
                            <span className="text-[8px] bg-emerald-600/20 px-1 py-0.5 rounded font-mono font-bold">
                              Echo Rep (T0 C0)
                            </span>
                          </motion.div>
                        )}
                        {pingStep === 'error' && (
                          <motion.div
                            initial={{ left: '0%' }}
                            animate={{ left: '30%' }}
                            transition={{ duration: 0.4 }}
                            className="absolute -top-2 flex flex-col items-center gap-1"
                          >
                            <div className="p-1 px-1.5 bg-rose-500 text-white font-bold rounded-lg text-[9px] shadow-lg shadow-rose-500/50 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Host Unreachable (T3 C1)</span>
                            </div>
                          </motion.div>
                        )}
                        {pingStep === 'timeout' && (
                          <motion.div
                            initial={{ left: '0%' }}
                            animate={{ left: '60%' }}
                            transition={{ duration: 1.2 }}
                            className="absolute -top-2.5 p-1 bg-amber-500 rounded-full text-white flex items-center gap-1 text-[8px] border border-amber-400"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Dropped (Timeout)</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Target Icon */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className={`p-3 border rounded-full shadow-md transition ${
                      pingScenario === 'unreachable'
                        ? 'bg-rose-955/35 border-rose-900 text-rose-500'
                        : pingScenario === 'timeout'
                        ? 'bg-amber-955/20 border-amber-900/40 text-amber-500'
                        : 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono leading-none">{pingTarget}</span>
                    <span className="text-[9px] text-gray-500 font-sans leading-none">
                      {pingScenario === 'unreachable' ? 'Gateway Disconnect' : 'Target Host'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右：主機真實 Ping Console */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    系統作業系統 Ping 終端輸出 (Standard Out)
                  </h3>
                </div>
                <button
                  onClick={() => setPingConsoleLines([])}
                  className="text-gray-500 hover:text-gray-300 font-mono text-[10px] bg-slate-900 p-1 px-2 rounded border border-gray-850 hover:bg-slate-800 transition"
                >
                  Clear Console
                </button>
              </div>

              {/* Terminal Frame */}
              <div className="bg-[#050811] text-emerald-400 font-mono text-xs p-5 rounded-2xl min-h-[360px] max-h-[420px] overflow-y-auto border border-gray-900 flex flex-col justify-between shadow-inner">
                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-600 border-b border-gray-950 pb-2 flex items-center justify-between text-[10px] font-mono">
                    <span>SYSTEM SHELL v1.3</span>
                    <span>UTC STDOUT HOST_IF</span>
                  </div>

                  {pingConsoleLines.length === 0 ? (
                    <div className="text-gray-600 italic py-10 text-center text-xs">
                      等待發行 Ping 數據診斷。點擊「發射 Ping」探航主機。
                    </div>
                  ) : (
                    pingConsoleLines.map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed animate-fade-in">
                        {line.startsWith('---') || line.startsWith('PING') ? (
                          <span className="text-sky-400 font-bold">{line}</span>
                        ) : line.includes('Destination Host Unreachable') || line.includes('timeout') ? (
                          <span className="text-rose-400 font-bold">{line}</span>
                        ) : (
                          <span className="text-emerald-400">{line}</span>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600 border-t border-gray-950 pt-3 mt-4">
                  <span className="animate-pulse font-bold text-emerald-500">●</span>
                  <span>SHELL IS ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: Traceroute Simulator
            ==================================================== */}
        {activeTab === 'traceroute' && (
          <div className="flex flex-col gap-6">
            {/* 上：網路拓撲鏈路視覺區與飛行器 */}
            <div className="bg-[#101423] border border-gray-850 p-5 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
                <div>
                  <span className="text-[10px] text-sky-450 font-bold font-mono uppercase tracking-widest block">
                    INTER-DOMAIN MULTI-HOP NETWORK GRAPH
                  </span>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
                    <span>Traceroute 遞增探航 6 點拓撲沙盒</span>
                  </h3>
                </div>

                {/* Scenario dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">連線場景選擇:</span>
                  <select
                    value={trMode}
                    onChange={(e) => setTrMode(e.target.value as any)}
                    disabled={isTrRunning}
                    className="bg-slate-950 border border-gray-800 text-xs text-sky-400 p-1.5 px-3 rounded-lg font-bold focus:outline-none"
                  >
                    <option value="normal">正常模式 (Normal Traceroute)</option>
                    <option value="unresponsive_r3">中途 Router 3 安全性略過 (* * *)</option>
                    <option value="unreachable_dst font-bold text-rose-400">中途 Router 4 端死機 (Host Unreachable)</option>
                  </select>
                </div>
              </div>

              {/* Hop Chain Nodes Grid */}
              <div className="grid grid-cols-6 gap-2 sm:gap-4 relative pt-6 pb-4">
                {/* Visual Connector Wire */}
                <div className="absolute left-1/12 right-1/12 top-11 h-1 bg-gray-850 rounded" />

                {/* Packet Flight Animation layer */}
                {trStep !== 'idle' && activeProbePackets.length > 0 && (
                  <div
                    className="absolute top-8 h-6 flex items-center justify-center transition-all duration-700 ease-in-out"
                    style={{ left: getCarrierXPosition(), marginLeft: '-15px' }}
                  >
                    <div className="flex gap-0.5">
                      {activeProbePackets.map((p) => (
                        <motion.div
                          key={p}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {tracerouteNodes.map((node, idx) => {
                  const isActive = trCurrentTtl === idx;
                  const isExplored = idx <= trCurrentTtl && trCurrentTtl > 0;
                  const isStar = trMode === 'unresponsive_r3' && idx === 3 && trCurrentTtl >= 3;
                  const isDead = trMode === 'unreachable_dst' && idx === 4 && trCurrentTtl >= 4;

                  return (
                    <div key={node.id} className="flex flex-col items-center gap-1.5 z-10">
                      <div
                        className={`w-10 sm:w-11 h-10 sm:h-11 rounded-full flex items-center justify-center border font-mono font-bold text-xs shadow-md transition ${
                          node.id === 'src'
                            ? 'bg-blue-955 border-blue-800 text-blue-400'
                            : node.id === 'dst'
                            ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                            : isStar
                            ? 'bg-gray-900 border-gray-800 text-gray-500'
                            : isDead
                            ? 'bg-rose-955/20 border-rose-900 text-rose-500'
                            : isExplored
                            ? 'bg-yellow-955/25 border-yellow-800 text-yellow-400'
                            : 'bg-slate-950 border-gray-900 text-gray-500'
                        } ${isActive ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                      >
                        {node.id === 'src' ? 'Src' : node.id === 'dst' ? 'Dst' : `R${idx}`}
                      </div>

                      {/* Info below */}
                      <span className="text-[9px] md:text-[10px] font-bold text-center leading-tight truncate w-full">
                        {node.name.split(' (')[0]}
                      </span>
                      <span className="text-[8px] font-mono text-gray-500 text-center leading-none">
                        {isStar && '?.?.?.?'}
                        {!isStar && node.ip}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action and Probe controls */}
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={startTraceroute}
                  disabled={isTrRunning}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-900 disabled:text-gray-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>重設定/啟航手動 Traceroute</span>
                </button>

                <button
                  onClick={executeNextHop}
                  disabled={!isTrRunning || showPredictionQuestion || trStep === 'probing' || isTrCompleted}
                  className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-900 disabled:text-gray-600 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>傳送下一跳探針 (Next TTL={trCurrentTtl + 1})</span>
                </button>

                <button
                  onClick={handleAutoTraceroute}
                  disabled={isTrRunning}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-gray-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Auto-Run 全自動探尋</span>
                </button>
              </div>
            </div>

            {/* 中：探針跳步預測 Interactive Matching Card */}
            <AnimatePresence>
              {isTrRunning && showPredictionQuestion && !isTrCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-amber-955/20 via-[#101423] to-[#0e1629] border border-amber-900/30 p-4.5 rounded-2xl flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      【即時互動學術考驗】請發揮你的控制面選路推想，預測下一跳會如何？
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    探險隊即將發射 <strong className="text-yellow-400">TTL={trCurrentTtl + 1}</strong> 的一組 1500-byte UDP 探針包前往目的。請問，你預期它撞擊下一跳路由器或終端時，將會回饋發送哪一種特定的控制面報文？
                  </p>

                  <div className="flex flex-wrap gap-2.5 mt-1">
                    <button
                      onClick={() => handlePredict('ttl_expire')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        prediction === 'ttl_expire'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-950 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      TTL Expired (Type 11 Code 0)
                    </button>
                    <button
                      onClick={() => handlePredict('port_unreachable')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        prediction === 'port_unreachable'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-950 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      Port Unreachable (Type 3 Code 3)
                    </button>
                    <button
                      onClick={() => handlePredict('asterisk')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        prediction === 'asterisk'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-950 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      靜默丟包 Asterisk (* * *)
                    </button>
                    <button
                      onClick={() => handlePredict('host_unreachable')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        prediction === 'host_unreachable'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-950 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      Host Unreachable (Type 3 Code 1)
                    </button>
                  </div>

                  {predictionFeedback && (
                    <div className="p-2 px-3 bg-slate-950 border border-gray-900 rounded-xl text-xs font-bold text-gray-300 leading-relaxed font-sans">
                      {predictionFeedback}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 下：Traceroute 逐步 hops 日誌表 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Traceroute 逐跳回應分析日誌 (Hop Response Log Table)
                </h3>
              </div>

              <div className="border border-gray-850 rounded-2xl overflow-hidden bg-slate-950/30">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-950 border-b border-gray-850 text-gray-400 font-mono text-[10px]">
                      <th className="py-2 px-3 text-center w-12 font-bold">Hop (TTL)</th>
                      <th className="py-2 px-3 font-bold w-48">中繼點/路由器名稱</th>
                      <th className="py-2 px-3 font-bold w-36">IP 位址名稱</th>
                      <th className="py-2 px-3 text-center font-bold w-48">發射 3 Probes 的 RTT 探測日誌</th>
                      <th className="py-2 px-3 font-mono font-bold w-32">ICMP 回傳型碼</th>
                      <th className="py-2 px-3 font-bold">控制面動作語意說明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trHops.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-650 italic">
                          等待 Traceroute 探尋發射。請點擊「重設定/啟航手動 Traceroute」或「Auto-Run」！
                        </td>
                      </tr>
                    ) : (
                      trHops.map((hop, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-900/50 hover:bg-slate-900/10 transition leading-snug ${
                            hop.isTarget
                              ? 'bg-emerald-950/15 text-emerald-400 font-bold'
                              : hop.isStar
                              ? 'text-gray-500'
                              : hop.isError
                              ? 'bg-rose-955/10 text-rose-400 font-medium'
                              : 'text-gray-300'
                          }`}
                        >
                          {/* Hop / TTL */}
                          <td className="py-3 px-3 text-center font-mono font-bold">{hop.ttl}</td>

                          {/* Node name */}
                          <td className="py-3 px-3 font-bold flex items-center gap-1.5 shrink-0">
                            {hop.isTarget ? '🏁 ' : hop.isStar ? '⚠️ ' : '🛡️ '}
                            {hop.nodeName}
                          </td>

                          {/* IP */}
                          <td className="py-3 px-3 font-mono text-[11px] font-bold">{hop.ip}</td>

                          {/* RTTs */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-[11px]">
                            {hop.rtts.join('   ')}
                          </td>

                          {/* ICMP returned code */}
                          <td className="py-3 px-3 font-mono text-[11px] font-bold text-sky-500">
                            {hop.isStar ? 'Timeout' : hop.icmpCode}
                          </td>

                          {/* Semantics desc info */}
                          <td className="py-3 px-3 text-xs text-gray-400 leading-normal font-sans">
                            {hop.icmpDesc}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部小知識提示卡 */}
      <div className="bg-slate-950 p-4 border-t border-gray-850 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-400 leading-relaxed font-sans">
          <strong className="text-gray-200">教練講解原理：</strong>
          Traceroute 連接過程在 RFC 中是一流的控制設計。為了量測每跳延遲 RTT，第一輪探針故意少給一點生存時間 (TTL=1)，一到 R1 就沒力 dropped，逼 R1 按標準回信 TTL Expired，藉此收回 R1 的 IP。下一跳遞增 TTL=2，抵達 R2 逾期...
          這樣一關關「逼」對方退回退信包裹，把中繼點全部定位出來。最終，我們需要一個「結束信號」：將 UDP 目標對準 30000+ 的隨機埠，Destination 主機一接下，發現埠沒開，於是勃然拋出 Port Unreachable (Type 3 Code 3) 朝源頭退簽。
          源端收到 Port Unreachable 後，便會一陣欣喜──「已經抵達目的地終點！探祕結束！」
        </div>
      </div>
    </div>
  );
}
