'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { FaBell, FaCheckCircle } from 'react-icons/fa'
import { notificationApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function DriverNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [showUnreadOnly])

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications(showUnreadOnly)
      setNotifications(response.data)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      loadNotifications()
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      toast.success('All notifications marked as read')
      loadNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['Driver']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary text-sm"
            >
              Mark All Read
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showUnreadOnly
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showUnreadOnly
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="card text-center py-12">
              <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`card cursor-pointer transition-all ${
                    !notification.isRead ? 'bg-primary-50 border-l-4 border-primary-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <FaCheckCircle
                        className="text-primary-600 text-xl flex-shrink-0 ml-4 cursor-pointer hover:text-primary-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

