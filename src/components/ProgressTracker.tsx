/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgress } from '../types';
import { Award, BookOpen, CheckCircle, RotateCcw, ShieldCheck } from 'lucide-react';

interface ProgressTrackerProps {
  progress: UserProgress;
  onResetProgress: () => void;
}

export default function ProgressTracker({ progress, onResetProgress }: ProgressTrackerProps) {
  // 計算總進度比例 (總共三個 module，測驗高分)
  const completedCount = progress.completedLessons.length;
  const averageQuizScore = Object.values(progress.quizHighScores).length > 0
    ? Math.round(Object.values(progress.quizHighScores).reduce((a, b) => a + b, 0) / Object.values(progress.quizHighScores).length)
    : 0;

  // 勳章判定
  const badges = [
    { id: 'b1', title: '探險啟航者', desc: '閱讀完成至少 1 個學習模組', achieved: completedCount >= 1 },
    { id: 'b2', title: '大腦全數解鎖', desc: '閱讀完成全部 10 個學習模組', achieved: completedCount >= 10 },
    { id: 'b3', title: '金牌工程師', desc: '在至少 1 個測驗中取得 100% 滿分', achieved: Object.values(progress.quizHighScores).some(s => s === 100) },
    { id: 'b4', title: '卓越學者', desc: '十個測驗平均成績高於 80%', achieved: averageQuizScore >= 80 && Object.keys(progress.quizHighScores).length >= 10 }
  ];

  return (
    <div className="bg-[#0f1422] border border-gray-855 rounded-2xl p-5 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-gray-200">
              個人網路成就與學習進度
            </h3>
            <p className="text-xs text-gray-400">
              學習數據全部儲存在瀏覽器本機的 localStorage 中。
            </p>
          </div>
        </div>
        <button
          onClick={onResetProgress}
          className="text-xs flex items-center gap-1 text-rose-400 hover:text-rose-300 border border-rose-900 bg-rose-950/20 hover:bg-rose-950/50 px-2.5 py-1 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重設進度</span>
        </button>
      </div>

      {/* 數據看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 課程進度 */}
        <div className="bg-gray-950/40 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              掌握學術模組
            </div>
            <div className="text-xl font-mono font-bold text-gray-200 mt-0.5">
              {completedCount} <span className="text-sm text-gray-500">/ 10</span>
            </div>
            <div className="w-32 bg-gray-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(completedCount / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 測驗表現 */}
        <div className="bg-gray-950/40 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-amber-500" />
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              平均評測成績
            </div>
            <div className="text-xl font-mono font-bold text-gray-200 mt-0.5">
              {averageQuizScore}%
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              已挑戰 {Object.keys(progress.quizHighScores).length} / 10 個測驗
            </p>
          </div>
        </div>

        {/* 進度條 */}
        <div className="bg-gray-950/40 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              實戰大腦總進度
            </div>
            <div className="text-xl font-mono font-bold text-gray-200 mt-0.5">
              {Math.round((completedCount / 10) * 50 + (averageQuizScore / 100) * 50)}%
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              結合「閱讀吸收」與「測驗滿分率」加權
            </p>
          </div>
        </div>
      </div>

      {/* 學習勳章 (Badges) */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
          已取得的學術勳章 (Milestone Badges)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 transition ${
                b.achieved
                  ? 'bg-emerald-950/25 border-emerald-900 text-emerald-100'
                  : 'bg-gray-950/10 border-gray-900 opacity-40 text-gray-500'
              }`}
            >
              <Award
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  b.achieved ? 'text-emerald-400' : 'text-gray-600'
                }`}
              />
              <div>
                <h5 className="text-xs font-bold font-sans">{b.title}</h5>
                <p className="text-[10.5px] text-gray-400 mt-0.5 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
