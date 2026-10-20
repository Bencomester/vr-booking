const BASE_URL = '/api';

interface WrappedResponse<T> {
    success: boolean;
    data: T | null;
    error: { message: string; code: string } | null;
    timestamp: string;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
            const err = await response.json();
            if (err?.error?.message) errorMessage = err.error.message;
        } catch {
            errorMessage = `HTTP Error ${response.status}`;
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