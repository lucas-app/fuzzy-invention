-- Create basic user balances table
CREATE TABLE IF NOT EXISTS public.user_balances (
  user_id UUID PRIMARY KEY,
  usdc_balance NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic transactions table  
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Insert test data
INSERT INTO public.user_balances (user_id, usdc_balance, pending_balance, total_earned)
VALUES 
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 100.00, 25.00, 150.00)
ON CONFLICT (user_id) DO UPDATE
SET 
  usdc_balance = 100.00,
  pending_balance = 25.00,
  total_earned = 150.00;

-- Insert test transactions
INSERT INTO public.transactions (user_id, type, amount, status, description, created_at)
VALUES
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 25.50, 'COMPLETED', 'Image classification task', NOW() - INTERVAL '1 day'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 15.75, 'COMPLETED', 'Audio classification task', NOW() - INTERVAL '3 days'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 40.00, 'COMPLETED', 'Text sentiment analysis', NOW() - INTERVAL '5 days'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'WITHDRAWAL', 30.00, 'COMPLETED', 'Withdrawal to PayPal', NOW() - INTERVAL '7 days'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'INVESTMENT', 50.00, 'COMPLETED', 'USDC Yield investment', NOW() - INTERVAL '10 days'); 