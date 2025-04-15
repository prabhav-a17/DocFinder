import axios from 'axios';
import { API_BASE_URL } from '../config';

const HEALTH_JOURNAL_API = `${API_BASE_URL}/health-journal/logs/`;

export interface HealthLog {
    id: number;
    clinic_name: string;
    rating: number;
    thoughts: string;
    created_at: string;
    updated_at: string;
}

export const healthJournalService = {
    getLogs: async (): Promise<HealthLog[]> => {
        const response = await axios.get(HEALTH_JOURNAL_API);
        return response.data;
    },

    createLog: async (log: Omit<HealthLog, 'id' | 'created_at' | 'updated_at'>): Promise<HealthLog> => {
        const response = await axios.post(HEALTH_JOURNAL_API, log);
        return response.data;
    },

    updateLog: async (id: number, log: Partial<HealthLog>): Promise<HealthLog> => {
        const response = await axios.patch(`${HEALTH_JOURNAL_API}${id}/`, log);
        return response.data;
    },

    deleteLog: async (id: number): Promise<void> => {
        await axios.delete(`${HEALTH_JOURNAL_API}${id}/`);
    }
}; 