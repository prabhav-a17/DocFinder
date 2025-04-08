import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Chatbot: React.FC = () => {
    return (
        <Paper elevation={3} sx={{ p: 3, height: '70vh' }}>
            <Typography variant="h5" gutterBottom>
                Chatbot Interface
            </Typography>
            <Box sx={{ 
                height: 'calc(100% - 40px)', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
                p: 2
            }}>
                <Typography color="text.secondary">
                    Chatbot interface will be implemented here
                </Typography>
            </Box>
        </Paper>
    );
};

export default Chatbot; 