const API_BASE = 'http://localhost:8080/vr/api';

interface WrappedResponse<T> {
    success: boolean;
    data: T | null;
    error: { message: string; code: string } | null;
    timestamp: string;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('vr_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status} on ${endpoint}`;
        try {
            const errJson = (await response.json()) as WrappedResponse<T>;
            if (errJson?.error?.message) {
                errorMessage = errJson.error.message;
            }
        } catch {
            errorMessage = `HTTP Error ${response.status} on ${endpoint}`;
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
        return undefined as T;
    }

    const json = JSON.parse(text) as WrappedResponse<T> | T;

    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        const wrapped = json as WrappedResponse<T>;
        if (!wrapped.success) {
            throw new Error(wrapped.error?.message || 'Unknown backend error');
        }
        return wrapped.data as T;
    }

    return json as T;
}