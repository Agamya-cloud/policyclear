import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../lib/authService';
import { Profile } from '../types';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
      setProfile({ id: storedUser.id, full_name: storedUser.full_name, email: storedUser.email } as Profile);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { user: newUser, error } = await authService.signUp(email, password, fullName);
    if (error) return { error };
    if (newUser) {
      setUser(newUser);
      setProfile({ id: newUser.id, full_name: newUser.full_name, email: newUser.email } as Profile);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { user: signedInUser, error } = await authService.signIn(email, password);
    if (error) return { error };
    if (signedInUser) {
      setUser(signedInUser);
      setProfile({ id: signedInUser.id, full_name: signedInUser.full_name, email: signedInUser.email } as Profile);
    }
    return { error: null };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
