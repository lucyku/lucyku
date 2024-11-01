'use client';

import { useState } from 'react';
import Link from 'next/link';
import HistorySidebar from './components/HistorySidebar';

export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        {/* Your existing main page content */}
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

      {/* Hamburger button */}
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded-lg z-50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </main>
  );
} 