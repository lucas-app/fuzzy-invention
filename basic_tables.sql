-- Basic Tables for LUCAS Wallet System

-- Create user_balances table
CREATE TABLE IF NOT EXISTS public.user_balances (
  user_id UUID PRIMARY KEY,
  usdc_balance NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
); 