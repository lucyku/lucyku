import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Add this useEffect to fetch history when component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  // Separate function to fetch history
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
      console.error("Error fetching history: ", error);
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
      
      // Add to Firebase and update history regardless of menu state
      try {
        const docRef = await addDoc(collection(db, "searches"), {
          topic: topic,
          result: data,
          timestamp: serverTimestamp(),
        });
        
        // Create new history item
        const newHistoryItem = {
          id: docRef.id,
          topic,
          timestamp: new Date().toLocaleString(),
          result: data
        };
        
        // Update local history state
        setHistory(prevHistory => [...prevHistory, newHistoryItem]);
        
        // Fetch fresh history from Firebase
        fetchHistory();
        
      } catch (error) {
        console.error("Error adding to Firebase: ", error);
      }

    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component code ...

  return (
    <div>
      {/* ... existing JSX ... */}
      
      {/* History hamburger menu */}
      <div className={`history-menu ${isHistoryOpen ? 'open' : ''}`}>
        <button onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
          {/* Your hamburger icon */}
        </button>
        
        {isHistoryOpen && (
          <div className="history-content">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                {/* Your history item display */}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* ... rest of your JSX ... */}
    </div>
  );
}; 