const API_BASE = import.meta.env.VITE_API_BASE || '/api';

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add mutation header for non-GET requests
  if (options.method && options.method !== 'GET') {
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'ERROR',
      response.status
    );
  }

  return response.json();
}

// Auth
export const auth = {
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => 
    request('/auth/logout', { method: 'POST' }),
  me: () => 
    request('/auth/me'),
};

// Items
export const items = {
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.q) searchParams.set('q', params.q);
    if (params.status) searchParams.set('status', params.status);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.sort) searchParams.set('sort', params.sort);
    const query = searchParams.toString();
    return request(`/items${query ? `?${query}` : ''}`);
  },
  get: (id) => 
    request(`/items/${id}`),
  create: (data) => 
    request('/items', { method: 'POST', body: data }),
  update: (id, data) => 
    request(`/items/${id}`, { method: 'PUT', body: data }),
  delete: (id) => 
    request(`/items/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) => 
    request(`/items/${id}/status`, { method: 'POST', body: { status } }),
};

// Tags
export const tags = {
  list: () => 
    request('/tags'),
  create: (name) => 
    request('/tags', { method: 'POST', body: { name } }),
  update: (id, name) => 
    request(`/tags/${id}`, { method: 'PUT', body: { name } }),
  delete: (id) => 
    request(`/tags/${id}`, { method: 'DELETE' }),
};

// Metrics
export const metrics = {
  summary: () => 
    request('/metrics/summary'),
};

export { ApiError };

