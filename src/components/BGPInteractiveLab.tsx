/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { Network, HelpCircle, ArrowRight, AlertTriangle, Check, RefreshCw, Cpu, Zap, Settings, ShieldAlert, Award } from 'lucide-react';

interface LogMessage {
  id: string;
  timestamp: string;
  source: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'ibgp' | 'ebgp';
  text: string;
}

export default function BGPInteractiveLab() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'loop' | 'nexthop' | 'hotpotato' | 'policy'>('simulation');
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Helper to append log
  const addLog = (source: string, type: LogMessage['type'], text: string) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      type,
      text,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 30));
  };

  // Reset logs on tab change
  useEffect(() => {
    setLogs([]);
    addLog('System', 'info', `已切換至 ${
      activeTab === 'simulation' ? 'BGP 宣告模擬' :
      activeTab === 'loop' ? 'AS-PATH 迴路偵測' :
      activeTab === 'nexthop' ? '下一跳轉發表聯動' :
      activeTab === 'hotpotato' ? '熱馬鈴薯選路計算' : '商業政策選路實驗'
    } 模組。初始化完畢！`);
  }, [activeTab]);

  // ==========================================
  // 【互動功能一：BGP Advertisement Simulator】
  // ==========================================
  const [simStep, setSimStep] = useState<number>(1);
  const [as2ImportPolicy, setAs2ImportPolicy] = useState<'accept' | 'reject'>('accept');
  const [as2IbgpDone, setAs2IbgpDone] = useState<boolean>(false);
  const [as1SelectedPath, setAs1SelectedPath] = useState<'path1' | 'path2' | 'none'>('none');
  const [as1Policy, setAs1Policy] = useState<'shortest' | 'force-path2'>('shortest');

  const handleSimRestart = () => {
    setSimStep(1);
    setAs2IbgpDone(false);
    setAs1SelectedPath('none');
    setLogs([]);
    addLog('Simulator', 'info', '重設 BGP 宣告模擬引擎。Destination X (12.34.0.0/16) 已就緒於 AS3 內部。');
  };

  const handleSimAdvertiseAS3 = () => {
    addLog('AS3 (Gateway)', 'ebgp', '發起 eBGP UPDATE：對外宣告 Prefix: 12.34.0.0/16, AS-PATH: [AS3], NEXT-HOP: 3.3.3.3 (AS3網關對外接口 IP)');
    setSimStep(2);
  };

  const handleAS2Import = (policy: 'accept' | 'reject') => {
    setAs2ImportPolicy(policy);
    if (policy === 'accept') {
      addLog('AS2 (Gateway)', 'success', '【Import Policy 核准】接受來自 AS3 的 prefix X 宣告。將其寫入 AS2 的 BGP RIB-In。');
      setSimStep(3);
    } else {
      addLog('AS2 (Gateway)', 'error', '【Import Policy 駁回】根據 AS2 import 策略過濾：拒絕接受來自 AS3 的路徑！宣告終止。');
      setSimStep(2.5); // Error state
    }
  };

  const handleAS2IbgpPropagate = () => {
    setAs2IbgpDone(true);
    addLog('AS2 (iBGP)', 'ibgp', '【iBGP 擴散】邊界網關將路由同步給同一個 AS2 內其他路由器。核心重點：NEXT-HOP 屬性不變，依舊指向上游閘道 IP 3.3.3.3！');
    setSimStep(4);
  };

  const handleSimAdvertiseAS2 = () => {
    addLog('AS2 (Gateway)', 'ebgp', '發起 eBGP UPDATE 宣告給 AS1：Prefix: 12.34.0.0/16, AS-PATH: [AS2, AS3], NEXT-HOP: 2.2.2.2 (AS2對AS1物理接口 IP)');
    setSimStep(5);
  };

  const handleAS1PathSelection = () => {
    // AS1 has learned Path 1 via AS2 (len 2) and Path 2 via AS5-AS9-AS8-AS3 (len 4)
    if (as1Policy === 'force-path2') {
      setAs1SelectedPath('path2');
      addLog('AS1 (Decision)', 'warn', '【選路完成：政策覆蓋】雖然 Path 1 較短，但因管理員設定了 Local Preference 偏好政策，AS1 強制選擇 Path 2 (via AS5) 轉送 X 流量！');
    } else {
      setAs1SelectedPath('path1');
      addLog('AS1 (Decision)', 'success', '【選路完成】AS1 收到兩條路徑：1. vIa AS2 [AS2, AS3]; 2. via AS5 [AS5, AS9, AS8, AS3]。在 Local Pref 等同下，比較 AS-PATH 長度 (2 < 4)，自動挑選最少跳躍的 Path 1！');
    }
    setSimStep(6);
  };


  // ==========================================
  // 【互動功能二：AS-PATH 與 Loop Detection】
  // ==========================================
  const [customAsPath, setCustomAsPath] = useState<number[]>([400, 200, 50]);
  const [loopCheckResult, setLoopCheckResult] = useState<{ status: 'idle' | 'safe' | 'loop'; msg: string }>({ status: 'idle', msg: '' });

  const addAsToPath = (asNum: number) => {
    setCustomAsPath((prev) => [...prev, asNum]);
    setLoopCheckResult({ status: 'idle', msg: '' });
  };

  const clearCustomPath = () => {
    setCustomAsPath([]);
    setLoopCheckResult({ status: 'idle', msg: '' });
  };

  const runLoopDetection = () => {
    // Our own AS is AS10
    addLog('AS10 Router', 'info', `開始檢驗入鏈 BGP 宣告。Prefix X, 宣告之 AS-PATH 為: [${customAsPath.join(', ')}]`);
    if (customAsPath.includes(10)) {
      setLoopCheckResult({
        status: 'loop',
        msg: '🚨 【拒絕！偵測到路由環路 (Loop Detected)】\n\n在此條宣告中包含了「AS10」，此即本 AS 自己的編號！如果我們採信此路徑，當本 AS 發送封包出去後，封包會經由該鏈路繞一大圈最後又被送回我們自己這裏，形成無盡循環 (Routing Loop)。\n\n根據 BGP Path-Vector 理論安全準則：任何路由器一旦在本域入鏈 BGP UPDATE 的 AS-PATH 屬性中發現「含有我方 AS 號」，必須立刻「Reject (拒絕錄用)」，以保障全局互聯網大脈防環安全！'
      });
      addLog('AS10 Router', 'error', '發現環路！AS10 出現於 AS-PATH。直接 Reject 丟棄該路由通告。');
    } else {
      setLoopCheckResult({
        status: 'safe',
        msg: `🟢 【通過！AS-PATH 安全無環路】\n\n該路徑歷經 [${customAsPath.join(' → ')}]，其中未包涵我方 AS10。路徑安全。\n\n本路由器將會採納此 UPDATE，並將我們自己的 AS 號「10」加塞（Prepend）到 AS-PATH 的最左端，使其變成 [10, ${customAsPath.join(', ')}]，之後再向我們的外部 eBGP Peers 繼續廣播宣傳。`
      });
      addLog('AS10 Router', 'success', `無環路，批准接受宣告。本地 BGP 表向外轉發時將 Prepend 自身為 [10, ${customAsPath.join(', ')}]。`);
    }
  };


  // ==========================================
  // 【互動功能三：NEXT-HOP 與 Forwarding Table】
  // ==========================================
  const [selectedAs1Router, setSelectedAs1Router] = useState<'1a' | '1d'>('1a');
  
  // OSPF Topology in AS1:
  // 1a (Source) -- [Cost: 2] -> 1b -- [Cost: 1] -> 1c (BGP Gateway)
  // 1a (Source) -- [Cost: 8] -> 1d -- [Cost: 1] -> 1c (BGP Gateway)
  // 1d can also be selected:
  // 1d -- [Cost: 1] -> 1c
  // eBGP next-hop on 1c is 203.0.113.2 (AS2 gateway Physical Interface)

  const getOspfOptimalPath = (src: '1a' | '1d') => {
    if (src === '1a') {
      return {
        path: '1a → 1b → 1c',
        nextHopRouter: '1b (via eth0)',
        totalOspfCost: 3,
      };
    } else {
      return {
        path: '1d → 1c',
        nextHopRouter: '1c (via eth1)',
        totalOspfCost: 1,
      };
    }
  };

  const optimal = getOspfOptimalPath(selectedAs1Router);


  // ==========================================
  // 【互動功能四：Hot Potato Routing】
  // ==========================================
  const [ospfCostToEast, setOspfCostToEast] = useState<number>(6);
  const [ospfCostToWest, setOspfCostToWest] = useState<number>(3);
  
  // East Gateway has: AS-PATH len = 3 (AS2, AS4, AS10)
  // West Gateway has: AS-PATH len = 3 (AS5, AS8, AS11)
  // Since external routes are equivalent, we tie-break with Closest NEXT-HOP (Hot Potato)

  const selectedGateway = ospfCostToWest < ospfCostToEast ? 'West-Gate' : (ospfCostToWest > ospfCostToEast ? 'East-Gate' : 'Equal');


  // ==========================================
  // 【互動功能五：Policy Lab】
  // ==========================================
  const [universityPolicy, setUniversityPolicy] = useState<'no-transit' | 'accident-transit' | 'undecided'>('undecided');
  const [policyLabLogs, setPolicyLabLogs] = useState<string[]>([]);

  const handleApplyPolicy = (policy: 'no-transit' | 'accident-transit') => {
    setUniversityPolicy(policy);
    if (policy === 'no-transit') {
      setPolicyLabLogs([
        '🟢 【大學 BGP 保存綠燈！】完美！',
        '大學網關在對 ISP A (AS100) 的宣告中只發送自己大學名下的 Prefix X。',
        '絕不向 ISP A 透露「我可以中轉去 ISP B」的路由。',
        '結果：ISP A 要發給 ISP B 的幾十 TB 商務流量規矩地走公網線路，不會灌進大學，守護了校園有生頻寬！',
        ' commercial reason: 身為 Customer，你的目的僅是獲取自身上網接入，倒貼幫 Provider 中繼流量，不僅無利可圖，更會癱瘓本域核心線路！'
      ]);
    } else {
      setPolicyLabLogs([
        '❌ 【警告：商業違規與大當機！】學校大專網關不慎打破 Import/Export 政策！',
        '管理員對 ISP A (AS100) 的 BGP UPDATE 居然宣告了「我可以幫忙中轉到整個由 ISP B 對接的互聯網」。',
        '結果：ISP A (Provider A) 聽聞此『免費捷徑』，立刻把所有要去 ISP B 的骨幹巨量過路流量 (Transit Traffic) 全數塞入大學校園通道。',
        '校內那條 10Gbps 的精緻窄卡在 1 毫秒內被撐爆癱瘓！全校師生卡死！',
        '商業原因說明：Customer 絕對不應該替 Providers 做中繼 Transit。因為你既收不到過路費，又損害了自己本域的網路品質，純屬嚴重商務倒貼配置！'
      ]);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-5 md:p-6 text-gray-200 mt-4">
      {/* 實驗大標 header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 mb-5 gap-3">
        <div>
          <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-900/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 w-max">
            <Cpu className="w-3.5 h-3.5" />
            <span>Module 7 實作 · 政策選路沙盒</span>
          </span>
          <h3 className="text-base md:text-lg font-bold font-sans mt-1.5 text-gray-200">
            BGP 閘道宣告與跨AS互聯網選路實驗室
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            親手掌握網際互聯網黏合膠 BGP。實操 eBGP/iBGP 通告、防環檢索、下一跳聯動、自私熱馬鈴薯與 customer/provider 商業策略。
          </p>
        </div>
        <div className="flex bg-[#0f1422] border border-gray-800 rounded-xl p-1 shrink-0 self-stretch md:self-auto overflow-x-auto gap-0.5">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition shrink-0 ${activeTab === 'simulation' ? 'bg-rose-900/40 text-rose-400 border border-rose-800/40' : 'text-gray-400 hover:text-white'}`}
          >
            1. BGP 宣告模擬
          </button>
          <button
            onClick={() => setActiveTab('loop')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition shrink-0 ${activeTab === 'loop' ? 'bg-rose-900/40 text-rose-400 border border-rose-800/40' : 'text-gray-400 hover:text-white'}`}
          >
            2. 防環環路偵測
          </button>
          <button
            onClick={() => setActiveTab('nexthop')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition shrink-0 ${activeTab === 'nexthop' ? 'bg-rose-900/40 text-rose-400 border border-rose-800/40' : 'text-gray-400 hover:text-white'}`}
          >
            3. 下一跳與 OSPF
          </button>
          <button
            onClick={() => setActiveTab('hotpotato')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition shrink-0 ${activeTab === 'hotpotato' ? 'bg-rose-900/40 text-rose-400 border border-rose-800/40' : 'text-gray-400 hover:text-white'}`}
          >
            4. 熱馬鈴薯
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition shrink-0 ${activeTab === 'policy' ? 'bg-rose-900/40 text-rose-400 border border-rose-800/40' : 'text-gray-400 hover:text-white'}`}
          >
            5. 商務 Policy Lab
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px]">
        {/* 左側 8 格：互動主控操作區 */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0f1422] border border-gray-850 rounded-2xl p-4 md:p-5">
          
          {/* ======================================= */}
          {/* TAB 1: BGP Advertisement Simulator     */}
          {/* ======================================= */}
          {activeTab === 'simulation' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>【實驗一：BGP 多跳宣告與跨網蔓延模擬】</span>
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                  模擬目的 Prefix X 誕生於 AS3 內部，如何跨越 eBGP 前往 AS2 進行 Import 特檢、轉為 iBGP 內網擴散，再經由 eBGP 自主 prepend 抵達 AS1 匯聚雙通道的演算法核心。
                </p>
              </div>

              {/* 拓撲圖 visualization */}
              <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col justify-center items-center relative overflow-hidden min-h-[140px]">
                <div className="flex items-center justify-around w-full max-w-xl z-20">
                  {/* AS1 Area */}
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${simStep >= 5 ? 'border-blue-500 bg-blue-950/20' : 'border-gray-800 bg-gray-900/10'}`}>
                      <span className="text-xxs text-gray-400 uppercase font-mono font-bold">AS1</span>
                      <span className="text-[10px] font-bold text-gray-200 mt-1">Gateway</span>
                      <div className="text-[9px] font-mono mt-0.5 text-blue-400">1c</div>
                    </div>
                    {simStep >= 6 && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-900 border-dashed rounded px-1.5 py-0.5 mt-2 font-mono font-bold">
                        ✓ 選擇 Path 1
                      </span>
                    )}
                  </div>

                  {/* Connecting Line 1 */}
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="h-0.5 w-full bg-gray-800 relative">
                      {simStep === 4 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                      )}
                      {simStep === 5 && (
                        <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
                      )}
                      <div className={`absolute h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all ${simStep >= 5 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">eBGP Link</span>
                  </div>

                  {/* AS2 Area */}
                  <div className={`p-3 rounded-2xl border transition-all ${simStep >= 2 ? 'border-indigo-500 bg-indigo-950/5' : 'border-gray-800 bg-gray-900/10'}`}>
                    <div className="text-[10px] text-gray-400 uppercase font-mono font-bold text-center border-b border-gray-850 pb-1 mb-1.5">AS2 自治網</div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${as2IbgpDone ? 'border-emerald-500 bg-emerald-950/10' : 'border-gray-800 bg-gray-900/30'}`}>
                          <span className="text-[9px] font-mono text-gray-400">2a</span>
                        </div>
                        <span className="text-[8px] text-gray-500 mt-0.5">iBGP Router</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${simStep >= 3 ? 'border-indigo-400 bg-[#0b0f19]' : 'border-gray-850'}`}>
                          <span className="text-[9px] font-mono text-indigo-400">2c</span>
                        </div>
                        <span className="text-[8px] text-gray-500 mt-0.5">eBGP Access</span>
                      </div>
                    </div>
                    {simStep >= 3 && (
                      <div className="text-[8px] text-center text-indigo-400 mt-2 font-mono">
                        NH: 3.3.3.3
                      </div>
                    )}
                  </div>

                  {/* Connecting Line 2 */}
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="h-0.5 w-full bg-gray-800">
                      {simStep === 1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                      <div className={`absolute h-0.5 bg-indigo-400 transition-all ${simStep >= 2 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">eBGP Link</span>
                  </div>

                  {/* AS3 Area */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl border border-rose-500 bg-rose-955/10 flex flex-col items-center justify-center">
                      <span className="text-xxs text-rose-400 uppercase font-mono font-bold">AS3</span>
                      <span className="text-[10px] font-bold text-gray-200 mt-1">Gateway</span>
                      <div className="text-[9px] font-mono mt-0.5 text-rose-400">3a</div>
                    </div>
                    <span className="text-[9px] text-rose-400 bg-rose-950/50 border border-rose-900 border-dashed rounded px-1 mt-1.5 font-mono">
                      Prefix X
                    </span>
                  </div>
                </div>

                {/* Legend or status */}
                <div className="absolute bottom-2 left-4 text-[9px] text-gray-500 font-mono">
                  Prefix X = 12.34.0.0/16
                </div>
              </div>

              {/* 手動按鈕控制流 */}
              <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">模擬步驟流程 (Active Phase)</span>
                  <button
                    onClick={handleSimRestart}
                    className="p-1 text-gray-500 hover:text-white transition rounded hover:bg-gray-850 flex items-center gap-1 text-[10px] font-bold font-mono"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Simulation</span>
                  </button>
                </div>

                {simStep === 1 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      第一步：目的地 Prefix X (12.34.0.0/16) 已就緒。請點擊上方按鈕，將路由網段宣告給臨接網域 AS2 網關。这是一個 eBGP 宣告。
                    </p>
                    <button
                      onClick={handleSimAdvertiseAS3}
                      className="bg-rose-700 hover:bg-rose-600 font-bold text-white text-xs py-2 px-4 rounded-lg self-start transition-all"
                    >
                      點擊 AS3 網關：宣示 X 給 AS2 (eBGP)
                    </button>
                  </div>
                )}

                {simStep === 2 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg text-[11px] text-rose-400 font-mono">
                      📥 AS2-Inbound: 收到 BGP UPDATE :: Prefix: 12.34.0.0/16, AS-PATH: [AS3], NEXT-HOP: 3.3.3.3
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      第二步：AS2 閘道收到宣告。在正式收納前，必須依照 AS2 的 <strong>Import Policy (匯入策略)</strong> 過濾檢索。請為 AS2 設計決策：
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAS2Import('accept')}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg transition"
                      >
                        ✓ Accept (核准匯入)
                      </button>
                      <button
                        onClick={() => handleAS2Import('reject')}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg transition"
                      >
                        ✕ Reject (拒絕匯入)
                      </button>
                    </div>
                  </div>
                )}

                {simStep === 2.5 && (
                  <div className="flex flex-col gap-2 text-xs">
                    <p className="text-red-400 font-bold leading-relaxed">
                      ✕ 宣告已遭中途拒絕。因為 Import Policy 將其過濾，AS2 路由表無此 Prefix，也不會繼續對外宣告。
                    </p>
                    <button
                      onClick={() => setSimStep(2)}
                      className="bg-gray-800 hover:bg-gray-750 font-bold py-1 px-3 rounded text-xxs w-max transition"
                    >
                      返回重新決策
                    </button>
                  </div>
                )}

                {simStep === 3 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      第三步：確認核准！新路由已存在 AS2 邊界。現在此閘道器必須透過 <strong>iBGP (Internal BGP)</strong> 向 AS2 內部所有核心路由器傳遞此更新。
                    </p>
                    <button
                      onClick={handleAS2IbgpPropagate}
                      className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs py-2 px-4 rounded-lg self-start transition"
                    >
                      點擊執行 AS2 內部 iBGP 廣播
                    </button>
                    <div className="text-[10px] text-gray-500 font-sans mt-1 bg-gray-900/40 p-2 rounded border border-gray-850">
                      💡 <strong>學術硬核知識：</strong>在 iBGP 擴散中，NEXT-HOP 屬性並不會被自動改成宣傳者本身的 IP，它依舊保持當初從 eBGP 發起時的 <code>3.3.3.3</code>！
                    </div>
                  </div>
                )}

                {simStep === 4 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      第四步：AS2 內部收斂完成。現在，AS2 雙手對接外網，將此路由資訊向 eBGP 鄰居 AS1 宣告。
                    </p>
                    <button
                      onClick={handleSimAdvertiseAS2}
                      className="bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-lg self-start transition"
                    >
                      點擊由 AS2 網關對外宣告給 AS1 (eBGP)
                    </button>
                    <p className="text-[10.5px] text-gray-500">
                      注意：eBGP 宣告會將自己的 AS 號「AS2」堆疊（Prepend）到路徑最前頭，並寫入新的 NEXT-HOP IP。
                    </p>
                  </div>
                )}

                {simStep === 5 && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-blue-950/20 border border-blue-900/40 p-2.5 rounded-lg text-[11px] font-mono leading-relaxed text-blue-400">
                      📥 AS1 閘道收到來自 AS2 的 Path 1 宣告：<br />
                      Prefix: 12.34.0.0/16, AS-PATH: <strong>[AS2, AS3]</strong>, NEXT-HOP: 2.2.2.2<br /><br />
                      🌐 同時，AS1 還從側線 AS5 收到 Path 2 替代宣告：<br />
                      Prefix: 12.34.0.0/16, AS-PATH: <strong>[AS5, AS9, AS8, AS3]</strong>, NEXT-HOP: 5.5.5.5
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      第五步：多重路徑抉擇！AS1 同時擁有了兩條去往 X 的路由。請設定 AS1 的選路原則：
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          id="p-short"
                          name="as1p"
                          checked={as1Policy === 'shortest'}
                          onChange={() => setAs1Policy('shortest')}
                          className="accent-rose-500"
                        />
                        <label htmlFor="p-short" className="text-xs text-gray-200 cursor-pointer">
                          預設選路：Shortest AS-PATH (長度 2 優於 4)
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          id="p-force"
                          name="as1p"
                          checked={as1Policy === 'force-path2'}
                          onChange={() => setAs1Policy('force-path2')}
                          className="accent-rose-500"
                        />
                        <label htmlFor="p-force" className="text-xs text-gray-200 cursor-pointer">
                          設定 Local Preference 優先權強推 Path 2 (偏好設定)
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleAS1PathSelection}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-lg self-start transition mt-1"
                    >
                      點擊並觀察 AS1 最終轉發表決策
                    </button>
                  </div>
                )}

                {simStep === 6 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>【宣告與選路模擬大獲成功！】</span>
                    </p>
                    <div className="text-xs text-gray-300 leading-relaxed font-sans bg-[#11192e] border border-blue-900/40 p-3 rounded-lg">
                      {as1SelectedPath === 'path1' ? (
                        <span>
                          <strong>決策依據分析：</strong>AS1 選擇了 <strong>Path 1 (via AS2)</strong>。這是典型的網聯網最短路徑向量（Shortest AS-PATH）選擇！因為路由 A 通過的自治網段跳數僅有 2（AS2, AS3），而 B 則高達 4。在 Local Preference 等高時，跳數越少代表鏈路越安全快速。
                        </span>
                      ) : (
                        <span>
                          <strong>決策依據分析：</strong>AS1 選擇了 <strong>Path 2 (via AS5)</strong>。雖然 Path 2 的 AS-PATH (AS5, AS9, AS8, AS3) 長度高達 4 跳，按預設理應被淘汰。但因為管理員在 Import Policy 自定義了更高階的 <strong>Local Preference</strong>，這具有一票否決權！商業大於跳躍，完美落實了 BGP 政策控制。
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSimRestart}
                      className="bg-gray-800 hover:bg-gray-750 text-white font-bold text-xxs py-1.5 px-3 rounded self-start transition border border-gray-700"
                    >
                      重新操演本實驗
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: AS-PATH & Loop Detection        */}
          {/* ======================================= */}
          {activeTab === 'loop' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="border-b border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>【實驗二：手動編織路徑與 BGP 迴路剔除警報】</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  BGP 是一套 Path-Vector 協定。在傳播時，每一個路由宣告（UPDATE）都會在其 AS-PATH 清單最左方 Prepend 自己所經的 AS 號。本路由器代表的是 <strong>AS10</strong>，你將扮演 BGP 專家，手動模擬對外路由，測試防環邏輯。
                </p>
              </div>

              {/* AS-PATH Build Interface */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                  <span className="font-bold text-gray-300 block">1. 自行拼裝入鏈 AS-PATH</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    請點擊下方按鈕，在路由向量中添加穿越的自治網域 (AS)。嘗試添加本路由器自身的 <strong>AS10</strong>，看看 BGP 安全機制會發生什麼事！
                  </p>

                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <button
                      onClick={() => addAsToPath(400)}
                      className="bg-gray-850 hover:bg-gray-750 border border-gray-700 font-mono font-bold text-xxs py-1.5 px-3 rounded"
                    >
                      + AS400 (Google)
                    </button>
                    <button
                      onClick={() => addAsToPath(200)}
                      className="bg-gray-850 hover:bg-gray-750 border border-gray-700 font-mono font-bold text-xxs py-1.5 px-3 rounded"
                    >
                      + AS200 (Comcast)
                    </button>
                    <button
                      onClick={() => addAsToPath(50)}
                      className="bg-gray-850 hover:bg-gray-750 border border-gray-700 font-mono font-bold text-xxs py-1.5 px-3 rounded"
                    >
                      + AS50 (中華電信)
                    </button>
                    <button
                      onClick={() => addAsToPath(10)}
                      className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800 font-mono font-bold text-xxs py-1.5 px-3 rounded text-rose-300"
                    >
                      + AS10 (★ 本域自己)
                    </button>
                  </div>

                  <div className="flex gap-2.5 mt-3 pt-3 border-t border-gray-850">
                    <button
                      onClick={runLoopDetection}
                      className="bg-rose-750 hover:bg-rose-650 text-white font-bold text-xs py-2 px-4 rounded-lg flex-1 transition"
                    >
                      🚀 向 AS10 發送路由 UPDATE
                    </button>
                    <button
                      onClick={clearCustomPath}
                      className="bg-gray-850 hover:bg-gray-750 text-gray-400 font-mono text-xs py-2 px-3 rounded-lg transition"
                    >
                      清空路徑
                    </button>
                  </div>
                </div>

                {/* Path Visualiser & Output */}
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-gray-300 block mb-1">2. 羊皮紙卷路徑預覽 (AS-PATH)</span>
                    <div className="bg-gray-950 p-2.5 rounded border border-gray-850 font-mono text-xs flex flex-wrap items-center gap-1.5 min-h-[44px]">
                      {customAsPath.length === 0 ? (
                        <span className="text-gray-500 italic">目前路徑為空，請點選左側 AS 組裝...</span>
                      ) : (
                        customAsPath.map((as, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded font-bold ${as === 10 ? 'bg-rose-955 text-rose-400 border border-rose-900/60' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                              AS{as}
                            </span>
                            {idx < customAsPath.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Warning/Success result */}
                  <div className="mt-4 pt-3 border-t border-gray-850 flex-1 flex flex-col justify-center">
                    {loopCheckResult.status === 'idle' ? (
                      <div className="text-xs text-gray-500 leading-relaxed italic text-center font-sans">
                        👉 組裝完畢後，點點擊上方發送按鈕，觸發 BGP 控制平面防環 Loop Detection 機制。
                      </div>
                    ) : loopCheckResult.status === 'loop' ? (
                      <div className="bg-red-955/15 border border-red-900/40 p-3 rounded-lg text-red-300 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>BGP 迴路防禦啟動：REJECTED 💥</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed font-sans whitespace-pre-line mt-1">
                          {loopCheckResult.msg}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-955/10 border border-emerald-900/40 p-3 rounded-lg text-emerald-300 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 font-bold">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>路由安全性通過：ACCEPTED ➔ PREPEND</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed font-sans whitespace-pre-line mt-1">
                          {loopCheckResult.msg}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: NEXT-HOP & Forwarding Table     */}
          {/* ======================================= */}
          {activeTab === 'nexthop' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="border-b border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <Network className="w-4 h-4" />
                  <span>【實驗三：BGP 下一跳與本自治網轉發表聯動】</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  BGP 僅宣告跨網目的 Prefix 與外網 NEXT-HOP IP（例如 <code>203.0.113.2</code>）。當此路由透過 iBGP 在 AS1 內部傳遞時，內部路由器（如 <code>1a</code> 或 <code>1d</code>）必須利用內部的 OSPF 演算法計算出如何抵達此 NEXT-HOP，進而自我填寫 Forwarding Table。
                </p>
              </div>

              {/* Selection Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                  <span className="font-bold text-gray-300">1. 選定 AS1 自治域內之特定路由器</span>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed font-sans">
                    請任意選取本 AS1 內部路由器，觀看它如何透過 iBGP 知道 Destination X，並聯動本域 OSPF 短路樹抵達邊界網關：
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAs1Router('1a')}
                      className={`flex-1 py-2 px-3 border rounded-xl font-bold transition flex flex-col items-center gap-1 ${selectedAs1Router === '1a' ? 'bg-rose-955 text-rose-400 border-rose-800' : 'bg-gray-900/30 border-gray-800 text-gray-400'}`}
                    >
                      <span>路由器 1a</span>
                      <span className="text-[8px] font-sans font-normal">多級中繼 (距離遠)</span>
                    </button>
                    <button
                      onClick={() => setSelectedAs1Router('1d')}
                      className={`flex-1 py-2 px-3 border rounded-xl font-bold transition flex flex-col items-center gap-1 ${selectedAs1Router === '1d' ? 'bg-rose-955 text-rose-400 border-rose-800' : 'bg-gray-900/30 border-gray-800 text-gray-400'}`}
                    >
                      <span>路由器 1d</span>
                      <span className="text-[8px] font-sans font-normal">直連網關 (距離近)</span>
                    </button>
                  </div>

                  {/* OSPF Topology description */}
                  <div className="p-2 bg-gray-950/50 rounded border border-gray-850 text-[10px] space-y-1 text-gray-500 font-mono leading-relaxed mt-2">
                    <div className="font-bold border-b border-gray-900 pb-1 mb-1 text-gray-400">本 AS1 內部 OSPF 鏈路權重:</div>
                    <div>• 1a ➔ 1b: Cost = 2 | 1b ➔ 1c (網關): Cost = 1</div>
                    <div>• 1a ➔ 1d: Cost = 8 | 1d ➔ 1c (網關): Cost = 1</div>
                  </div>
                </div>

                {/* Forwarding table generator */}
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3 justify-between">
                  <div>
                    <span className="font-bold text-gray-300 block mb-1">2. 路由器 1a 轉發表動態生成成果</span>
                    <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                      當前節點：<strong>路由器 {selectedAs1Router}</strong>。透過聯動 OSPF 短路樹，解算結果如下：
                    </p>
                  </div>

                  {/* Table visual */}
                  <div className="border border-gray-800 rounded-lg overflow-hidden my-2 font-mono text-[10px]">
                    <div className="bg-gray-900 p-2 border-b border-gray-800 font-bold grid grid-cols-4 text-center text-rose-400">
                      <span>目的 Prefix</span>
                      <span>BGP下一跳</span>
                      <span>OSPF出力埠</span>
                      <span>本網內部 Cost</span>
                    </div>
                    <div className="p-2 grid grid-cols-4 text-center bg-gray-950/60 border-b border-gray-900 font-semibold items-center text-gray-300">
                      <span>12.34.0.0/16</span>
                      <span className="text-[9px]">203.0.113.2</span>
                      <span className="text-emerald-400">{optimal.nextHopRouter}</span>
                      <span className="text-blue-400">{optimal.totalOspfCost}</span>
                    </div>
                  </div>

                  {/* Narrative details */}
                  <div className="bg-slate-900/30 p-2 rounded text-[10px] text-gray-400 leading-relaxed font-sans">
                    💡 <strong>學術分析：</strong>路由器 <code>{selectedAs1Router}</code> 雖然學到了外鏈 NEXT-HOP 為遠端外部 IP，但透過查詢本網 OSPF 自動算路。在 <strong>{optimal.path}</strong> 中，發現僅需以 <strong>Cost: {optimal.totalOspfCost}</strong> 的代价，走出口介面 <strong>{optimal.nextHopRouter}</strong> ，即可最速跳脫本自治域，完美實現轉發填寫！
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 4: Hot Potato Routing               */}
          {/* ======================================= */}
          {activeTab === 'hotpotato' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="border-b border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <span>【實驗四：Hot Potato Routing 熱馬鈴薯與自私選路】</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  當 AS1 內部路由器去往 Destination X 時，發現 East-Gate 與 West-Gate 同時聽到了 <strong>相同長度/優先度</strong> 的 BGP 路徑。此時 BGP 會使用 <strong>Closest NEXT-HOP</strong> 規則，這也被俗稱為「熱馬鈴薯選路」——不顧外網代價多大，盡快把流量丟出本網！
                </p>
              </div>

              {/* Adjust OSPF slider controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                  <span className="font-bold text-gray-300 block">1. 調整本網內部 OSPF Cost 權重</span>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed">
                    請推動下方滑桿，動態調整源路由器 1a 抵達東網關（East-Gate）與西網關（West-Gate）的內部 OSPF 成本代價：
                  </p>

                  {/* Slider 1 */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-400">1a ➔ 東網關 (East-Gate) Cost:</span>
                      <span className="text-rose-400 font-bold">{ospfCostToEast}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={ospfCostToEast}
                      onChange={(e) => setOspfCostToEast(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-400">1a ➔ 西網關 (West-Gate) Cost:</span>
                      <span className="text-indigo-400 font-bold">{ospfCostToWest}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={ospfCostToWest}
                      onChange={(e) => setOspfCostToWest(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Hot Potato visual state */}
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col justify-between items-center">
                  <div className="w-full text-center">
                    <span className="font-bold text-gray-300 block mb-1">2. 決策：自私熱馬鈴薯出口大抉擇</span>
                    <span className="text-[10px] text-gray-500 block">系統正監聽你的內部權重變更...</span>
                  </div>

                  {/* Animated potato or feedback */}
                  <div className="my-3 flex flex-col items-center justify-center">
                    <div className="relative p-4 rounded-full bg-gradient-to-tr from-amber-900/30 to-rose-950/40 border border-amber-800/40 animate-pulse flex items-center justify-center">
                      <span className="text-3xl">🥔</span>
                      <span className="absolute -top-1 -right-1 text-xs animate-bounce">🔥</span>
                    </div>
                    <div className="text-center font-mono font-bold text-sm mt-2">
                      出口中選：
                      {selectedGateway === 'West-Gate' && <span className="text-indigo-400">West-Gate 西網關 ➔</span>}
                      {selectedGateway === 'East-Gate' && <span className="text-rose-400">East-Gate 東網關 ➔</span>}
                      {selectedGateway === 'Equal' && <span className="text-yellow-400">等同 cost、隨機輪詢</span>}
                    </div>
                  </div>

                  {/* Academic Explain box */}
                  <div className="bg-slate-900/40 border border-gray-850/50 p-2.5 rounded text-[10px] text-gray-300 leading-relaxed font-sans">
                    {selectedGateway === 'West-Gate' ? (
                      <span>
                        <strong>自私選路說明：</strong>此刻 West-Gate 的 OSPF 成本為 <strong>{ospfCostToWest}</strong>，小於 East-Gate ({ospfCostToEast})。雖然從 West-Gate 丟出外網後，在全球上得多跳一級 AS 套圈圈，但 AS1 為了利己自保，不管三七二十一，堅持在 <code>West-Gate</code> 把馬鈴薯拋出去！
                      </span>
                    ) : selectedGateway === 'East-Gate' ? (
                      <span>
                        <strong>自私選路說明：</strong>縮短了內網開銷！East-Gate 的 OSPF 成本為 <strong>{ospfCostToEast}</strong> 比 West-Gate ({ospfCostToWest}) 還要實惠，1a 路由器二話不說，立刻挑選了 <code>East-Gate</code> 放行。這就是最少本地消耗優先的 Hot Potato 選路精神！
                      </span>
                    ) : (
                      <span>
                        東、西網關內部 OSPF 距離恰巧等長。BGP 內建平衡或隨機挑選其一釋放本機發包壓力的燙手山芋。
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: Policy Lab                       */}
          {/* ======================================= */}
          {activeTab === 'policy' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="border-b border-gray-800 pb-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-rose-405" />
                  <span>【實驗五：Customer-Provider 與 Dual-homed 商業路由宣告實驗】</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  在 Internet 商業圈中，路由宣告控制了現實世界中數十億美金的流量流向。大學自治網（AS300）是 <strong>ISP A</strong> 與 <strong>ISP B</strong> 的雙宿客戶（Customer）。身為學校管理員，你必須為學校網關規劃最理智、不會讓學校網路窒息崩潰的宣告（Export）政策。
                </p>
              </div>

              {/* Operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                  <span className="font-bold text-gray-300 block">1. 設計大學閘道器 Export 政策</span>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed font-sans">
                    當與 ISP A 建立 BGP 會連後，是否要向上游 ISP A 宣告「我可以聯通另一端 ISP B」的路由，自充中繼網（Transit Provider）？
                  </p>

                  <div className="flex flex-col gap-2.5 mt-2">
                    <button
                      onClick={() => handleApplyPolicy('accident-transit')}
                      className={`py-2 px-3.5 border rounded-xl font-bold font-sans transition flex items-center gap-2 ${universityPolicy === 'accident-transit' ? 'bg-red-955 text-red-400 border-red-800/60' : 'bg-gray-900 hover:bg-gray-850 text-gray-400 border-gray-800'}`}
                    >
                      <span className="text-sm">❌</span>
                      <div className="text-left">
                        <div className="text-xs">向 ISP A 宣稱：我能幫忙中轉去 ISP B！</div>
                        <span className="text-[9px] font-normal text-gray-500">（將 A 的信路宣告導流給 B：YES）</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleApplyPolicy('no-transit')}
                      className={`py-2 px-3.5 border rounded-xl font-bold font-sans transition flex items-center gap-2 ${universityPolicy === 'no-transit' ? 'bg-emerald-955 text-emerald-400 border-emerald-800/60' : 'bg-gray-900 hover:bg-gray-850 text-gray-400 border-gray-800'}`}
                    >
                      <span className="text-sm">✓</span>
                      <div className="text-left">
                        <div className="text-xs">嚴格限制：絕不宣稱能聯通 ISP B！</div>
                        <span className="text-[9px] font-normal text-gray-500">（NO Transit - 互聯網經典防守商務策略）</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Corporate Reason Panel (in traditional Chinese as requested) */}
                <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl flex flex-col justify-between min-h-[160px]">
                  <div>
                    <span className="font-bold text-gray-300 block mb-1">2. 商業選路與流向判定報告</span>
                    <span className="text-[10px] text-gray-500 block">學術與商業政策合約檢索：</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center mt-3">
                    {universityPolicy === 'undecided' ? (
                      <p className="text-gray-500 italic text-center font-sans leading-relaxed text-[11px]">
                        👉 請在左側點選大學閘道策略，觀看其在現實互聯網商業運作中，可能會因爲人為過失或優化而引發的生存性衝擊。
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {policyLabLogs.map((log, i) => (
                          <p key={i} className={`text-[10.5px] leading-relaxed font-sans ${i === 0 ? 'font-bold text-sm' : 'text-gray-400'}`}>
                            {log}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 右側 4 格：即時控制平面運行事件日誌 (Event Logger Panel) */}
        <div className="lg:col-span-4 flex flex-col bg-[#0b0f19] border border-gray-850 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-850">
            <span className="text-xs font-bold font-sans text-gray-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>BGP 網路引擎事件日誌</span>
            </span>
            <span className="text-[9px] bg-rose-955 text-rose-400 px-1.5 py-0.5 rounded font-mono font-bold">
              PORT 179 ACTIVE
            </span>
          </div>

          <p className="text-[10px] text-gray-500 leading-relaxed font-sans py-1.5">
            即時追蹤邊界閘道器在 TCP 179 發佈的 OPEN、UPDATE 和 Policy 封包脈搏：
          </p>

          {/* Logs container */}
          <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-none space-y-2 pr-1 font-mono text-[10px]">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic text-center pt-8">等候通告事件觸發中...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-gray-950/80 border border-gray-900/60 leading-relaxed">
                  <div className="flex justify-between items-center text-[9px] mb-0.5 border-b border-gray-900 pb-0.5">
                    <span className={`font-bold ${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warn' ? 'text-orange-400' :
                      log.type === 'ebgp' ? 'text-blue-400' :
                      log.type === 'ibgp' ? 'text-indigo-400' : 'text-gray-400'
                    }`}>
                      [{log.source}]
                    </span>
                    <span className="text-gray-600 text-[8px]">{log.timestamp}</span>
                  </div>
                  <div className="text-gray-300 font-sans break-words">{log.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
