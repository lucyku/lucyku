'use client';

import Link from 'next/link';
import SharedHamburger from './components/SharedHamburger';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Movie Topic Analyzer</h1>
          <Link 
            href="/analyzer" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
          >
            Start Analyzing
          </Link>
        </div>
      </div>
      <SharedHamburger />
    </main>
  );
} 