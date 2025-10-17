'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaCar, FaEnvelope, FaLock, FaUser, FaPhone, FaIdCard } from 'react-icons/fa'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(searchParams.get('role') || 'Rider')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    // Driver details
    licenseNumber: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleColor: '',
    vehiclePlate: '',
    vehicleYear: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: role,
      }

      if (role === 'Driver') {
        payload.driverDetails = {
          licenseNumber: formData.licenseNumber,
          vehicleType: formData.vehicleType,
          vehicleModel: formData.vehicleModel,
          vehicleColor: formData.vehicleColor,
          vehiclePlate: formData.vehiclePlate,
          vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
        }
      }

      const response = await authApi.register(payload)
      const { token, user } = response.data

      setToken(token)
      setUser(user)

      toast.success('Account created successfully!')

      // Redirect based on role
      if (user.role === 'Driver') {
        router.push('/driver')
      } else {
        router.push('/rider')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in my-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaCar className="text-4xl text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">InDrive</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join InDrive today</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I want to register as
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('Rider')}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === 'Rider'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'
              }`}
            >
              <div className="font-semibold">Rider</div>
              <div className="text-sm text-gray-600">Book rides</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('Driver')}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === 'Driver'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'
              }`}
            >
              <div className="font-semibold">Driver</div>
              <div className="text-sm text-gray-600">Earn money</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input pl-10"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  className="input pl-10"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                className="input pl-10"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                className="input pl-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Driver Details */}
          {role === 'Driver' && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Driver & Vehicle Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <div className="relative">
                      <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="input pl-10"
                        placeholder="DL123456"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type
                      </label>
                      <select
                        required
                        className="input"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Toyota Camry"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Color
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Black"
                        value={formData.vehicleColor}
                        onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Plate
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="ABC-1234"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Year (Optional)
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-3 mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

