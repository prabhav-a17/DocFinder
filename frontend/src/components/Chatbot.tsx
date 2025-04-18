import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

interface Message {
    text: string;
    isUser: boolean;
    specialist?: string;
}

const Chatbot: React.FC = () => {
    const token = localStorage.getItem('token');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            text: input,
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8001/api/chat/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            
            // Check if the response contains a specialist recommendation
            const specialistMatch = data.response.match(/I recommend seeing a (\w+)/i);
            const specialist = specialistMatch ? specialistMatch[1].toLowerCase() : undefined;

            const botMessage: Message = {
                text: data.response,
                isUser: false,
                specialist
            };

            setMessages(prev => [...prev, botMessage]);

            // If a specialist was recommended, add a button to find doctors
            if (specialist) {
                setTimeout(() => {
                    const findDoctorMessage: Message = {
                        text: `Would you like to find ${specialist}s near you?`,
                        isUser: false,
                        specialist
                    };
                    setMessages(prev => [...prev, findDoctorMessage]);
                }, 1000);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleFindDoctor = (specialist: string) => {
        navigate(`/find-doctor/${specialist}`);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
                DocFinder Chat
            </Typography>
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                bgcolor: 'grey.50',
                borderRadius: 1,
                mb: 2,
                p: 2
            }}>
                <List>
                    {messages.map((message, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    maxWidth: '70%',
                                    bgcolor: message.isUser ? 'primary.main' : 'background.paper',
                                    color: message.isUser ? 'white' : 'text.primary'
                                }}
                            >
                                <ListItemText primary={message.text} />
                                {message.specialist && !message.isUser && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleFindDoctor(message.specialist!)}
                                        sx={{ mt: 1 }}
                                    >
                                        Find {message.specialist}s
                                    </Button>
                                )}
                            </Paper>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default Chatbot; 