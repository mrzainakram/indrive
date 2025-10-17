'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { FaUsers, FaCar, FaRoute, FaDollarSign, FaChartLine, FaCheckCircle } from 'react-icons/fa'
import { adminApi, userApi, rideApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, usersRes, ridesRes] = await Promise.all([
        adminApi.getStats(),
        userApi.getAllUsers(),
        rideApi.getAllRides(1, 20),
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
      setRides(ridesRes.data)
    } catch (error: any) {
      toast.error('Failed to load admin data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, !currentStatus)
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (error: any) {
      toast.error('Failed to update user status')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor and manage your InDrive platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FaUsers className="text-3xl text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Drivers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalDrivers || 0}</p>
                </div>
                <div className="bg-success-100 p-3 rounded-lg">
                  <FaCar className="text-3xl text-success-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Rides</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalRides || 0}</p>
                </div>
                <div className="bg-warning-100 p-3 rounded-lg">
                  <FaRoute className="text-3xl text-warning-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaDollarSign className="text-3xl text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <FaCheckCircle className="text-success-600 text-xl" />
                <span className="text-sm text-gray-600">Completed Rides</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedRides || 0}</p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <FaChartLine className="text-primary-600 text-xl" />
                <span className="text-sm text-gray-600">Active Rides</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeRides || 0}</p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <FaDollarSign className="text-success-600 text-xl" />
                <span className="text-sm text-gray-600">Average Fare</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${stats?.averageFare?.toFixed(2) || 0}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('rides')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'rides'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Rides ({rides.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && stats?.dailyStats && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Daily Stats (Last 7 Days)</h2>
              <div className="space-y-3">
                {stats.dailyStats.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">{day.totalRides} rides</div>
                    </div>
                    <div className="text-2xl font-bold text-success-600">
                      ${day.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Users Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{user.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'Driver' ? 'bg-primary-100 text-primary-700' :
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center">
                            {user.rating.toFixed(1)}
                            <span className="text-xs text-gray-500 ml-1">({user.totalRatings})</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className={`text-sm ${
                              user.isActive ? 'text-danger-600 hover:text-danger-700' : 'text-success-600 hover:text-success-700'
                            } font-medium`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rides' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Rides</h2>
              <div className="space-y-3">
                {rides.map((ride) => (
                  <div key={ride.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{ride.rider?.fullName} → {ride.driver?.fullName || 'No driver'}</div>
                        <div className="text-sm text-gray-600">{ride.pickupAddress} → {ride.dropoffAddress}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success-600">${ride.finalFare || ride.riderOfferedFare}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ride.status === 'completed' ? 'bg-success-100 text-success-700' :
                          ride.status === 'started' ? 'bg-primary-100 text-primary-700' :
                          ride.status === 'cancelled' ? 'bg-danger-100 text-danger-700' :
                          'bg-warning-100 text-warning-700'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ride.requestedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

