'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { FaToggleOn, FaToggleOff, FaMapMarkerAlt, FaDollarSign, FaClock, FaStar, FaPhone } from 'react-icons/fa'
import { rideApi, driverApi } from '@/lib/api'
import { useAuthStore, useRideStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { signalRService } from '@/lib/signalr'
import { useRouter } from 'next/navigation'

export default function DriverDashboard() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const { currentRide, setCurrentRide } = useRideStore()
  const [isAvailable, setIsAvailable] = useState(false)
  const [availableRides, setAvailableRides] = useState<any[]>([])
  const [recentRides, setRecentRides] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [selectedRide, setSelectedRide] = useState<any>(null)
  const [offerData, setOfferData] = useState({
    offeredFare: '',
    estimatedArrivalMinutes: '',
    message: '',
  })

  useEffect(() => {
    loadCurrentRide()
    loadRecentRides()
    setupSignalR()
    
    // Check availability from driver details
    if (user?.driverDetails) {
      setIsAvailable(user.driverDetails.isAvailable)
    }

    return () => {
      signalRService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (isAvailable) {
      loadAvailableRides()
    }
  }, [isAvailable])

  const setupSignalR = async () => {
    if (token) {
      await signalRService.connectToRideHub(token)
      await signalRService.connectToLocationHub(token)

      signalRService.onOfferAccepted((ride) => {
        toast.success('Your offer was accepted!')
        setCurrentRide(ride)
        loadAvailableRides()
      })

      signalRService.onRideStatusUpdated((ride) => {
        toast.success('Ride status updated')
        setCurrentRide(ride)
      })
    }
  }

  const loadCurrentRide = async () => {
    try {
      const response = await rideApi.getMyRides()
      const activeRide = response.data.find((r: any) => 
        ['accepted', 'started'].includes(r.status)
      )
      if (activeRide) {
        setCurrentRide(activeRide)
        if (activeRide.id) {
          signalRService.joinRide(activeRide.id)
        }
      }
    } catch (error) {
      console.error('Failed to load current ride:', error)
    }
  }

  const loadAvailableRides = async () => {
    try {
      const response = await rideApi.getAvailableRides()
      setAvailableRides(response.data)
    } catch (error) {
      console.error('Failed to load available rides:', error)
    }
  }

  const loadRecentRides = async () => {
    try {
      const response = await rideApi.getMyRides('completed')
      setRecentRides(response.data.slice(0, 5))
    } catch (error) {
      console.error('Failed to load recent rides:', error)
    }
  }

  const handleToggleAvailability = async () => {
    try {
      const newAvailability = !isAvailable
      await driverApi.updateAvailability(newAvailability)
      setIsAvailable(newAvailability)
      toast.success(`You are now ${newAvailability ? 'online' : 'offline'}`)
      
      if (newAvailability) {
        loadAvailableRides()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update availability')
    }
  }

  const handleMakeOffer = (ride: any) => {
    setSelectedRide(ride)
    setOfferData({
      offeredFare: ride.riderOfferedFare?.toString() || '',
      estimatedArrivalMinutes: '10',
      message: '',
    })
    setShowOfferModal(true)
  }

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRide) return

    setLoading(true)

    try {
      await rideApi.createOffer({
        rideId: selectedRide.id,
        offeredFare: parseFloat(offerData.offeredFare),
        estimatedArrivalMinutes: offerData.estimatedArrivalMinutes ? parseInt(offerData.estimatedArrivalMinutes) : null,
        message: offerData.message || null,
      })

      toast.success('Offer sent successfully!')
      setShowOfferModal(false)
      loadAvailableRides()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send offer')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRideStatus = async (status: string) => {
    if (!currentRide) return

    try {
      const response = await rideApi.updateRideStatus(currentRide.id, { status })
      setCurrentRide(response.data)
      toast.success(`Ride ${status}`)
      
      if (status === 'completed') {
        loadRecentRides()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update ride status')
    }
  }

  const calculateEarnings = () => {
    return recentRides.reduce((total, ride) => total + (ride.finalFare || 0), 0)
  }

  return (
    <ProtectedRoute allowedRoles={['Driver']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user?.fullName}!
              </h1>
              <p className="text-gray-600">
                {isAvailable ? 'You are online and ready for rides' : 'Go online to start receiving ride requests'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isAvailable
                  ? 'bg-success-500 text-white hover:bg-success-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {isAvailable ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
              <span>{isAvailable ? 'Online' : 'Offline'}</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Ride */}
              {currentRide ? (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Current Ride</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentRide.status === 'started' ? 'bg-success-100 text-success-700' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {currentRide.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Rider Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-semibold mb-2">Rider</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{currentRide.rider?.fullName}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <FaPhone className="mr-1" />
                            {currentRide.rider?.phoneNumber}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaStar className="text-warning-500 mr-1" />
                            <span className="font-semibold">{currentRide.rider?.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${currentRide.rider?.phoneNumber}`}
                          className="btn-primary"
                        >
                          Call
                        </a>
                      </div>
                    </div>

                    {/* Pickup & Dropoff */}
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-primary-600 mt-1" />
                      <div>
                        <div className="font-semibold">Pickup</div>
                        <div className="text-gray-600">{currentRide.pickupAddress}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-danger-600 mt-1" />
                      <div>
                        <div className="font-semibold">Dropoff</div>
                        <div className="text-gray-600">{currentRide.dropoffAddress}</div>
                      </div>
                    </div>

                    {/* Fare */}
                    <div className="bg-success-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700">Fare</div>
                      <div className="text-3xl font-bold text-success-600">${currentRide.finalFare}</div>
                    </div>

                    {/* Actions */}
                    {currentRide.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateRideStatus('started')}
                        className="btn-success w-full text-lg"
                      >
                        Start Ride
                      </button>
                    )}

                    {currentRide.status === 'started' && (
                      <button
                        onClick={() => handleUpdateRideStatus('completed')}
                        className="btn-primary w-full text-lg"
                      >
                        Complete Ride
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Available Rides */}
                  {isAvailable && (
                    <div className="card">
                      <h2 className="text-xl font-bold mb-4">
                        Available Rides ({availableRides.length})
                      </h2>
                      
                      {availableRides.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FaMapMarkerAlt className="text-5xl mx-auto mb-4 opacity-50" />
                          <p>No rides available right now</p>
                          <p className="text-sm">New rides will appear here automatically</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableRides.map((ride) => (
                            <div key={ride.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="font-semibold mb-1">{ride.pickupAddress}</div>
                                  <div className="text-sm text-gray-600">To: {ride.dropoffAddress}</div>
                                  {ride.distanceKm && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      Distance: {ride.distanceKm.toFixed(1)} km
                                    </div>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-2xl font-bold text-primary-600">
                                    ${ride.riderOfferedFare}
                                  </div>
                                  {ride.aiSuggestedFareMin && ride.aiSuggestedFareMax && (
                                    <div className="text-xs text-gray-500">
                                      AI: ${ride.aiSuggestedFareMin}-${ride.aiSuggestedFareMax}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleMakeOffer(ride)}
                                className="btn-primary w-full"
                              >
                                Make an Offer
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Recent Rides */}
              {recentRides.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Recent Rides</h2>
                  <div className="space-y-3">
                    {recentRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => router.push(`/driver/rides/${ride.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{ride.dropoffAddress}</div>
                          <div className="text-success-600 font-bold">${ride.finalFare}</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(ride.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Earnings */}
              <div className="card bg-gradient-to-br from-success-600 to-success-800 text-white">
                <h3 className="font-bold mb-2">Today's Earnings</h3>
                <div className="text-4xl font-bold mb-4">${calculateEarnings().toFixed(2)}</div>
                <div className="text-sm text-success-100">
                  {recentRides.length} completed rides
                </div>
              </div>

              {/* Stats */}
              <div className="card">
                <h3 className="font-bold mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-bold flex items-center">
                      <FaStar className="text-warning-500 mr-1" />
                      {user?.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rides</span>
                    <span className="font-bold">{user?.totalRatings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-bold ${isAvailable ? 'text-success-600' : 'text-gray-600'}`}>
                      {isAvailable ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              {user?.driverDetails && (
                <div className="card">
                  <h3 className="font-bold mb-4">Vehicle Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model</span>
                      <span className="font-semibold">{user.driverDetails.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color</span>
                      <span className="font-semibold">{user.driverDetails.vehicleColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plate</span>
                      <span className="font-semibold">{user.driverDetails.vehiclePlate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Offer Modal */}
        {showOfferModal && selectedRide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
              <h2 className="text-2xl font-bold mb-4">Make an Offer</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600 mb-1">Rider's Offer</div>
                <div className="text-3xl font-bold text-primary-600">${selectedRide.riderOfferedFare}</div>
                {selectedRide.aiSuggestedFareMin && selectedRide.aiSuggestedFareMax && (
                  <div className="text-sm text-gray-600 mt-2">
                    AI Suggested: ${selectedRide.aiSuggestedFareMin} - ${selectedRide.aiSuggestedFareMax}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    value={offerData.offeredFare}
                    onChange={(e) => setOfferData({ ...offerData, offeredFare: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Arrival (minutes)
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    value={offerData.estimatedArrivalMinutes}
                    onChange={(e) => setOfferData({ ...offerData, estimatedArrivalMinutes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Any message for the rider?"
                    value={offerData.message}
                    onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Sending...' : 'Send Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

