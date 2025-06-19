-- Insert test balance for current user (replace USER_ID_HERE with actual user id)
INSERT INTO user_balances (user_id, usdc_balance, pending_balance, total_earned)
VALUES 
  ('USER_ID_HERE', 100.00, 25.00, 150.00)
ON CONFLICT (user_id) DO UPDATE
SET 
  usdc_balance = 100.00,
  pending_balance = 25.00,
  total_earned = 150.00;

-- Insert test transactions (replace USER_ID_HERE with actual user id)
INSERT INTO transactions (user_id, type, amount, status, description, created_at)
VALUES
  ('USER_ID_HERE', 'TASK_REWARD', 25.50, 'COMPLETED', 'Image classification task', NOW() - INTERVAL '1 day'),
  ('USER_ID_HERE', 'TASK_REWARD', 15.75, 'COMPLETED', 'Audio classification task', NOW() - INTERVAL '3 days'),
  ('USER_ID_HERE', 'TASK_REWARD', 40.00, 'COMPLETED', 'Text sentiment analysis', NOW() - INTERVAL '5 days'),
  ('USER_ID_HERE', 'WITHDRAWAL', 30.00, 'COMPLETED', 'Withdrawal to PayPal', NOW() - INTERVAL '7 days'),
  ('USER_ID_HERE', 'INVESTMENT', 50.00, 'COMPLETED', 'USDC Yield investment', NOW() - INTERVAL '10 days');

-- You can get your user ID with:
-- SELECT id FROM auth.users WHERE email = 'your_email@example.com'; 