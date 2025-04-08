import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Rating, Dialog, DialogTitle, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface LogEntry {
    id: number;
    clinicName: string;
    rating: number;
    thoughts: string;
}

const HealthJournal: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState<number | null>(null);

    const handleCreateLog = () => {
        const newLog: LogEntry = {
            id: Date.now(),
            clinicName: '',
            rating: 0,
            thoughts: ''
        };
        setLogs([...logs, newLog]);
    };

    const handleDeleteClick = (logId: number) => {
        setLogToDelete(logId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (logToDelete !== null) {
            setLogs(logs.filter(log => log.id !== logToDelete));
        }
        setDeleteDialogOpen(false);
        setLogToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setLogToDelete(null);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, height: '70vh', overflow: 'auto' }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5">
                    Health Journal
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateLog}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3
                    }}
                >
                    Create Log
                </Button>
            </Box>
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 'calc(100% - 80px)'
            }}>
                {logs.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Typography color="text.secondary">
                            Select Create to start a new log entry...
                        </Typography>
                    </Box>
                ) : (
                    logs.map((log) => (
                        <Paper
                            key={log.id}
                            elevation={2}
                            sx={{
                                p: 3,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Clinic / Physician Name"
                                variant="standard"
                                value={log.clinicName}
                                onChange={(e) => {
                                    const updatedLogs = logs.map(l => 
                                        l.id === log.id ? { ...l, clinicName: e.target.value } : l
                                    );
                                    setLogs(updatedLogs);
                                }}
                                sx={{
                                    mb: 2,
                                    '& .MuiInput-root': {
                                        fontSize: '1.2rem',
                                        fontWeight: 500
                                    }
                                }}
                            />
                            <Rating
                                value={log.rating}
                                onChange={(_, newValue) => {
                                    const updatedLogs = logs.map(l => 
                                        l.id === log.id ? { ...l, rating: newValue || 0 } : l
                                    );
                                    setLogs(updatedLogs);
                                }}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Thoughts...
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Enter your thoughts here..."
                                value={log.thoughts}
                                onChange={(e) => {
                                    const updatedLogs = logs.map(l => 
                                        l.id === log.id ? { ...l, thoughts: e.target.value } : l
                                    );
                                    setLogs(updatedLogs);
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteClick(log.id)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Are you sure you want to delete this entry?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDelete} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default HealthJournal; 