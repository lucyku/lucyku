import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "searches"));
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || new Date().toLocaleString()
      }));
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!topic) return;

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
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!result || !topic) return;

    try {
      await addDoc(collection(db, "searches"), {
        topic,
        result,
        timestamp: serverTimestamp(),
      });

      // Fetch updated history immediately
      await fetchHistory();

      // Optional: Show success message
      alert('Response saved successfully!');
    } catch (error) {
      console.error("Error saving response:", error);
      alert('Failed to save response');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* ... existing input and button ... */}

      {/* Show result and save button */}
      {result && !loading && (
        <div className="mt-4">
          <div className="bg-white p-4 rounded-lg shadow">
            {/* Your existing result display */}
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            
            {/* Add Save Response button */}
            <button
              onClick={handleSaveResponse}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Save Response
            </button>
          </div>
        </div>
      )}

      {/* ... rest of your component (history menu, etc.) ... */}
    </div>
  );
};

export default MovieTopicAnalyzer; 