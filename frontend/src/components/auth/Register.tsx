import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { loginSuccess } from '../../store/slices/authSlice';
import authService, { RegisterData } from '../../services/authService';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        email: '',
        password: '',
        password2: '',
        phone_number: ''
    });
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        try {
            console.log('Attempting registration with:', { ...formData, password: '[REDACTED]' });
            const response = await authService.register(formData);
            console.log('Registration successful:', response);
            dispatch(loginSuccess(response));
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.detail ||
                               err.response?.data?.username?.[0] ||
                               err.response?.data?.email?.[0] ||
                               err.response?.data?.password?.[0] ||
                               'Registration failed';
            setError(errorMessage);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Register
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                    margin="normal"
                    required
                />
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Register
                </Button>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/login" variant="body2">
                        Already have an account? Login
                    </Link>
                </Box>
            </form>
        </Box>
    );
};

export default Register; 