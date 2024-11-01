'use client';

import { useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import HistorySidebar from './HistorySidebar';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Save to Firebase function
  const saveToFirebase = async (searchTopic: string, searchResult: any) => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "searches"), {
        topic: searchTopic,
        result: searchResult,
        timestamp: serverTimestamp()
      });
      console.log("Saved to Firebase with ID:", docRef.id);
      return true;
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!topic.trim() || loading || isSaving) return;

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
      
      // 2. Update result state
      setResult(data);

      // 3. Save to Firebase and wait for completion
      const savedSuccessfully = await saveToFirebase(topic, data);
      
      if (savedSuccessfully) {
        setTopic(''); // Clear input only after successful save
        console.log("Search completed and saved successfully");
      }

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
            disabled={loading || isSaving}
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
    </div>
  );
};

export default MovieTopicAnalyzer;