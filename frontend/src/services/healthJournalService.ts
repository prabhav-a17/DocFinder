import axios from 'axios';
import { API_BASE_URL } from '../config';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const HEALTH_JOURNAL_API = `${API_BASE_URL}/health-journal/logs/`;

export interface HealthLog {
    id: number;
    clinic_name: string;
    rating: number;
    thoughts: string;
    created_at: string;
    updated_at: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        // Clear the invalid token and user data
        store.dispatch(logout());
        // Redirect to login with return path
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    throw error;
};

export const healthJournalService = {
    getLogs: async (): Promise<HealthLog[]> => {
        try {
            const response = await axios.get(HEALTH_JOURNAL_API, getAuthHeaders());
            return response.data;
        } catch (error: any) {
            if (error.message === 'No authentication token found') {
                window.location.href = '/login';
                return [];
            }
            handleAuthError(error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch logs');
        }
    },

    createLog: async (log: Omit<HealthLog, 'id' | 'created_at' | 'updated_at'>): Promise<HealthLog> => {
        try {
            const response = await axios.post(HEALTH_JOURNAL_API, log, getAuthHeaders());
            return response.data;
        } catch (error: any) {
            if (error.message === 'No authentication token found') {
                window.location.href = '/login';
                throw new Error('Please log in to create a health log');
            }
            handleAuthError(error);
            throw new Error(error.response?.data?.detail || 'Failed to create log');
        }
    },

    updateLog: async (id: number, log: Partial<HealthLog>): Promise<HealthLog> => {
        try {
            const response = await axios.patch(`${HEALTH_JOURNAL_API}${id}/`, log, getAuthHeaders());
            return response.data;
        } catch (error: any) {
            if (error.message === 'No authentication token found') {
                window.location.href = '/login';
                throw new Error('Please log in to update the health log');
            }
            handleAuthError(error);
            throw new Error(error.response?.data?.detail || 'Failed to update log');
        }
    },

    deleteLog: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${HEALTH_JOURNAL_API}${id}/`, getAuthHeaders());
        } catch (error: any) {
            if (error.message === 'No authentication token found') {
                window.location.href = '/login';
                throw new Error('Please log in to delete the health log');
            }
            handleAuthError(error);
            throw new Error(error.response?.data?.detail || 'Failed to delete log');
        }
    }
}; 