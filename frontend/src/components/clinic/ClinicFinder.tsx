import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ClinicFinder: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleSearch = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            // TODO: Implement clinic search API call
            console.log('Searching for clinics with query:', searchQuery);
        } catch (error) {
            console.error('Error searching for clinics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Find a Clinic
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'calc(66.666% - 8px)' } }}>
                        <TextField
                            fullWidth
                            label="Search for clinics or specialties"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 0, minWidth: { xs: '100%', sm: 'calc(33.333% - 8px)' } }}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Search'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
            {/* TODO: Add clinic results display */}
        </Box>
    );
};

export default ClinicFinder; 