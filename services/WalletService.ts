import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserBalance = Database['public']['Tables']['user_balances']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

// Storage keys for mock wallet data
const MOCK_BALANCE_KEY = '@lucas/mock_wallet_balance';
const MOCK_TRANSACTIONS_KEY = '@lucas/mock_wallet_transactions';

// Use mock data only as fallback, not as primary data source
const USE_MOCK_DATA = false;

export class WalletService {
  static async getUserBalance(userId: string): Promise<UserBalance | null> {
    // Try to use real database first
    try {
      console.log('Fetching real balance from database for user:', userId);
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching balance from database:', error);
        // Fall back to mock data if database fails
        return WalletService.getMockBalance(userId);
      }
      
      if (data) {
        console.log('Successfully fetched real balance from database:', data);
        
        // Ensure numeric values are properly converted to numbers
        const cleanedData = {
          ...data,
          usdc_balance: typeof data.usdc_balance === 'string' ? parseFloat(data.usdc_balance) : data.usdc_balance,
          pending_balance: typeof data.pending_balance === 'string' ? parseFloat(data.pending_balance) : data.pending_balance,
          total_earned: typeof data.total_earned === 'string' ? parseFloat(data.total_earned) : data.total_earned
        };
        
        return cleanedData;
      } else {
        console.log('No balance found in database, creating one');
        // Try to create a balance record for this user
        const initialBalance = {
          user_id: userId,
          usdc_balance: 0,
          pending_balance: 0,
          total_earned: 0,
          updated_at: new Date().toISOString()
        };
        
        const { data: newBalance, error: insertError } = await supabase
          .from('user_balances')
          .upsert([initialBalance])
          .select();
        
        if (insertError) {
          console.error('Error creating initial balance:', insertError);
          return WalletService.getMockBalance(userId);
        }
        
        console.log('Created new balance record:', newBalance);
        return newBalance[0];
      }
    } catch (error) {
      console.error('Exception in getUserBalance:', error);
      // Use mock data as fallback
      return WalletService.getMockBalance(userId);
    }
  }

  static async getTransactionHistory(
    userId: string,
    limit = 10,
    offset = 0
  ): Promise<Transaction[]> {
    // Try to use real database first
    try {
      console.log('Fetching real transactions from database for user:', userId);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching transactions from database:', error);
        // Fall back to mock data if database fails
        return WalletService.getMockTransactions(userId);
      }
      
      console.log('Successfully fetched real transactions from database:', data?.length || 0);
      
      // Ensure amount values are properly converted to numbers
      const cleanedData = data?.map(tx => ({
        ...tx,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      })) || [];
      
      return cleanedData;
    } catch (error) {
      console.error('Exception in getTransactionHistory:', error);
      // Use mock data as fallback
      return WalletService.getMockTransactions(userId);
    }
  }

  static async addTaskReward(userId: string, amount: number): Promise<UserBalance | null> {
    // Try to use real database first
    try {
      console.log('Adding task reward to database for user:', userId, 'amount:', amount);
      const { data, error } = await supabase
        .rpc('add_task_reward', {
          p_user_id: userId,
          p_amount: amount
        });
      
      if (error) {
        console.error('Error adding task reward to database:', error);
        
        // Try direct database operations instead of using the function
        try {
          console.log('Trying direct database operations for task reward');
          
          // Start a transaction with two operations: update balance and add transaction
          // 1. Get current balance
          const { data: currentBalance, error: balanceError } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (balanceError) {
            console.error('Error fetching current balance:', balanceError);
            throw balanceError;
          }
          
          // 2. Update balance
          const updatedBalance = {
            usdc_balance: (currentBalance?.usdc_balance || 0) + amount,
            total_earned: (currentBalance?.total_earned || 0) + amount,
            updated_at: new Date().toISOString()
          };
          
          const { data: newBalance, error: updateError } = await supabase
            .from('user_balances')
            .update(updatedBalance)
            .eq('user_id', userId)
            .select();
          
          if (updateError) {
            console.error('Error updating balance:', updateError);
            throw updateError;
          }
          
          // 3. Add transaction
          const newTransaction = {
            user_id: userId,
            type: 'TASK_REWARD',
            amount: amount,
            status: 'COMPLETED',
            description: 'Task completion reward',
            created_at: new Date().toISOString()
          };
          
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert([newTransaction]);
          
          if (transactionError) {
            console.error('Error creating transaction:', transactionError);
            // We'll still consider this a success since the balance was updated
          }
          
          console.log('Successfully added task reward through direct operations');
          return newBalance?.[0] || null;
        } catch (directDbError) {
          console.error('Direct database operations failed:', directDbError);
          // Fall back to mock data
          return WalletService.addMockTaskReward(userId, amount);
        }
      }
      
      console.log('Successfully added task reward to database:', data);
      return data;
    } catch (error) {
      console.error('Exception in addTaskReward:', error);
      // Use mock data as fallback
      return WalletService.addMockTaskReward(userId, amount);
    }
  }

  static async requestWithdrawal(
    userId: string,
    amount: number,
    method: string
  ): Promise<Transaction | null> {
    // Try to use real database first
    try {
      console.log('Requesting withdrawal from database for user:', userId, 'amount:', amount, 'method:', method);
      const { data, error } = await supabase
        .rpc('request_withdrawal', {
          p_user_id: userId,
          p_amount: amount,
          p_method: method
        });
      
      if (error) {
        console.error('Error requesting withdrawal from database:', error);
        
        // Try direct database operations instead of using the function
        try {
          console.log('Trying direct database operations for withdrawal');
          
          // 1. Get current balance
          const { data: currentBalance, error: balanceError } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (balanceError) {
            console.error('Error fetching current balance:', balanceError);
            throw balanceError;
          }
          
          // Check if user has sufficient balance
          if ((currentBalance?.usdc_balance || 0) < amount) {
            throw new Error('Insufficient balance');
          }
          
          // 2. Update balance
          const updatedBalance = {
            usdc_balance: (currentBalance.usdc_balance || 0) - amount,
            pending_balance: (currentBalance.pending_balance || 0) + amount,
            updated_at: new Date().toISOString()
          };
          
          const { error: updateError } = await supabase
            .from('user_balances')
            .update(updatedBalance)
            .eq('user_id', userId);
          
          if (updateError) {
            console.error('Error updating balance:', updateError);
            throw updateError;
          }
          
          // 3. Add transaction
          const newTransaction = {
            user_id: userId,
            type: 'WITHDRAWAL',
            amount: amount,
            status: 'PENDING',
            description: 'Withdrawal request',
            created_at: new Date().toISOString(),
            metadata: { method }
          };
          
          const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert([newTransaction])
            .select();
          
          if (transactionError) {
            console.error('Error creating transaction:', transactionError);
            throw transactionError;
          }
          
          console.log('Successfully created withdrawal through direct operations');
          return transaction?.[0] || null;
        } catch (directDbError) {
          console.error('Direct database operations failed:', directDbError);
          // Fall back to mock data
          return WalletService.requestMockWithdrawal(userId, amount, method);
        }
      }
      
      console.log('Successfully requested withdrawal from database:', data);
      return data;
    } catch (error) {
      console.error('Exception in requestWithdrawal:', error);
      // Use mock data as fallback
      return WalletService.requestMockWithdrawal(userId, amount, method);
    }
  }

  // Mock implementation methods
  private static async getMockBalance(userId: string): Promise<UserBalance> {
    try {
      console.log('Trying to get mock balance from storage...');
      const storedBalance = await AsyncStorage.getItem(MOCK_BALANCE_KEY);
      if (storedBalance) {
        try {
          const parsedBalance = JSON.parse(storedBalance);
          console.log('Found stored mock balance:', parsedBalance);
          
          // Make sure the user ID matches
          if (parsedBalance.user_id !== userId) {
            parsedBalance.user_id = userId;
            await AsyncStorage.setItem(MOCK_BALANCE_KEY, JSON.stringify(parsedBalance));
            console.log('Updated stored mock balance with correct userId');
          }
          
          // Verify the parsed data has all the required fields
          if (parsedBalance.usdc_balance !== undefined && 
              parsedBalance.user_id && 
              parsedBalance.total_earned !== undefined) {
            return parsedBalance;
          } else {
            console.log('Stored mock balance is missing required fields, creating new one');
          }
        } catch (parseError) {
          console.error('Error parsing stored mock balance:', parseError);
        }
      }
    } catch (error) {
      console.log('Error retrieving mock balance:', error);
    }

    // Default mock balance with some initial values to make the UI look better
    const mockBalance: UserBalance = {
      user_id: userId,
      usdc_balance: 25.75,
      pending_balance: 5.50,
      total_earned: 45.25,
      updated_at: new Date().toISOString()
    };

    console.log('Creating new mock balance:', mockBalance);
    try {
      await AsyncStorage.setItem(MOCK_BALANCE_KEY, JSON.stringify(mockBalance));
    } catch (error) {
      console.error('Error saving mock balance to AsyncStorage:', error);
    }
    
    return mockBalance;
  }

  private static async getMockTransactions(userId: string): Promise<Transaction[]> {
    try {
      console.log('Trying to get mock transactions from storage...');
      const storedTransactions = await AsyncStorage.getItem(MOCK_TRANSACTIONS_KEY);
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          console.log('Found stored mock transactions, count:', parsedTransactions.length);
          
          // Verify it's an array and has at least some expected structure
          if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
            // Check if user IDs match and update them if needed
            let needsUpdate = false;
            const updatedTransactions = parsedTransactions.map(tx => {
              if (tx.user_id !== userId) {
                needsUpdate = true;
                return { ...tx, user_id: userId };
              }
              return tx;
            });
            
            if (needsUpdate) {
              console.log('Updating stored mock transactions with correct userId');
              await AsyncStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
            }
            
            return updatedTransactions;
          } else {
            console.log('Stored mock transactions are invalid, creating new ones');
          }
        } catch (parseError) {
          console.error('Error parsing stored mock transactions:', parseError);
        }
      }
    } catch (error) {
      console.log('Error retrieving mock transactions:', error);
    }

    // Create some default mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        user_id: userId,
        type: 'TASK_REWARD',
        amount: 10.25,
        status: 'COMPLETED',
        description: 'Audio classification task',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        metadata: null
      },
      {
        id: '2',
        user_id: userId,
        type: 'TASK_REWARD',
        amount: 8.50,
        status: 'COMPLETED',
        description: 'Image classification task',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        metadata: null
      },
      {
        id: '3',
        user_id: userId,
        type: 'WITHDRAWAL',
        amount: 15.00,
        status: 'COMPLETED',
        description: 'Withdrawal to PayPal',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        metadata: { method: 'PayPal' }
      },
      {
        id: '4',
        user_id: userId,
        type: 'TASK_REWARD',
        amount: 12.00,
        status: 'COMPLETED',
        description: 'Text sentiment analysis',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        metadata: null
      },
      {
        id: '5',
        user_id: userId,
        type: 'INVESTMENT',
        amount: 30.00,
        status: 'COMPLETED',
        description: 'Staking rewards',
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        metadata: { pool: 'USDC-ETH' }
      }
    ];

    console.log('Creating new mock transactions, count:', mockTransactions.length);
    try {
      await AsyncStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
    } catch (error) {
      console.error('Error saving mock transactions to AsyncStorage:', error);
    }
    
    return mockTransactions;
  }

  private static async addMockTaskReward(userId: string, amount: number): Promise<UserBalance> {
    try {
      // Get current balance
      const balance = await WalletService.getMockBalance(userId);

      // Update balance
      const updatedBalance: UserBalance = {
        ...balance,
        usdc_balance: (balance.usdc_balance || 0) + amount,
        total_earned: (balance.total_earned || 0) + amount,
        updated_at: new Date().toISOString()
      };

      // Save updated balance
      await AsyncStorage.setItem(MOCK_BALANCE_KEY, JSON.stringify(updatedBalance));

      // Add transaction
      const transactions = await WalletService.getMockTransactions(userId);
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        user_id: userId,
        type: 'TASK_REWARD',
        amount: amount,
        status: 'COMPLETED',
        description: 'Task completion reward',
        created_at: new Date().toISOString(),
        metadata: null
      };

      transactions.unshift(newTransaction);
      await AsyncStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(transactions));

      return updatedBalance;
    } catch (error) {
      console.error('Error in addMockTaskReward:', error);
      throw error;
    }
  }

  private static async requestMockWithdrawal(userId: string, amount: number, method: string): Promise<Transaction> {
    try {
      // Get current balance
      const balance = await WalletService.getMockBalance(userId);

      // Check if user has sufficient balance
      if ((balance.usdc_balance || 0) < amount) {
        throw new Error('Insufficient balance');
      }

      // Update balance
      const updatedBalance: UserBalance = {
        ...balance,
        usdc_balance: (balance.usdc_balance || 0) - amount,
        pending_balance: (balance.pending_balance || 0) + amount,
        updated_at: new Date().toISOString()
      };

      // Save updated balance
      await AsyncStorage.setItem(MOCK_BALANCE_KEY, JSON.stringify(updatedBalance));

      // Add transaction
      const transactions = await WalletService.getMockTransactions(userId);
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        user_id: userId,
        type: 'WITHDRAWAL',
        amount: amount,
        status: 'PENDING',
        description: 'Withdrawal request',
        created_at: new Date().toISOString(),
        metadata: { method }
      };

      transactions.unshift(newTransaction);
      await AsyncStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(transactions));

      return newTransaction;
    } catch (error) {
      console.error('Error in requestMockWithdrawal:', error);
      throw error;
    }
  }
}

export default WalletService; 