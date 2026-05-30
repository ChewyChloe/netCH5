/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { QuizQuestion, UserProgress } from '../types';
import { quizzesData } from '../data/quizzes';
import LatexRenderer from './LatexRenderer';
import { 
  AlertTriangle, BookOpen, Brain, Check, ChevronRight, Filter, 
  HelpCircle, RefreshCw, Sparkles, Trash2, X 
} from 'lucide-react';

interface ReviewPageProps {
  progress: UserProgress;
  onNavigateToModule: (moduleId: string) => void;
  onNavigateToSimulator: () => void;
}

interface MistakeRecord {
  id: string;
  userAnswer: string;
  correctAnswer: string;
  errorCount: number;
  moduleId: string;
  conceptBadge: string;
  lastIncorrectTime: number;
}

export default function ReviewPage({
  progress,
  onNavigateToModule,
  onNavigateToSimulator,
}: ReviewPageProps) {
  const [mistakes, setMistakes] = useState<Record<string, MistakeRecord>>({});
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<string>('all');
  
  // 重新挑戰狀態
  const [challengerId, setChallengerId] = useState<string | null>(null);
  const [challengerAnswer, setChallengerAnswer] = useState<string>('');
  const [challengerFeedback, setChallengerFeedback] = useState<{
    submitted: boolean;
    isCorrect: boolean;
  } | null>(null);

  // 1. 載入錯題簿
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cn_control_plane_mistakes_v1');
      if (stored) {
        setMistakes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse mistakes:', e);
    }
  }, []);

  // 2. 獲取所有問題的對照表
  const allQuestionsMap = Object.values(quizzesData).reduce((accum, qObj) => {
    qObj.questions.forEach((q) => {
      accum[q.id] = q;
    });
    return accum;
  }, {} as Record<string, QuizQuestion>);

  const mistakeList = (Object.values(mistakes) as MistakeRecord[]).sort(
    (a, b) => b.errorCount - a.errorCount // 錯誤次數多者排前 (Weakness focus)
  );

  // 3. 模組對照顯示
  const moduleTitles: Record<string, string> = {
    'module-1': 'Module 1: 控制平面雙核心與 SDN',
    'module-2': 'Module 2: 網路圖形抽象化與路徑規劃',
    'module-3': 'Module 3: Dijkstra 連結狀態演算',
    'module-4': 'Module 4: Distance Vector 距離向量路由',
    'module-5': 'Module 5: Intra-AS 內部選路與 OSPF',
    'module-6': 'Module 6: Inter-AS 外部選路政策與 BGP',
    'module-7': 'Module 7: SDN 控制器架構與 OpenFlow',
    'module-8': 'Module 8: 流量工程與 BGP/SDN 引流微調',
    'module-9': 'Module 9: SDN 多級流表匹配 Actions',
    'module-10': 'Module 10: ICMP 協定機制與 Traceroute 探航',
  };

  // 過濾清單
  const filteredMistakes = mistakeList.filter((m) => {
    const q = allQuestionsMap[m.id];
    if (!q) return false;
    const matchMod = selectedModule === 'all' || m.moduleId === selectedModule;
    const matchConcept = selectedConcept === 'all' || m.conceptBadge === selectedConcept;
    return matchMod && matchConcept;
  });

  // 概念清單 (動態粹取)
  const availableConcepts = Array.from(
    new Set(mistakeList.map((m) => m.conceptBadge))
  );

  // 4. 五大領域弱點分析
  const analyzeWeakness = () => {
    const categories = {
      Dijkstra: { label: 'Dijkstra 連結狀態', count: 0, totalErrors: 0, maxScore: 0, color: 'from-emerald-500 to-teal-500' },
      DV: { label: 'Distance Vector 向量路由', count: 0, totalErrors: 0, maxScore: 0, color: 'from-indigo-500 to-blue-500' },
      BGP: { label: 'BGP 自治選路政策', count: 0, totalErrors: 0, maxScore: 0, color: 'from-rose-500 to-amber-500' },
      SDN: { label: 'SDN 架構與流表控制', count: 0, totalErrors: 0, maxScore: 0, color: 'from-violet-500 to-purple-500' },
      ICMP: { label: 'ICMP 與 Traceroute 探導', count: 0, totalErrors: 0, maxScore: 0, color: 'from-sky-500 to-cyan-500' }
    };

    mistakeList.forEach((m) => {
      const mid = m.moduleId;
      const concept = m.conceptBadge.toLowerCase();
      
      if (mid === 'module-2' || mid === 'module-3' || concept.includes('dijkstra') || concept.includes('最短路')) {
        categories.Dijkstra.count++;
        categories.Dijkstra.totalErrors += m.errorCount;
      } else if (mid === 'module-4' || concept.includes('distance') || concept.includes('vector') || concept.includes('bellman')) {
        categories.DV.count++;
        categories.DV.totalErrors += m.errorCount;
      } else if (mid === 'module-6' || mid === 'module-8' && (concept.includes('bgp') || concept.includes('med') || concept.includes('preference'))) {
        categories.BGP.count++;
        categories.BGP.totalErrors += m.errorCount;
      } else if (mid === 'module-1' || mid === 'module-7' || mid === 'module-8' || mid === 'module-9' || concept.includes('sdn') || concept.includes('flow') || concept.includes('openflow')) {
        categories.SDN.count++;
        categories.SDN.totalErrors += m.errorCount;
      } else if (mid === 'module-10' || concept.includes('icmp') || concept.includes('traceroute') || concept.includes('ping') || concept.includes('ttl')) {
        categories.ICMP.count++;
        categories.ICMP.totalErrors += m.errorCount;
      } else {
        // 預設分類
        categories.Dijkstra.count++;
        categories.Dijkstra.totalErrors += m.errorCount;
      }
    });

    // 計算危害比例度
    const totalErrsGlobal = Object.values(categories).reduce((sum, item) => sum + item.totalErrors, 0);
    return Object.entries(categories).map(([key, item]) => {
      const percentage = totalErrsGlobal > 0 ? Math.round((item.totalErrors / totalErrsGlobal) * 100) : 0;
      return {
        key,
        ...item,
        percentage
      };
    }).sort((a, b) => b.totalErrors - a.totalErrors); // 機制嚴重者排前
  };

  const weaknessResults = analyzeWeakness();

  // 5. 推薦複習順序
  const generateRevisionOrder = () => {
    if (mistakeList.length === 0) return [];
    
    // 按模組錯題累計數排序
    const modCount: Record<string, number> = {};
    mistakeList.forEach((m) => {
      modCount[m.moduleId] = (modCount[m.moduleId] || 0) + m.errorCount;
    });

    return Object.entries(modCount)
      .map(([mid, errors]) => ({
        moduleId: mid,
        title: moduleTitles[mid] || mid,
        errors,
        suggestion: 
          mid === 'module-3' ? '建議優先前往互動沙盒演練 Dijkstra，觀察 N\' 展開鬆弛鬆弛過程。' :
          mid === 'module-4' ? '建議開啟 Distance Vector 沙盒，調試壞消息無限遞增與毒性補償規避動作。' :
          mid === 'module-7' ? '配合 SDN 九步故障自癒動畫重新梳理 Packet-In 回應握手手續。' :
          mid === 'module-10' ? '查看 Traceroute 特殊 TTL 耗竭 Type11/Code0 的報錯捕獲特質。' :
          '重新研讀本模組的白話生活比喻、專業定義，並挑战隨堂測驗。'
      }))
      .sort((a, b) => b.errors - a.errors);
  };

  const revisionOrder = generateRevisionOrder();

  // 6. 刪除單個錯題
  const handleDeleteMistake = (qId: string) => {
    if (window.confirm('確定要將此題從錯題記錄中移出嗎？移出後弱點分析將扣除比重！')) {
      const copy = { ...mistakes };
      delete copy[qId];
      setMistakes(copy);
      localStorage.setItem('cn_control_plane_mistakes_v1', JSON.stringify(copy));
    }
  };

  // 7. 清空錯題庫
  const handleClearAll = () => {
    if (window.confirm('恭喜！確定一鍵清空所有歷史錯題記錄嗎？')) {
      setMistakes({});
      localStorage.setItem('cn_control_plane_mistakes_v1', JSON.stringify({}));
    }
  };

  // 8. 重新挑戰單題作答
  const handleStartChallenge = (q: QuizQuestion) => {
    setChallengerId(q.id);
    setChallengerAnswer('');
    setChallengerFeedback(null);
  };

  const handleSubmitChallenge = (q: QuizQuestion) => {
    let check = false;
    if (q.type === 'fill') {
      const student = challengerAnswer.trim().toLowerCase();
      check = student === q.correctAnswer.toLowerCase() || 
              q.correctAnswer.toLowerCase().includes(student) || 
              student.includes(q.correctAnswer.toLowerCase());
    } else if (q.type === 'multi') {
      const studentArr = challengerAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      const correctArr = q.correctAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      check = studentArr === correctArr;
    } else {
      check = challengerAnswer.toUpperCase() === q.correctAnswer.toUpperCase() || 
              challengerAnswer.startsWith(q.correctAnswer) ||
              q.correctAnswer.startsWith(challengerAnswer);
    }

    setChallengerFeedback({
      submitted: true,
      isCorrect: check
    });

    if (check) {
      // 答對了！在錯題記錄中縮減扣減錯誤次數或消滅該條記錄
      const copy = { ...mistakes };
      if (copy[q.id]) {
        if (copy[q.id].errorCount <= 1) {
          delete copy[q.id];
        } else {
          copy[q.id].errorCount -= 1;
        }
        setMistakes(copy);
        localStorage.setItem('cn_control_plane_mistakes_v1', JSON.stringify(copy));
      }
    } else {
      // 答錯加重處罰
      const copy = { ...mistakes };
      if (copy[q.id]) {
        copy[q.id].errorCount += 1;
        copy[q.id].lastIncorrectTime = Date.now();
        setMistakes(copy);
        localStorage.setItem('cn_control_plane_mistakes_v1', JSON.stringify(copy));
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 text-gray-200">
      
      {/* Page Title Panel */}
      <div className="bg-gradient-to-r from-blue-950/20 via-[#0a0f1d] to-rose-955/20 border border-gray-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-rose-950/40 text-rose-455 border border-rose-800/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
            Syllabus Mistake Diagnostic Center
          </span>
          <h2 className="text-xl font-bold mt-1.5 text-gray-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-rose-400" />
            <span>核心觀念錯題回顧與弱點洞察</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            系統會自動追蹤與剖析所有在隨堂測驗、總複習中答錯的網規題目，即時量算五大核心控制平面模組的損耗配額。
          </p>
        </div>
        {mistakeList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-gray-400 hover:text-white bg-gray-900 hover:bg-rose-900/30 border border-gray-800 hover:border-rose-800/40 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-stretch md:self-auto justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空錯題簿</span>
          </button>
        )}
      </div>

      {mistakeList.length === 0 ? (
        <div className="bg-[#0f1422] border border-gray-850 p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-emerald-950/20 text-emerald-400 rounded-full border border-emerald-900/40 animate-pulse">
            <Check className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-200">
              毫無錯題！大腦防禦完美無缺
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
              目前您尚未在任何隨常模組或總複習中留下錯題。保持專注！現在就去挑戰「學術模組」或進行「總複習測驗」評估吧！
            </p>
          </div>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={() => onNavigateToModule('modules')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition"
            >
              進入學術模組
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Bento-Grid Summary Dashboard: Weakness & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. 五域弱點危害雷達分析卡 (8 columns) */}
            <div className="bg-[#090d16] border border-gray-850 rounded-2xl p-5 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    WEAKNESS DEGREE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-gray-300 mt-2 tracking-wide">
                  🎯 5 大核心範疇分佈與錯誤頻次比重 (危害佔比越高越脆弱)
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  基於錯題的「錯誤次數加權」，精確運算您在 Dijkstra、Distance Vector、BGP、SDN、ICMP 上的知識缺口。
                </p>
              </div>

              {/* 橫條弱點大沙盤 */}
              <div className="space-y-4 mt-6">
                {weaknessResults.map((category) => (
                  <div key={category.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {category.label}
                      </span>
                      <span className="font-mono text-gray-400 text-[11px]">
                        累計 {category.totalErrors} 次錯誤 / 佔比 
                        <strong className="text-rose-400 ml-1 font-bold">{category.percentage}%</strong>
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-700`}
                        style={{ width: `${category.percentage || 2}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10.5px] text-gray-500 mt-4 leading-relaxed border-t border-gray-900 pt-3">
                ⭐ 
                <span className="font-bold text-amber-500"> 弱點提示：</span>
                當某領域的佔比超過 <strong>30%</strong>，代表其在路由大考中是您的最大失分漏洞。請務必優先點擊右側的建議順序進行修復！
              </div>
            </div>

            {/* 2. 弱點推薦複習順序 (5 columns) */}
            <div className="bg-[#090d16] border border-gray-850 rounded-2xl p-5 lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-900/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    RECOMMENDED PATH
                  </span>
                </div>
                <h3 className="text-xs font-bold text-gray-300 mt-2">
                  🚀 系統自適應：推薦大腦複習優先順序
                </h3>
              </div>

              <div className="space-y-2.5 mt-4 flex-1">
                {revisionOrder.slice(0, 3).map((item, index) => (
                  <div 
                    key={item.moduleId} 
                    className="bg-[#0f1422] border border-gray-850 hover:border-gray-800 p-3 rounded-xl flex items-start gap-2.5 transition"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold mt-0.5 border border-amber-500/20">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-200 truncate">
                          M{item.moduleId.replace('module-', '')} {item.title.split(': ')[1]}
                        </h4>
                        <span className="bg-red-950/60 text-red-400 text-[9px] px-1.5 rounded font-mono">
                          {item.errors} 誤
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {item.suggestion}
                      </p>
                      
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onNavigateToModule(item.moduleId)}
                          className="text-[9.5px] font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-0.5 bg-blue-950/20 px-2 py-0.5 rounded border border-blue-500/10"
                        >
                          <span>前往研讀</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {item.moduleId === 'module-3' && (
                          <button
                            onClick={onNavigateToSimulator}
                            className="text-[9.5px] font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-0.5 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10"
                          >
                            <span>開啟 Dijkstra 模擬</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle / Filter Header for Question list */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-gray-900 pb-3 mt-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <span>錯題庫清單 (目前過濾出 {filteredMistakes.length} 題)</span>
            </h3>

            {/* 篩選控制器 */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setSelectedConcept('all');
                }}
                className="bg-[#0f1422] border border-gray-800 rounded-xl text-xs px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">🔍 所有模組篩選</option>
                {Object.entries(moduleTitles).map(([mid, title]) => (
                  <option key={mid} value={mid}>{title}</option>
                ))}
              </select>

              {availableConcepts.length > 0 && selectedModule === 'all' && (
                <select
                  value={selectedConcept}
                  onChange={(e) => setSelectedConcept(e.target.value)}
                  className="bg-[#0f1422] border border-gray-800 rounded-xl text-xs px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="all">🏷️ 所有概念選取</option>
                  {availableConcepts.map((concept) => (
                    <option key={concept} value={concept}>{concept}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Question Render Cards */}
          <div className="space-y-4">
            {filteredMistakes.map((record) => {
              const q = allQuestionsMap[record.id];
              if (!q) return null;
              const isChallenging = challengerId === q.id;

              return (
                <div 
                  key={record.id} 
                  className="bg-[#080d1a]/80 border border-gray-850 hover:border-gray-800/80 p-5 rounded-2xl flex flex-col gap-3 transition"
                >
                  
                  {/* Card Header metadata */}
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-900/40 px-2 py-0.5 rounded font-mono font-bold">
                        {record.moduleId.replace('module-', 'MODULE ').toUpperCase()}
                      </span>
                      <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-900/30 px-2 py-0.5 rounded font-bold">
                        累計答錯 {record.errorCount} 次
                      </span>
                      <span className="text-[10.5px] text-gray-500 font-mono">
                        觀念：{record.conceptBadge}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-mono">
                        最後答錯時間: {new Date(record.lastIncorrectTime).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteMistake(record.id)}
                        className="text-gray-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/20 transition"
                        title="移出錯題簿"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="bg-[#0f1422] border border-gray-850/60 p-4 rounded-xl">
                    <div className="text-[10px] text-amber-500 font-mono font-bold mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {q.type === 'single' ? '單選題 SINGLE CHOICE' :
                         q.type === 'multi' ? '多選題 MULTIPLE CHOICE (逗號區隔答題)' :
                         q.type === 'boolean' ? '是非題 YES/NO QUESTION' :
                         q.type === 'fill' ? '填空題 FILL IN BLANK' :
                         q.type === 'matching' ? '配對題 MATCHING' :
                         q.type === 'sorting' ? '排序題 SORTING' :
                         q.type === 'algorithm' ? '演算法步驟題 ALGORITHM STEPS' :
                         q.type === 'calculation' ? '計算題 CALCULATION' :
                         '圖表判讀題 DIAGRAM ANALYSIS'}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-200 mt-1 whitespace-pre-line leading-relaxed font-medium">
                      <LatexRenderer text={q.questionText} />
                    </div>
                  </div>

                  {/* Normal Static Feedback (When not in active challenge) */}
                  {!isChallenging ? (
                    <div className="text-xs space-y-1.5 border-t border-gray-900 pt-3 text-gray-400">
                      <p>• <strong className="text-rose-455">您曾回答：</strong> <span className="font-mono text-gray-300">{record.userAnswer || '未填/其他'}</span></p>
                      <p className="flex items-baseline gap-1">
                        • <strong className="text-emerald-400">最優解答：</strong> 
                        <span className="font-bold font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded text-[11px]">
                          {q.correctAnswer}
                        </span>
                      </p>
                      
                      <div className="bg-[#0f1422]/50 p-3 rounded-lg border border-gray-900 mt-2 text-[11px] text-gray-400 space-y-1">
                        <strong className="text-amber-500 font-bold">學術解剖：</strong>
                        <div className="whitespace-pre-line"><LatexRenderer text={q.explanation} /></div>
                        {q.choicesWrongExplanation && q.type === 'single' && (
                          <div className="mt-2 border-t border-gray-900 pt-2 space-y-1 text-gray-500">
                            <strong>🚫 為何其餘選項錯：</strong>
                            {Object.entries(q.choicesWrongExplanation).map(([opt, errExplanation]) => (
                              <p key={opt}>· <span className="text-gray-400 hover:text-white font-bold">{opt}：</span> {errExplanation}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-blue-400 font-bold mt-1">
                          ↳ 建議回到：【{q.reviewSection}】複習
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => onNavigateToModule(record.moduleId)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>回到學術模組</span>
                        </button>
                        <button
                          onClick={() => handleStartChallenge(q)}
                          className="bg-[#242f4c] hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/20 hover:border-blue-500/50 px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                          <span>重新挑戰此題</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Active Re-challenge panel */
                    <div className="border-t border-gray-900 pt-3 space-y-3">
                      <div className="flex items-center gap-1.5 md:gap-3 text-xs">
                        <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px] animate-pulse">
                          ⚡ 重新挑戰運算模式 ⚡
                        </span>
                        <button
                          onClick={() => setChallengerId(null)}
                          className="text-gray-500 hover:text-white flex items-center gap-0.5 text-[10.5px] ml-auto transition"
                        >
                          <X className="w-3 h-3" />
                          <span>取消挑戰</span>
                        </button>
                      </div>

                      {/* Options or text input based on type */}
                      {q.type === 'fill' ? (
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400">請在下方填入精確繁體中文或英文字眼回答：</label>
                          <input
                            type="text"
                            value={challengerAnswer}
                            onChange={(e) => setChallengerAnswer(e.target.value)}
                            placeholder="例如：轉發表..."
                            disabled={challengerFeedback?.submitted}
                            className="bg-[#0f1422] border border-gray-800 focus:border-blue-500 focus:outline-none w-full p-2.5 rounded-xl text-xs text-gray-200 transition"
                          />
                        </div>
                      ) : q.options ? (
                        <div className="space-y-2">
                          {q.type === 'multi' && (
                            <p className="text-[11px] text-blue-400 font-medium">
                              📝 此題為多選題，點擊選項可選取多個答案（多選答案會自動以逗號隔開）。目前已選：
                              <span className="font-mono bg-blue-950 px-2 py-0.5 rounded text-blue-300 ml-1">
                                {challengerAnswer || '(未選)'}
                              </span>
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const letter = opt.charAt(0);
                              const isMulti = q.type === 'multi';
                              const isSelected = isMulti
                                ? challengerAnswer.split(',').map(s => s.trim().toUpperCase()).includes(letter)
                                : challengerAnswer === opt || opt.startsWith(challengerAnswer) && challengerAnswer !== '';

                              const handleToggle = () => {
                                if (isMulti) {
                                  let list = challengerAnswer.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                                  if (list.includes(letter)) {
                                    list = list.filter(x => x !== letter);
                                  } else {
                                    list.push(letter);
                                  }
                                  list.sort();
                                  setChallengerAnswer(list.join(','));
                                } else {
                                  setChallengerAnswer(letter);
                                }
                              };

                              return (
                                <button
                                  key={opt}
                                  disabled={challengerFeedback?.submitted}
                                  onClick={handleToggle}
                                  className={`text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                                      : 'bg-[#0f1422] border-gray-850 hover:border-gray-800 text-gray-300'
                                  }`}
                                >
                                  <span><LatexRenderer text={opt} /></span>
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400">請填寫正確代號或其餘格式答案（多選以英文逗號分隔，比如 A,B）：</label>
                          <input
                            type="text"
                            value={challengerAnswer}
                            onChange={(e) => setChallengerAnswer(e.target.value)}
                            placeholder="請填入大寫字母代號..."
                            disabled={challengerFeedback?.submitted}
                            className="bg-[#0f1422] border border-gray-850 focus:border-blue-500 focus:outline-none w-full p-2.5 rounded-xl text-xs text-gray-200 transition font-mono uppercase"
                          />
                        </div>
                      )}

                      {challengerFeedback && (
                        <div className={`p-4 rounded-xl border flex flex-col gap-1.5 transition ${
                          challengerFeedback.isCorrect 
                            ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-100' 
                            : 'bg-rose-950/20 border-rose-900/60 text-rose-100'
                        }`}>
                          <strong className="text-xs flex items-center gap-1 uppercase">
                            {challengerFeedback.isCorrect ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">解答正確！弱點比重安全調減一分！</span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-400">挑戰失效！本概念危害度再度累加。</span>
                              </>
                            )}
                          </strong>
                          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                            <strong>正確配比對：</strong> <span className="font-mono text-emerald-400 font-bold">{q.correctAnswer}</span>
                          </p>
                          <div className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-800 pt-2 mt-1">
                            <strong>學術解說：</strong> <LatexRenderer text={q.explanation} />
                          </div>
                          <button
                            onClick={() => setChallengerId(null)}
                            className="bg-gray-800 hover:bg-gray-750 text-gray-200 text-[10.5px] font-bold px-3.5 py-1 rounded border border-gray-700 ml-auto mt-2 transition"
                          >
                            完成挑戰關閉
                          </button>
                        </div>
                      )}

                      {!challengerFeedback?.submitted && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setChallengerId(null)}
                            className="bg-gray-900 hover:bg-gray-800 text-gray-300 px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleSubmitChallenge(q)}
                            disabled={!challengerAnswer}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                          >
                            送出校對
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
