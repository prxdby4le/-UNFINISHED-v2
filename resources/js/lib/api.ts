// API helper for Inertia.js
// Inertia handles requests automatically, but we can use this for direct API calls if needed
export const api = {
    get: async (url: string, params?: Record<string, any>) => {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        const response = await fetch(url + queryString, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        return response.json();
    },
};
