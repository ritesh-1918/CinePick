import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { HowItWorks } from './components/HowItWorks';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import FAQ from './pages/FAQ';
import Legal from './pages/Legal';
import Survey from './pages/Survey';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Library from './pages/Library';
import Discovery from './pages/Discovery';
import TrailerPage from './pages/TrailerPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<Legal />} />
                    <Route path="/terms" element={<Legal />} />
                    <Route path="/cookies" element={<Legal />} />

                    {/* Protected Routes */}
                    <Route path="/survey" element={
                        <ProtectedRoute>
                            <Survey />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/edit-profile" element={
                        <ProtectedRoute>
                            <EditProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/library" element={
                        <ProtectedRoute>
                            <Library />
                        </ProtectedRoute>
                    } />
                    <Route path="/trailer/:movieId" element={
                        <ProtectedRoute>
                            <TrailerPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/discovery" element={
                        <ProtectedRoute>
                            <Discovery />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
