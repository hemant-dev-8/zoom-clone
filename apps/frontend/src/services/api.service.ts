// API Service for backend integration

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MEETING_API_URL = process.env.NEXT_PUBLIC_MEETING_API_URL || 'http://localhost:3002';

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export interface Meeting {
    id: string;
    title: string;
    host_id: string;
    start_time: string;
    status: string;
    settings: any;
}

class ApiService {
    private getHeaders(token?: string) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // Auth Service APIs
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    }

    async register(data: { email: string; password: string; name: string }): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    }

    async guestLogin(name: string, deviceId: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/guest`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, deviceId }),
        });
        if (!response.ok) throw new Error('Guest login failed');
        return response.json();
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) throw new Error('Token refresh failed');
        return response.json();
    }

    // Meeting Service APIs
    async createMeeting(data: { title: string; start_time: string; waiting_room?: boolean }, token: string): Promise<Meeting> {
        const response = await fetch(`${MEETING_API_URL}/meetings`, {
            method: 'POST',
            headers: this.getHeaders(token),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create meeting');
        return response.json();
    }

    async getMeeting(meetingId: string, token: string): Promise<Meeting> {
        const response = await fetch(`${MEETING_API_URL}/meetings/${meetingId}`, {
            method: 'GET',
            headers: this.getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to get meeting');
        return response.json();
    }

    async joinMeeting(meetingId: string, token: string): Promise<any> {
        const response = await fetch(`${MEETING_API_URL}/meetings/${meetingId}/join`, {
            method: 'POST',
            headers: this.getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to join meeting');
        return response.json();
    }

    async startMeeting(meetingId: string, token: string): Promise<Meeting> {
        const response = await fetch(`${MEETING_API_URL}/meetings/${meetingId}/start`, {
            method: 'POST',
            headers: this.getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to start meeting');
        return response.json();
    }

    async endMeeting(meetingId: string, token: string): Promise<Meeting> {
        const response = await fetch(`${MEETING_API_URL}/meetings/${meetingId}/end`, {
            method: 'POST',
            headers: this.getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to end meeting');
        return response.json();
    }
}

export const apiService = new ApiService();
