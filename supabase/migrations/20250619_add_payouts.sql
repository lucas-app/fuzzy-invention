-- Create payouts table
CREATE TABLE public.payouts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider     text NOT NULL CHECK (provider IN ('binance_pay')),
  amount_usd   numeric(14,2) NOT NULL CHECK (amount_usd > 0),
  status       text NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  tx_id        text,     -- provider-side reference or hash
  error_msg    text,     -- nullable, populated when status = 'FAILED'
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

COMMENT ON TABLE public.payouts IS 'Ledger of every contributor payout in USDT (USD-quoted).';

-- Create indexes
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payouts" ON public.payouts
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
