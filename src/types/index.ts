export interface Policy {
  id: string;
  user_id: string;
  policy_name: string;
  insurer: string;
  policy_number: string;
  sum_insured: number;
  premium: number;
  policy_year: number;
  raw_text: string;
  ocr_source: string;
  summary: Record<string, unknown>;
  coverages: Record<string, unknown>;
  exclusions: unknown[];
  members: string[];
  uploaded_at: string;
}

export interface Simulation {
  id: string;
  user_id: string;
  scenario: string;
  bill_amount: number;
  hospital_type: string;
  policy_year: number;
  city_tier: string;
  insurer_pays: number;
  user_pays: number;
  verdict: string;
  breakdown: BreakdownItem[];
  created_at: string;
}

export interface BreakdownItem {
  label: string;
  amount: number;
  type: 'deduction' | 'covered' | 'info';
}

export interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'policy-summary' | 'document';
  policyData?: PolicySummary;
}

export interface PolicySummary {
  policyName: string;
  insurer: string;
  sumInsured: number;
  premium: number;
  coverages: string[];
  exclusions: string[];
  waitingPeriods: string[];
  conditions: string[];
  verdict: string;
}
