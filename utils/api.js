const API_URL = process.env.NEXT_PUBLIC_API_URL;
import axios from 'axios';

const API = axios.create({
    baseURL: API_URL && API_URL.endsWith('/api') ? API_URL : `${API_URL || 'http://localhost:8000'}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const generateMockTest = (testConfig) => API.post('/student/tests/generate/', testConfig);
export const fetchTestSession = (testId) => API.get(`/student/tests/${testId}/session/`);
export const submitMockTest = (testId, answers) => API.post(`/student/tests/${testId}/submit/`, { answers });
export const fetchTestAnalytics = (testId) => API.get(`/student/tests/${testId}/analytics/`);
export const fetchTestQuestions = (testId, page = 1) => API.get(`/student/tests/${testId}/questions/?page=${page}`);
export const fetchTestHistory = () => API.get('/student/tests/history/');

// --- ADMIN: CATEGORY MANAGEMENT ---
export const fetchAllCategories = () => API.get('/admin/categories/');
export const createCategory = (data) => API.post('/admin/categories/', data);
export const deleteCategory = (id) => API.delete(`/admin/categories/${id}/`);

// --- ADMIN: QUESTION BANK MANAGEMENT ---
export const fetchAllQuestions = (page = 1) => API.get(`/admin/questions/?page=${page}`);
export const fetchQuestion = (id) => API.get(`/admin/questions/${id}/`);
export const createQuestion = (data) => API.post('/admin/questions/', data);
export const updateQuestion = (id, data) => API.put(`/admin/questions/${id}/`, data);
export const deleteQuestion = (id) => API.delete(`/admin/questions/${id}/`);

const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem('access_token');

    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    let baseUrl = API_URL || 'http://localhost:8000';
    if (!baseUrl.endsWith('/api')) {
        baseUrl += '/api';
    }
    const finalPath = path.startsWith('/api/') ? path.slice(4) : path;
    const response = await fetch(`${baseUrl}${finalPath}`, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    return response;
};

export default apiFetch;