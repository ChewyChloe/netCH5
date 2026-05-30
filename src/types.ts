/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Link {
  source: string;
  target: string;
  cost: number;
}

export type NodeName = 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export interface GraphTopology {
  nodes: NodeName[];
  links: Link[];
}

// 模擬器狀態 (Dijkstra)
export interface DijkstraStep {
  stepIndex: number;
  nPrime: string[];
  // 記錄每個節點的 D(v) 和 p(v)
  // key 是節點名稱，值是 { distance: number, predecessor: string | null, isSettled: boolean }
  nodesState: Record<string, {
    distance: number;
    predecessor: string | null;
    isSettled: boolean;
  }>;
  explanation: string;
  selectedNode: string | null; // 本步被選入 N' 的節點
  updatedNodes: string[];     // 被更新的鄰居節點
  notUpdatedNodes: string[];  // 沒被更新或不需要更新的節點
}

// 學習進度 (localStorage)
export interface UserProgress {
  completedLessons: string[]; // 儲存已讀完的模組ID (e.g. "module-1")
  quizHighScores: Record<string, number>; // 每個模組的最高得分比例 (100分制)
  notes: Record<string, string>; // 記錄每個模組的筆記
  finalExamHighScore?: number;   // 總複習特測最高分記錄
  dijkstraSimCount?: number;     // Dijkstra 模擬完成次數
  dvSimCount?: number;           // Distance Vector 模擬完成次數
  bgpSimCount?: number;          // BGP 模擬完成次數
  sdnSimCount?: number;          // SDN 模擬完成次數
  tracerouteSimCount?: number;   // Traceroute 模擬完成次數
}

// 課程結構
export interface LessonContent {
  id: string;
  title: string;
  objectives: string[];       // 學習目標
  vernacular: string;         // 白話解釋
  definition: string;         // 專業定義
  analogy: string;            // 生活比喻
  pdfReference: string;       // 對應 PDF 內容
  misconceptions: string[];   // 常見誤解
  interactiveTask: {          // 互動小任務
    description: string;
    requirement: string;
    placeholder: string;
    expectedKeyword: string;   // 學生輸入比對關鍵字
    successMessage: string;
  };
  summary: string;            // 本章總結
}

// 題型
export type QuizType =
  | 'single'
  | 'multi'
  | 'boolean'
  | 'fill'
  | 'matching'
  | 'sorting'
  | 'scenario'
  | 'algorithm'
  | 'calculation'
  | 'chart';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  questionText: string;
  options?: string[];         // 選項 (單選、多選、是非、情境、計算、圖表等)
  correctAnswer: string;      // 正確解析 (多選用逗號分隔，配對用連接符如 "A-1,B-2", 排序用 "1,0,2")
  explanation: string;        // 詳細解析
  conceptBadge: string;       // 對應觀念
  reviewSection: string;      // 推薦回來複習段落
  moduleId?: string;          // 對應模組ID
  
  // 新設學分回饋與結構性欄位
  choicesWrongExplanation?: Record<string, string>; // 為何其餘選項錯
  matchingLeft?: string[];    // 配對題左側 (例如：名詞)
  matchingRight?: string[];   // 配對題右側 (例如：解釋)
  sortingItems?: string[];    // 排序與演算法步驟題項目
}

export interface Quiz {
  moduleId: string;
  questions: QuizQuestion[];
}
