/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { QuizQuestion, UserProgress } from '../types';
import { quizzesData } from '../data/quizzes';
import LatexRenderer from './LatexRenderer';
import { 
  Award, Brain, Check, CheckCircle2, ChevronRight, ClipboardList, HelpCircle, 
  Play, RefreshCw, Sparkles, Terminal, X, XCircle, AlertTriangle
} from 'lucide-react';

interface FinalExamPageProps {
  progress: UserProgress;
  onUpdateHighScore: (score: number) => void;
  onNavigateToModule: (moduleId: string) => void;
  onNavigateToSimulator: () => void;
}

export default function FinalExamPage({
  progress,
  onUpdateHighScore,
  onNavigateToModule,
  onNavigateToSimulator,
}: FinalExamPageProps) {
  // 考試狀態
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: answer }
  const [examFinished, setExamFinished] = useState(false);
  
  // 計算得出結果
  const [totalScore, setTotalScore] = useState(0);
  const [moduleCorrectCount, setModuleCorrectCount] = useState<Record<string, number>>({});
  const [examMistakesList, setExamMistakesList] = useState<{ q: QuizQuestion; userAnswer: string }[]>([]);

  // 1. 生成 30 題隨機大考卷 (10 modules * 3 q/module = 30)
  const generateExamPaper = () => {
    const selected: QuizQuestion[] = [];
    const moduleKeys = Object.keys(quizzesData);

    moduleKeys.forEach((mKey) => {
      const list = (quizzesData[mKey]?.questions || []).map((q) => ({
        ...q,
        moduleId: mKey,
      }));
      // 隨機洗牌該模組的 12 題
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      // 取得前 3 題
      selected.push(...shuffled.slice(0, 3));
    });

    // 驗證是否有至少 5 題演算法/流程/計算/圖表題。如果少於 5 題，重新替換非演算法題非流程題
    let algos = selected.filter(
      (q) => q.type === 'algorithm' || q.type === 'sorting' || q.type === 'chart' || q.type === 'calculation'
    );

    if (algos.length < 5) {
      // 缺少的數量
      const deficit = 5 - algos.length;
      let substituted = 0;

      // 遍歷所有模組找演算法題來補足
      for (const mKey of moduleKeys) {
        if (substituted >= deficit) break;
        const allQuestions = (quizzesData[mKey]?.questions || []).map((q) => ({
          ...q,
          moduleId: mKey,
        }));
        const algoQuestions = allQuestions.filter(
          (q) => q.type === 'algorithm' || q.type === 'sorting' || q.type === 'chart' || q.type === 'calculation'
        );

        for (const aq of algoQuestions) {
          // 如果該題本來不在 selected 中，且選中的 30 題有非演算法題可以退貨
          if (!selected.some((s) => s.id === aq.id) && substituted < deficit) {
            // 在 selected 中尋找相同 moduleId 下的非演算法題退貨
            const victimIdx = selected.findIndex(
              (s) => s.moduleId === mKey && s.type !== 'algorithm' && s.type !== 'sorting' && s.type !== 'chart' && s.type !== 'calculation'
            );
            if (victimIdx !== -1) {
              selected[victimIdx] = aq;
              substituted++;
              if (substituted >= deficit) break;
            }
          }
        }
      }
    }

    // 將整份 30 題大考卷做最终全體隨機洗牌，打亂模組順序
    const finalShuffledPaper = [...selected].sort(() => 0.5 - Math.random());
    setQuestions(finalShuffledPaper);
    setCurrentIdx(0);
    setAnswers({});
    setExamFinished(false);
    setExamStarted(true);
  };

  // 2. 勾記作答並登入錯題 localStorage
  const handleAnswerOption = (optionChar: string) => {
    const q = questions[currentIdx];
    setAnswers({
      ...answers,
      [q.id]: optionChar,
    });
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // 3. 送出考試評比，計算總分與各模組答對率，並自動連線錯題本
  const handleSubmitExam = () => {
    let scoreCount = 0;
    const modCorrect: Record<string, number> = {};
    const mistakes: { q: QuizQuestion; userAnswer: string }[] = [];

    // 初始化各模組答對率計數
    const moduleKeys = Object.keys(quizzesData);
    moduleKeys.forEach((m) => {
      modCorrect[m] = 0;
    });

    questions.forEach((q) => {
      const studentAns = (answers[q.id] || '').trim().toLowerCase();
      let isCorrect = false;

      if (q.type === 'fill') {
        isCorrect = studentAns === q.correctAnswer.toLowerCase() || 
                    q.correctAnswer.toLowerCase().includes(studentAns) || 
                    studentAns.includes(q.correctAnswer.toLowerCase());
      } else if (q.type === 'multi') {
        const studentArr = studentAns.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
        const correctArr = q.correctAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
        isCorrect = studentArr === correctArr;
      } else {
        isCorrect = studentAns === q.correctAnswer.toLowerCase() || 
                    studentAns.startsWith(q.correctAnswer.toLowerCase()) ||
                    q.correctAnswer.toLowerCase().startsWith(studentAns);
      }

      if (isCorrect) {
        scoreCount++;
        modCorrect[q.moduleId] = (modCorrect[q.moduleId] || 0) + 1;
      } else {
        // 記錄錯題，並上拋寫入到錯題 localStorage 暫存中
        mistakes.push({ q, userAnswer: answers[q.id] || '(未答)' });
        recordMistakeInLocalStorage(q.id, answers[q.id] || '', q);
      }
    });

    const finalScoreRatio = Math.round((scoreCount / questions.length) * 100);
    setTotalScore(finalScoreRatio);
    setModuleCorrectCount(modCorrect);
    setExamMistakesList(mistakes);
    setExamFinished(true);

    // 回傳高分給父層進度儲存
    onUpdateHighScore(finalScoreRatio);
  };

  // 輔助函式：錯題入庫
  const recordMistakeInLocalStorage = (qId: string, studentAns: string, q: QuizQuestion) => {
    try {
      const key = 'cn_control_plane_mistakes_v1';
      const stored = localStorage.getItem(key);
      const db: Record<string, any> = stored ? JSON.parse(stored) : {};

      if (db[qId]) {
        db[qId].errorCount += 1;
        db[qId].userAnswer = studentAns;
        db[qId].lastIncorrectTime = Date.now();
      } else {
        db[qId] = {
          id: qId,
          userAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          errorCount: 1,
          moduleId: q.moduleId,
          conceptBadge: q.conceptBadge,
          lastIncorrectTime: Date.now(),
        };
      }
      localStorage.setItem(key, JSON.stringify(db));
    } catch (e) {
      console.error(e);
    }
  };

  // 4. 計算學會標準 (Mastery Criteria) 達標度
  const checkMasteryCriteria = () => {
    // a. 所有 module 通關 completedLessons
    const all10ModulesRead = Object.keys(quizzesData).every((m) => 
      progress.completedLessons.includes(m)
    );
    
    // b. 每個 module quiz >= 80%
    const allQuizHighScoresPass = Object.keys(quizzesData).every((m) => 
      (progress.quizHighScores[m] || 0) >= 80
    );

    // c. 總複習分數 >= 80%
    const currentHighScore = Math.max(progress.finalExamHighScore || 0, totalScore);
    const finalExamHighScorePass = currentHighScore >= 80;

    // d. 模擬器完成次數
    const dijkstraPass = (progress.dijkstraSimCount || 0) >= 2;
    const dvPass = (progress.dvSimCount || 0) >= 2;
    const bgpPass = (progress.bgpSimCount || 0) >= 1;
    const sdnPass = (progress.sdnSimCount || 0) >= 1;
    const traceroutePass = (progress.tracerouteSimCount || 0) >= 1;

    const allConditionsPassed = 
      all10ModulesRead && 
      allQuizHighScoresPass && 
      finalExamHighScorePass && 
      dijkstraPass && 
      dvPass && 
      bgpPass && 
      sdnPass && 
      traceroutePass;

    return {
      all10ModulesRead,
      allQuizHighScoresPass,
      finalExamHighScorePass,
      dijkstraPass,
      dvPass,
      bgpPass,
      sdnPass,
      traceroutePass,
      allConditionsPassed,
    };
  };

  const masteryStatus = checkMasteryCriteria();

  // 模組中文標題對照
  const moduleShortTitles: Record<string, string> = {
    'module-1': 'M1: 控制面與 SDN 崛起',
    'module-2': 'M2: 網路圖形最短路徑',
    'module-3': 'M3: Dijkstra 連結狀態',
    'module-4': 'M4: Distance Vector 向量',
    'module-5': 'M5: 內部自治選路 OSPF',
    'module-6': 'M6: 外部自治政策 BGP',
    'module-7': 'M7: SDN 控制機與 OpenFlow',
    'module-8': 'M8: 流量工程與 BGP 引流',
    'module-9': 'M9: multi-table 匹配機制',
    'module-10': 'M10: ICMP 診斷與 Traceroute',
  };

  return (
    <div className="flex flex-col gap-8 text-gray-200">
      
      {/* 總複習主板 */}
      <div className="bg-gradient-to-r from-violet-950/20 via-[#0a0f1d] to-emerald-955/20 border border-gray-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-violet-950/50 text-violet-400 border border-violet-800/30 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
            Antigravity Final Examination
          </span>
          <h2 className="text-xl font-bold mt-1.5 text-gray-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400 animate-pulse" />
            <span>Chapter 5 控制平面總複習綜合特測</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            大考每次隨機抽取 30 題專業計網選路與控制平面難題，要求完整覆蓋本章十大核心模組。其中強制配置至少 5 題複雜的演算法步驟或拓撲分析計算題！
          </p>
        </div>
        {!examStarted && (
          <button
            onClick={generateExamPaper}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 self-stretch md:self-auto justify-center"
          >
            <Play className="w-4 h-4" />
            <span>開始總複習大考</span>
          </button>
        )}
      </div>

      {/* 1. 沒開始考試：顯示目前的「學會標準 Mastery Checklist」大盤點 */}
      {!examStarted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左側：學術標準大比拼 (7 cols) */}
          <div className="bg-[#090d16] border border-gray-850 p-5 rounded-2xl lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 border-b border-gray-900 pb-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>電腦網路：Chapter 5 骨幹「學會標準」考核檢核清單</span>
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                欲達到此章的頂尖「學會認證」，必須完成以下一系列嚴格的硬體與軟體互動指標學分：
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 mt-4">
              
              {/* Completed Lessons */}
              <div className="flex items-start justify-between text-xs p-2.5 bg-[#0e1322] border border-gray-850 rounded-xl">
                <div className="flex items-center gap-2">
                  {masteryStatus.all10ModulesRead ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <span className="font-bold text-gray-300">A. 10 大學術模組阅读讀完</span>
                    <p className="text-[10px] text-gray-500">已讀完 ({progress.completedLessons.length} / 10) 個模組</p>
                  </div>
                </div>
                <span className="font-mono text-gray-400">{progress.completedLessons.length * 10}%</span>
              </div>

              {/* Module Quizzes */}
              <div className="flex items-start justify-between text-xs p-2.5 bg-[#0e1322] border border-gray-850 rounded-xl">
                <div className="flex items-center gap-2">
                  {masteryStatus.allQuizHighScoresPass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <span className="font-bold text-gray-300">B. 十個模組隨堂測驗均合格 (&ge; 80%)</span>
                    <p className="text-[10px] text-gray-500">
                      目前未合格模組：
                      {Object.keys(quizzesData).filter(m => (progress.quizHighScores[m] || 0) < 80).map(m => m.replace('module-', 'M')).join(', ') || '無 (皆滿貫達標！)'}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-gray-400">
                  {Object.keys(quizzesData).filter(m => (progress.quizHighScores[m] || 0) >= 80).length} / 10 達標
                </span>
              </div>

              {/* Final Exam HighScore */}
              <div className="flex items-start justify-between text-xs p-2.5 bg-[#0e1322] border border-gray-850 rounded-xl">
                <div className="flex items-center gap-2">
                  {masteryStatus.finalExamHighScorePass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <span className="font-bold text-gray-300">C. 總複習特測綜合高分 (&ge; 80%)</span>
                    <p className="text-[10px] text-gray-500">目前歷史大考最高記錄分數：{(progress.finalExamHighScore || 0)}%</p>
                  </div>
                </div>
                <span className="font-mono text-gray-400">{(progress.finalExamHighScore || 0)} / 80</span>
              </div>

              {/* Simulator completions */}
              <div className="p-3 bg-[#0e1322] border border-gray-850 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-gray-300">D. 核心互動沙盒實驗累計次數（實機淬鍊）</span>
                
                <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10.5px]">
                  {/* Dijkstra */}
                  <div className="flex items-center justify-between bg-[#11182c] px-2 py-1 rounded">
                    <span className="text-gray-400">Dijkstra ({progress.dijkstraSimCount || 0}/2 次)</span>
                    {masteryStatus.dijkstraPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>}
                  </div>
                  {/* DV */}
                  <div className="flex items-center justify-between bg-[#11182c] px-2 py-1 rounded">
                    <span className="text-gray-400">Distance Vector ({progress.dvSimCount || 0}/2 次)</span>
                    {masteryStatus.dvPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>}
                  </div>
                  {/* BGP */}
                  <div className="flex items-center justify-between bg-[#11182c] px-2 py-1 rounded">
                    <span className="text-gray-400">BGP ({progress.bgpSimCount || 0}/1 次)</span>
                    {masteryStatus.bgpPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>}
                  </div>
                  {/* SDN */}
                  <div className="flex items-center justify-between bg-[#11182c] px-2 py-1 rounded">
                    <span className="text-gray-400">SDN ({progress.sdnSimCount || 0}/1 次)</span>
                    {masteryStatus.sdnPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>}
                  </div>
                  {/* Traceroute */}
                  <div className="flex items-center justify-between bg-[#11182c] px-2 py-1 rounded col-span-2">
                    <span className="text-gray-400">ICMP Traceroute ({progress.tracerouteSimCount || 0}/1 次)</span>
                    {masteryStatus.traceroutePass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 右側：學位認證分析看板 (5 cols) */}
          <div className="bg-[#090d16] border border-gray-850 p-5 rounded-2xl lg:col-span-5 flex flex-col justify-between text-center items-center">
            <div className="w-full">
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded font-mono font-bold">
                CERTIFICATE OF MASTERY
              </span>
              <h3 className="text-xs font-bold text-gray-300 mt-2">
                大腦控制平面主宰度認證 (Mastery Status)
              </h3>
            </div>

            {/* Badge Graphic */}
            <div className="my-6 relative flex items-center justify-center">
              <div className={`p-8 rounded-full border-2 ${
                masteryStatus.allConditionsPassed 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 scale-105 animate-pulse' 
                  : 'bg-gray-900/80 border-gray-800 text-gray-500'
              } transition-all duration-700`}>
                <Award className="w-16 h-16" />
              </div>
              {masteryStatus.allConditionsPassed && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                  MASTERED
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              <h4 className="text-xs font-bold text-gray-200">
                {masteryStatus.allConditionsPassed 
                  ? '🎉 恭喜！您已獲得 Chapter 5 骨幹通關大滿貫認證' 
                  : '⏳ 努力前行！大腦正逐步建立完整控制核心'}
              </h4>
              <p className="text-[10.5px] text-gray-400 leading-relaxed font-sans">
                {masteryStatus.allConditionsPassed 
                  ? '您的理論儲備、算法矩陣演進、以及 SDN 控制器和 OSPF/BGP 動態 TE 實機調試能力皆已臻化境！' 
                  : '請點選「開始總複習大考」自我挑戰，並進入學術課程下的各個嵌入式互動沙盒來增加模擬次數吧！'}
              </p>
              
              {!masteryStatus.allConditionsPassed && (
                <div className="text-[9.5px] text-blue-400 font-bold bg-blue-950/20 px-3 py-1 rounded border border-blue-900/10 flex items-center gap-1 mt-1 justify-center">
                  <span>貼心小技巧：在課程視窗底部的沙盒，多點幾次「完成」即可刷滿次數。</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. 正在進行考試 (active testing) */}
      {examStarted && !examFinished && (
        <div className="bg-[#080d19]/90 border border-gray-850 p-6 rounded-2xl flex flex-col gap-5">
          
          {/* Progress Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-violet-950 text-violet-400 border border-violet-850 px-2 py-0.5 rounded font-mono font-bold">
                QUESTION {currentIdx + 1} OF {questions.length}
              </span>
              <span className="text-xs text-gray-400">
                對應節點：{moduleShortTitles[questions[currentIdx].moduleId] || questions[currentIdx].moduleId}
              </span>
            </div>
            
            {/* Quick map indicators */}
            <div className="flex gap-0.5 max-w-xs md:max-w-md overflow-x-auto py-1">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-sm transition ${
                      isCurrent
                        ? 'bg-violet-500 scale-125'
                        : isAnswered
                        ? 'bg-blue-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    title={`題目 ${idx + 1}`}
                  ></button>
                );
              })}
            </div>
          </div>

          {/* Question Text Card */}
          <div className="bg-[#0f1422] p-5 rounded-xl border border-gray-850/60">
            <span className="text-[10px] text-violet-400 font-mono tracking-widest font-bold uppercase mb-1 block">
              {questions[currentIdx].type === 'single' ? '單選題 Single Choice' :
               questions[currentIdx].type === 'multi' ? '多選題 Multiple Choice (逗號分隔)' :
               questions[currentIdx].type === 'boolean' ? '是非題 True/False' :
               questions[currentIdx].type === 'fill' ? '填空題 Fill In Blank' :
               questions[currentIdx].type === 'matching' ? '配對與匹配題 Matching' :
               questions[currentIdx].type === 'sorting' ? '排序或步驟題 Sorting/Steps' :
               questions[currentIdx].type === 'algorithm' ? '演算法步驟題 Algorithm Steps' :
               questions[currentIdx].type === 'calculation' ? '定量與代數計算題 Math Calculation' :
               '拓撲與圖表判讀題 Diagram Analysis'}
            </span>
            <div className="text-xs md:text-sm text-gray-200 mt-1 whitespace-pre-line leading-relaxed font-sans">
              <LatexRenderer text={questions[currentIdx].questionText} />
            </div>
          </div>

          {/* Options Input Block */}
          <div className="space-y-2 mt-2">
            {questions[currentIdx].type === 'fill' ? (
              <div className="space-y-1 bg-[#0b0f19] p-4 rounded-xl border border-gray-850/60">
                <label className="text-[11px] text-gray-400 font-bold">請填寫精確名詞（繁體中文或英文）：</label>
                <input
                  type="text"
                  value={answers[questions[currentIdx].id] || ''}
                  onChange={(e) => handleAnswerOption(e.target.value)}
                  placeholder="請在此輸入答案字眼..."
                  className="w-full bg-[#0d1222] border border-gray-800 focus:border-violet-500 focus:outline-none p-2.5 rounded-lg text-xs text-gray-200 transition mt-1"
                />
              </div>
            ) : questions[currentIdx].options ? (
              <div className="space-y-3">
                {questions[currentIdx].type === 'multi' && (
                  <p className="text-[11px] text-violet-400 font-medium">
                    📝 此題為多選題，點擊選項可選取多個答案（多選答案會自動以逗號隔開）。目前已選：
                    <span className="font-mono bg-violet-950 px-2 py-0.5 rounded text-violet-300 ml-1">
                      {answers[questions[currentIdx].id] || '(未選)'}
                    </span>
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[currentIdx].options.map((opt) => {
                    const letter = opt.charAt(0);
                    const q = questions[currentIdx];
                    const isMulti = q.type === 'multi';
                    const isChecked = isMulti
                      ? (answers[q.id] || '').split(',').map(s => s.trim().toUpperCase()).includes(letter)
                      : (answers[q.id] || '') === letter;

                    const handleOptionToggle = () => {
                      if (isMulti) {
                        let list = (answers[q.id] || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                        if (list.includes(letter)) {
                          list = list.filter(x => x !== letter);
                        } else {
                          list.push(letter);
                        }
                        list.sort();
                        setAnswers({
                          ...answers,
                          [q.id]: list.join(','),
                        });
                      } else {
                        handleAnswerOption(letter);
                      }
                    };

                    return (
                      <button
                        key={opt}
                        onClick={handleOptionToggle}
                        className={`text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${
                          isChecked
                            ? 'bg-violet-950/40 border-violet-500 text-violet-200 shadow-md shadow-violet-950/25'
                            : 'bg-[#0f1422] border-gray-850 hover:border-gray-800 text-gray-300'
                        }`}
                      >
                        <span><LatexRenderer text={opt} /></span>
                        {isChecked && <span className="w-2 h-2 rounded-full bg-violet-400"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-1 bg-[#0b0f19] p-4 rounded-xl border border-gray-850/60">
                <label className="text-[11px] text-gray-400 font-bold">請填入大寫字母代號（若是多選題，以英文逗號分隔，比如 A,B）：</label>
                <input
                  type="text"
                  value={answers[questions[currentIdx].id] || ''}
                  onChange={(e) => handleAnswerOption(e.target.value)}
                  placeholder="例如 A 或 A,B..."
                  className="w-full bg-[#0d1222] border border-gray-800 focus:border-violet-500 focus:outline-none p-2.5 rounded-lg text-xs text-gray-200 transition font-mono uppercase mt-1"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-gray-900 pt-5 mt-4">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIdx === 0}
              className="bg-gray-900 hover:bg-gray-850 disabled:opacity-30 border border-gray-820 text-gray-300 rounded-xl px-4 py-2 text-xs font-bold transition"
            >
              上一題
            </button>
            
            <div className="text-xs text-gray-500 font-mono">
              答對概念會減少錯題頻次，答錯會主動入庫
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition"
              >
                下一題
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950/20"
              >
                <Check className="w-4 h-4" />
                <span>結束並交卷評比</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* 3. 考試結束：顯示綜合戰報與學術分析 (Active Exam Results) */}
      {examStarted && examFinished && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Scores Overview banner card */}
          <div className="bg-gradient-to-r from-violet-950/30 via-[#090d16] to-[#090d16] border border-gray-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] bg-violet-950 text-violet-400 border border-violet-850 px-2 py-0.5 rounded font-mono font-bold">
                COMPLETED
              </span>
              <h3 className="text-xl font-bold mt-1.5 text-gray-100 flex items-center gap-1.5">
                大考戰報：大腦控制平面綜合特測完成！
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                所有 30 道試題已校驗核備完。做錯的 {examMistakesList.length} 道難題已自適應登載入庫。
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-820 self-stretch md:self-auto justify-between">
              <div className="text-center px-4">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Exam Score</span>
                <strong className={`text-3xl font-extrabold font-mono ${totalScore >= 80 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {totalScore}%
                </strong>
              </div>
              <div className="w-1 px-0.5 bg-gray-800 h-10"></div>
              <div className="text-center px-4">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Mastery Status</span>
                <span className={`text-xs font-bold block mt-1.5 ${totalScore >= 80 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {totalScore >= 80 ? '✅ 及格已達標' : '❌ 未及格需再戰'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* a. 各 Module 得分細目 (7 cols) */}
            <div className="bg-[#090d16] border border-gray-850 p-5 rounded-2xl lg:col-span-7">
              <h3 className="text-sm font-bold text-gray-200 border-b border-gray-900 pb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>本次考試十大模組大沙盤對標分析</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {(Object.entries(moduleCorrectCount) as [string, number][]).map(([mid, correct]) => {
                  const ratio = Math.round((correct / 3) * 100);
                  return (
                    <div key={mid} className="bg-[#0f1422] p-3 rounded-xl border border-gray-850 hover:border-gray-800 transition">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-300 truncate">{moduleShortTitles[mid] || mid}</span>
                        <span className="font-mono font-bold text-gray-400">{correct} / 3 題</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ratio === 100 ? 'bg-emerald-400' : ratio >= 60 ? 'bg-blue-400' : 'bg-rose-500'}`}
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                        <span className={`font-mono text-[10px] shrink-0 font-bold ${ratio === 100 ? 'text-emerald-400' : ratio >= 60 ? 'text-blue-400' : 'text-rose-500'}`}>
                          {ratio}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* b. 推薦複習路徑 (5 cols) */}
            <div className="bg-[#090d16] border border-gray-850 p-5 rounded-2xl lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-200 border-b border-gray-900 pb-2">
                  🗺️ 本次考試自適應推薦複習路徑
                </h3>
              </div>

              {examMistakesList.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-6">
                  ✨ 完美！答錯題數為 0，神功初成，已無任何路徑需要推薦！
                </div>
              ) : (
                <div className="space-y-3 mt-4 flex-1">
                  {/* Find modules with highest mistake rates */}
                  {(Object.entries(moduleCorrectCount) as [string, number][])
                    .filter(([mid, correct]) => correct < 3)
                    .sort((a, b) => a[1] - b[1]) // Mistakes high first (correct lower first)
                    .slice(0, 3)
                    .map(([mid, correct], idx) => (
                      <div key={mid} className="bg-[#0f1422] p-3 rounded-xl border border-gray-850 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-mono text-[10px] font-bold mt-0.5 shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-200">
                            加強：{moduleShortTitles[mid] || mid}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                            您在本核心模組下僅答照對了 {correct}/3 題。
                            建議回到該模組專欄，重新調試互動模擬器以深化理解。
                          </p>
                          <button
                            onClick={() => onNavigateToModule(mid)}
                            className="text-[9px] text-violet-400 font-bold hover:text-violet-300 mt-1.5 flex items-center gap-0.5"
                          >
                            <span>回到該模組</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setExamStarted(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  返回學會指標
                </button>
                <button
                  onClick={generateExamPaper}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>再度挑戰新大考</span>
                </button>
              </div>
            </div>

          </div>

          {/* c. 錯題大解剖 (If they made mistakes) */}
          {examMistakesList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>本次考試錯題深度檢核 ({examMistakesList.length} 題)</span>
              </h3>

              <div className="space-y-3">
                {examMistakesList.map(({ q, userAnswer }) => (
                  <div key={q.id} className="bg-[#090d16] p-5 rounded-2xl border border-gray-850 flex flex-col gap-2.5">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-red-950 text-red-400 px-2 rounded font-mono font-bold text-[10px]">
                        {(q.moduleId || '').replace('module-', 'M').toUpperCase()} ERROR
                      </span>
                      <span className="text-gray-400 text-[11px]">觀念：{q.conceptBadge}</span>
                    </div>

                    <div className="text-xs text-gray-200 font-medium whitespace-pre-line leading-relaxed">
                      <LatexRenderer text={q.questionText} />
                    </div>

                    <div className="bg-[#0e1322] p-3 rounded-lg border border-gray-880/40 text-[11.5px] space-y-1 mt-1 text-gray-400">
                      <p>
                        • <strong className="text-rose-400">您的答覆：</strong> 
                        <span className="font-mono text-gray-300">{userAnswer || '(空白)'}</span>
                      </p>
                      <p>
                        • <strong className="text-emerald-400">正確答案：</strong> 
                        <span className="font-bold font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                          {q.correctAnswer}
                        </span>
                      </p>
                      
                      <div className="border-t border-gray-900 pt-2 mt-2 space-y-1 text-gray-400 text-[11px] leading-relaxed">
                        <strong className="text-amber-500 font-bold block">名師解析：</strong>
                        <div className="whitespace-pre-line"><LatexRenderer text={q.explanation} /></div>
                        {q.choicesWrongExplanation && q.type === 'single' && (
                          <div className="mt-2 border-t border-gray-900 pt-1 text-gray-500">
                            <strong>🚫 其餘選項說明：</strong>
                            {Object.entries(q.choicesWrongExplanation).map(([opt, errExplanation]) => (
                              <p key={opt}>· <span className="text-gray-400 font-bold">{opt}：</span> {errExplanation}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-blue-400 font-bold mt-1.5">
                          ↳ 建議回到：【{q.reviewSection}】重讀
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
