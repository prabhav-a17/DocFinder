import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { format } from 'date-fns';
import '../styles/ChatHistory.css';

interface Message {
  content: string;
  role: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  is_pinned: boolean;
}

const ChatHistory: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort conversations by pinned status and updated_at
        const sortedConversations = data.sort((a: Conversation, b: Conversation) => {
          if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        setConversations(sortedConversations);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch chat history');
      }
    } catch (err) {
      setError('An error occurred while fetching chat history');
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking pin button
    try {
      const response = await fetch(`${API_BASE_URL}/chat/pin/${conversationId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update the conversation's pinned status in the state
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, is_pinned: !conv.is_pinned }
              : conv
          );
          // Re-sort after updating pin status
          return updated.sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) {
              return a.is_pinned ? -1 : 1;
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          });
        });
      }
    } catch (err) {
      setError('Failed to toggle pin status');
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return <div className="chat-history loading">Loading conversations...</div>;
  }

  if (error) {
    return <div className="chat-history error">{error}</div>;
  }

  return (
    <div className="chat-history">
      <h2>Chat History</h2>
      {conversations.length === 0 ? (
        <p className="no-conversations">No conversations yet</p>
      ) : (
        <div className="conversations-list">
          {conversations.map(conversation => (
            <div 
              key={conversation.id} 
              className={`conversation-item ${conversation.is_pinned ? 'pinned' : ''}`}
              onClick={() => navigate(`/chatbot?conversation=${conversation.id}`)}
            >
              <div className="conversation-header">
                <h3>{conversation.title}</h3>
                <button 
                  className={`pin-button ${conversation.is_pinned ? 'pinned' : ''}`}
                  onClick={(e) => handlePinToggle(conversation.id, e)}
                  title={conversation.is_pinned ? 'Unpin conversation' : 'Pin conversation'}
                >
                  📌
                </button>
              </div>
              <p className="last-message">
                {conversation.messages.length > 0 
                  ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
                  : 'No messages yet'}
              </p>
              <p className="timestamp">
                {formatDate(conversation.updated_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory; 