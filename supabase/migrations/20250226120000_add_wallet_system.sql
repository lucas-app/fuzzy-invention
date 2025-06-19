-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user balances table
CREATE TABLE IF NOT EXISTS user_balances (
    user_id uuid PRIMARY KEY REFERENCES auth.users,
    usdc_balance numeric NOT NULL DEFAULT 0,
    pending_balance numeric NOT NULL DEFAULT 0,
    total_earned numeric NOT NULL DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    type text NOT NULL CHECK (type IN ('TASK_REWARD', 'WITHDRAWAL', 'INVESTMENT')),
    amount numeric NOT NULL,
    status text NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    description text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_balances
CREATE POLICY "Users can view their own balance"
    ON user_balances FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create updated_at trigger for user_balances
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create function to add task reward
CREATE OR REPLACE FUNCTION add_task_reward(
    p_user_id uuid,
    p_amount numeric
) RETURNS user_balances AS $$
DECLARE
    result user_balances;
BEGIN
    -- Insert transaction record
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description
    ) VALUES (
        p_user_id,
        'TASK_REWARD',
        p_amount,
        'COMPLETED',
        'Task completion reward'
    );

    -- Update user balance
    INSERT INTO user_balances (
        user_id, 
        usdc_balance, 
        total_earned
    )
    VALUES (
        p_user_id, 
        p_amount, 
        p_amount
    )
    ON CONFLICT (user_id) DO UPDATE
    SET usdc_balance = user_balances.usdc_balance + p_amount,
        total_earned = user_balances.total_earned + p_amount
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to request withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_user_id uuid,
    p_amount numeric,
    p_method text
) RETURNS transactions AS $$
DECLARE
    result transactions;
BEGIN
    -- Check if user has sufficient balance
    IF NOT EXISTS (
        SELECT 1 FROM user_balances
        WHERE user_id = p_user_id
        AND usdc_balance >= p_amount
    ) THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Create withdrawal transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_user_id,
        'WITHDRAWAL',
        p_amount,
        'PENDING',
        'Withdrawal request',
        jsonb_build_object('method', p_method)
    )
    RETURNING * INTO result;

    -- Update user balance
    UPDATE user_balances
    SET usdc_balance = usdc_balance - p_amount,
        pending_balance = pending_balance + p_amount
    WHERE user_id = p_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 