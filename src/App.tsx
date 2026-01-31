import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PopupProvider } from './contexts/PopupContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import LearnerDashboard from './pages/LearnerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import DeleteAccount from './pages/DeleteAccount';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';
import MobileRedirect from './pages/MobileRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <PopupProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mobile" element={<MobileRedirect />} />

              {/* Protected Learner Routes */}
              <Route
                path="/learn/*"
                element={
                  <ProtectedRoute role="learner">
                    <LearnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Client Routes */}
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute role="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Global Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account/delete"
                element={
                  <ProtectedRoute>
                    <DeleteAccount />
                  </ProtectedRoute>
                }
              />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </AuthProvider>
        </PopupProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
