/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Quiz, QuizQuestion, UserProgress } from '../types';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight, BookOpen } from 'lucide-react';
import LatexRenderer from './LatexRenderer';

interface QuizViewProps {
  quiz: Quiz;
  moduleTitle: string;
  progress: UserProgress;
  onUpdateQuizScore: (score: number) => void;
  onNavigateToModule: () => void;
}

export default function QuizView({
  quiz,
  moduleTitle,
  progress,
  onUpdateQuizScore,
  onNavigateToModule,
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillAnswer, setFillAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // 學生送出答案
  const handleSubmit = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    let studentAns = '';

    if (currentQuestion.type === 'fill') {
      studentAns = fillAnswer.trim();
      isCorrect = studentAns === currentQuestion.correctAnswer ||
        currentQuestion.correctAnswer.toLowerCase() === studentAns.toLowerCase() ||
        studentAns.includes(currentQuestion.correctAnswer);
    } else if (currentQuestion.type === 'multi') {
      studentAns = selectedAnswer;
      const studentArr = studentAns.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      const correctArr = currentQuestion.correctAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      isCorrect = studentArr === correctArr;
    } else {
      studentAns = selectedAnswer;
      // 在 single 和 scenario 題型，以選項 A/B/C/D 比對
      isCorrect = studentAns.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ||
        studentAns.startsWith(currentQuestion.correctAnswer) ||
        currentQuestion.correctAnswer.startsWith(studentAns);
    }

    if (isCorrect) {
      setScore((prev) => prev + 20); // 因為有 5 題，每題 20 分
    } else {
      setWrongQuestions((prev) => [...prev, currentQuestion]);
    }

    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelectedAnswer('');
    setFillAnswer('');

    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // 測驗結束
      const finalScore = score + (
        // 剛才送出的最後一題是否 Correct
        checkLastQuestionCorrect() ? 20 : 0
      );
      onUpdateQuizScore(finalScore);
      setQuizFinished(true);
    }
  };

  const checkLastQuestionCorrect = (): boolean => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'fill') {
      return fillAnswer.trim().toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase());
    }
    if (currentQuestion.type === 'multi') {
      const studentArr = selectedAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      const correctArr = currentQuestion.correctAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      return studentArr === correctArr;
    }
    return selectedAnswer.startsWith(currentQuestion.correctAnswer) ||
      currentQuestion.correctAnswer.startsWith(selectedAnswer);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setFillAnswer('');
    setSubmitted(false);
    setScore(0);
    setWrongQuestions([]);
    setQuizFinished(false);
  };

  // 渲染選項
  const renderInputArea = () => {
    if (
      currentQuestion.type === 'single' ||
      currentQuestion.type === 'boolean' ||
      currentQuestion.type === 'scenario' ||
      currentQuestion.type === 'multi'
    ) {
      const options = currentQuestion.options || [];
      const isMulti = currentQuestion.type === 'multi';

      return (
        <div className="flex flex-col gap-2 pt-2">
          {isMulti && (
            <p className="text-[11px] text-blue-400 font-medium mb-1">
              📝 此題為多選題，點擊選項可選取多個答案（多選答案會自動以逗號隔開）。
            </p>
          )}
          {options.map((opt) => {
            const letter = opt.charAt(0);
            const isSelected = isMulti
              ? selectedAnswer.split(',').map(s => s.trim().toUpperCase()).includes(letter)
              : selectedAnswer === opt || opt.startsWith(selectedAnswer) && selectedAnswer !== '';

            const isOptCorrectAnswer = isMulti
              ? currentQuestion.correctAnswer.split(',').map(s => s.trim().toUpperCase()).includes(letter)
              : opt.startsWith(currentQuestion.correctAnswer);

            const handleOptionClick = () => {
              if (isMulti) {
                let list = selectedAnswer.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                if (list.includes(letter)) {
                  list = list.filter(x => x !== letter);
                } else {
                  list.push(letter);
                }
                list.sort();
                setSelectedAnswer(list.join(','));
              } else {
                setSelectedAnswer(opt);
              }
            };

            return (
              <button
                key={opt}
                disabled={submitted}
                onClick={handleOptionClick}
                className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                  submitted
                    ? isOptCorrectAnswer
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : isSelected
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                      : 'bg-gray-900/40 border-gray-900 text-gray-500'
                    : isSelected
                    ? 'bg-blue-950/50 border-blue-500/70 text-blue-200 shadow-lg shadow-blue-500/5'
                    : 'bg-[#0f1422] border-gray-800 hover:border-gray-700 text-gray-300'
                }`}
              >
                <span><LatexRenderer text={opt} /></span>
                {isSelected && !submitted && (
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                )}
                {submitted && isOptCorrectAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                {submitted && isSelected && !isOptCorrectAnswer && (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      );
    } else if (currentQuestion.type === 'fill') {
      return (
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-[11px] text-gray-400 font-mono tracking-wider">輸入你的答案：</label>
          <input
            type="text"
            disabled={submitted}
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="請輸入關鍵字（例如：轉發表）..."
            className="w-full bg-[#0f1422] border border-gray-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-xs text-gray-200 transition"
          />
        </div>
      );
    }
    return null;
  };

  // 當前題目的正確判定
  const isSelectedAnswerCorrect = () => {
    if (currentQuestion.type === 'fill') {
      return fillAnswer.trim().toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase());
    }
    if (currentQuestion.type === 'multi') {
      const studentArr = selectedAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      const correctArr = currentQuestion.correctAnswer.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
      return studentArr === correctArr;
    }
    return selectedAnswer.startsWith(currentQuestion.correctAnswer) ||
      currentQuestion.correctAnswer.startsWith(selectedAnswer);
  };

  if (quizFinished) {
    const finalCalculatedScore = Math.min(100, Math.max(0, score));
    const passed = finalCalculatedScore >= 60;

    return (
      <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-6 flex flex-col gap-6 text-gray-200">
        <div className="text-center pb-4 border-b border-gray-900">
          <span className="text-xs font-bold text-amber-500 tracking-widest uppercase">
            Quiz Result Finished
          </span>
          <h2 className="text-xl font-bold mt-1 text-gray-200">
            {moduleTitle} 隨堂評測成果
          </h2>
        </div>

        {/* 成績大圖卡 */}
        <div className="flex flex-col md:flex-row items-center justify-around bg-[#0f1422] border border-gray-800 p-6 rounded-xl gap-6">
          <div className="text-center">
            <div className={`text-4xl md:text-5xl font-mono font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {finalCalculatedScore} 分
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
              {passed ? '🎉 順利及格 (PASSED)' : '⚠️ 需再努力 (FAILED)'}
            </div>
          </div>

          <div className="text-xs max-w-sm text-gray-400 space-y-1.5 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6 leading-relaxed">
            <p>• 評測標準包含：單選題、是非題、填空題、情境題。</p>
            <p>• 滿分 100 分，及格標準為 60 分（答對至少 3 題）。</p>
            <p>• 你的最高紀錄會自動更新到個人看板成就系統中！</p>
          </div>
        </div>

        {/* 薄弱觀念複習建議卡片 */}
        {wrongQuestions.length > 0 ? (
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              🎯 以下為你本次錯題的精準複習引導 (錯題回顧)：
            </h3>
            <div className="space-y-3">
              {wrongQuestions.map((q) => (
                <div key={q.id} className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-rose-900/30 text-rose-400 border border-rose-800/40 px-2 py-0.5 rounded-full font-bold">
                      錯題 · {q.conceptBadge}
                    </span>
                    <button
                      onClick={onNavigateToModule}
                      className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-blue-950/30 hover:bg-blue-950/60 px-2.5 py-1 rounded transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>回到學術模組複習</span>
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-gray-300 leading-relaxed mt-1">
                    {q.questionText}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed bg-[#0b0f19]/80 px-3 py-2 rounded-lg border border-gray-900 mt-1_5">
                    <strong className="text-rose-400">複習引導段落：</strong>
                    推薦回去學習：<span className="text-blue-300 font-bold font-sans">【{q.reviewSection}】</span>。解析指引：{q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl flex items-center gap-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-medium">
              非常傑出！你答對了所有隨堂評測問題。你對本模組控制平面的架構以及演算法邏輯掌握得極其透徹！
            </div>
          </div>
        )}

        {/* 底部按鍵控制 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新測驗</span>
          </button>
          <button
            onClick={onNavigateToModule}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
          >
            <span>返回本模組學習面</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col gap-5 text-gray-200">
      {/* 頂部進度、題號 */}
      <div className="flex items-center justify-between border-b border-gray-900 pb-3">
        <div>
          <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full font-bold">
            PROGRESSIVE ASSESSMENTS
          </span>
          <h3 className="text-sm font-bold text-gray-300 mt-1 uppercase">
            {quiz.moduleId === 'module-1' ? 'M1 隨堂評測' : quiz.moduleId === 'module-2' ? 'M2 隨堂評測' : 'M3 隨堂評測'}
          </h3>
        </div>
        <div className="text-xs font-mono text-gray-400">
          題目 <span className="text-blue-400 font-bold">{currentQuestionIndex + 1}</span> / 5
        </div>
      </div>

      {/* 問題文本卡 */}
      <div className="bg-[#0f1422] border border-gray-850 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9.5px] bg-gray-900 text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded font-mono font-bold">
            {currentQuestion.type === 'single'
              ? '單選題 Single Choice'
              : currentQuestion.type === 'boolean'
              ? '是非題 Yes/No Question'
              : currentQuestion.type === 'fill'
              ? '填空題 Fill In Blank'
              : '情境分析題 Scenario Problem'}
          </span>
          <span className="text-[9.5px] text-gray-500 font-mono tracking-wide">
            觀念：{currentQuestion.conceptBadge}
          </span>
        </div>
        <div className="text-xs md:text-sm leading-relaxed text-gray-200 font-sans font-medium whitespace-pre-line">
          <LatexRenderer text={currentQuestion.questionText} />
        </div>
      </div>

      {/* 答題輸入區域 */}
      {renderInputArea()}

      {/* 答題判斷解析面板 */}
      {submitted && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-1.5 mt-2 transition animate-fade-in ${
            isSelectedAnswerCorrect()
              ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-100'
              : 'bg-rose-950/20 border-rose-900/60 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase font-sans">
            {isSelectedAnswerCorrect() ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">🎉 回答正確！得分 20 分！</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 font-bold">⚠️ 回答錯誤！</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
            <strong>正確答案：</strong>
            <span className="text-emerald-400 font-bold font-mono">
              {currentQuestion.type === 'fill' ? currentQuestion.correctAnswer : currentQuestion.correctAnswer.toUpperCase()}
            </span>
          </p>
          <div className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-800 pt-2 mt-1">
            <strong>解析提示：</strong>
            <LatexRenderer text={currentQuestion.explanation} />
          </div>
        </div>
      )}

      {/* 操控按鍵列 */}
      <div className="flex justify-end pt-3 border-t border-gray-900 gap-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={
              currentQuestion.type === 'fill' ? !fillAnswer : !selectedAnswer
            }
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>送出作答 Submit</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
          >
            <span>
              {currentQuestionIndex + 1 < quiz.questions.length ? '下一題' : '查看統計評測報告'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
