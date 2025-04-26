import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { API_BASE_URL } from '../../config';

// Get initial state from localStorage
const getInitialState = (): AuthState => {
    const token = localStorage.getItem('token');
    return {
        user: null,
        token: token,
        isAuthenticated: !!token,
        loading: false,
        error: null,
    };
};

const initialState: AuthState = getInitialState();

// Create async thunk for session restoration
export const restoreUserSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, { dispatch }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found in localStorage');
            return null;
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
                return user;
            } else {
                console.log('Failed to restore session, clearing token');
                localStorage.removeItem('token');
                return null;
            }
        } catch (error) {
            console.error('Error restoring session:', error);
            return null;
        }
    }
);

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
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(restoreUserSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(restoreUserSession.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.token = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(restoreUserSession.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer; 