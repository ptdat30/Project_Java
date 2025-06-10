
const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        googleLogin: '/api/auth/google-login',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
    }
};

export default config;