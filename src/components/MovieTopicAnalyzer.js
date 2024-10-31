import React, { useState } from 'react';

const MovieTopicAnalyzer = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      // Add the new search to history immediately after getting the response
      const newHistoryItem = {
        topic,
        timestamp: new Date().toLocaleString(),
        result: data
      };
      
      setHistory(prevHistory => [...prevHistory, newHistoryItem]);
      // Optionally save to localStorage here as well
      const updatedHistory = [...history, newHistoryItem];
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to analyze topic' });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component ...
} 