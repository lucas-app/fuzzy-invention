// Migration script to create wallet tables in Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials (replace with actual values from the .env file)
const supabaseUrl = 'https://cljvcuqnkfosltyqb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function createWalletTables() {
  console.log('Starting wallet tables migration...');
  
  if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_KEY. Please run with: SUPABASE_SERVICE_KEY=your_key node migration.js');
    process.exit(1);
  }

  // Initialize Supabase admin client with service role
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('Creating wallet tables directly with SQL...');
    
    // Create tables and functions directly with SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Enable required extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- Create updated_at trigger function
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

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
        DROP POLICY IF EXISTS "Users can view their own balance" ON user_balances;
        CREATE POLICY "Users can view their own balance"
            ON user_balances FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can insert their own balance" ON user_balances;
        CREATE POLICY "Users can insert their own balance"
            ON user_balances FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);

        -- Create policies for transactions
        DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
        CREATE POLICY "Users can view their own transactions"
            ON transactions FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
        CREATE POLICY "Users can insert their own transactions"
            ON transactions FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);

        -- Create updated_at trigger for user_balances
        DROP TRIGGER IF EXISTS update_user_balances_updated_at ON user_balances;
        CREATE TRIGGER update_user_balances_updated_at
            BEFORE UPDATE ON user_balances
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
      `
    });
    
    if (error) {
      console.error('Error executing migration SQL:', error);
      return { success: false, error };
    }

    console.log('Successfully created wallet tables!');
    return { success: true, message: 'Wallet tables created successfully' };
  } catch (error) {
    console.error('Error in migration:', error);
    return { success: false, error };
  }
}

// Run the migration
createWalletTables()
  .then(result => {
    console.log('Migration completed:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  }); 