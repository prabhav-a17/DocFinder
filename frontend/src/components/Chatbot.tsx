import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUserMd } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import { IconType } from 'react-icons';
import '../styles/Chatbot.css';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

const IconWrapper: React.FC<{ Icon: IconType }> = ({ Icon }) => {
  const IconComponent = Icon as React.ComponentType<{ size?: number }>;
  return <IconComponent size={20} />;
};

// Mapping of specialist variations to standardized search terms
const specialistMapping: { [key: string]: string } = {
  "Primary Care Physician": "Primary Care",
  "Cardiologist": "Cardiology",
  "Dermatologist": "Dermatology",
  "Endocrinologist": "Endocrinology",
  "Gastroenterologist": "Gastroenterology",
  "Neurologist": "Neurology",
  "Obstetrician/Gynecologist": "OBGYN",
  "Oncologist": "Oncology",
  "Ophthalmologist": "Ophthalmology",
  "Orthopedist": "Orthopedics",
  "Otolaryngologist": "otolaryngologist-(ent)",
  "ENT": "otolaryngologist-(ent)",
  "ENT Specialist": "otolaryngologist-(ent)",
  "Otolaryngologist (ENT)": "otolaryngologist-(ent)",
  "Pediatrician": "Pediatrics",
  "Psychiatrist": "Psychiatry",
  "Pulmonologist": "Pulmonology",
  "Rheumatologist": "Rheumatology",
  "Urologist": "Urology",
  "Allergist": "Allergy",
  "Immunologist": "Immunology",
  "Nephrologist": "Nephrology",
  "Hematologist": "Hematology",
  "Pain Management Specialist": "Pain Management",
  "Physical Medicine Specialist": "Physical Medicine",
  "Rehabilitation Specialist": "Rehabilitation",
  "Plastic Surgeon": "Plastic Surgery",
  "Podiatrist": "Podiatry",
  "Sports Medicine Specialist": "Sports Medicine",
  "Vascular Surgeon": "Vascular Surgery",
  "Dentist": "Dental",
  "Chiropractor": "Chiropractic",
  "Emergency Medicine Physician": "Emergency Medicine"
};

const specialistTypes = Object.keys(specialistMapping);

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractSpecialist = (text: string): string | null => {
    if (!text) return null;
    
    // First try to find exact matches from our specialist types
    const exactMatch = specialistTypes.find(type => 
      text.toLowerCase().includes(type.toLowerCase())
    );
    if (exactMatch) return exactMatch;
    
    // If no exact match, try patterns
    const patterns = [
      /(?:see|consult|visit|recommend|suggest).*?(?:a|an)?\s*([A-Za-z\s]+)(?:specialist|doctor|physician)/i,
      /(?:you should|I recommend|I suggest).*?(?:see|consult|visit).*?(?:a|an)?\s*([A-Za-z\s]+)(?:specialist|doctor|physician)/i,
      /(?:specialist|doctor|physician).*?(?:in|for|of)\s*([A-Za-z\s]+)/i,
      /(?:[A-Za-z\s]+)(?:specialist|doctor|physician)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const foundSpecialist = match[1].trim();
        // Try to find a matching specialist from our list
        const matchingSpecialist = specialistTypes.find(type => 
          type.toLowerCase().includes(foundSpecialist.toLowerCase()) ||
          foundSpecialist.toLowerCase().includes(type.toLowerCase())
        );
        if (matchingSpecialist) return matchingSpecialist;
      }
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, role: 'user' }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId
        }),
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage = data.response;
      
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      setMessages(prev => [...prev, { content: botMessage, role: 'assistant' }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response from chatbot. Please try again.');
      setMessages(prev => [...prev, {
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const navigateToFindDoctor = (specialist: string) => {
    const searchTerm = specialistMapping[specialist] || specialist;
    navigate(`/find-doctor/${searchTerm}`);
  };

  const renderMessage = (message: Message, index: number) => {
    const specialist = message.role === 'assistant' ? extractSpecialist(message.content) : null;

    return (
      <div key={index} className={`message ${message.role}`}>
        <div className="message-content">
          {message.content}
          {specialist && (
            <button 
              className="find-doctor-btn"
              onClick={() => navigateToFindDoctor(specialist)}
            >
              <IconWrapper Icon={FaUserMd} /> Find {specialist}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && (
          <div className="message assistant">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your symptoms..."
          rows={1}
        />
        <button onClick={handleSend} disabled={isLoading}>
          <IconWrapper Icon={FaPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 