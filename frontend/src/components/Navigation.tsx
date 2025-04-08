import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import ChatIcon from '@mui/icons-material/Chat';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
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
                <Box>
                    <Button
                        color="inherit"
                        onClick={() => navigate('/chatbot')}
                        sx={{ mr: 2 }}
                        startIcon={<ChatIcon />}
                    >
                        Chatbot
                    </Button>
                    {isAuthenticated ? (
                        <>
                            {user?.is_admin && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/admin/users')}
                                    sx={{ mr: 2 }}
                                >
                                    Admin
                                </Button>
                            )}
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{ mr: 2 }}
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 