'use client'

import Link from 'next/link'
import { FaCar, FaMoneyBillWave, FaShieldAlt, FaStar, FaMapMarkedAlt, FaClock } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FaCar className="text-3xl text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">InDrive</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your Ride,<br />Your Fare
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Set your own price and find drivers who accept it. Fair rides for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=rider" className="btn bg-white text-primary-600 hover:bg-gray-100 text-center text-lg py-3">
                  Get Started as Rider
                </Link>
                <Link href="/register?role=driver" className="btn bg-primary-500 text-white hover:bg-primary-400 text-center text-lg py-3">
                  Drive with Us
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block animate-slide-up">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <FaMapMarkedAlt className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold">Real-time Tracking</p>
                      <p className="text-sm text-primary-100">Track your ride live</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <FaMoneyBillWave className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold">Set Your Fare</p>
                      <p className="text-sm text-primary-100">You decide the price</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <FaShieldAlt className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold">Safe & Secure</p>
                      <p className="text-sm text-primary-100">Verified drivers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose InDrive?</h2>
            <p className="text-xl text-gray-600">The smartest way to book your rides</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
              <p className="text-gray-600">
                Set your own fare and negotiate directly with drivers. No surge pricing surprises.
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-3xl text-success-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Response</h3>
              <p className="text-gray-600">
                Get multiple offers from drivers within seconds. Choose the best option for you.
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="bg-warning-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-3xl text-warning-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rated Drivers</h3>
              <p className="text-gray-600">
                All drivers are verified and rated by the community for your safety.
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkedAlt className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-gray-600">
                Track your driver in real-time from pickup to destination.
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-3xl text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Your safety is our priority with 24/7 support and verified drivers.
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCar className="text-3xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Options</h3>
              <p className="text-gray-600">
                Various vehicle types available to suit your needs and budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of riders and drivers using InDrive every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=rider" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg py-3 px-8">
              Book a Ride
            </Link>
            <Link href="/register?role=driver" className="btn bg-primary-500 text-white hover:bg-primary-400 border-2 border-white text-lg py-3 px-8">
              Become a Driver
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaCar className="text-2xl text-primary-400" />
                <span className="text-xl font-bold">InDrive</span>
              </div>
              <p className="text-gray-400">
                Your ride, your fare. The fair way to travel.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InDrive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

