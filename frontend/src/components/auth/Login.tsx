import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import authService, { LoginCredentials } from '../../services/authService';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        dispatch(loginStart());

        try {
            const response = await authService.login(credentials);
            dispatch(loginSuccess({
                user: response.user,
                token: response.token,
                refreshToken: response.refreshToken
            }));
            navigate('/appointments');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Login failed';
            setError(errorMessage);
            dispatch(loginFailure(errorMessage));
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
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
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Login
                </Button>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/register" variant="body2">
                        Don't have an account? Register
                    </Link>
                    <br />
                    <Link href="/forgot-password" variant="body2">
                        Forgot password?
                    </Link>
                </Box>
            </form>
        </Box>
    );
};

export default Login; 