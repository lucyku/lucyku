import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Fetch history on component mount
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

      // Store in Firebase immediately after getting response
      await addDoc(collection(db, "searches"), {
        topic,
        result: data,
        timestamp: serverTimestamp(),
      });

      // Fetch updated history
      await fetchHistory();

    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your existing component code ...
};

export default MovieTopicAnalyzer; 