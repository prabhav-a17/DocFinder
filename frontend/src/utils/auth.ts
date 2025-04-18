import { store } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { API_BASE_URL } from '../config';

export const restoreUserSession = async () => {
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
            store.dispatch(restoreSession(user));
        } else {
            console.log('Failed to restore session, clearing token');
            // If the token is invalid, clear it
            localStorage.removeItem('token');
            store.dispatch({ type: 'auth/logout' });
        }
    } catch (error) {
        console.error('Error restoring session:', error);
        // Don't automatically log out on network errors
        // Just keep the existing token and let the user try again
    }
}; 