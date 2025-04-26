import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:8001/api/auth';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
    phone_number: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetData {
    password: string;
    password2: string;
    token: string;
}

const authService = {
    register: async (data: RegisterData) => {
        try {
            const response = await axios.post(`${API_URL}/register/`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Registration API error:', error.response?.data || error.message);
            throw error;
        }
    },

    login: async (credentials: LoginCredentials) => {
        try {
            const response = await axios.post(`${API_URL}/login/`, credentials);
            const { access, refresh, user } = response.data;
            return { 
                user, 
                token: access, 
                refreshToken: refresh 
            };
        } catch (error: any) {
            console.error('Login API error:', error.response?.data || error.message);
            throw error;
        }
    },

    refreshToken: async (refreshToken: string) => {
        try {
            const response = await axios.post(`${API_URL}/token/refresh/`, {
                refresh: refreshToken
            });
            return response.data.access;
        } catch (error: any) {
            console.error('Token refresh error:', error.response?.data || error.message);
            throw error;
        }
    },

    requestPasswordReset: async (data: PasswordResetRequest) => {
        const response = await axios.post(`${API_URL}/password-reset-request/`, data);
        return response.data;
    },

    resetPassword: async (data: PasswordResetData) => {
        const response = await axios.post(`${API_URL}/password-reset/`, data);
        return response.data;
    },

    getUsers: async (token: string) => {
        const response = await axios.get(`${API_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateUser: async (userId: number, data: Partial<User>, token: string) => {
        const response = await axios.put(`${API_URL}/users/${userId}/`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteUser: async (userId: number, token: string) => {
        await axios.delete(`${API_URL}/users/${userId}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

export default authService; 