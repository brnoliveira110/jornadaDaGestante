import { User, PregnancyData, Consultation, Vaccine, ExamResult, Alert, Tip, Post, Comment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5167/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return {} as T;

    return response.json();
}

export const api = {
    // Users
    getUsers: () => fetchJson<User[]>('/users'),
    getUser: (id: string) => fetchJson<User>(`/users/${id}`),
    createUser: (user: User) => fetchJson<User>('/users', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (user: User) => fetchJson<void>(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) }),

    // Pregnancy Data
    getPregnancyData: (patientId: string) => fetchJson<PregnancyData>(`/pregnancydata/patient/${patientId}`),
    createPregnancyData: (data: PregnancyData) => fetchJson<PregnancyData>('/pregnancydata', { method: 'POST', body: JSON.stringify(data) }),
    updatePregnancyData: (data: PregnancyData) => fetchJson<void>(`/pregnancydata/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Consultations
    getConsultations: (patientId: string) => fetchJson<Consultation[]>(`/consultations/patient/${patientId}`),
    createConsultation: (data: Consultation) => fetchJson<Consultation>('/consultations', { method: 'POST', body: JSON.stringify(data) }),
    updateConsultation: (data: Consultation) => fetchJson<void>(`/consultations/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Vaccines
    getVaccines: (patientId: string) => fetchJson<Vaccine[]>(`/vaccines/patient/${patientId}`),
    createVaccine: (data: Vaccine) => fetchJson<Vaccine>('/vaccines', { method: 'POST', body: JSON.stringify(data) }),
    updateVaccine: (data: Vaccine) => fetchJson<void>(`/vaccines/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Exams
    getExams: (patientId: string) => fetchJson<ExamResult[]>(`/exams/patient/${patientId}`),

    createExam: (data: ExamResult) => fetchJson<ExamResult>('/exams', { method: 'POST', body: JSON.stringify(data) }),

    updateExam: (data: ExamResult) => fetchJson<void>(`/exams/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Alerts
    getAlerts: (userId: string) => fetchJson<Alert[]>(`/alerts/user/${userId}`),
    createAlert: (data: Alert) => fetchJson<Alert>('/alerts', { method: 'POST', body: JSON.stringify(data) }),
    markAlertRead: (id: string) => fetchJson<void>(`/alerts/${id}/read`, { method: 'PUT' }),

    // Tips
    getTips: () => fetchJson<Tip[]>('/tips'),

    // Community
    getPosts: () => fetchJson<Post[]>('/community'),
    createPost: (post: Post) => fetchJson<Post>('/community', { method: 'POST', body: JSON.stringify(post) }),
    addComment: (postId: string, comment: Comment) => fetchJson<Comment>(`/community/${postId}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
    likePost: (postId: string) => fetchJson<void>(`/community/${postId}/like`, { method: 'POST' }),
};
