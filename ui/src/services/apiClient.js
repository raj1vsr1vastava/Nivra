import axios from 'axios';

// API base URL - adjust according to your backend service URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Get error detail from response
    const errorDetail = error.response?.data?.detail;
    let customError;
    
    if (errorDetail && typeof errorDetail === 'object') {
      // Handle structured error responses
      customError = {
        code: errorDetail.code || 'ERROR',
        message: errorDetail.message || 'An error occurred',
        field: errorDetail.field || null,
        fields: errorDetail.fields || null,
        status: error.response?.status,
        data: error.response?.data
      };
    } else {
      // Handle string error responses (backwards compatibility)
      customError = {
        code: 'ERROR',
        message: typeof errorDetail === 'string' ? errorDetail : 'An unexpected error occurred',
        status: error.response?.status,
        data: error.response?.data
      };
    }
    
    // Log detailed error information to console
    console.error('API Error:', {
      status: customError.status,
      code: customError.code,
      message: customError.message,
      field: customError.field,
      fields: customError.fields,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      responseData: error.response?.data
    });
    
    return Promise.reject(customError);
  }
);

export default apiClient;
