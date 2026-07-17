import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userApi = {
  me: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  publicProfile: (id) => api.get(`/users/${id}`),
  wishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (listingId) => api.post(`/users/wishlist/${listingId}`),
};

export const listingApi = {
  list: (params) => api.get('/listings', { params }),
  detail: (id) => api.get(`/listings/${id}`),
  mine: () => api.get('/listings/mine'),
  create: (formData) => api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.patch(`/listings/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/listings/${id}`),
  nearby: (lng, lat, maxDistanceKm = 25) => api.get('/listings/nearby', { params: { lng, lat, maxDistanceKm } }),
};

export const swapApi = {
  create: (data) => api.post('/swaps', data),
  mine: (type) => api.get('/swaps/mine', { params: { type } }),
  detail: (id) => api.get(`/swaps/${id}`),
  respond: (id, action) => api.patch(`/swaps/${id}`, { action }),
};

export const chatApi = {
  history: (swapRequestId) => api.get(`/chat/${swapRequestId}`),
  send: (swapRequestId, text) => api.post(`/chat/${swapRequestId}`, { text }),
};

export const reviewApi = {
  create: (data) => api.post('/reviews', data),
  forUser: (userId) => api.get(`/reviews/user/${userId}`),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const reportApi = {
  create: (data) => api.post('/reports', data),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  toggleBlock: (id, reason) => api.patch(`/admin/users/${id}/block`, { reason }),
  listings: () => api.get('/admin/listings'),
  flagListing: (id, reason) => api.patch(`/admin/listings/${id}/flag`, { reason }),
  removeListing: (id) => api.delete(`/admin/listings/${id}`),
  reports: () => api.get('/admin/reports'),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  auditLogs: () => api.get('/admin/audit-logs'),
};
