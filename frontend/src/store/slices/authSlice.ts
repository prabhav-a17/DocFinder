import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { API_BASE_URL } from '../../config';

// Get initial state from localStorage
const getInitialState = (): AuthState => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return {
        user: null,
        token: token,
        refreshToken: refreshToken,
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
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!token || !refreshToken) {
            console.log('No tokens found in localStorage');
            return null;
        }

        try {
            // First try to get user info with current token
            const response = await fetch(`${API_BASE_URL}/auth/me/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const user = await response.json();
                console.log('Successfully restored session for user:', user);
                return { user, token, refreshToken };
            } else if (response.status === 401) {
                // Token expired, try to refresh
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const { access } = await refreshResponse.json();
                    // Try to get user info with new token
                    const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${access}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (userResponse.ok) {
                        const user = await userResponse.json();
                        localStorage.setItem('token', access);
                        return { user, token: access, refreshToken };
                    }
                }
            }

            // If we get here, we couldn't restore the session
            console.log('Failed to restore session, clearing tokens');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return null;
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
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        clearError: (state) => {
            state.error = null;
        },
        setToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
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
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.token = null;
                    state.refreshToken = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(restoreUserSession.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            });
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer; 