'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/Header';

interface Question {
  id: string;
  text: string;
  isRequired: boolean;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  points: number;
}

interface ResultRange {
  id: string;
  minScore: number;
  maxScore: number;
  resultText: string;
  customFieldLabel?: string;
}

interface Survey {
  id: string;
  title: string;
  showPoints: boolean;
  questions: Question[];
  resultRanges: ResultRange[];
}

export default function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ totalScore: number; resultText: string; customFieldLabel?: string } | null>(null);
  const [customFieldAnswer, setCustomFieldAnswer] = useState('');

  useEffect(() => {
    async function fetchSurvey() {
      try {
        const res = await fetch(`/api/surveys/${resolvedParams.id}`);
        if (!res.ok) {
          throw new Error('Опрос не найден');
        }
        const data = await res.json();
        setSurvey(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSurvey();
  }, [resolvedParams.id]);

  function handleAnswerSelect(questionId: string, answerId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate required questions
    if (survey) {
      for (const q of survey.questions) {
        if (q.isRequired && !answers[q.id]) {
          setError(`Пожалуйста, ответьте на обязательный вопрос: "${q.text}"`);
          return;
        }
      }
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/surveys/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: resolvedParams.id,
          answers,
          customFieldAnswer,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка при отправке');
      }

      const data = await res.json();
      setResult({
        totalScore: data.totalScore,
        resultText: data.resultText,
        customFieldLabel: data.customFieldLabel,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#003DA5]">Загрузка опроса...</div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Ошибка</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto py-12 px-6">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-[#00A3E0] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#003DA5] mb-4">Опрос завершён!</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-4xl font-bold text-[#FFA300] mb-2">{result.totalScore} баллов</p>
              <p className="text-gray-700">{result.resultText}</p>
            </div>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-[#003DA5] text-white rounded-lg hover:bg-[#002d7a] transition-colors"
            >
              На главную
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto py-8 px-6">
        <div className="card p-8 mb-6">
          <h1 className="text-2xl font-bold text-[#003DA5] mb-2">{survey?.title}</h1>
          <p className="text-gray-600 text-sm">Ответьте на вопросы ниже</p>
        </div>

        {error && (
          <div className="card p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey?.questions.map((question, qIdx) => (
            <div key={question.id} className="card p-6 relative">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#00A3E0] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {qIdx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800 mb-1">
                    {question.text}
                    {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </p>
                </div>
              </div>

              <div className="ml-11 space-y-2">
                {question.answers.map((answer) => (
                  <label
                    key={answer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[question.id] === answer.id
                        ? 'border-[#00A3E0] bg-[#00A3E0]/5'
                        : 'border-gray-200 hover:border-[#00A3E0]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={answer.id}
                      checked={answers[question.id] === answer.id}
                      onChange={() => handleAnswerSelect(question.id, answer.id)}
                      className="w-4 h-4 text-[#00A3E0] focus:ring-[#00A3E0]"
                    />
                    <span className="flex-1 text-gray-700">{answer.text}</span>
                    {survey.showPoints && (
                      <span className="text-sm font-medium text-[#FFA300]">{answer.points} балл.</span>
                    )}
                  </label>
                ))}
              </div>

              {/* Floating "Add question" button - shown after each question for creator convenience */}
              <div className="absolute -bottom-3 right-4 opacity-0 hover:opacity-100 transition-opacity">
                <a
                  href="/my-surveys"
                  className="text-xs text-[#00A3E0] hover:text-[#008cc2]"
                  title="Вернуться к созданию опросов"
                >
                  ← К моим опросам
                </a>
              </div>
            </div>
          ))}

          {survey?.resultRanges.some(r => r.customFieldLabel) && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[#003DA5] mb-4">Дополнительная информация</h3>
              {survey.resultRanges.map(range => range.customFieldLabel && (
                <div key={range.id} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {range.customFieldLabel}
                  </label>
                  <textarea
                    value={customFieldAnswer}
                    onChange={(e) => setCustomFieldAnswer(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Ваш ответ..."
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#003DA5] text-white rounded-lg font-medium hover:bg-[#002d7a] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Отправка...' : 'Завершить опрос'}
          </button>
        </form>
      </main>
    </div>
  );
}
