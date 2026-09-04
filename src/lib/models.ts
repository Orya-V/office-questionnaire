import db from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Survey, Question, Answer, ResultRange } from './schema';

export interface SurveyWithDetails extends Omit<Survey, 'questions'> {
  questions: (Question & { answers: Answer[] })[];
  resultRanges: ResultRange[];
  createdAt?: string;
}

export const surveyModels = {
  getAll(): SurveyWithDetails[] {
    const surveys = db.prepare('SELECT * FROM surveys ORDER BY createdAt DESC').all() as any[];
    return surveys.map(survey => ({
      ...survey,
      googleSheetsUrl: survey.googleSheetsUrl || '',
      showPoints: !!survey.showPoints,
      questions: this.getQuestions(survey.id),
      resultRanges: this.getResultRanges(survey.id),
    }));
  },

  getById(id: string): SurveyWithDetails | null {
    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(id) as any;
    if (!survey) return null;
    return {
      ...survey,
      googleSheetsUrl: survey.googleSheetsUrl || '',
      showPoints: !!survey.showPoints,
      questions: this.getQuestions(survey.id),
      resultRanges: this.getResultRanges(survey.id),
    };
  },

  create(data: Omit<SurveyWithDetails, 'id' | 'createdAt'>): SurveyWithDetails {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO surveys (id, title, googleSheetsUrl, showPoints)
      VALUES (?, ?, ?, ?)
    `).run(id, data.title, data.googleSheetsUrl || null, data.showPoints ? 1 : 0);

    const questions = data.questions.map((q, index) => {
      const questionId = uuidv4();
      db.prepare(`
        INSERT INTO questions (id, surveyId, text, isRequired, orderIndex)
        VALUES (?, ?, ?, ?, ?)
      `).run(questionId, id, q.text, q.isRequired ? 1 : 0, index);

      q.answers.forEach((a, ansIndex) => {
        db.prepare(`
          INSERT INTO answers (id, questionId, text, points, orderIndex)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), questionId, a.text, a.points, ansIndex);
      });

      return { ...q, id: questionId, answers: q.answers.map(a => ({ ...a, id: uuidv4() })) };
    });

    const resultRanges = data.resultRanges.map((r) => {
      const rangeId = uuidv4();
      db.prepare(`
        INSERT INTO resultRanges (id, surveyId, minScore, maxScore, resultText, customFieldLabel)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(rangeId, id, r.minScore, r.maxScore, r.resultText, r.customFieldLabel || null);
      return { ...r, id: rangeId };
    });

    return {
      id,
      title: data.title,
      googleSheetsUrl: data.googleSheetsUrl || '',
      showPoints: data.showPoints,
      questions,
      resultRanges,
    };
  },

  update(id: string, data: Partial<SurveyWithDetails>): SurveyWithDetails | null {
    const existing = this.getById(id);
    if (!existing) return null;

    db.prepare(`
      UPDATE surveys 
      SET title = ?, googleSheetsUrl = ?, showPoints = ?
      WHERE id = ?
    `).run(data.title ?? existing.title, data.googleSheetsUrl ?? existing.googleSheetsUrl, data.showPoints ? 1 : 0, id);

    db.prepare('DELETE FROM answers WHERE questionId IN (SELECT id FROM questions WHERE surveyId = ?)').run(id);
    db.prepare('DELETE FROM questions WHERE surveyId = ?').run(id);
    db.prepare('DELETE FROM resultRanges WHERE surveyId = ?').run(id);

    if (data.questions) {
      data.questions.forEach((q, index) => {
        const questionId = uuidv4();
        db.prepare(`
          INSERT INTO questions (id, surveyId, text, isRequired, orderIndex)
          VALUES (?, ?, ?, ?, ?)
        `).run(questionId, id, q.text, q.isRequired ? 1 : 0, index);

        q.answers.forEach((a, ansIndex) => {
          db.prepare(`
            INSERT INTO answers (id, questionId, text, points, orderIndex)
            VALUES (?, ?, ?, ?, ?)
          `).run(uuidv4(), questionId, a.text, a.points, ansIndex);
        });
      });
    }

    if (data.resultRanges) {
      data.resultRanges.forEach((r) => {
        db.prepare(`
          INSERT INTO resultRanges (id, surveyId, minScore, maxScore, resultText, customFieldLabel)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), id, r.minScore, r.maxScore, r.resultText, r.customFieldLabel || null);
      });
    }

    return this.getById(id);
  },

  delete(id: string): boolean {
    try {
      db.prepare('DELETE FROM surveyResults WHERE surveyId = ?').run(id);
      db.prepare('DELETE FROM resultRanges WHERE surveyId = ?').run(id);
      db.prepare('DELETE FROM answers WHERE questionId IN (SELECT id FROM questions WHERE surveyId = ?)').run(id);
      db.prepare('DELETE FROM questions WHERE surveyId = ?').run(id);
      db.prepare('DELETE FROM surveys WHERE id = ?').run(id);
      return true;
    } catch {
      return false;
    }
  },

  getQuestions(surveyId: string): (Question & { answers: Answer[] })[] {
    const questions = db.prepare('SELECT * FROM questions WHERE surveyId = ? ORDER BY orderIndex').all(surveyId) as any[];
    return questions.map(q => ({
      ...q,
      isRequired: !!q.isRequired,
      answers: db.prepare('SELECT * FROM answers WHERE questionId = ? ORDER BY orderIndex').all(q.id) as Answer[],
    }));
  },

  getResultRanges(surveyId: string): ResultRange[] {
    return db.prepare('SELECT * FROM resultRanges WHERE surveyId = ? ORDER BY minScore').all(surveyId) as ResultRange[];
  },
};

export const resultModels = {
  create(surveyId: string, totalScore: number, rangeId: string | null, customFieldAnswer: string | null, userAnswers: { questionId: string; answerId: string | null; answerText: string; points: number }[]) {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO surveyResults (id, surveyId, totalScore, rangeId, customFieldAnswer)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, surveyId, totalScore, rangeId, customFieldAnswer);

    userAnswers.forEach(ua => {
      db.prepare(`
        INSERT INTO userAnswers (id, resultId, questionId, answerId, answerText, points)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), id, ua.questionId, ua.answerId, ua.answerText, ua.points);
    });

    return id;
  },

  getBySurveyId(surveyId: string) {
    return db.prepare(`
      SELECT sr.*, rr.resultText, rr.customFieldLabel
      FROM surveyResults sr
      LEFT JOIN resultRanges rr ON sr.rangeId = rr.id
      WHERE sr.surveyId = ?
      ORDER BY sr.completedAt DESC
    `).all(surveyId) as any[];
  },

  getUserAnswers(resultId: string) {
    return db.prepare('SELECT * FROM userAnswers WHERE resultId = ?').all(resultId) as any[];
  },
};
