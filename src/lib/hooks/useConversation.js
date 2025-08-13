import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useAuth } from '@/lib/hooks/useAuth.jsx';

    export const useConversation = (queryType) => {
      const [conversationHistory, setConversationHistory] = useState([]);
      const [conversationId, setConversationId] = useState(null);
      const { user } = useAuth();

      const getStorageKey = useCallback(() => {
        if (!user || !queryType) return null;
        return `conversationHistory_${user.id}_${queryType}`;
      }, [user, queryType]);

      const loadConversationHistory = useCallback(() => {
        const storageKey = getStorageKey();
        if (!storageKey) return;

        try {
          const storedHistory = localStorage.getItem(storageKey);
          if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory)) {
              setConversationHistory(parsedHistory);
            } else {
              setConversationHistory([]);
            }
          } else {
            setConversationHistory([]);
          }
        } catch (error) {
          console.error("Error loading conversation history from localStorage:", error);
          setConversationHistory([]);
        }
      }, [getStorageKey]);

      const saveConversationHistory = useCallback(() => {
        const storageKey = getStorageKey();
        if (!storageKey || !Array.isArray(conversationHistory)) return;
        
        localStorage.setItem(storageKey, JSON.stringify(conversationHistory));
      }, [conversationHistory, getStorageKey]);

      useEffect(() => {
        if (user && queryType) {
          loadConversationHistory();
        }
      }, [user, queryType, loadConversationHistory]);
      
      useEffect(() => {
        if (user && queryType) {
          saveConversationHistory();
        }
      }, [conversationHistory, user, queryType, saveConversationHistory]);


      const startNewConversation = useCallback((initialSystemMessage) => {
        if (initialSystemMessage && Array.isArray(initialSystemMessage)) {
          setConversationHistory(initialSystemMessage);
        } else if (initialSystemMessage && typeof initialSystemMessage === 'object') {
           setConversationHistory([initialSystemMessage]);
        }
        else {
          setConversationHistory([]);
        }
        setConversationId(null); 
      }, []);
      

      const addToConversation = useCallback((message) => {
        setConversationHistory((prev) => {
          if (!Array.isArray(prev)) {
            console.warn("useConversation: conversationHistory was not an array. Resetting.");
            return [message];
          }
          const messageWithId = { ...message, id: message.id || Date.now() + Math.random() };
          return [...prev, messageWithId];
        });
      }, []);

      const addMessageToConversation = useCallback((message) => {
        setConversationHistory((prev) => {
          if (!Array.isArray(prev)) {
            console.warn("useConversation: conversationHistory was not an array. Resetting.");
            return [message];
          }
          const messageWithId = { ...message, id: message.id || Date.now() + Math.random() };
          return [...prev, messageWithId];
        });
      }, []);
      

      const getConversationMessages = useCallback(() => {
        if (!Array.isArray(conversationHistory)) {
          return [];
        }
        return conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : (msg.role || 'assistant'),
          content: msg.file ? `File: ${msg.file.name}\n${msg.text}` : msg.text
        }));
      }, [conversationHistory]);

      const clearConversation = useCallback(() => {
        const storageKey = getStorageKey();
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
        setConversationHistory([]);
        setConversationId(null);
      }, [getStorageKey]);

      return {
        conversation: conversationHistory,
        conversationId,
        startNewConversation,
        addToConversation,
        addMessageToConversation,
        getConversationMessages,
        setConversationHistory,
        loadConversationHistory,
        clearConversation 
      };
    };