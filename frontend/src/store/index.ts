import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatbotReducer from './slices/chatbotSlice';
import clinicFinderReducer from './slices/clinicFinderSlice';
import healthJournalReducer from './slices/healthJournalSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chatbot: chatbotReducer,
        clinicFinder: clinicFinderReducer,
        healthJournal: healthJournalReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 