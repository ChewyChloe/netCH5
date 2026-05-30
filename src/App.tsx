/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProgress } from './types';
import { lessonsData } from './data/lessons';
import { quizzesData } from './data/quizzes';
import HomeView from './components/HomeView';
import ModuleListView from './components/ModuleListView';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import DijkstraSimulator from './components/DijkstraSimulator';
import DistanceVectorSimulator from './components/DistanceVectorSimulator';
import ProgressTracker from './components/ProgressTracker';
import ReviewPage from './components/ReviewPage';
import FinalExamPage from './components/FinalExamPage';
import { Network, Home, BookOpen, Compass, Cpu, HelpCircle, Award, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'cn_control_plane_progress_mvp';

const INITIAL_PROGRESS: UserProgress = {
  completedLessons: [],
  quizHighScores: {},
  notes: {},
};

export default function App() {
  // 1. 載入本機進度
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse progress from localStorage:', e);
    }
    return INITIAL_PROGRESS;
  });

  // 2. 同步儲存本機進度
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
  }, [progress]);

  // 控制當前視圖分流路由
  // 'home' | 'modules' | 'module-1' | 'module-2' | 'module-3' | 'module-4' | 'quiz-1' | 'quiz-2' | 'quiz-3' | 'quiz-4' | 'simulator'
  const [activeView, setActiveView] = useState<string>('home');
  const [simType, setSimType] = useState<'dijkstra' | 'dv'>('dijkstra');

  // 全局 Reset 進度功能
  const handleResetProgress = () => {
    if (window.confirm('確定要清除所有研讀進度、筆記與測驗記錄嗎？本動作不可回復！')) {
      setProgress(INITIAL_PROGRESS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setActiveView('home');
    }
  };

  // 標記某章研讀完畢
  const handleCompleteLesson = (lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  };

  // 儲存或更新手寫筆記
  const handleUpdateNote = (lessonId: string, text: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [lessonId]: text,
      },
    }));
  };

  // 更新測驗成績更高分紀錄
  const handleUpdateQuizScore = (lessonId: string, score: number) => {
    setProgress((prev) => {
      const currentHigh = prev.quizHighScores[lessonId] || 0;
      return {
        ...prev,
        quizHighScores: {
          ...prev.quizHighScores,
          [lessonId]: Math.max(currentHigh, score),
        },
      };
    });
  };

  // 分流渲染主視圖
  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeView
            progress={progress}
            onNavigateToModule={(mid) => setActiveView(mid)}
            onNavigateToSimulator={() => setActiveView('simulator')}
          />
        );
      case 'modules':
        return (
          <ModuleListView
            progress={progress}
            onNavigateToModule={(mid) => setActiveView(mid)}
            onNavigateToQuiz={(mid) => setActiveView(mid.replace('module-', 'quiz-'))}
          />
        );
      case 'module-1':
      case 'module-2':
      case 'module-3':
      case 'module-4':
      case 'module-5':
      case 'module-6':
      case 'module-7':
      case 'module-8':
      case 'module-9':
      case 'module-10': {
        const lesson = lessonsData.find((l) => l.id === activeView);
        if (!lesson) return <div className="text-rose-450 text-xs">查無模組章節數據。</div>;
        return (
          <LessonView
            lesson={lesson}
            progress={progress}
            onUpdateCompleted={() => handleCompleteLesson(lesson.id)}
            onUpdateNote={(txt) => handleUpdateNote(lesson.id, txt)}
            onStartQuiz={() => setActiveView(lesson.id.replace('module-', 'quiz-'))}
            onIncrementSimCount={(type) => {
              setProgress((prev) => {
                const key = 
                  type === 'dijkstra' ? 'dijkstraSimCount' :
                  type === 'dv' ? 'dvSimCount' :
                  type === 'bgp' ? 'bgpSimCount' :
                  type === 'sdn' ? 'sdnSimCount' :
                  'tracerouteSimCount';
                const currentVal = prev[key] || 0;
                return {
                  ...prev,
                  [key]: currentVal + 1,
                };
              });
            }}
          />
        );
      }
      case 'quiz-1':
      case 'quiz-2':
      case 'quiz-3':
      case 'quiz-4':
      case 'quiz-5':
      case 'quiz-6':
      case 'quiz-7':
      case 'quiz-8':
      case 'quiz-9':
      case 'quiz-10': {
        const mKey = activeView.replace('quiz-', 'module-');
        const quiz = quizzesData[mKey];
        const lsData = lessonsData.find((l) => l.id === mKey);
        if (!quiz || !lsData) return <div className="text-rose-450 text-xs">查無測驗評測資料。</div>;
        return (
          <QuizView
            quiz={quiz}
            moduleTitle={lsData.title}
            progress={progress}
            onUpdateQuizScore={(score) => handleUpdateQuizScore(mKey, score)}
            onNavigateToModule={() => setActiveView(mKey)}
          />
        );
      }
      case 'simulator':
        return (
          <div className="flex flex-col gap-6">
            {/* 互動沙盒分流 Tab 控制項 */}
            <div className="flex border-b border-gray-800 gap-2">
              <button
                id="tab-btn-dijkstra"
                onClick={() => setSimType('dijkstra')}
                className={`px-4 py-2.5 text-xs md:text-sm font-bold transition-all rounded-t-xl border-b-2 ${
                  simType === 'dijkstra'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Dijkstra 連結狀態模擬
              </button>
              <button
                id="tab-btn-dv"
                onClick={() => setSimType('dv')}
                className={`px-4 py-2.5 text-xs md:text-sm font-bold transition-all rounded-t-xl border-b-2 ${
                  simType === 'dv'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Distance Vector 距離向量模擬
              </button>
            </div>

            {simType === 'dijkstra' ? (
              <>
                <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl text-xs md:text-sm text-gray-300 leading-relaxed font-sans">
                  <span className="font-bold text-emerald-400">💡 航海教練沙盒指引 (Dijkstra)：</span>
                  本獨立沙盒為完整 6 節點拓撲 Dijkstra 計算模擬核心。你可以在這裏隨時點擊各個網路邊上的「權重核心」變更鏈路成本 c(w,v)，或者變更不同的來源節點 u-z 作為首發起點。向右挑戰「隨試隨評」將大幅強化演算法手動推估能力！
                </div>
                <DijkstraSimulator />
              </>
            ) : (
              <>
                <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl text-xs md:text-sm text-gray-300 leading-relaxed font-sans w-full">
                  <span className="font-bold text-indigo-400">💡 航海教練沙盒指引 (Distance Vector & Bellman-Ford)：</span>
                  這是一個具有完整分輪演算、動態封包消息飛行、隨機鏈路成本修改與 Count-to-Infinity 還原模擬的 DV 控制平面引擎。你可以靈活選擇「好消息迅速收斂」或「壞消息惡性繞路」劇本，並即時在圖上點擊任何一條綠、黃邊在對話窗修改長度，考驗你的 Bellman-Ford 方程式心算能力！
                </div>
                <DistanceVectorSimulator />
              </>
            )}
          </div>
        );
      case 'review':
        return (
          <ReviewPage
            progress={progress}
            onNavigateToModule={(mid) => setActiveView(mid)}
            onNavigateToSimulator={() => setActiveView('simulator')}
          />
        );
      case 'final-exam':
        return (
          <FinalExamPage
            progress={progress}
            onUpdateHighScore={(score) => {
              setProgress((prev) => {
                const currentHigh = prev.finalExamHighScore || 0;
                return {
                  ...prev,
                  finalExamHighScore: Math.max(currentHigh, score),
                };
              });
            }}
            onNavigateToModule={(mid) => setActiveView(mid)}
            onNavigateToSimulator={() => {
              setActiveView('simulator');
              setSimType('dijkstra');
            }}
          />
        );
      default:
        return <div className="text-rose-440 text-xs">路由解析出錯。</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-150 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 頂部 Header & 導航 */}
      <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-b border-gray-800/85">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-gradient-to-tr from-blue-700 to-emerald-500 rounded-lg text-white transition-transform group-hover:scale-105">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-100 text-sm md:text-base group-hover:text-emerald-400 transition font-sans tracking-tight">
                Computer Network
              </span>
              <span className="hidden sm:inline text-xs text-gray-500 font-medium ml-1.5 font-mono">
                控制平面互動學習系統
              </span>
            </div>
          </div>

          {/* 導航分流按紐組 */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'home'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">學習首頁</span>
            </button>

            <button
              onClick={() => setActiveView('modules')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView.startsWith('module-') || activeView === 'modules' || activeView.startsWith('quiz-')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>學術模組</span>
            </button>

            <button
              onClick={() => setActiveView('simulator')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'simulator'
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-250 hover:bg-gray-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>互動沙盒</span>
            </button>

            <button
              onClick={() => setActiveView('review')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'review'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30'
                  : 'text-gray-400 hover:text-gray-250 hover:bg-gray-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>錯題回顧</span>
            </button>

            <button
              onClick={() => setActiveView('final-exam')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'final-exam'
                  ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30'
                  : 'text-gray-400 hover:text-gray-250 hover:bg-gray-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-violet-400" />
              <span>總複習測驗</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 主體 Content 區 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col gap-6 animate-fade-in">
        {/* 動態麵包屑輔助 (小字軌跡) */}
        <div id="syllabus-breadcrumb" className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <span>ROOT NAVIGATION</span>
          <span>/</span>
          <span className="text-gray-400">{activeView}</span>
        </div>

        {/* 主視圖分流分塊 */}
        {renderMainContent()}

        {/* 下方：個人成就進度區 (只在首頁或模組中心時完整陳列) */}
        {(activeView === 'home' || activeView === 'modules') && (
          <div className="mt-4 pt-4 border-t border-gray-900">
            <ProgressTracker
              progress={progress}
              onResetProgress={handleResetProgress}
            />
          </div>
        )}
      </main>

      {/* 頁尾 */}
      <footer className="bg-gray-950 border-t border-gray-900/40 text-gray-600 py-6 text-center text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© 2026 電腦網路學術控制平面互動引導系統. All rights reserved.</p>
          <div className="flex gap-4 text-[11px] font-mono">
            <span>Intra-AS (OSPF)</span>
            <span>·</span>
            <span>Inter-AS (BGP)</span>
            <span>·</span>
            <span>SDN Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
