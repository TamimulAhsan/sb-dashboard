// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sb.tamimulahsan.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the access token to every request automatically - Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Redirect to login upon access token/refresh token expiration - response interceptor
api.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;

        // If the error is 401 and it's not the refresh token endpoint itself
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to avoid infinite loops

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`https://sb.tamimulahsan.com/api/refresh/`, {
                        refresh: refreshToken,
                    });

                    // Update tokens
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh); // If ROTATE_REFRESH_TOKENS is True

                    // Retry original request with new access token
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token also expired or invalid
                    console.error('Refresh token failed:', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // Redirect to login page
                    window.location.href = '/login';
                }
            } else {
                // No refresh token available, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);


export default api;
