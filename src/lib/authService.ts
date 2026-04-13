const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { user: null, error: new Error(data.message || 'Sign up failed') };
      }

      const data: AuthResponse = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { user: null, error: new Error(data.message || 'Sign in failed') };
      }

      const data: AuthResponse = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
