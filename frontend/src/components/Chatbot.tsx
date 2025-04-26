import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaSearch, FaUserMd } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import { IconType } from 'react-icons';
import '../styles/Chatbot.css';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

const IconWrapper = ({ Icon, ...props }: { Icon: IconType; [key: string]: any }) => {
  const IconComponent = Icon as React.ComponentType<any>;
  return <IconComponent {...props} />;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const extractSpecialist = (text: string): string | null => {
    // First, try to find a direct match in the "Would you like me to find a [specialist] near you?" format
    const findDoctorMatch = text.match(/Would you like (?:me )?to find (?:an?|the) ([^?]+?) (?:near you|in your area)\??/i);
    if (findDoctorMatch) {
      const matchedSpecialist = findDoctorMatch[1].trim();
      // Check if the matched specialist is in our list
      const foundSpecialist = specialistTypes.find(type => 
        type.toLowerCase() === matchedSpecialist.toLowerCase() ||
        matchedSpecialist.toLowerCase().includes(type.toLowerCase())
      );
      if (foundSpecialist) return foundSpecialist;
    }

    // Then try to find any specialist mention in the text
    for (const specialist of specialistTypes) {
      // Create variations of the specialist name
      const variations = [
        specialist,
        specialist.toLowerCase(),
        specialist.replace('/', ' or '),
        specialist.replace('/', ' '),
        specialist.split('/')[0], // Take first part of split specialties
        specialist.split('(')[0].trim() // Remove parenthetical descriptions
      ];

      // Check for each variation in the text
      for (const variation of variations) {
        if (text.toLowerCase().includes(variation.toLowerCase())) {
          return specialist;
        }
      }
    }

    // Look for "see a/an [specialist]" pattern
    const seeSpecialistMatch = text.match(/(?:should |need to |recommend |visit |see )(?:a|an|the) ([^.,!?]+?)(?=\.|,|!|\?|$)/gi);
    if (seeSpecialistMatch) {
      for (const match of seeSpecialistMatch) {
        const potentialSpecialist = match.replace(/(?:should |need to |recommend |visit |see )(?:a|an|the) /i, '').trim();
        const foundSpecialist = specialistTypes.find(type => 
          type.toLowerCase() === potentialSpecialist.toLowerCase() ||
          potentialSpecialist.toLowerCase().includes(type.toLowerCase())
        );
        if (foundSpecialist) return foundSpecialist;
      }
    }

    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!token) {
      toast.error('Please log in to use the chatbot');
      navigate('/login');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { content: userMessage, role: 'user' }]);

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
      
      // Save the conversation ID if it's a new conversation
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add bot message to chat
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
    console.log('Message content:', message.content);
    console.log('Extracted specialist:', specialist);

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