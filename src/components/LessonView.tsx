/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LessonContent, UserProgress } from '../types';
import LatexRenderer from './LatexRenderer';
import DijkstraSimulator from './DijkstraSimulator';
import DistanceVectorSimulator from './DistanceVectorSimulator';
import LSvsDVLab from './LSvsDVLab';
import OSPFHierarchicalLab from './OSPFHierarchicalLab';
import BGPInteractiveLab from './BGPInteractiveLab';
import TrafficEngineeringLab from './TrafficEngineeringLab';
import SDNControllerLab from './SDNControllerLab';
import ICMPTracerouteLab from './ICMPTracerouteLab';
import { BookOpen, Check, Target, Lightbulb, HelpCircle, Save, ArrowRight, Play } from 'lucide-react';

interface LessonViewProps {
  lesson: LessonContent;
  progress: UserProgress;
  onUpdateCompleted: () => void;
  onUpdateNote: (noteText: string) => void;
  onStartQuiz: () => void;
  onIncrementSimCount?: (type: 'dijkstra' | 'dv' | 'bgp' | 'sdn' | 'traceroute') => void;
}

export default function LessonView({
  lesson,
  progress,
  onUpdateCompleted,
  onUpdateNote,
  onStartQuiz,
  onIncrementSimCount,
}: LessonViewProps) {
  // 記錄筆記
  const [noteInput, setNoteInput] = useState<string>('');

  const renderClaimButton = (type: 'dijkstra' | 'dv' | 'bgp' | 'sdn' | 'traceroute', label: string, required: number) => {
    if (!onIncrementSimCount) return null;
    const countKey = 
      type === 'dijkstra' ? 'dijkstraSimCount' :
      type === 'dv' ? 'dvSimCount' :
      type === 'bgp' ? 'bgpSimCount' :
      type === 'sdn' ? 'sdnSimCount' :
      'tracerouteSimCount';
    
    const count = progress[countKey] || 0;
    const isCompleted = count >= required;

    return (
      <div className="mt-4 p-4 bg-[#0e1322] border border-gray-850 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
            🏆 骨幹沙盒實修判定：「{label}」
          </span>
          <p className="text-[11px] text-gray-500 mt-1">
            學會認證考核標準：要求累計實測並完成至少 <strong>{required}</strong> 次。您目前已申報 <strong>{count}</strong> 次。
          </p>
        </div>
        <button
          onClick={() => {
            onIncrementSimCount(type);
            alert(`已成功累計 ${label} 完成次數 +1！(目前累計已申報 ${count + 1} 次)`);
          }}
          className={`px-4.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
            isCompleted 
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' 
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5" />}
          <span>{isCompleted ? '已達標 (可繼續申報)' : '申報完成此沙盒實修 (+1)'}</span>
        </button>
      </div>
    );
  };
  const [noteSavedMessage, setNoteSavedMessage] = useState<boolean>(false);

  // 互動小挑戰
  const [taskInput, setTaskInput] = useState<string>('');
  const [taskSuccess, setTaskSuccess] = useState<boolean>(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // 初始化載入既有筆記與重置小挑戰
  useEffect(() => {
    setNoteInput(progress.notes[lesson.id] || '');
    setNoteSavedMessage(false);
    setTaskInput('');
    setTaskSuccess(false);
    setTaskError(null);
  }, [lesson, progress]);

  const handleSaveNote = () => {
    onUpdateNote(noteInput);
    setNoteSavedMessage(true);
    setTimeout(() => {
      setNoteSavedMessage(false);
    }, 2500);
  };

  const handleVerifyTask = () => {
    const keyword = lesson.interactiveTask.expectedKeyword.toLowerCase();
    const inputVal = taskInput.trim().toLowerCase();

    if (inputVal.includes(keyword)) {
      setTaskSuccess(true);
      setTaskError(null);
    } else {
      setTaskSuccess(false);
      setTaskError(`答案不對喔！提示：可以仔細看白話與生活比喻，尋找最契合題目要求的關鍵字。`);
    }
  };

  const isCompleted = progress.completedLessons.includes(lesson.id);

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      {/* 標題及完成狀態卡 */}
      <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full font-bold">
            ACADEMIC MODULE SECTION
          </span>
          <h2 className="text-xl md:text-2xl font-bold mt-1 text-gray-200 flex items-center gap-2">
            <span>{lesson.title}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            引領你逐步剖析網路架構的各塊拼圖。
          </p>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/60 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
            <Check className="w-4 h-4" />
            <span>本章已研讀完畢 (MUTED)</span>
          </div>
        ) : (
          <button
            onClick={onUpdateCompleted}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" />
            <span>標記此章已讀完</span>
          </button>
        )}
      </div>

      {/* 學習目標、比喻與 PDF 參照 (左右分欄) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側 7 格：概念精讲 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. 學習目標 */}
          <div className="bg-[#0f1422] border border-gray-850 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>本章學習目標 (Objectives)</span>
            </h3>
            <ul className="text-xs md:text-sm space-y-2.5 text-gray-300 font-sans leading-relaxed">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">0{i + 1}.</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. 白話解釋與專業定義 */}
          <div className="bg-[#0f1422] border border-gray-850 rounded-xl p-5 flex flex-col gap-5">
            {/* 白話 */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>白話解釋 (Plain English)</span>
              </h4>
              <div className="text-xs md:text-sm leading-relaxed text-gray-300 bg-gray-950/40 p-3.5 rounded-xl border border-gray-900 font-sans whitespace-pre-line">
                <LatexRenderer text={lesson.vernacular} />
              </div>
            </div>

            {/* 專業定義 */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>專業定義 (Academic Definition)</span>
              </h4>
              <div className="text-xs md:text-sm leading-relaxed text-gray-300 whitespace-pre-line font-sans">
                <LatexRenderer text={lesson.definition} />
              </div>
            </div>
          </div>

          {/* 3. 對應 PDF 出處與生活比喻 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                🏠 生活比喻 (Analogy)
              </h4>
              <p className="text-xs leading-relaxed text-gray-300 font-sans">
                {lesson.analogy}
              </p>
            </div>

            <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                📄 對應 PDF 內容依據
              </h4>
              <p className="text-xs leading-relaxed text-gray-300 font-sans">
                {lesson.pdfReference}
              </p>
            </div>
          </div>

          {/* 4. 常見誤解 (Misconceptions) */}
          <div className="bg-[#0f1422] border border-gray-850 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="text-rose-400 font-bold font-mono">⚠️</span>
              <span className="text-rose-300">常見學術誤解澄清 (Misconceptions)</span>
            </h3>
            <div className="space-y-3.5">
              {lesson.misconceptions.map((mis, i) => (
                <div key={i} className="text-xs leading-relaxed border-l-2 border-rose-900/60 pl-3 py-0.5">
                  <p className="font-sans text-gray-300">{mis}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側 4 格：任務與個人筆記區 */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* A. 互動小任務 */}
          <div className="bg-gradient-to-b from-[#161a29] to-[#0f1422] border border-blue-900/40 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                互動理解小任務 (Mini Task)
              </h4>
            </div>

            <p className="text-xs leading-relaxed text-gray-300 font-sans">
              {lesson.interactiveTask.description}
            </p>

            <div className="mt-1">
              <label className="text-[10px] text-gray-400 font-mono tracking-wider">
                {lesson.interactiveTask.requirement}
              </label>
              <input
                type="text"
                value={taskInput}
                disabled={taskSuccess}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder={lesson.interactiveTask.placeholder}
                className="w-full bg-[#0b0f19] border border-gray-800 focus:border-blue-500 focus:outline-none p-2.5 rounded-xl text-xs text-gray-200 mt-1 transition"
              />
            </div>

            {taskError && (
              <p className="text-[11px] text-rose-400 leading-relaxed bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg font-sans">
                {taskError}
              </p>
            )}

            {taskSuccess ? (
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl text-[10.5px] text-emerald-400 leading-relaxed">
                {lesson.interactiveTask.successMessage}
              </div>
            ) : (
              <button
                onClick={handleVerifyTask}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition self-start"
              >
                驗證答案
              </button>
            )}
          </div>

          {/* B. 本章手寫筆記儲存區 */}
          <div className="bg-[#0f1422] border border-gray-850 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                💡 本章學術筆記 (Notes)
              </h4>
              {noteSavedMessage && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/50">
                  儲存成功
                </span>
              )}
            </div>

            <p className="text-[10.5px] text-gray-500 leading-relaxed font-sans">
              你可以一邊閱讀，一邊隨手寫下如公式或個人頓悟，它會即時保存於 Local Storage。
            </p>

            <textarea
              rows={5}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="例如：OSPF 跑的是 Link-State，全體路由器都得擁有同一張拓撲地圖..."
              className="w-full bg-[#0b0f19] border border-gray-800 focus:border-emerald-500 focus:outline-none p-2.5 rounded-xl text-xs text-gray-200 resize-none transition"
            />

            <button
              onClick={handleSaveNote}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存儲存筆記</span>
            </button>
          </div>
        </div>
      </div>

      {/* 嵌入式 simulator：如果是 Module 3，直接嵌入 Dijkstra 互動模擬器，強無敵 */}
      {lesson.id === 'module-3' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>學術嵌入：Dijkstra 演算法互動觀察區</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              當你研讀完上方的步驟原理，在下方直接實際操演演算法的擴張矩陣，建立最短路徑樹！
            </p>
          </div>
          <DijkstraSimulator />
          {renderClaimButton('dijkstra', 'Dijkstra 演算法模擬', 2)}
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 4，嵌入 Distance Vector 距離向量模擬器 */}
      {lesson.id === 'module-4' && (
        <div className="pt-4 border-t border-gray-905">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              <span>學術嵌入：Distance Vector 分散式選路觀察區</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              當你理解了 Bellman-Ford 的公式，在下方直接體驗分散式口耳相傳與 Count-to-Infinity 還原模擬！
            </p>
          </div>
          <DistanceVectorSimulator />
          {renderClaimButton('dv', 'Distance Vector 距離向量模擬', 2)}
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 5，嵌入 LS vs DV Comparison Lab */}
      {lesson.id === 'module-5' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              <span>學術嵌入：LS vs DV 路由演算法深度對決實驗室</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              親手設定拓撲密度：稀疏或密集對泛洪複雜度 O(n*e) 的衝擊，並發起中毒路由器謠言，觀察謊言如何感染全網或遭到隔離！
            </p>
          </div>
          <LSvsDVLab />
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 6，嵌入 OSPF 階層化實驗室 */}
      {lesson.id === 'module-6' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>學術嵌入：OSPF 階層化 ABR 屏蔽雜訊實驗室</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              親自觸發 Area 1 的連結故障，觀測 ABR 如何在維持 OSPF 正確性的同時，向 Area 0 宣告彙整（Summary），從而阻擋 LSA 封包風暴、保護 Area 2 免於 Dijkstra 重算噪音！
            </p>
          </div>
          <OSPFHierarchicalLab />
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 7，嵌入 BGP Interactive Lab */}
      {lesson.id === 'module-7' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-rose-455" />
              <span>學術嵌入：BGP 自主宣告與跨網選路政策實驗室</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              不准死記硬背！親自調整內部 OSPF 高低成本觸發自私的「熱馬鈴薯（Hot Potato）」出走決策，親身體驗偽造 AS-PATH 時觸發的 Routing loop 環形拒絕保護，並調試 Customer-Provider 商務出口策略！
            </p>
          </div>
          <BGPInteractiveLab />
          {renderClaimButton('bgp', 'BGP 自主宣告選路政策模擬', 1)}
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 8，嵌入 TrafficEngineeringLab */}
      {lesson.id === 'module-8' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>學術嵌入：流量工程 (Traffic Engineering) 與 SDN 流表對抗探究區</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              挑戰三種網路流量調變目標：點擊鏈路編輯其 OSPF 成本 (Link Weight)，體會傳統 Destination-Based 選路的全網震盪痛苦；隨後一鍵解鎖 SDN 通用轉發模式，用 Match-Action 對多重屬性（來源和顏色）進行精準分流行車指南！
            </p>
          </div>
          <TrafficEngineeringLab />
          {renderClaimButton('sdn', 'SDN 流量工程引流模擬', 1)}
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 9，嵌入 SDNControllerLab */}
      {lesson.id === 'module-9' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              <span>學術嵌入：SDN 控制器架構與 OpenFlow 鏈路故障自癒九步探究區</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              這不是文字，而是真實的系統狀態機！透過此沙盒，您可以深度探索 SDN 核心三層體系、與交換機之 Packet-in / Mod-state 等通訊協定交互。更有全流程 Link Failure 控制資料面九步倒接動畫，預測並親自驅動每一步驟的狀態演進！
            </p>
          </div>
          <SDNControllerLab />
          {renderClaimButton('sdn', 'SDN 自癒與控制器協調模擬', 1)}
        </div>
      )}

      {/* 嵌入式 simulator: 如果是 Module 10，嵌入 ICMP & Traceroute 實驗室 */}
      {lesson.id === 'module-10' && (
        <div className="pt-4 border-t border-gray-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-400" />
              <span>學術嵌入：ICMP 報文回饋與 Traceroute 遞增探航實驗區</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              當你掌握了 ICMP 欄位結構（Type/Code）以及 Traceroute 藉由 TTL 逐步遞增來揭示中間路由器的底層原理，可以在下方親自動手進行 Ping 與 Traceroute 的完整流程控制演練與預測挑戰！
            </p>
          </div>
          <ICMPTracerouteLab />
          {renderClaimButton('traceroute', 'Traceroute 遞增探航模擬', 1)}
        </div>
      )}

      {/* C. 總結與評測跳轉按鈕 */}
      <div className="bg-gradient-to-r from-[#0d1325] via-[#0d1325] to-emerald-955/20 border border-gray-850 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="max-w-2xl">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
            Chapter Summary & Evaluation
          </h4>
          <h3 className="text-sm font-bold text-gray-200 mt-1">
            本章總結：
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed mt-1 font-sans">
            {lesson.summary}
          </p>
        </div>

        <button
          onClick={onStartQuiz}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
        >
          <span>前往挑戰隨堂評測</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
