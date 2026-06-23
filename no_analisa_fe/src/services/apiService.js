const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 1. GET THE TOKEN INSIDE THE FUNCTION
    const token = localStorage.getItem('accessToken'); 
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        // Use the token variable we just retrieved
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status === 401 && !window.location.pathname.includes('/login')) {
                localStorage.clear();
                window.location.href = '/login';
                return;
            }
            throw new Error(result.error || result.message || `Error: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
};