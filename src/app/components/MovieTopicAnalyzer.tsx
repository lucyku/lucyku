'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface SearchResult {
  id: string;
  topic: string;
  result: any;
  timestamp: string;
}

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Function to fetch history
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
      console.log("Fetched history:", historyData); // Debug log
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      // 1. Make API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      setResult(data);

      // 2. Save to Firebase
      const docRef = await addDoc(collection(db, "searches"), {
        topic,
        result: data,
        timestamp: serverTimestamp(),
      });

      // 3. Add to local state immediately
      const newSearch: SearchResult = {
        id: docRef.id,
        topic,
        result: data,
        timestamp: new Date().toLocaleString()
      };

      // Update local state immediately
      setHistory(prevHistory => [newSearch, ...prevHistory]);
      
      console.log("Search saved successfully:", newSearch); // Debug log

    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 relative">
      {/* Main content */}
      <div className="max-w-xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a movie topic..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => {
          setIsHistoryOpen(!isHistoryOpen);
          if (!isHistoryOpen) {
            fetchHistory(); // Refresh history when opening menu
          }
        }}
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
    </div>
  );
};

export default MovieTopicAnalyzer;