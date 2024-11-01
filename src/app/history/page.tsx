'use client';

import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';

export default function HistoryPage() {
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "searches"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || new Date().toLocaleString()
      }));
      setSearchHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Search History</h1>
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Search
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {searchHistory.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{item.topic}</h2>
                  <span className="text-sm text-gray-500">{item.timestamp}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Analysis Result:</h3>
                  <pre className="whitespace-pre-wrap text-gray-600 text-sm">
                    {JSON.stringify(item.result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}

            {searchHistory.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No search history found
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 