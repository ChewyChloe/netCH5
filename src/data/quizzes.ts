/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quiz } from '../types';
import { quizzesPart1 } from './quizzes_part1';
import { quizzesPart2 } from './quizzes_part2';
import { quizzesPart3 } from './quizzes_part3';
import { quizzesPart4 } from './quizzes_part4';

export const quizzesData: Record<string, Quiz> = {
  ...quizzesPart1,
  ...quizzesPart2,
  ...quizzesPart3,
  ...quizzesPart4,
};
