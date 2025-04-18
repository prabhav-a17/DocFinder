import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { API_BASE_URL } from '../../config';

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
        restoreSession: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
    },
});

// Thunk to restore user session
export const restoreUserSession = () => async (dispatch: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found in localStorage');
        return;
    }

    try {
        console.log('Attempting to restore session with token:', token);
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Session restore response status:', response.status);
        
        if (response.ok) {
            const user = await response.json();
            console.log('Successfully restored session for user:', user);
            dispatch(restoreSession(user));
        } else {
            console.log('Failed to restore session, clearing token');
            // If the token is invalid, clear it
            localStorage.removeItem('token');
            dispatch(logout());
        }
    } catch (error) {
        console.error('Error restoring session:', error);
        // Don't automatically log out on network errors
        // Just keep the existing token and let the user try again
    }
};

export const { loginStart, loginSuccess, loginFailure, logout, clearError, restoreSession } = authSlice.actions;
export default authSlice.reducer; 