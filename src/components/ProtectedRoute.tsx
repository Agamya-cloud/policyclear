import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: ReactNode;
  onOpenAuth?: () => void;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
