"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';

function ChatMessage({ message }) {
  return (
    <div className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
      {message.content}
    </div>
  );
}

function ChatForm({ input, handleInputChange, handleSubmit, isLoading }) {
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Ask me about games ..."
        className={styles.input}
        disabled={isLoading}
      />
      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Question...?'}
      </button>
    </form>
  );
}

function LoadingIndicator() {
  return <div className={styles.loadingIndicator}>Finding the best GAME for you...</div>;
}

export default function Home() {
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const newMessage = { role: 'user', content: input.trim() };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setError('Could not find the desired GAME :) Try asking another question !!!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GAME FINDER AI</h1>
      <div className={styles.chatWindow}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <ChatForm 
        input={input} 
        handleInputChange={handleInputChange} 
        handleSubmit={handleSubmit} 
        isLoading={isLoading}
      />
    </div>
  );
}