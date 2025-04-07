import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HealthcareProvider, Specialization } from '../../types';

interface ClinicFinderState {
    providers: HealthcareProvider[];
    specializations: Specialization[];
    selectedProvider: HealthcareProvider | null;
    loading: boolean;
    error: string | null;
    filters: {
        distance: number;
        rating: number;
        specialization: number | null;
        isOpenNow: boolean;
    };
}

const initialState: ClinicFinderState = {
    providers: [],
    specializations: [],
    selectedProvider: null,
    loading: false,
    error: null,
    filters: {
        distance: 10, // Default 10km radius
        rating: 0,
        specialization: null,
        isOpenNow: false,
    },
};

const clinicFinderSlice = createSlice({
    name: 'clinicFinder',
    initialState,
    reducers: {
        setProviders: (state, action: PayloadAction<HealthcareProvider[]>) => {
            state.providers = action.payload;
        },
        setSpecializations: (state, action: PayloadAction<Specialization[]>) => {
            state.specializations = action.payload;
        },
        setSelectedProvider: (state, action: PayloadAction<HealthcareProvider>) => {
            state.selectedProvider = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<ClinicFinderState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setProviders,
    setSpecializations,
    setSelectedProvider,
    setLoading,
    setError,
    setFilters,
    clearError,
} = clinicFinderSlice.actions;

export default clinicFinderSlice.reducer; 