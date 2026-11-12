import React from 'react'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Get from './components/Get'
import Footer from './components/Footer'
import Login from './components/Login'
import Signup from './components/Signup'

import ClientDashboard from './pages/ClientDashboard'
import ContractorDashboard from './pages/ContractorDashboard'
import AdminDashboard from './pages/AdminDashboard'

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Get />
      <Footer />
    </>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-white font-sans">
      <h1 className="text-8xl font-extrabold text-blue-500">404</h1>
      <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-slate-400">Sorry, the page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Client Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Contractor / Engineer Dashboard */}
          <Route
            path="/contractor"
            element={
              <ProtectedRoute allowedRoles={['contractor', 'engineer', 'admin']}>
                <ContractorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
