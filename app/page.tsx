'use client';

import dynamic from 'next/dynamic';

const FortuneChat = dynamic(() => import('@/app/components/FortuneChat'), {
  ssr: false,
  loading: () => <p className="text-center p-4">로딩 중...</p>
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
        <header className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-3xl">🔮</span> AI 사주 상담냥이
          </h1>
          <p className="text-sm opacity-80 mt-1">고민을 말해달라냥😺</p>
        </header>
        <div className="p-4">
          <FortuneChat />
        </div>
      </div>
    </main>
  );
}
