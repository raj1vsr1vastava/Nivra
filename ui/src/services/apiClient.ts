import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API base URL - adjust according to your backend service URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ErrorDetail {
  code?: string;
  message?: string;
  field?: string | null;
  fields?: Record<string, string[]> | null;
}

interface CustomError {
  code: string;
  message: string;
  field?: string | null;
  fields?: Record<string, string[]> | null;
  status?: number;
  data?: any;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Get error detail from response
    const errorResponse = error.response?.data as any;
    const errorDetail = errorResponse?.detail as ErrorDetail | string | undefined;
    let customError: CustomError;
    
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
    } else if (error.response?.status === 422 && typeof errorResponse === 'object') {
      // Special handling for 422 validation errors which may have a different structure
      // FastAPI often returns detailed validation errors in a different format
      const validationMessage = errorResponse.detail || 
                               (Array.isArray(errorResponse) && errorResponse.length > 0 ? 
                                 errorResponse.map(item => `${item.loc?.slice(-1)[0]}: ${item.msg}`).join(', ') : 
                                 'Validation error');
                                 
      customError = {
        code: 'VALIDATION_ERROR',
        message: typeof validationMessage === 'string' ? validationMessage : JSON.stringify(validationMessage),
        status: 422,
        data: errorResponse,
        fields: Array.isArray(errorResponse) ? 
          errorResponse.reduce((acc, item) => {
            const field = item.loc?.slice(-1)[0];
            if (field) {
              acc[field] = [item.msg];
            }
            return acc;
          }, {} as Record<string, string[]>) : null
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
