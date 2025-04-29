import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatHistory.css';

interface Chat {
  id: string;
  title: string;
  message: string;
  response: string;
  is_pinned: boolean;
  created_at: string;
}

interface ChatHistoryProps {
  chats: Chat[];
  onPinToggle: (chatId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chats, onPinToggle }) => {
  const navigate = useNavigate();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Sort chats with pinned ones first, then by date
  const sortedChats = [...chats].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getChatTitle = (chat: Chat) => {
    // If there's a title, use it, otherwise use the first part of the message
    if (chat?.title?.trim()) return chat.title.trim();
    if (chat?.message?.trim()) {
      const message = chat.message.trim();
      // Return first 30 characters of message or up to the first newline
      const firstLine = message.split('\n')[0];
      return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
    }
    return 'New chat';
  };

  return (
    <div className="chat-history">
      <div className="chat-sections">
        <div className="chat-section">
          <h3 className="section-title">Today</h3>
          {sortedChats
            .filter(chat => {
              const date = new Date(chat.created_at);
              const today = new Date();
              return date.toDateString() === today.toDateString();
            })
            .map(chat => (
              <div 
                key={chat.id} 
                className={`chat-summary ${chat.is_pinned ? 'pinned' : ''}`}
                onClick={() => navigate(`/chatbot?conversation=${chat.id}`)}
              >
                <div className="chat-info">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinToggle(chat.id);
                    }}
                    className={`pin-button ${chat.is_pinned ? 'pinned' : ''}`}
                    aria-label={chat.is_pinned ? 'Unpin chat' : 'Pin chat'}
                  >
                    {chat.is_pinned ? '📌' : '📍'}
                  </button>
                  <span className="chat-title">{getChatTitle(chat)}</span>
                </div>
              </div>
            ))}
        </div>

        <div className="chat-section">
          <h3 className="section-title">Yesterday</h3>
          {sortedChats
            .filter(chat => {
              const date = new Date(chat.created_at);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return date.toDateString() === yesterday.toDateString();
            })
            .map(chat => (
              <div 
                key={chat.id} 
                className={`chat-summary ${chat.is_pinned ? 'pinned' : ''}`}
                onClick={() => navigate(`/chatbot?conversation=${chat.id}`)}
              >
                <div className="chat-info">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinToggle(chat.id);
                    }}
                    className={`pin-button ${chat.is_pinned ? 'pinned' : ''}`}
                    aria-label={chat.is_pinned ? 'Unpin chat' : 'Pin chat'}
                  >
                    {chat.is_pinned ? '📌' : '📍'}
                  </button>
                  <span className="chat-title">{getChatTitle(chat)}</span>
                </div>
              </div>
            ))}
        </div>

        <div className="chat-section">
          <h3 className="section-title">Previous 7 Days</h3>
          {sortedChats
            .filter(chat => {
              const date = new Date(chat.created_at);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              return date > sevenDaysAgo && date.toDateString() !== today.toDateString() && date.toDateString() !== yesterday.toDateString();
            })
            .map(chat => (
              <div 
                key={chat.id} 
                className={`chat-summary ${chat.is_pinned ? 'pinned' : ''}`}
                onClick={() => navigate(`/chatbot?conversation=${chat.id}`)}
              >
                <div className="chat-info">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinToggle(chat.id);
                    }}
                    className={`pin-button ${chat.is_pinned ? 'pinned' : ''}`}
                    aria-label={chat.is_pinned ? 'Unpin chat' : 'Pin chat'}
                  >
                    {chat.is_pinned ? '📌' : '📍'}
                  </button>
                  <span className="chat-title">{getChatTitle(chat)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory; 