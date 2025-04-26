import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Rating, Dialog, DialogTitle, DialogActions, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { healthJournalService, HealthLog } from '../services/healthJournalService';
import '../styles/HealthJournal.css';

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
        <div className="health-journal-container">
            <div className="health-journal-header">
                <h2>Health Journal</h2>
                <Button
                    className="create-log-btn"
                    startIcon={<AddIcon />}
                    onClick={handleCreateLog}
                >
                    Create Log
                </Button>
            </div>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <div className="logs-container">
                {logs.length === 0 ? (
                    <div className="empty-state">
                        <AddIcon className="empty-state-icon" />
                        <Typography className="empty-state-text">
                            No logs yet. Click "Create Log" to start tracking your health journey.
                        </Typography>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div 
                            key={log.id} 
                            className={`log-card ${log.isEditing ? 'editing' : ''}`}
                        >
                            <TextField
                                className="clinic-name"
                                placeholder="Clinic / Physician Name"
                                value={log.clinic_name}
                                onChange={(e) => {
                                    const updatedLogs = logs.map(l => 
                                        l.id === log.id ? { ...l, clinic_name: e.target.value } : l
                                    );
                                    setLogs(updatedLogs);
                                }}
                                disabled={!log.isEditing}
                                variant="standard"
                            />
                            
                            <div className="rating-container">
                                <span className="rating-label">Rating:</span>
                                <Rating
                                    value={log.rating}
                                    onChange={(_, newValue) => {
                                        const updatedLogs = logs.map(l => 
                                            l.id === log.id ? { ...l, rating: newValue || 0 } : l
                                        );
                                        setLogs(updatedLogs);
                                    }}
                                    disabled={!log.isEditing}
                                />
                            </div>

                            <Typography className="thoughts-label">
                                Thoughts...
                            </Typography>
                            
                            <TextField
                                className="thoughts-input"
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

                            <div className="log-actions">
                                {log.isEditing ? (
                                    <Button
                                        className="action-btn save-btn"
                                        startIcon={<SaveIcon />}
                                        onClick={() => handleSaveClick(log.id)}
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        className="action-btn edit-btn"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleEditClick(log.id)}
                                    >
                                        Edit
                                    </Button>
                                )}
                                <Button
                                    className="action-btn delete-btn"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteClick(log.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Are you sure you want to delete this entry?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default HealthJournal; 