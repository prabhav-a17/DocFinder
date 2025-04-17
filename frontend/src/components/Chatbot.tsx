import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
    text: string;
    isUser: boolean;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
    const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        fetchPinnedMessages();
        fetchChatHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            const response = await fetch('http://localhost:8001/api/chat/history/');
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            setChatHistory(data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleNewChatClick = async () => {
        setMessages([]);
        setInput('');
        setCurrentConversationId(null);

        try {
            const response = await fetch('http://localhost:8001/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: "Start a new chat",
                    conversation_id: null,
                    system_prompt: "Welcome to DocFinder! How can I assist you today?"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create new conversation');
            }

            const data = await response.json();
            const newConversationId = data.conversation_id;

            // Add welcome message
            const welcomeMessage: Message = {
                id: data.message_id,
                text: data.response,
                isUser: false,
                conversation_id: newConversationId,
                timestamp: new Date().toISOString()
            };

            // Update states
            setMessages([welcomeMessage]);
            setCurrentConversationId(newConversationId);

            // Create new conversation entry
            const newConversation: Conversation = {
                conversation_id: newConversationId,
                timestamp: new Date().toISOString(),
                messages: [{
                    id: data.message_id,
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString(),
                    is_pinned: false
                }]
            };

            // Update chat history
            setChatHistory(prev => [newConversation, ...prev]);
        } catch (error) {
            console.error('Error creating new conversation:', error);
        }
    };

    const handleHistoryItemClick = async (conversation: Conversation) => {
        try {
            // Format and set messages from the conversation history
            const formattedMessages = conversation.messages.map(msg => ({
                id: msg.id,
                text: msg.content,
                isUser: msg.role === 'user',
                is_pinned: msg.is_pinned,
                timestamp: msg.timestamp,
                conversation_id: conversation.conversation_id
            }));

            // Update states
            setMessages(formattedMessages);
            setCurrentConversationId(conversation.conversation_id);
            setInput('');

            // Move the clicked conversation to the top of the history
            setChatHistory(prev => {
                const updatedHistory = prev.filter(conv => conv.conversation_id !== conversation.conversation_id);
                return [conversation, ...updatedHistory];
            });
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const fetchPinnedMessages = async () => {
        try {
            const response = await fetch('http://localhost:8001/api/chat/pinned/');
            if (!response.ok) {
                throw new Error('Failed to fetch pinned messages');
            }
            const data = await response.json();
            setPinnedMessages(data.map((msg: any) => ({
                id: msg.id,
                text: msg.content,
                isUser: msg.role === 'user',
                is_pinned: msg.is_pinned,
                conversation_id: msg.conversation_id,
                timestamp: msg.timestamp
            })));
        } catch (error) {
            console.error('Error fetching pinned messages:', error);
        }
    };

    const handleTogglePin = async (messageId: number) => {
        try {
            const response = await fetch(`http://localhost:8001/api/chat/pin/${messageId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to toggle pin');
            }
            const data = await response.json();
            
            // Update the pin status in the main messages list
            setMessages(prev => prev.map(msg => 
                msg.id === messageId ? { ...msg, is_pinned: data.is_pinned } : msg
            ));
            
            // Update pinned messages list
            if (data.is_pinned) {
                // If message was pinned, find it in messages and add to pinned messages
                const pinnedMessage = messages.find(msg => msg.id === messageId);
                if (pinnedMessage) {
                    setPinnedMessages(prev => [...prev, { ...pinnedMessage, is_pinned: true }]);
                }
            } else {
                // If message was unpinned, remove it from pinned messages
                setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            text: input,
            isUser: true,
            conversation_id: currentConversationId || undefined
        };

        // Add user message to current conversation
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8001/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: input,
                    conversation_id: currentConversationId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            
            const botMessage: Message = {
                id: data.message_id,
                text: data.response,
                isUser: false,
                conversation_id: data.conversation_id,
                timestamp: new Date().toISOString()
            };

            // Update messages state
            setMessages(prev => [
                ...prev.slice(0, -1),
                updatedUserMessage,
                botMessage
            ]);

            // Update chat history
            setChatHistory(prev => {
                const updatedHistory = [...prev];
                const conversationIndex = updatedHistory.findIndex(
                    conv => conv.conversation_id === data.conversation_id
                );

                if (conversationIndex !== -1) {
                    // Update existing conversation
                    updatedHistory[conversationIndex] = {
                        ...updatedHistory[conversationIndex],
                        timestamp: new Date().toISOString(),
                        messages: [
                            ...updatedHistory[conversationIndex].messages,
                            {
                                id: data.user_message_id,
                                role: 'user',
                                content: input,
                                timestamp: new Date().toISOString(),
                                is_pinned: false
                            },
                            {
                                id: data.message_id,
                                role: 'assistant',
                                content: data.response,
                                timestamp: new Date().toISOString(),
                                is_pinned: false
                            }
                        ]
                    };
                } else {
                    // Create new conversation
                    updatedHistory.unshift({
                        conversation_id: data.conversation_id,
                        timestamp: new Date().toISOString(),
                        messages: [
                            {
                                id: data.user_message_id,
                                role: 'user',
                                content: input,
                                timestamp: new Date().toISOString(),
                                is_pinned: false
                            },
                            {
                                id: data.message_id,
                                role: 'assistant',
                                content: data.response,
                                timestamp: new Date().toISOString(),
                                is_pinned: false
                            }
                        ]
                    });
                }

                return updatedHistory;
            });

            setCurrentConversationId(data.conversation_id);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                conversation_id: currentConversationId || undefined
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

    const handleDeleteConversation = async (conversationId?: string) => {
        try {
            const url = conversationId 
                ? `http://localhost:8001/api/chat/history/delete/${conversationId}/`
                : 'http://localhost:8001/api/chat/history/delete/';
            
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete chat history');
            }

            // Clear current messages if we deleted the current conversation
            if (!conversationId || conversationId === currentConversationId) {
                setMessages([]);
                setCurrentConversationId(null);
            }

            // Refresh chat history
            fetchChatHistory();
        } catch (error) {
            console.error('Error deleting chat history:', error);
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
                                <ListItemText primary={message.text} />
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
