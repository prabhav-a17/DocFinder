import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Rating, Dialog, DialogTitle, DialogActions, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { healthJournalService, HealthLog } from '../services/healthJournalService';

interface LogEntry extends Omit<HealthLog, 'created_at' | 'updated_at'> {
    isEditing?: boolean;
}

const HealthJournal: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const fetchedLogs = await healthJournalService.getLogs();
            setLogs(fetchedLogs.map(log => ({
                ...log,
                isEditing: false
            })));
            setError(null);
        } catch (err) {
            setError('Failed to fetch logs. Please try again later.');
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLog = () => {
        const newLog: LogEntry = {
            id: Date.now(), // Temporary ID until saved
            clinic_name: '',
            rating: 0,
            thoughts: '',
            isEditing: true
        };
        setLogs([...logs, newLog]);
    };

    const handleDeleteClick = (logId: number) => {
        setLogToDelete(logId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (logToDelete !== null) {
            try {
                await healthJournalService.deleteLog(logToDelete);
                setLogs(logs.filter(log => log.id !== logToDelete));
                setError(null);
            } catch (err) {
                setError('Failed to delete log. Please try again later.');
                console.error('Error deleting log:', err);
            }
        }
        setDeleteDialogOpen(false);
        setLogToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setLogToDelete(null);
    };

    const handleEditClick = (logId: number) => {
        const updatedLogs = logs.map(log => 
            log.id === logId ? { ...log, isEditing: true } : log
        );
        setLogs(updatedLogs);
    };

    const handleSaveClick = async (logId: number) => {
        const logToSave = logs.find(log => log.id === logId);
        if (!logToSave) return;

        try {
            let savedLog: HealthLog;
            // Check if this is a temporary ID (created with Date.now())
            if (logId > 1000000000000) {  // Date.now() returns a 13-digit number
                // This is a new log
                savedLog = await healthJournalService.createLog({
                    clinic_name: logToSave.clinic_name,
                    rating: logToSave.rating,
                    thoughts: logToSave.thoughts
                });
            } else {
                // This is an existing log
                savedLog = await healthJournalService.updateLog(logId, {
                    clinic_name: logToSave.clinic_name,
                    rating: logToSave.rating,
                    thoughts: logToSave.thoughts
                });
            }

            const updatedLogs = logs.map(log => 
                log.id === logId ? { ...savedLog, isEditing: false } : log
            );
            setLogs(updatedLogs);
            setError(null);
        } catch (err) {
            setError('Failed to save log. Please try again later.');
            console.error('Error saving log:', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

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

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

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
                                value={log.clinic_name}
                                onChange={(e) => {
                                    const updatedLogs = logs.map(l => 
                                        l.id === log.id ? { ...l, clinic_name: e.target.value } : l
                                    );
                                    setLogs(updatedLogs);
                                }}
                                disabled={!log.isEditing}
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
                                disabled={!log.isEditing}
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
                                disabled={!log.isEditing}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                {log.isEditing ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={() => handleSaveClick(log.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleEditClick(log.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Edit
                                    </Button>
                                )}
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