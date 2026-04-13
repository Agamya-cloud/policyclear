import { authService } from './authService';
import { Policy, Simulation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = authService.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const policyService = {
  async fetchPolicies(): Promise<Policy[]> {
    try {
      const data = await fetchWithAuth('/policies');
      return data || [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  },

  async fetchSimulations(): Promise<Simulation[]> {
    try {
      const data = await fetchWithAuth('/simulations');
      return data || [];
    } catch (error) {
      console.error('Error fetching simulations:', error);
      return [];
    }
  },

  async savePolicy(policyData: Omit<Policy, 'id' | 'user_id' | 'uploaded_at'>): Promise<Policy | null> {
    try {
      const data = await fetchWithAuth('/policies', {
        method: 'POST',
        body: JSON.stringify(policyData),
      });
      return data;
    } catch (error) {
      console.error('Error saving policy:', error);
      return null;
    }
  },

  async deletePolicy(id: string): Promise<void> {
    try {
      await fetchWithAuth(`/policies/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  },

  async saveSimulation(sim: Omit<Simulation, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    try {
      await fetchWithAuth('/simulations', {
        method: 'POST',
        body: JSON.stringify(sim),
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
  },

  async deleteSimulation(id: string): Promise<void> {
    try {
      await fetchWithAuth(`/simulations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting simulation:', error);
    }
  },
};
