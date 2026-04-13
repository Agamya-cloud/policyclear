/*
  # PolicyClear Schema

  1. New Tables
    - `profiles` - User profile data extending auth.users
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `created_at` (timestamptz)
    - `policies` - Insurance policy documents
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `policy_name`, `insurer`, `policy_number` (text)
      - `sum_insured`, `premium`, `policy_year` (numeric/int)
      - `raw_text` (text, OCR extracted)
      - `ocr_source` (text: pdf/image/typed)
      - `summary` (jsonb)
      - `coverages` (jsonb)
      - `exclusions` (jsonb array)
      - `members` (text array)
      - `uploaded_at` (timestamptz)
    - `simulations` - Claim simulation history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `scenario`, `hospital_type`, `city_tier`, `verdict` (text)
      - `bill_amount`, `insurer_pays`, `user_pays` (numeric)
      - `policy_year` (int)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_name text NOT NULL DEFAULT '',
  insurer text NOT NULL DEFAULT '',
  policy_number text NOT NULL DEFAULT '',
  sum_insured numeric DEFAULT 0,
  premium numeric DEFAULT 0,
  policy_year int DEFAULT 1,
  raw_text text DEFAULT '',
  ocr_source text DEFAULT 'typed',
  summary jsonb DEFAULT '{}',
  coverages jsonb DEFAULT '{}',
  exclusions jsonb DEFAULT '[]',
  members text[] DEFAULT '{}',
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario text NOT NULL DEFAULT '',
  bill_amount numeric DEFAULT 0,
  hospital_type text DEFAULT '',
  policy_year int DEFAULT 1,
  city_tier text DEFAULT '',
  insurer_pays numeric DEFAULT 0,
  user_pays numeric DEFAULT 0,
  verdict text DEFAULT '',
  breakdown jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own policies"
  ON policies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own policies"
  ON policies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own simulations"
  ON simulations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
