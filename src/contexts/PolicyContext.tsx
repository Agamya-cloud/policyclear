import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Policy, Simulation } from '../types';
import { useAuth } from './AuthContext';

interface PolicyContextType {
  policies: Policy[];
  activePolicy: Policy | null;
  simulations: Simulation[];
  loading: boolean;
  fetchPolicies: () => Promise<void>;
  fetchSimulations: () => Promise<void>;
  savePolicy: (policy: Omit<Policy, 'id' | 'user_id' | 'uploaded_at'>) => Promise<Policy | null>;
  deletePolicy: (id: string) => Promise<void>;
  saveSimulation: (sim: Omit<Simulation, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteSimulation: (id: string) => Promise<void>;
  setActivePolicy: (policy: Policy | null) => void;
}

const PolicyContext = createContext<PolicyContextType>({
  policies: [],
  activePolicy: null,
  simulations: [],
  loading: false,
  fetchPolicies: async () => {},
  fetchSimulations: async () => {},
  savePolicy: async () => null,
  deletePolicy: async () => {},
  saveSimulation: async () => {},
  deleteSimulation: async () => {},
  setActivePolicy: () => {},
});

export function PolicyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });
    if (data) {
      setPolicies(data as Policy[]);
      if (data.length > 0 && !activePolicy) setActivePolicy(data[0] as Policy);
    }
    setLoading(false);
  };

  const fetchSimulations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('simulations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setSimulations(data as Simulation[]);
  };

  const savePolicy = async (policyData: Omit<Policy, 'id' | 'user_id' | 'uploaded_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('policies')
      .insert({ ...policyData, user_id: user.id })
      .select()
      .single();
    if (error) return null;
    await fetchPolicies();
    return data as Policy;
  };

  const deletePolicy = async (id: string) => {
    await supabase.from('policies').delete().eq('id', id);
    await fetchPolicies();
  };

  const saveSimulation = async (sim: Omit<Simulation, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    await supabase.from('simulations').insert({ ...sim, user_id: user.id });
    await fetchSimulations();
  };

  const deleteSimulation = async (id: string) => {
    await supabase.from('simulations').delete().eq('id', id);
    await fetchSimulations();
  };

  useEffect(() => {
    if (user) {
      fetchPolicies();
      fetchSimulations();
    } else {
      setPolicies([]);
      setActivePolicy(null);
      setSimulations([]);
    }
  }, [user]);

  return (
    <PolicyContext.Provider value={{
      policies, activePolicy, simulations, loading,
      fetchPolicies, fetchSimulations,
      savePolicy, deletePolicy,
      saveSimulation, deleteSimulation,
      setActivePolicy,
    }}>
      {children}
    </PolicyContext.Provider>
  );
}

export const usePolicy = () => useContext(PolicyContext);
