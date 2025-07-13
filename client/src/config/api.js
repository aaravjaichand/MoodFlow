// API configuration for different environments
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // In production, use relative URLs since the API is on the same domain
        return '';
    } else {
        // In development, use localhost or environment variable
        return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
    }
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
    ANALYZE_EMOTION: '/api/analyze-emotion',
    GET_RECOMMENDATIONS: '/api/get-recommendations',
    HEALTH: '/api/health'
}; 