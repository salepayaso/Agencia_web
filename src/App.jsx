import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabase';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollProgress from './components/ScrollProgress';
import GTMTracker from './components/GTMTracker';
import SessionManager from './components/SessionManager';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const BusinessCard = lazy(() => import('./components/BusinessCard'));

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <GTMTracker />
      <AuthHandler />
      <SessionManager />
      <ScrollToTop />
      <ScrollProgress />
      <SpeedInsights />
      <Suspense fallback={<div className="min-h-screen bg-dark-bg" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/portafolio" element={<Portfolio />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/tarjeta" element={<BusinessCard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
