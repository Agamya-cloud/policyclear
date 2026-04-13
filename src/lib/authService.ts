import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  email: string;
  full_name: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { user: null, error: new Error(error.message) };
    const user: User = {
      id: data.user!.id,
      email: data.user!.email!,
      full_name: fullName,
    };
    localStorage.setItem('user', JSON.stringify(user));
    return { user, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: new Error(error.message) };
    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name ?? '',
    };
    localStorage.setItem('user', JSON.stringify(user));
    return { user, error: null };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
  },

  getUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },
};
