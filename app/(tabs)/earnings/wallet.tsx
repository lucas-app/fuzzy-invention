import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore } from '../../../store/walletStore';
import { useAuthStore } from '../../../store/authStore';

export default function WalletScreen() {
  const { user } = useAuthStore();
  const { 
    balance, 
    transactions, 
    isLoading, 
    error, 
    fetchBalance, 
    fetchTransactions 
  } = useWalletStore();
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      fetchBalance(user.id);
      fetchTransactions(user.id);
    }
  }, [user?.id]);
  
  const handleWithdraw = () => {
    router.push({ pathname: '/withdraw' });
  };
  
  const handleSendFunds = () => {
    Alert.alert(
      "Coming Soon",
      "Sending funds to other users will be available in a future update."
    );
  };
  
  const handleViewActivity = () => {
    router.push({ pathname: '/transactions' });
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            if (user?.id) {
              fetchBalance(user.id);
              fetchTransactions(user.id);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ 
        title: "My Wallet",
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#fff'
      }} />
      
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.walletHeader}
        >
          <Text style={styles.walletTitle}>LUCAS Wallet</Text>
          <Text style={styles.walletBalance}>${balance?.usdc_balance?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.walletCurrency}>USDC</Text>
          
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
              <View style={styles.actionIcon}>
                <Ionicons name="arrow-down-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleSendFunds}>
              <View style={styles.actionIcon}>
                <Ionicons name="send-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleViewActivity}>
              <View style={styles.actionIcon}>
                <Ionicons name="list-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Activity</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Total Earned</Text>
            <Text style={styles.statsValue}>${balance?.total_earned?.toFixed(2) || '0.00'}</Text>
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Pending</Text>
            <Text style={styles.statsValue}>${balance?.pending_balance?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
        
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewActivity}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Complete tasks to earn rewards</Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                  <Ionicons 
                    name={getTransactionIcon(transaction.type)} 
                    size={20} 
                    color={getTransactionIconColor(transaction.type)} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{getTransactionTitle(transaction.type)}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount, 
                  {color: transaction.type === 'WITHDRAWAL' ? '#EF4444' : '#10B981'}
                ]}>
                  {transaction.type === 'WITHDRAWAL' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
        
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>Wallet Security</Text>
          <TouchableOpacity style={styles.securityItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
            <Text style={styles.securityText}>Enable Two-Factor Authentication</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityItem}>
            <Ionicons name="key-outline" size={24} color="#3B82F6" />
            <Text style={styles.securityText}>Manage Recovery Options</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'TASK_REWARD':
      return 'checkmark-circle-outline';
    case 'WITHDRAWAL':
      return 'arrow-down-circle-outline';
    case 'INVESTMENT':
      return 'trending-up-outline';
    default:
      return 'help-circle-outline';
  }
};

const getTransactionIconColor = (type: string) => {
  switch (type) {
    case 'TASK_REWARD':
      return '#10B981';
    case 'WITHDRAWAL':
      return '#EF4444';
    case 'INVESTMENT':
      return '#3B82F6';
    default:
      return '#94A3B8';
  }
};

const getTransactionTitle = (type: string) => {
  switch (type) {
    case 'TASK_REWARD':
      return 'Task Reward';
    case 'WITHDRAWAL':
      return 'Withdrawal';
    case 'INVESTMENT':
      return 'Investment';
    default:
      return 'Transaction';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  walletHeader: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletCurrency: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 24,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    marginTop: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  transactionsSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  securitySection: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  securityText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 12,
  },
}); 