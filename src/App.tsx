import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Trends from './components/Trends';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import AdminLayout from './components/Admin/AdminLayout';
import Overview from './components/Admin/Overview';
import ComplaintManager from './components/Admin/ComplaintManager';
import AdminSettings from './components/Admin/Settings';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
      </div>
    );
  }

  if (!user) return <Auth />;
  if (profile && !profile.onboarded) return <Onboarding />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans selection:bg-black selection:text-white">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="history" element={<History />} />
              <Route path="trends" element={<Trends />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Portal */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="complaints" element={<ComplaintManager />} />
              <Route path="categories" element={<AdminSettings />} />
              <Route path="mappings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
