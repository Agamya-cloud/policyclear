import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PolicyProvider } from './contexts/PolicyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Coverage from './pages/Coverage';
import Exclusions from './pages/Exclusions';
import Simulator from './pages/Simulator';
import Compare from './pages/Compare';
import Chat from './pages/Chat';

function AppContent() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({
    open: false,
    tab: 'signup',
  });

  const openAuth = (tab: 'signin' | 'signup') => setAuthModal({ open: true, tab });
  const closeAuth = () => setAuthModal(prev => ({ ...prev, open: false }));

  return (
    <>
      <Navbar openAuth={openAuth} />
      <Routes>
        <Route path="/" element={<Landing openAuth={openAuth} />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/coverage" element={<ProtectedRoute><Coverage /></ProtectedRoute>} />
        <Route path="/exclusions" element={<ProtectedRoute><Exclusions /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
      <AuthModal isOpen={authModal.open} initialTab={authModal.tab} onClose={closeAuth} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PolicyProvider>
          <AppContent />
        </PolicyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
