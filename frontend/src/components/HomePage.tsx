import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
            color: 'white'
        }}>
            {/* Hero Section */}
            <Box sx={{
                py: { xs: 8, md: 12 },
                px: { xs: 2, md: 4 },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                    opacity: 0.5
                }
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 4,
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h2" component="h1" sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Find the Right Doctor for You
                            </Typography>
                            <Typography variant="h5" sx={{ 
                                mb: 4, 
                                opacity: 0.8,
                                color: '#e0e0e0'
                            }}>
                                Connect with healthcare providers based on your symptoms and needs
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                                        background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2d5fa3 0%, #00b8e6 100%)'
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
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'rgba(255,255,255,0.4)',
                                            background: 'rgba(255,255,255,0.05)'
                                        }
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="/doctor-illustration.svg"
                                alt="Doctor illustration"
                                sx={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, md: 4 } }}>
                <Typography variant="h3" component="h2" align="center" sx={{
                    fontWeight: 700,
                    mb: 6,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
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
                            gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
                        },
                        {
                            title: 'Doctor Search',
                            description: 'Find doctors and clinics near you with verified reviews and ratings',
                            gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                        },
                        {
                            title: 'Health Journal',
                            description: 'Track your health history and doctor visits in one place',
                            gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)'
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
                                borderRadius: 2,
                                background: feature.gradient,
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            <Typography variant="h5" sx={{ 
                                mb: 2, 
                                fontWeight: 600,
                                color: 'white'
                            }}>
                                {feature.title}
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '1.1rem'
                            }}>
                                {feature.description}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* Chatbot Section */}
            <Box sx={{
                py: 8,
                px: { xs: 2, md: 4 },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                    opacity: 0.5
                }
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 4,
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h3" component="h2" sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Try Our AI Chatbot
                            </Typography>
                            <Typography variant="h5" sx={{ 
                                mb: 4, 
                                opacity: 0.8,
                                color: '#e0e0e0'
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
                                    background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2d5fa3 0%, #00b8e6 100%)'
                                    }
                                }}
                            >
                                Start Chat
                            </Button>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="/chatbot-illustration.svg"
                                alt="Chatbot illustration"
                                sx={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Call to Action */}
            <Box sx={{
                py: 8,
                px: { xs: 2, md: 4 },
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        textAlign: 'center',
                        maxWidth: '800px',
                        mx: 'auto'
                    }}>
                        <Typography variant="h3" component="h2" sx={{
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Ready to Find Your Doctor?
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            mb: 4, 
                            opacity: 0.8,
                            color: '#e0e0e0'
                        }}>
                            Join thousands of users who have found the right healthcare provider through DocFinder
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                px: 6,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2d5fa3 0%, #00b8e6 100%)'
                                }
                            }}
                        >
                            Create Your Account
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage; 