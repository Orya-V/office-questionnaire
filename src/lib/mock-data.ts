export const mockSurvey = {
  id: 'mock-survey-1',
  title: 'Опрос удовлетворённости работой',
  googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/example123',
  showPoints: false,
  questions: [
    {
      id: 'q1',
      text: 'Как вы оцениваете свою рабочую нагрузку?',
      isRequired: true,
      orderIndex: 0,
      answers: [
        { id: 'a1', text: 'Слишком высокая', points: 5, orderIndex: 0 },
        { id: 'a2', text: 'Высокая, но приемлемая', points: 3, orderIndex: 1 },
        { id: 'a3', text: 'Оптимальная', points: 1, orderIndex: 2 },
        { id: 'a4', text: 'Недостаточная', points: 2, orderIndex: 3 },
      ],
    },
    {
      id: 'q2',
      text: 'Насколько вы довольны отношениями в коллективе?',
      isRequired: true,
      orderIndex: 1,
      answers: [
        { id: 'a5', text: 'Очень доволен', points: 1, orderIndex: 0 },
        { id: 'a6', text: 'Доволен', points: 2, orderIndex: 1 },
        { id: 'a7', text: 'Затрудняюсь ответить', points: 3, orderIndex: 2 },
        { id: 'a8', text: 'Не доволен', points: 5, orderIndex: 3 },
      ],
    },
    {
      id: 'q3',
      text: 'Есть ли у вас возможность профессионального роста?',
      isRequired: false,
      orderIndex: 2,
      answers: [
        { id: 'a9', text: 'Да, определённо', points: 1, orderIndex: 0 },
        { id: 'a10', text: 'Скорее да', points: 2, orderIndex: 1 },
        { id: 'a11', text: 'Скорее нет', points: 4, orderIndex: 2 },
        { id: 'a12', text: 'Нет', points: 5, orderIndex: 3 },
      ],
    },
  ],
  resultRanges: [
    { id: 'r1', minScore: 3, maxScore: 7, resultText: 'У вас всё хорошо! Вы довольны работой.', customFieldLabel: undefined },
    { id: 'r2', minScore: 8, maxScore: 12, resultText: 'Стоит обратить внимание на некоторые аспекты работы.', customFieldLabel: 'Что бы вы хотели изменить?' },
    { id: 'r3', minScore: 13, maxScore: 20, resultText: 'Ситуация критическая. Рекомендуется обратиться к руководителю или HR.', customFieldLabel: 'Опишите вашу проблему подробно' },
  ],
};

export const mockSurveys = [mockSurvey];
