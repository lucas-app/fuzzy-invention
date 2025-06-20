import { create } from 'zustand';
import type { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

type UserBalance = Database['public']['Tables']['user_balances']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

interface WalletState {
  balance: UserBalance | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchWalletData: (userId: string) => Promise<void>;
  addReward: (userId: string, amount: number, description: string) => Promise<boolean>;
  requestWithdrawal: (userId: string, amount: number, method: string) => Promise<boolean>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: null,
  transactions: [],
  isLoading: false,
  error: null,

  // Fetch all wallet data (balance and transactions)
  fetchWalletData: async (userId: string) => {
    if (!userId) {
      console.error('Cannot fetch wallet data: No user ID provided');
      return;
    }

    set({ isLoading: true, error: null });
    console.log(`Fetching wallet data for user: ${userId}`);

    try {
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
        
        // If the error is that the record doesn't exist, we should create one
        if (balanceError.code === 'PGRST116') {
          console.log('No balance record found, creating initial balance');
          const initialBalance = {
            user_id: userId,
            usdc_balance: 0,
            pending_balance: 0,
            total_earned: 0,
            updated_at: new Date().toISOString()
          };

          const { data: newBalance, error: createError } = await supabase
            .from('user_balances')
            .insert([initialBalance])
            .select()
            .single();

          if (createError) {
            throw new Error(`Failed to create initial balance: ${createError.message}`);
          }
          
          set({ balance: newBalance });
        } else {
          throw new Error(`Failed to fetch balance: ${balanceError.message}`);
        }
      } else {
        set({ balance: balanceData });
      }

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (txError) {
        console.error('Error fetching transactions:', txError);
        throw new Error(`Failed to fetch transactions: ${txError.message}`);
      }
      
      console.log(`📊 Fetched ${txData?.length || 0} transactions:`, txData);
      set({ transactions: txData || [] });
      console.log(`Successfully fetched wallet data. Balance: ${get().balance?.usdc_balance}, Transactions: ${txData?.length || 0}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching wallet data';
      console.error('Exception in fetchWalletData:', errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a reward to the wallet
  addReward: async (userId: string, amount: number, description: string) => {
    if (!userId) {
      console.error('Cannot add reward: No user ID provided');
      set({ error: 'No user ID provided' });
      return false;
    }

    if (amount <= 0) {
      console.error('Cannot add reward: Amount must be positive');
      set({ error: 'Reward amount must be positive' });
      return false;
    }

    set({ isLoading: true, error: null });
    console.log(`🚀 Adding reward of ${amount} USDC to user ${userId}: ${description}`);

    try {
      // First try to use the RPC function
      try {
        console.log('📞 Attempting to use RPC function add_task_reward...');
        const { data, error } = await supabase.rpc('add_task_reward', {
          p_user_id: userId,
          p_amount: amount
        });
        
        if (error) {
          console.error('❌ RPC add_task_reward failed, falling back to direct DB operations:', error);
          throw error;
        }
        
        console.log('✅ RPC add_task_reward succeeded');
        // If RPC succeeded, refresh wallet data and return
        await get().fetchWalletData(userId);
        return true;
      } catch (rpcError) {
        // If RPC failed, fall back to direct DB operations
        console.log('🔄 Falling back to direct database operations for reward');
        
        // 1. Start a transaction (done manually through separate operations)
        
        // 2. Get current balance
        console.log('📊 Fetching current balance...');
        const { data: currentBalance, error: balanceError } = await supabase
          .from('user_balances')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (balanceError) {
          // If no balance record exists, create one
          if (balanceError.code === 'PGRST116') {
            console.log('🆕 No balance record found, creating initial balance...');
            const initialBalance = {
              user_id: userId,
              usdc_balance: amount,
              pending_balance: 0,
              total_earned: amount,
              updated_at: new Date().toISOString()
            };

            const { data: newBalance, error: createError } = await supabase
              .from('user_balances')
              .insert([initialBalance])
              .select()
              .single();

            if (createError) {
              throw new Error(`Failed to create initial balance: ${createError.message}`);
            }
            
            console.log('✅ Initial balance created:', newBalance);
            set({ balance: newBalance });
          } else {
            throw new Error(`Failed to fetch current balance: ${balanceError.message}`);
          }
        } else {
          console.log('📊 Current balance found:', currentBalance);
          // 3. Update the balance
          const updatedBalance = {
            usdc_balance: (currentBalance.usdc_balance || 0) + amount,
            total_earned: (currentBalance.total_earned || 0) + amount,
            updated_at: new Date().toISOString()
          };
          
          console.log('💰 Updating balance with:', updatedBalance);
          const { data: newBalance, error: updateError } = await supabase
            .from('user_balances')
            .update(updatedBalance)
            .eq('user_id', userId)
            .select()
            .single();
          
          if (updateError) {
            throw new Error(`Failed to update balance: ${updateError.message}`);
          }
          
          console.log('✅ Balance updated:', newBalance);
          set({ balance: newBalance });
        }
        
        // 4. Create transaction record
        console.log('📝 Creating transaction record...');
        const newTransaction = {
          user_id: userId,
          type: 'TASK_REWARD',
          amount: amount,
          status: 'COMPLETED',
          description: description,
          created_at: new Date().toISOString(),
          metadata: null
        };
        
        console.log('📝 Transaction data:', newTransaction);
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert([newTransaction])
          .select();
        
        if (transactionError) {
          throw new Error(`Failed to create transaction record: ${transactionError.message}`);
        }
        
        console.log('✅ Transaction created:', transactionData);
      }
      
      // Refresh wallet data to show the latest state
      console.log('🔄 Refreshing wallet data...');
      await get().fetchWalletData(userId);
      console.log('✅ Reward added successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error adding reward';
      console.error('❌ Error in addReward:', errorMessage);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Request a withdrawal
  requestWithdrawal: async (userId: string, amount: number, method: string) => {
    if (!userId) {
      console.error('Cannot request withdrawal: No user ID provided');
      set({ error: 'No user ID provided' });
      return false;
    }

    if (amount <= 0) {
      console.error('Cannot request withdrawal: Amount must be positive');
      set({ error: 'Withdrawal amount must be positive' });
      return false;
    }

    set({ isLoading: true, error: null });
    console.log(`Requesting withdrawal of ${amount} USDC for user ${userId} via ${method}`);

    try {
      // First try to use the RPC function
      try {
        const { data, error } = await supabase.rpc('request_withdrawal', {
          p_user_id: userId,
          p_amount: amount,
          p_method: method
        });
        
        if (error) {
          console.error('RPC request_withdrawal failed, falling back to direct DB operations:', error);
          throw error;
        }
        
        // If RPC succeeded, refresh wallet data and return
        await get().fetchWalletData(userId);
        return true;
      } catch (rpcError) {
        // If RPC failed, fall back to direct DB operations
        console.log('Falling back to direct database operations for withdrawal');
        
        // 1. Get current balance
        const { data: currentBalance, error: balanceError } = await supabase
          .from('user_balances')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (balanceError) {
          throw new Error(`Failed to fetch current balance: ${balanceError.message}`);
        }
        
        // 2. Check if balance is sufficient
        if ((currentBalance.usdc_balance || 0) < amount) {
          throw new Error('Insufficient balance for withdrawal');
        }
        
        // 3. Update the balance
        const updatedBalance = {
          usdc_balance: (currentBalance.usdc_balance || 0) - amount,
          pending_balance: (currentBalance.pending_balance || 0) + amount,
          updated_at: new Date().toISOString()
        };
        
        const { data: newBalance, error: updateError } = await supabase
          .from('user_balances')
          .update(updatedBalance)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updateError) {
          throw new Error(`Failed to update balance: ${updateError.message}`);
        }
        
        set({ balance: newBalance });
        
        // 4. Create transaction record
        const newTransaction = {
          user_id: userId,
          type: 'WITHDRAWAL',
          amount: amount,
          status: 'PENDING',
          description: `Withdrawal request via ${method}`,
          created_at: new Date().toISOString(),
          metadata: { method }
        };
        
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([newTransaction]);
        
        if (transactionError) {
          throw new Error(`Failed to create transaction record: ${transactionError.message}`);
        }
      }
      
      // Refresh wallet data to show the latest state
      await get().fetchWalletData(userId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing withdrawal';
      console.error('Error in requestWithdrawal:', errorMessage);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null })
})); 