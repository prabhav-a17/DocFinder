import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A'
        }}>
            {/* Hero Section */}
            <Box sx={{
                py: { xs: 10, md: 14 },
                px: { xs: 2, md: 4 },
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Box sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        p: { xs: 4, md: 6 },
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <Typography variant="h1" component="h1" sx={{
                            fontWeight: 800,
                            mb: 3,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            color: '#000000',
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em'
                        }}>
                            Find the Right Doctor for You
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            mb: 4, 
                            color: '#000000',
                            fontWeight: 400,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}>
                            Connect with healthcare providers based on your symptoms and needs
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            justifyContent: 'center',
                            flexWrap: 'wrap' 
                        }}>
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<DashboardIcon />}
                                        onClick={() => navigate('/dashboard')}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(45deg, #007ACC 30%, #0099FF 90%)',
                                            boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 16px rgba(0, 122, 204, 0.4)',
                                                background: 'linear-gradient(45deg, #0066CC 30%, #007ACC 90%)'
                                            }
                                        }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<CalendarMonthIcon />}
                                        onClick={() => navigate('/appointments')}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            borderColor: '#007ACC',
                                            borderWidth: 2,
                                            color: '#007ACC',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#005c99',
                                                backgroundColor: 'rgba(0, 122, 204, 0.04)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Appointments
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/register')}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(45deg, #007ACC 30%, #0099FF 90%)',
                                            boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 16px rgba(0, 122, 204, 0.4)',
                                                background: 'linear-gradient(45deg, #0066CC 30%, #007ACC 90%)'
                                            }
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            borderColor: '#007ACC',
                                            borderWidth: 2,
                                            color: '#007ACC',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#005c99',
                                                backgroundColor: 'rgba(0, 122, 204, 0.04)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 10, px: { xs: 2, md: 4 } }}>
                <Typography variant="h2" component="h2" align="center" sx={{
                    fontWeight: 800,
                    mb: 8,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    color: '#000000',
                    letterSpacing: '-0.02em'
                }}>
                    How DocFinder Works
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 4
                }}>
                    {[
                        {
                            title: 'Symptom Analysis',
                            description: 'Describe your symptoms and get personalized doctor recommendations',
                            icon: '🔍'
                        },
                        {
                            title: 'Doctor Search',
                            description: 'Find doctors and clinics near you with verified reviews and ratings',
                            icon: '👨‍⚕️'
                        },
                        {
                            title: 'Health Journal',
                            description: 'Track your health history and doctor visits in one place',
                            icon: '📝'
                        }
                    ].map((feature, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(230, 242, 255, 0.5)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)',
                                    borderColor: '#007ACC'
                                }
                            }}
                        >
                            <Typography variant="h4" sx={{ mb: 2 }}>
                                {feature.icon}
                            </Typography>
                            <Typography variant="h5" sx={{ 
                                mb: 2, 
                                fontWeight: 600,
                                color: '#000000'
                            }}>
                                {feature.title}
                            </Typography>
                            <Typography sx={{ 
                                color: '#000000',
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                            }}>
                                {feature.description}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* Chatbot Section */}
            <Box sx={{
                py: 10,
                px: { xs: 2, md: 4 },
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)',
                position: 'relative',
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Box sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        p: { xs: 4, md: 6 },
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}>
                        <Typography variant="h2" component="h2" sx={{
                            fontWeight: 800,
                            mb: 3,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#000000',
                            letterSpacing: '-0.02em'
                        }}>
                            Try Our AI Chatbot
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            mb: 4, 
                            color: '#000000',
                            fontWeight: 400,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}>
                            Get instant medical advice and doctor recommendations based on your symptoms
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/chatbot')}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #007ACC 30%, #0099FF 90%)',
                                boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(0, 122, 204, 0.4)',
                                    background: 'linear-gradient(45deg, #0066CC 30%, #007ACC 90%)'
                                }
                            }}
                        >
                            Start Chat
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage; 