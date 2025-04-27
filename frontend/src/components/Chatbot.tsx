import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ChatHistory from './ChatHistory';
import '../styles/Chatbot.css';

interface Message {
  content: string;
  role: string;
  created_at: string;
}

const Chatbot: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get('conversation');
  const { token } = useSelector((state: RootState) => state.auth);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSpecialist, setLastSpecialist] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

  const extractSpecialist = (message: string): string | null => {
    // Look for the pattern "find a [specialist] near you"
    const specialistMatch = message.match(/find a ([^?]+) near you/i);
    if (specialistMatch) {
      return specialistMatch[1].trim();
    }
    
    // Look for the pattern "find an [specialist] near you"
    const specialistMatch2 = message.match(/find an ([^?]+) near you/i);
    if (specialistMatch2) {
      return specialistMatch2[1].trim();
    }
    
    // Look for the pattern "find [specialist] near you"
    const specialistMatch3 = message.match(/find ([^?]+) near you/i);
    if (specialistMatch3) {
      return specialistMatch3[1].trim();
    }
    
    return null;
  };

  const fetchConversation = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0 && data[0].messages) {
          setMessages(data[0].messages);
          // Check the last assistant message for a specialist recommendation
          const lastAssistantMessage = data[0].messages
            .filter((msg: Message) => msg.role === 'assistant')
            .pop();
          if (lastAssistantMessage) {
            const specialist = extractSpecialist(lastAssistantMessage.content);
            setLastSpecialist(specialist);
          }
        } else {
          setMessages([]);
        }
      } else {
        setError('Failed to fetch conversation');
      }
    } catch (err) {
      setError('An error occurred while fetching conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
        setInput('');
    setLoading(true);
    setError(null);

    // Add user message immediately
    const userMessageObj = { 
      content: userMessage, 
      role: 'user', 
      created_at: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMessageObj]);

        try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
                },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId
        })
            });

      if (response.ok) {
            const data = await response.json();
            
        // If this is a new conversation, update the URL
        if (!conversationId) {
          navigate(`/chatbot?conversation=${data.conversation_id}`);
        }

        // Add assistant's response
        setMessages(prev => [...prev, 
          { content: data.response, role: 'assistant', created_at: new Date().toISOString() }
        ]);

        // Check if the assistant recommended a specialist
        const specialist = extractSpecialist(data.response);
        console.log('Detected specialist:', specialist); // Debug log
        setLastSpecialist(specialist);
      } else {
        setError('Failed to send message');
        // Remove the user's message if the request failed
        setMessages(prev => prev.filter(msg => msg !== userMessageObj));
            }
    } catch (err) {
      setError('An error occurred while sending message');
      // Remove the user's message if there was an error
      setMessages(prev => prev.filter(msg => msg !== userMessageObj));
        } finally {
      setLoading(false);
        }
    };

  const handleFindSpecialist = () => {
    if (lastSpecialist) {
      // Convert specialist name to URL-friendly format
      const specialistSlug = lastSpecialist.toLowerCase().replace(/\s+/g, '-');
      navigate(`/find-doctor/${specialistSlug}`);
    }
  };

  const startNewConversation = () => {
    navigate('/chatbot');
    setMessages([]);
    setLastSpecialist(null);
    };

    return (
    <div className="chatbot-container">
      <div className="chat-history-sidebar">
        <ChatHistory />
      </div>
      <div className="chat-window">
        <div className="chat-header">
          <h2>{conversationId ? 'Current Conversation' : 'New Conversation'}</h2>
          {conversationId && (
            <button onClick={startNewConversation} className="new-conversation-btn">
              Start New Conversation
            </button>
          )}
        </div>
        <div className="messages-container">
          {messages.length === 0 && !loading ? (
            <div className="empty-state">
              <p>Start a new conversation by typing a message below.</p>
              <p>You can describe your symptoms or ask about medical specialists.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {lastSpecialist && (
            <div className="find-specialist-container">
              <button onClick={handleFindSpecialist} className="find-specialist-btn">
                Find {lastSpecialist} Near You
              </button>
            </div>
          )}
                    <div ref={messagesEndRef} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
            disabled={loading}
                />
          <button type="submit" disabled={loading}>
                    Send
          </button>
        </form>
      </div>
    </div>
    );
};

export default Chatbot; 