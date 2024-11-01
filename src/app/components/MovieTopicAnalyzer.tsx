'use client';

import { useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SharedHamburger from './SharedHamburger';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!topic.trim() || loading || isSaving) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      setResult(data);

      // Save to Firebase
      setIsSaving(true);
      await addDoc(collection(db, "searches"), {
        topic: topic.trim(),
        result: data,
        timestamp: serverTimestamp()
      });

      setTopic('');
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 relative">
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
      <SharedHamburger />
    </div>
  );
};

export default MovieTopicAnalyzer;