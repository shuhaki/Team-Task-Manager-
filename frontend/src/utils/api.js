const API_URL = '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authApi = {
  signup: (userData) => apiRequest('/auth/signup', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  getMe: () => apiRequest('/auth/me', 'GET'),
};

// Projects API
export const projectsApi = {
  getAll: () => apiRequest('/projects', 'GET'),
  getById: (id) => apiRequest(`/projects/${id}`, 'GET'),
  create: (data) => apiRequest('/projects', 'POST', data),
  update: (id, data) => apiRequest(`/projects/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/projects/${id}`, 'DELETE'),
  addMember: (id, email) => apiRequest(`/projects/${id}/members`, 'POST', { email }),
  removeMember: (id, userId) => apiRequest(`/projects/${id}/members/${userId}`, 'DELETE'),
};

// Tasks API
export const tasksApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/tasks?${queryString}`, 'GET');
  },
  getById: (id) => apiRequest(`/tasks/${id}`, 'GET'),
  create: (data) => apiRequest('/tasks', 'POST', data),
  update: (id, data) => apiRequest(`/tasks/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/tasks/${id}`, 'DELETE'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest('/dashboard', 'GET'),
};
