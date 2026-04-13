import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  initialTab: 'signin' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialTab, onClose }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTab(initialTab);
    setError('');
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) { setError(error.message); return; }
      } else {
        const { error } = await signIn(email, password);
        if (error) { setError(error.message); return; }
      }
      onClose();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#1A0F0A] border border-[#A89070]/30 rounded-lg px-4 py-3 text-[#F5F1E8] placeholder-[#A89070]/50 focus:outline-none focus:border-[#D4AF37] transition-colors font-poppins text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#2D1810] border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8"
        style={{ boxShadow: '0 0 40px rgba(212,175,55,0.15), inset 0 1px 0 rgba(212,175,55,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A89070] hover:text-[#F5F1E8] transition-colors">
          <X size={20} />
        </button>

        <div className="flex gap-1 mb-8 bg-[#1A0F0A] rounded-lg p-1">
          {(['signup', 'signin'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all font-poppins ${
                tab === t
                  ? 'bg-[#D4AF37] text-[#1A0F0A]'
                  : 'text-[#A89070] hover:text-[#F5F1E8]'
              }`}
            >
              {t === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        <h2 className="font-playfair text-2xl text-[#F5F1E8] mb-2">
          {tab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-[#A89070] text-sm font-poppins mb-6">
          {tab === 'signup' ? 'Start understanding your insurance today' : 'Sign in to your PolicyClear account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className={inputClass}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89070] hover:text-[#D4AF37]"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {tab === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
          )}
          {tab === 'signin' && (
            <div className="text-right">
              <button type="button" className="text-[#D4AF37] text-sm font-poppins hover:underline">
                Forgot Password?
              </button>
            </div>
          )}
          {error && (
            <p className="text-red-400 text-sm font-poppins bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] text-[#1A0F0A] rounded-lg font-semibold font-poppins transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : tab === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
