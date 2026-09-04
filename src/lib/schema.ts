import { z } from 'zod';

export const answerSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Текст ответа обязателен'),
  points: z.number().int().min(0),
  orderIndex: z.number().int().min(0),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Текст вопроса обязателен'),
  isRequired: z.boolean().default(true),
  orderIndex: z.number().int().min(0),
  answers: z.array(answerSchema).min(1, 'Добавьте хотя бы один вариант ответа'),
});

export const resultRangeSchema = z.object({
  id: z.string().optional(),
  minScore: z.number().int().min(0),
  maxScore: z.number().int().min(0),
  resultText: z.string().min(1, 'Текст результата обязателен'),
  customFieldLabel: z.string().optional(),
});

export const surveySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Название опроса обязательно'),
  googleSheetsUrl: z.string().url().optional().or(z.literal('')),
  showPoints: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'Добавьте хотя бы один вопрос'),
  resultRanges: z.array(resultRangeSchema).min(1, 'Добавьте хотя бы один диапазон результатов'),
});

export const submitSurveySchema = z.object({
  surveyId: z.string(),
  answers: z.record(z.string(), z.string()), // questionId -> answerId
  customFieldAnswer: z.string().optional(),
});

export type Answer = z.infer<typeof answerSchema>;
export type Question = z.infer<typeof questionSchema>;
export type ResultRange = z.infer<typeof resultRangeSchema>;
export type Survey = z.infer<typeof surveySchema>;
export type SubmitSurvey = z.infer<typeof submitSurveySchema>;
