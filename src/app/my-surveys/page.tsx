'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import type { Survey } from '@/lib/schema';

export default function MySurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyLink(id: string | undefined) {
    if (!id) return;
    const url = `${window.location.origin}/surveys/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#003DA5]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#003DA5]">Мои опросы</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-[#00A3E0] text-white rounded-lg hover:bg-[#008cc2] transition-colors"
          >
            {showCreateForm ? 'Отмена' : '+ Создать опрос'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card p-6 mb-8">
            <SurveyForm onSuccess={() => {
              fetchSurveys();
              setShowCreateForm(false);
            }} />
          </div>
        )}

        {!showCreateForm && surveys.length === 0 && (
          <div className="card p-8 text-center text-gray-600">
            У вас пока нет опросов. Создайте первый опрос!
          </div>
        )}

        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div key={survey.id} className="card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#003DA5]">{survey.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {(survey as any).questions?.length || 0} вопросов • 
                  {(survey as any).resultRanges?.length || 0} диапазонов результатов
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/surveys/${survey.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#003DA5] text-white rounded-lg hover:bg-[#002d7a] transition-colors text-sm"
                >
                  Пройти опрос
                </a>
                <button
                  onClick={() => copyLink(survey.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  {copiedId === survey.id ? 'Скопировано!' : 'Копировать ссылку'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function SurveyForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [showPoints, setShowPoints] = useState(false);
  const [questions, setQuestions] = useState<any[]>([
    { id: Date.now().toString(), text: '', isRequired: true, answers: [{ id: Date.now().toString(), text: '', points: 0 }] }
  ]);
  const [resultRanges, setResultRanges] = useState<any[]>([
    { id: Date.now().toString(), minScore: 0, maxScore: 10, resultText: '', customFieldLabel: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addQuestion() {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      text: '', 
      isRequired: true, 
      answers: [{ id: Date.now().toString(), text: '', points: 0 }] 
    }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: string, value: any) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function addAnswer(questionIndex: number) {
    const updated = [...questions];
    updated[questionIndex].answers.push({ 
      id: Date.now().toString(), 
      text: '', 
      points: 0 
    });
    setQuestions(updated);
  }

  function removeAnswer(questionIndex: number, answerIndex: number) {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter((_: any, i: number) => i !== answerIndex);
    setQuestions(updated);
  }

  function updateAnswer(questionIndex: number, answerIndex: number, field: string, value: any) {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = { 
      ...updated[questionIndex].answers[answerIndex], 
      [field]: field === 'points' ? Number(value) : value 
    };
    setQuestions(updated);
  }

  function addRange() {
    setResultRanges([...resultRanges, { 
      id: Date.now().toString(), 
      minScore: 0, 
      maxScore: 10, 
      resultText: '', 
      customFieldLabel: '' 
    }]);
  }

  function removeRange(index: number) {
    setResultRanges(resultRanges.filter((_, i) => i !== index));
  }

  function updateRange(index: number, field: string, value: any) {
    const updated = [...resultRanges];
    updated[index] = { ...updated[index], [field]: field === 'minScore' || field === 'maxScore' ? Number(value) : value };
    setResultRanges(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        title,
        googleSheetsUrl,
        showPoints,
        questions: questions.map((q, idx) => ({
          ...q,
          orderIndex: idx,
          answers: q.answers.map((a: any, aIdx: number) => ({ ...a, orderIndex: aIdx }))
        })),
        resultRanges: resultRanges.map((r, idx) => ({ ...r, id: undefined }))
      };

      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка при создании опроса');
      }

      const survey = await res.json();
      
      // Auto-copy link
      const url = `${window.location.origin}/surveys/${survey.id}`;
      navigator.clipboard.writeText(url);
      alert(`Опрос создан! Ссылка скопирована в буфер обмена:\n${url}`);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Название опроса</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="Введите название опроса"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Sheets URL (необязательно)</label>
        <input
          type="url"
          value={googleSheetsUrl}
          onChange={(e) => setGoogleSheetsUrl(e.target.value)}
          className="input-field"
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showPoints"
          checked={showPoints}
          onChange={(e) => setShowPoints(e.target.checked)}
          className="rounded border-gray-300 text-[#003DA5] focus:ring-[#003DA5]"
        />
        <label htmlFor="showPoints" className="text-sm text-gray-700">
          Показывать баллы за варианты ответов сотруднику
        </label>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#003DA5]">Вопросы</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1.5 bg-[#FFA300] text-white rounded-lg hover:bg-[#e69200] transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить вопрос
          </button>
        </div>

        {questions.map((question, qIdx) => (
          <div key={question.id} className="card p-4 mb-4 bg-gray-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                  className="input-field mb-2"
                  placeholder="Текст вопроса"
                  required
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={(e) => updateQuestion(qIdx, 'isRequired', e.target.checked)}
                    className="rounded border-gray-300 text-[#003DA5] focus:ring-[#003DA5]"
                  />
                  Обязательный вопрос
                </label>
              </div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <div className="ml-4 space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Варианты ответов:</p>
              {question.answers.map((answer: any, aIdx: number) => (
                <div key={answer.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Текст ответа"
                    required
                  />
                  <input
                    type="number"
                    value={answer.points}
                    onChange={(e) => updateAnswer(qIdx, aIdx, 'points', e.target.value)}
                    className="input-field w-20"
                    placeholder="Баллы"
                    min="0"
                    required
                  />
                  {question.answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(qIdx, aIdx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addAnswer(qIdx)}
                className="text-sm text-[#00A3E0] hover:text-[#008cc2] font-medium"
              >
                + Добавить вариант ответа
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#003DA5]">Диапазоны результатов</h3>
          <button
            type="button"
            onClick={addRange}
            className="px-3 py-1.5 bg-[#FFA300] text-white rounded-lg hover:bg-[#e69200] transition-colors text-sm"
          >
            + Добавить диапазон
          </button>
        </div>

        {resultRanges.map((range, rIdx) => (
          <div key={range.id} className="card p-4 mb-4 bg-gray-50">
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">От</label>
                <input
                  type="number"
                  value={range.minScore}
                  onChange={(e) => updateRange(rIdx, 'minScore', e.target.value)}
                  className="input-field"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">До</label>
                <input
                  type="number"
                  value={range.maxScore}
                  onChange={(e) => updateRange(rIdx, 'maxScore', e.target.value)}
                  className="input-field"
                  min="0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Текст результата</label>
                <input
                  type="text"
                  value={range.resultText}
                  onChange={(e) => updateRange(rIdx, 'resultText', e.target.value)}
                  className="input-field"
                  placeholder="Например: У вас всё хорошо"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Поле для сотрудника</label>
                <input
                  type="text"
                  value={range.customFieldLabel || ''}
                  onChange={(e) => updateRange(rIdx, 'customFieldLabel', e.target.value)}
                  className="input-field"
                  placeholder="Необязательно"
                />
              </div>
            </div>
            {resultRanges.length > 1 && (
              <button
                type="button"
                onClick={() => removeRange(rIdx)}
                className="mt-3 text-sm text-red-500 hover:text-red-700"
              >
                Удалить диапазон
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-[#003DA5] text-white rounded-lg font-medium hover:bg-[#002d7a] transition-colors disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Сохранить опрос'}
      </button>
    </form>
  );
}
