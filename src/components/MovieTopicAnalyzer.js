import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

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
      
      // Add to Firebase
      try {
        const docRef = await addDoc(collection(db, "searches"), {
          topic: topic,
          result: data,
          timestamp: serverTimestamp(),
          // Add user ID if you're tracking per user
          // userId: currentUser.uid 
        });
        
        // Create new history item with Firebase doc ID
        const newHistoryItem = {
          id: docRef.id,
          topic,
          timestamp: new Date().toLocaleString(),
          result: data
        };
        
        setHistory(prevHistory => [...prevHistory, newHistoryItem]);
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

  // Add useEffect to fetch history from Firebase when component mounts
  useEffect(() => {
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

    fetchHistory();
  }, []);

  // ... rest of the component ...
} 