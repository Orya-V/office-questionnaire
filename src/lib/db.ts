import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'surveys.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    googleSheetsUrl TEXT,
    showPoints BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    surveyId TEXT NOT NULL,
    text TEXT NOT NULL,
    isRequired BOOLEAN DEFAULT 1,
    orderIndex INTEGER NOT NULL,
    FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    questionId TEXT NOT NULL,
    text TEXT NOT NULL,
    points INTEGER NOT NULL,
    orderIndex INTEGER NOT NULL,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS resultRanges (
    id TEXT PRIMARY KEY,
    surveyId TEXT NOT NULL,
    minScore INTEGER NOT NULL,
    maxScore INTEGER NOT NULL,
    resultText TEXT NOT NULL,
    customFieldLabel TEXT,
    FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS surveyResults (
    id TEXT PRIMARY KEY,
    surveyId TEXT NOT NULL,
    totalScore INTEGER NOT NULL,
    rangeId TEXT,
    customFieldAnswer TEXT,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (rangeId) REFERENCES resultRanges(id)
  );

  CREATE TABLE IF NOT EXISTS userAnswers (
    id TEXT PRIMARY KEY,
    resultId TEXT NOT NULL,
    questionId TEXT NOT NULL,
    answerId TEXT,
    answerText TEXT,
    points INTEGER,
    FOREIGN KEY (resultId) REFERENCES surveyResults(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES questions(id),
    FOREIGN KEY (answerId) REFERENCES answers(id)
  );
`);

export default db;
