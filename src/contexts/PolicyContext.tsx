import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { policyService } from '../lib/policyService';
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
    const data = await policyService.fetchPolicies();
    setPolicies(data);
    if (data.length > 0 && !activePolicy) setActivePolicy(data[0]);
    setLoading(false);
  };

  const fetchSimulations = async () => {
    if (!user) return;
    const data = await policyService.fetchSimulations();
    setSimulations(data);
  };

  const savePolicy = async (policyData: Omit<Policy, 'id' | 'user_id' | 'uploaded_at'>) => {
    if (!user) return null;
    const data = await policyService.savePolicy(policyData);
    if (data) {
      await fetchPolicies();
    }
    return data;
  };

  const deletePolicy = async (id: string) => {
    await policyService.deletePolicy(id);
    await fetchPolicies();
  };

  const saveSimulation = async (sim: Omit<Simulation, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    await policyService.saveSimulation(sim);
    await fetchSimulations();
  };

  const deleteSimulation = async (id: string) => {
    await policyService.deleteSimulation(id);
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
