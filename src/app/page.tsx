import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-bold text-[#003DA5] mb-4">
            Добро пожаловать в сервис корпоративных опросов
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Создавайте опросы с балльной оценкой ответов, настраивайте диапазоны результатов 
            и получайте аналитику в удобном формате.
          </p>
          <a 
            href="/my-surveys"
            className="inline-block px-8 py-3 bg-[#003DA5] text-white rounded-lg font-medium hover:bg-[#002d7a] transition-colors"
          >
            Создать опрос
          </a>
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="w-12 h-12 bg-[#00A3E0] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003DA5] mb-2">Создание опросов</h3>
            <p className="text-gray-600 text-sm">
              Добавляйте вопросы, варианты ответов с баллами и настраивайте обязательность вопросов
            </p>
          </div>
          
          <div className="card p-6">
            <div className="w-12 h-12 bg-[#FFA300] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003DA5] mb-2">Диапазоны результатов</h3>
            <p className="text-gray-600 text-sm">
              Настраивайте тексты результатов для разных диапазонов баллов
            </p>
          </div>
          
          <div className="card p-6">
            <div className="w-12 h-12 bg-[#003DA5] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003DA5] mb-2">Google Sheets</h3>
            <p className="text-gray-600 text-sm">
              Привязывайте свои таблицы и экспортируйте результаты в Excel
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
