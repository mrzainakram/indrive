import { create } from 'zustand'

interface User {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  role: string
  profileImage?: string
  isActive: boolean
  isVerified: boolean
  rating: number
  totalRatings: number
  driverDetails?: any
}

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
    set({ user })
  },
  
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
    set({ token })
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ user: null, token: null })
  },
  
  isAuthenticated: () => {
    return !!get().token && !!get().user
  },
}))

interface Ride {
  id: string
  status: string
  rider?: User
  driver?: User
  pickupAddress: string
  dropoffAddress: string
  pickupLatitude: number
  pickupLongitude: number
  dropoffLatitude: number
  dropoffLongitude: number
  riderOfferedFare: number
  finalFare?: number
  aiSuggestedFareMin?: number
  aiSuggestedFareMax?: number
  offers?: any[]
  requestedAt: string
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
}

interface RideState {
  currentRide: Ride | null
  rides: Ride[]
  setCurrentRide: (ride: Ride | null) => void
  setRides: (rides: Ride[]) => void
  updateRide: (ride: Ride) => void
}

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  rides: [],
  
  setCurrentRide: (ride) => set({ currentRide: ride }),
  
  setRides: (rides) => set({ rides }),
  
  updateRide: (ride) => set((state) => ({
    currentRide: state.currentRide?.id === ride.id ? ride : state.currentRide,
    rides: state.rides.map((r) => (r.id === ride.id ? ride : r)),
  })),
}))

