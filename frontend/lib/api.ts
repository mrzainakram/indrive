import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
}

// User API
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAllUsers: (role?: string) => api.get('/users', { params: { role } }),
}

// Ride API
export const rideApi = {
  createRide: (data: any) => api.post('/rides', data),
  getRide: (id: string) => api.get(`/rides/${id}`),
  getMyRides: (status?: string) => api.get('/rides/my-rides', { params: { status } }),
  getAvailableRides: () => api.get('/rides/available'),
  createOffer: (data: any) => api.post('/rides/offers', data),
  acceptOffer: (offerId: string) => api.post(`/rides/offers/${offerId}/accept`),
  updateRideStatus: (id: string, data: any) => api.put(`/rides/${id}/status`, data),
  getAllRides: (page = 1, pageSize = 50) => api.get('/rides', { params: { page, pageSize } }),
}

// Driver API
export const driverApi = {
  updateAvailability: (isAvailable: boolean) => api.put('/drivers/availability', { isAvailable }),
  updateLocation: (latitude: number, longitude: number) => api.put('/drivers/location', { latitude, longitude }),
}

// Rating API
export const ratingApi = {
  createRating: (data: any) => api.post('/ratings', data),
  getRatingsForUser: (userId: string) => api.get(`/ratings/user/${userId}`),
  getRatingForRide: (rideId: string) => api.get(`/ratings/ride/${rideId}`),
}

// Notification API
export const notificationApi = {
  getNotifications: (unreadOnly = false) => api.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
}

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  updateUserStatus: (userId: string, isActive: boolean) => api.put(`/admin/users/${userId}/status`, { isActive }),
}

