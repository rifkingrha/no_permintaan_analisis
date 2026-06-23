const AUTH_API_URL = 'http://192.168.11.110:5174/api/v1/auth/login'; // Adjust URL as needed
const TOKEN_KEY = 'authToken';

export const authService = {
    async login(email, password) {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.token) {
            // Save the token upon successful login
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        } else {
            // Throw an error for the component to catch
            throw new Error(data.message || 'Invalid credentials');
        }
    },

    async logout() {
        localStorage.removeItem(TOKEN_KEY);
        const response = await fetch('http://192.168.11.110:5174/api/v1/auth/logout', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify({ email, password }),
        });
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};