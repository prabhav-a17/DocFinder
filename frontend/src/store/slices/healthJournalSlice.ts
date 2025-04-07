import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DoctorVisit, HealthNote } from '../../types';

interface HealthJournalState {
    visits: DoctorVisit[];
    notes: HealthNote[];
    selectedVisit: DoctorVisit | null;
    selectedNote: HealthNote | null;
    loading: boolean;
    error: string | null;
}

const initialState: HealthJournalState = {
    visits: [],
    notes: [],
    selectedVisit: null,
    selectedNote: null,
    loading: false,
    error: null,
};

const healthJournalSlice = createSlice({
    name: 'healthJournal',
    initialState,
    reducers: {
        setVisits: (state, action: PayloadAction<DoctorVisit[]>) => {
            state.visits = action.payload;
        },
        setNotes: (state, action: PayloadAction<HealthNote[]>) => {
            state.notes = action.payload;
        },
        setSelectedVisit: (state, action: PayloadAction<DoctorVisit>) => {
            state.selectedVisit = action.payload;
        },
        setSelectedNote: (state, action: PayloadAction<HealthNote>) => {
            state.selectedNote = action.payload;
        },
        addVisit: (state, action: PayloadAction<DoctorVisit>) => {
            state.visits.push(action.payload);
        },
        addNote: (state, action: PayloadAction<HealthNote>) => {
            state.notes.push(action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setVisits,
    setNotes,
    setSelectedVisit,
    setSelectedNote,
    addVisit,
    addNote,
    setLoading,
    setError,
    clearError,
} = healthJournalSlice.actions;

export default healthJournalSlice.reducer; 