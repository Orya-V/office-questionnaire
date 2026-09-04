'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isSurveyPage = pathname?.startsWith('/surveys/');

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="text-xl font-semibold text-[#003DA5] hover:text-[#00A3E0] transition-colors"
        >
          Корпоративные опросы
        </Link>
        {!isSurveyPage && (
          <nav className="flex gap-4">
            <Link 
              href="/my-surveys" 
              className="px-4 py-2 rounded-lg bg-[#003DA5] text-white hover:bg-[#002d7a] transition-colors"
            >
              Мои опросы
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
