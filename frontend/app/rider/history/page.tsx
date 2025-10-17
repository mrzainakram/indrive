'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { FaMapMarkerAlt, FaStar, FaClock, FaDollarSign } from 'react-icons/fa'
import { rideApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function RideHistory() {
  const router = useRouter()
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadRides()
  }, [])

  const loadRides = async () => {
    try {
      const response = await rideApi.getMyRides()
      setRides(response.data)
    } catch (error: any) {
      toast.error('Failed to load ride history')
    } finally {
      setLoading(false)
    }
  }

  const filteredRides = filter === 'all' 
    ? rides 
    : rides.filter(r => r.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700'
      case 'cancelled': return 'bg-danger-100 text-danger-700'
      case 'started': return 'bg-primary-100 text-primary-700'
      default: return 'bg-warning-100 text-warning-700'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Rider']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['Rider']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ride History</h1>
            <p className="text-gray-600">View all your past rides</p>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {['all', 'completed', 'cancelled', 'requested'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Rides List */}
          <div className="space-y-4">
            {filteredRides.length === 0 ? (
              <div className="card text-center py-12">
                <FaClock className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No rides found</p>
              </div>
            ) : (
              filteredRides.map((ride) => (
                <div
                  key={ride.id}
                  className="card-hover"
                  onClick={() => router.push(`/rider/rides/${ride.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ride.status)}`}>
                      {ride.status}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${ride.finalFare || ride.riderOfferedFare}
                      </div>
                      <div className="text-sm text-gray-600">{ride.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Pickup</div>
                        <div className="text-gray-600 text-sm">{ride.pickupAddress}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-danger-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Dropoff</div>
                        <div className="text-gray-600 text-sm">{ride.dropoffAddress}</div>
                      </div>
                    </div>

                    {ride.driver && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <div className="font-medium">{ride.driver.fullName}</div>
                          <div className="flex items-center text-sm">
                            <FaStar className="text-warning-500 mr-1" />
                            <span>{ride.driver.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        {ride.driver.driverDetails && (
                          <div className="text-right text-sm">
                            <div>{ride.driver.driverDetails.vehicleModel}</div>
                            <div className="text-gray-600">{ride.driver.driverDetails.vehiclePlate}</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 pt-2 border-t">
                      <FaClock className="mr-2" />
                      {new Date(ride.requestedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

