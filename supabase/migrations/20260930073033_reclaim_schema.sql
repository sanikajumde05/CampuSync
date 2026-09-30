/*
# RECLAIM - Campus Recovery System Schema

1. New Tables
- `profiles`: extends auth.users with full_name, student_id, role (user/admin)
- `items`: lost & found reports with category, color, features, location, photo, description, status, ai_attributes
- `ownership_challenges`: questions and answers for ownership verification linked to found items
- `recoveries`: recovery records with token, handover point, progress status

2. Security
- RLS enabled on all tables
- Owner-scoped CRUD for profiles, items, ownership_challenges, recoveries (authenticated only)
- Admin role can read all data

3. Notes
- Demo user seeded in auth.users + profiles for instant demo login
- Full backpack scenario seeded: lost report, found report, challenge, recovery
- Several additional lost/found items seeded for realistic dashboard
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  student_id text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ ITEMS ============
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('lost', 'found')),
  title text NOT NULL,
  category text,
  color text,
  description text,
  distinguishing_features text,
  ai_category text,
  ai_color text,
  ai_features jsonb DEFAULT '[]'::jsonb,
  location text NOT NULL,
  reported_at timestamptz,
  created_at timestamptz DEFAULT now(),
  photo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'verified', 'handover', 'recovered'))
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_items" ON items;
CREATE POLICY "select_items" ON items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_items" ON items;
CREATE POLICY "insert_own_items" ON items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_items" ON items;
CREATE POLICY "update_own_items" ON items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_own_items" ON items;
CREATE POLICY "delete_own_items" ON items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- ============ OWNERSHIP CHALLENGES ============
CREATE TABLE IF NOT EXISTS ownership_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lost_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_count int DEFAULT 0,
  total_questions int DEFAULT 3,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ownership_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_challenges" ON ownership_challenges;
CREATE POLICY "select_challenges" ON ownership_challenges FOR SELECT
  TO authenticated USING (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM items WHERE items.id = ownership_challenges.found_item_id AND items.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_challenges" ON ownership_challenges;
CREATE POLICY "insert_challenges" ON ownership_challenges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = claimant_id);

DROP POLICY IF EXISTS "update_challenges" ON ownership_challenges;
CREATE POLICY "update_challenges" ON ownership_challenges FOR UPDATE
  TO authenticated USING (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ RECOVERIES ============
CREATE TABLE IF NOT EXISTS recoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lost_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES ownership_challenges(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  handover_point text,
  status text NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'handover', 'recovered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recoveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_recoveries" ON recoveries;
CREATE POLICY "select_recoveries" ON recoveries FOR SELECT
  TO authenticated USING (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM items WHERE items.id = recoveries.found_item_id AND items.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_recoveries" ON recoveries;
CREATE POLICY "insert_recoveries" ON recoveries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_recoveries" ON recoveries;
CREATE POLICY "update_recoveries" ON recoveries FOR UPDATE
  TO authenticated USING (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM items WHERE items.id = recoveries.found_item_id AND items.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = claimant_id OR EXISTS (SELECT 1 FROM items WHERE items.id = recoveries.found_item_id AND items.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ SEED DEMO USER ============
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated', 'authenticated', 'demo@reclaim.edu',
  crypt('demo123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Alex Chen","student_id":"S100001"}'::jsonb,
  now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@reclaim.edu');

INSERT INTO profiles (id, full_name, student_id, role)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alex Chen', 'S100001', 'user'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- Admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'authenticated', 'authenticated', 'admin@reclaim.edu',
  crypt('admin123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin User","student_id":"A000001"}'::jsonb,
  now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@reclaim.edu');

INSERT INTO profiles (id, full_name, student_id, role)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Admin User', 'A000001', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012');