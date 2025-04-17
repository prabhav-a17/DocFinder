import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { uploadImageToBot } from '../services/api';

interface Message {
    text?: string;
    isUser: boolean;
    imageUrl?: string;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            const botMessage: Message = {
                text: data.response,
                isUser: false
            };

            setMessages(prev => [...prev, botMessage]);
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

    const handleImageUpload = async (file: File) => {
        setIsLoading(true);

        // Show user's image in chat immediately
        const userImageMessage: Message = {
            isUser: true,
            imageUrl: URL.createObjectURL(file),
            text: ''
        };
        setMessages(prev => [...prev, userImageMessage]);

        const data = await uploadImageToBot(file);

        if (data?.success) {
            const botResponse: Message = {
                isUser: false,
                text: data.response,
                imageUrl: data.image_url
            };
            setMessages(prev => [...prev, botResponse]);
        } else {
            setMessages(prev => [...prev, {
                isUser: false,
                text: 'Sorry, something went wrong with the image.'
            }]);
        }

        setIsLoading(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
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
                                {message.imageUrl && (
                                    <img
                                        src={message.imageUrl}
                                        alt="uploaded"
                                        style={{
                                            width: '100%',
                                            borderRadius: 8,
                                            marginBottom: message.text ? 8 : 0
                                        }}
                                    />
                                )}
                                {message.text && (
                                    <ListItemText primary={message.text} />
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

            <Box sx={{ mt: 2 }}>
                <Button
                    component="label"
                    variant="outlined"
                    disabled={isLoading}
                >
                    Upload Image
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                handleImageUpload(e.target.files[0]);
                            }
                        }}
                    />
                </Button>
            </Box>
        </Paper>
    );
};

export default Chatbot;
