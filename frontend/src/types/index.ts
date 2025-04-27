export interface User {
    id: number;
    username: string;
    email: string;
    phone_number?: string;
    profile_picture?: string;
    is_admin: boolean;
}

export interface HealthcareProvider {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone_number: string;
    website?: string;
    rating?: number;
    specialization?: Specialization;
    is_clinic: boolean;
    is_hospital: boolean;
    is_private_practice: boolean;
}

export interface Specialization {
    id: number;
    name: string;
    description?: string;
}

export interface OperatingHours {
    id: number;
    provider: number;
    day: string;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
}

export interface DoctorVisit {
    id: number;
    doctor_name: string;
    clinic_name: string;
    visit_date: string;
    next_appointment?: string;
    notes: string;
}

export interface HealthNote {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

export interface Conversation {
    id: number;
    user: number;
    created_at: string;
    updated_at: string;
    is_pinned: boolean;
    summary?: string;
}

export interface Message {
    id: number;
    conversation: number;
    content: string;
    is_user: boolean;
    created_at: string;
    image?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
} 