'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface SearchResult {
  id: string;
  topic: string;
  result: any;
  timestamp: string;
}

const SharedHamburger = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SearchResult[]>([]);

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "searches"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        topic: doc.data().topic,
        result: doc.data().result,
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || new Date().toLocaleString()
      }));
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch history when menu opens
  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  return (
    <>
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

      {/* History sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto z-40`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Search History</h2>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <p className="font-semibold">{item.topic}</p>
                <p className="text-sm text-gray-500">{item.timestamp}</p>
                <pre className="mt-2 text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                  {JSON.stringify(item.result, null, 2)}
                </pre>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-gray-500 text-center">No search history</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedHamburger; 