'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { FaMapMarkerAlt, FaMoneyBillWave, FaSearch, FaClock, FaStar } from 'react-icons/fa'
import { rideApi } from '@/lib/api'
import { useAuthStore, useRideStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { signalRService } from '@/lib/signalr'
import { useRouter } from 'next/navigation'

export default function RiderDashboard() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const { currentRide, setCurrentRide, rides, setRides } = useRideStore()
  const [showBooking, setShowBooking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recentRides, setRecentRides] = useState<any[]>([])
  
  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    pickupLatitude: 40.7128,
    pickupLongitude: -74.0060,
    dropoffAddress: '',
    dropoffLatitude: 40.7589,
    dropoffLongitude: -73.9851,
    riderOfferedFare: '',
    paymentMethod: 'cash',
    riderNotes: '',
  })

  useEffect(() => {
    loadCurrentRide()
    loadRecentRides()
    setupSignalR()

    return () => {
      signalRService.disconnect()
    }
  }, [])

  const setupSignalR = async () => {
    if (token) {
      await signalRService.connectToRideHub(token)

      signalRService.onOfferReceived((offer) => {
        toast.success('New offer received!')
        loadCurrentRide()
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
        ['requested', 'offered', 'accepted', 'started'].includes(r.status)
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

  const loadRecentRides = async () => {
    try {
      const response = await rideApi.getMyRides('completed')
      setRecentRides(response.data.slice(0, 5))
    } catch (error) {
      console.error('Failed to load recent rides:', error)
    }
  }

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await rideApi.createRide({
        ...bookingData,
        riderOfferedFare: parseFloat(bookingData.riderOfferedFare),
      })

      setCurrentRide(response.data)
      toast.success('Ride requested! Waiting for driver offers...')
      setShowBooking(false)
      setBookingData({
        pickupAddress: '',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '',
        dropoffLatitude: 40.7589,
        dropoffLongitude: -73.9851,
        riderOfferedFare: '',
        paymentMethod: 'cash',
        riderNotes: '',
      })

      if (response.data.id) {
        signalRService.joinRide(response.data.id)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book ride')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await rideApi.acceptOffer(offerId)
      setCurrentRide(response.data)
      toast.success('Offer accepted! Driver is on the way')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept offer')
    }
  }

  const handleCancelRide = async () => {
    if (!currentRide) return
    
    if (!confirm('Are you sure you want to cancel this ride?')) return

    try {
      await rideApi.updateRideStatus(currentRide.id, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by rider',
      })
      setCurrentRide(null)
      toast.success('Ride cancelled')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel ride')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['Rider']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600">Ready for your next ride?</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Ride or Book Ride */}
              {currentRide ? (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Current Ride</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentRide.status === 'started' ? 'bg-success-100 text-success-700' :
                      currentRide.status === 'accepted' ? 'bg-primary-100 text-primary-700' :
                      'bg-warning-100 text-warning-700'
                    }`}>
                      {currentRide.status}
                    </span>
                  </div>

                  <div className="space-y-4">
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

                    {currentRide.driver && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-semibold mb-2">Driver</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{currentRide.driver.fullName}</div>
                            <div className="text-sm text-gray-600">{currentRide.driver.phoneNumber}</div>
                            <div className="flex items-center mt-1">
                              <FaStar className="text-warning-500 mr-1" />
                              <span className="font-semibold">{currentRide.driver.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-600 ml-1">
                                ({currentRide.driver.totalRatings} rides)
                              </span>
                            </div>
                          </div>
                          {currentRide.driver.driverDetails && (
                            <div className="text-right">
                              <div className="font-medium">{currentRide.driver.driverDetails.vehicleModel}</div>
                              <div className="text-sm text-gray-600">{currentRide.driver.driverDetails.vehicleColor}</div>
                              <div className="text-sm font-semibold">{currentRide.driver.driverDetails.vehiclePlate}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentRide.status === 'offered' && currentRide.offers && currentRide.offers.length > 0 && (
                      <div>
                        <div className="font-semibold mb-3">Driver Offers ({currentRide.offers.length})</div>
                        <div className="space-y-2">
                          {currentRide.offers.filter((o: any) => o.status === 'pending').map((offer: any) => (
                            <div key={offer.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="font-medium">{offer.driver?.fullName}</div>
                                <div className="text-sm text-gray-600">
                                  <FaStar className="inline text-warning-500 mr-1" />
                                  {offer.driver?.rating.toFixed(1)} • {offer.driver?.driverDetails?.vehicleModel}
                                </div>
                                {offer.estimatedArrivalMinutes && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    <FaClock className="inline mr-1" />
                                    {offer.estimatedArrivalMinutes} min away
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary-600">${offer.offeredFare}</div>
                                <button
                                  onClick={() => handleAcceptOffer(offer.id)}
                                  className="btn-primary mt-2 text-sm"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentRide.finalFare && (
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700">Final Fare</div>
                        <div className="text-3xl font-bold text-primary-600">${currentRide.finalFare}</div>
                      </div>
                    )}

                    {currentRide.status !== 'started' && currentRide.status !== 'completed' && (
                      <button
                        onClick={handleCancelRide}
                        className="btn-danger w-full"
                      >
                        Cancel Ride
                      </button>
                    )}

                    {currentRide.status === 'completed' && (
                      <button
                        onClick={() => router.push(`/rider/rate/${currentRide.id}`)}
                        className="btn-primary w-full"
                      >
                        Rate Your Ride
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12">
                  <FaMapMarkerAlt className="text-6xl text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Where to?</h2>
                  <p className="text-gray-600 mb-6">Book your next ride with InDrive</p>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    Book a Ride
                  </button>
                </div>
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
                        onClick={() => router.push(`/rider/rides/${ride.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{ride.dropoffAddress}</div>
                          <div className="text-primary-600 font-bold">${ride.finalFare}</div>
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
              <div className="card">
                <h3 className="font-bold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rides</span>
                    <span className="font-bold">{recentRides.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Rating</span>
                    <span className="font-bold flex items-center">
                      <FaStar className="text-warning-500 mr-1" />
                      {user?.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <h3 className="font-bold mb-2">Invite Friends</h3>
                <p className="text-sm text-primary-100 mb-4">
                  Share InDrive and get rewards when your friends take their first ride!
                </p>
                <button className="btn bg-white text-primary-600 hover:bg-gray-100 w-full">
                  Share Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Book a Ride</h2>
              
              <form onSubmit={handleBookRide} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Enter pickup address"
                    value={bookingData.pickupAddress}
                    onChange={(e) => setBookingData({ ...bookingData, pickupAddress: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropoff Location
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Enter dropoff address"
                    value={bookingData.dropoffAddress}
                    onChange={(e) => setBookingData({ ...bookingData, dropoffAddress: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offered Fare ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    placeholder="How much are you willing to pay?"
                    value={bookingData.riderOfferedFare}
                    onChange={(e) => setBookingData({ ...bookingData, riderOfferedFare: e.target.value })}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    💡 Tip: Fair pricing gets you faster responses from drivers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="input"
                    value={bookingData.paymentMethod}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Any special instructions for the driver?"
                    value={bookingData.riderNotes}
                    onChange={(e) => setBookingData({ ...bookingData, riderNotes: e.target.value })}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Booking...' : 'Request Ride'}
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

