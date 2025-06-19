-- Test data for LUCAS Wallet

-- Insert user balance
INSERT INTO public.user_balances (user_id, usdc_balance, pending_balance, total_earned)
VALUES ('e8741831-91ed-41b1-b211-4424b77d4e7d', 100.00, 25.00, 150.00);

-- Insert test transactions
INSERT INTO public.transactions (user_id, type, amount, status, description)
VALUES
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 25.50, 'COMPLETED', 'Image classification task'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 15.75, 'COMPLETED', 'Audio classification task'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'TASK_REWARD', 40.00, 'COMPLETED', 'Text sentiment analysis'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'WITHDRAWAL', 30.00, 'COMPLETED', 'Withdrawal to PayPal'),
  ('e8741831-91ed-41b1-b211-4424b77d4e7d', 'INVESTMENT', 50.00, 'COMPLETED', 'USDC Yield investment'); 