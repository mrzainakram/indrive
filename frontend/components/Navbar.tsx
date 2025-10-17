'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaCar, FaBell, FaUser, FaSignOutAlt, FaHistory, FaCog } from 'react-icons/fa'
import { useAuthStore } from '@/lib/store'
import { notificationApi } from '@/lib/api'
import { useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications(true)
      setUnreadCount(response.data.length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${user?.role?.toLowerCase()}`} className="flex items-center space-x-2">
            <FaCar className="text-3xl text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">InDrive</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              href={`/${user?.role?.toLowerCase()}/notifications`}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block font-medium text-gray-900">{user?.fullName}</span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                    <Link
                      href={`/${user?.role?.toLowerCase()}/profile`}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="text-gray-600" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={`/${user?.role?.toLowerCase()}/history`}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaHistory className="text-gray-600" />
                      <span>Ride History</span>
                    </Link>
                    <Link
                      href={`/${user?.role?.toLowerCase()}/settings`}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaCog className="text-gray-600" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left text-danger-600"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

