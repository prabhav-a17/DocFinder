import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import ChatIcon from '@mui/icons-material/Chat';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { toast } from 'react-toastify';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleProtectedRoute = (path: string) => {
        if (!isAuthenticated) {
            toast.info('Please log in to access this feature');
            navigate('/login');
            return;
        }
        navigate(path);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    DocFinder
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        color="inherit"
                        onClick={() => handleProtectedRoute('/chatbot')}
                        startIcon={<ChatIcon />}
                    >
                        Chatbot
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => handleProtectedRoute('/health-journal')}
                        startIcon={<HealthAndSafetyIcon />}
                    >
                        Health Journal
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => handleProtectedRoute('/find-doctor')}
                        startIcon={<SearchIcon />}
                    >
                        Find Doctor
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => handleProtectedRoute('/appointments')}
                        startIcon={<CalendarMonthIcon />}
                    >
                        My Appointments
                    </Button>
                    {isAuthenticated ? (
                        <>
                            {user?.is_admin && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    Admin
                                </Button>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {user?.username?.[0]?.toUpperCase()}
                                </Avatar>
                                <Typography variant="body1">
                                    {user?.username}
                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 