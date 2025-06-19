import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Alert, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore } from '../../../store/walletStore';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';
import { BlurView } from 'expo-blur';

// Add new COLORS for the Earnings screen, matching the Tasks screen
const COLORS = {
  backgroundStart: '#0057FF',
  backgroundEnd: '#00B2FF',
  backgroundAccent: '#3ECFFF',
  cardGlass: 'rgba(255,255,255,0.13)',
  cardBorder: 'rgba(255,255,255,0.18)',
  cardShadow: '#0057FF',
  textPrimary: '#fff',
  textSecondary: '#E0E6F7',
  sectionTitle: '#E0E6F7',
  green: '#10B981',
  greenLight: '#34D399',
  yellow: '#F59E0B',
  red: '#EF4444',
};

// Balance Display component to properly handle currency formatting
const BalanceDisplay = ({ 
  amount, 
  style 
}: { 
  amount: number | undefined | null | string, 
  style: any 
}) => {
  // Convert string to number and handle null/undefined
  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount) 
    : (amount || 0);
    
  const formattedAmount = numericAmount.toFixed(2);
  
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text style={style}>
        ${formattedAmount}
        <Text style={[style, styles.currency]}> USDC</Text>
      </Text>
    </View>
  );
};

// Mock transaction history for all LUCAS task categories
const mockTransactions = [
  {
    id: 1,
    type: 'PHOTO',
    description: 'Task: Capture Real-World Photo',
    created_at: '2025-06-06',
    amount: 4.25,
    status: 'COMPLETED',
    icon: 'camera',
    color: '#10B386',
  },
  {
    id: 2,
    type: 'AI_CHAT',
    description: 'Task: Rate AI Chat',
    created_at: '2025-06-05',
    amount: 2.50,
    status: 'COMPLETED',
    icon: 'chatbubble-ellipses',
    color: '#FF7E58',
  },
  {
    id: 3,
    type: 'VOICE',
    description: 'Task: Record Your Voice',
    created_at: '2025-06-04',
    amount: 3.75,
    status: 'COMPLETED',
    icon: 'mic',
    color: '#49A0FF',
  },
  {
    id: 4,
    type: 'FEEDBACK',
    description: 'Task: Give Feedback on App',
    created_at: '2025-06-03',
    amount: 5.00,
    status: 'COMPLETED',
    icon: 'star',
    color: '#F986E5',
  },
  {
    id: 5,
    type: 'WEB3',
    description: 'Task: Web3 Project',
    created_at: '2025-06-02',
    amount: 6.00,
    status: 'COMPLETED',
    icon: 'logo-bitcoin',
    color: '#FFB869',
  },
  {
    id: 6,
    type: 'BONUS',
    description: 'Task: Bonus Mission',
    created_at: '2025-06-01',
    amount: 1.50,
    status: 'COMPLETED',
    icon: 'gift',
    color: '#7B3797',
  },
  {
    id: 7,
    type: 'WITHDRAWAL',
    description: 'Withdrawal to Wallet',
    created_at: '2025-05-31',
    amount: -10.00,
    status: 'PENDING',
    icon: 'arrow-up-circle',
    color: '#F59E0B',
  },
];

// Update ActivityItem to use a glassy bubble for each transaction
const ActivityItem = ({ item }: { item: any }) => {
  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const isWithdrawal = item.type === 'WITHDRAWAL';
  const amountColor = isWithdrawal ? '#FFB300' : '#fff';
  return (
    <View style={styles.revActivityBubble}>
      <View style={styles.revActivityRow}>
        <View style={styles.revActivityIconWrap}>
          <View style={[styles.revActivityIcon, { backgroundColor: item.color }]}> 
            <Ionicons name={item.icon as any} size={22} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.revActivityTitle}>{item.description}</Text>
          <Text style={styles.revActivityDate}>{date}</Text>
          {item.status === 'PENDING' && (
            <Text style={styles.pendingTagModern}>Pending</Text>
          )}
        </View>
        <Text style={[styles.revActivityAmount, { color: amountColor }]}> 
          {isWithdrawal ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export default function EarningsScreen() {
  const { user } = useAuthStore();
  const { 
    balance, 
    transactions, 
    isLoading, 
    error,
    fetchWalletData,
    clearError
  } = useWalletStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Initialize wallet data on component mount
  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  // Function to load wallet data
  const loadWalletData = async () => {
    if (!user?.id) {
      console.log('No user ID available, cannot load wallet data');
      return;
    }
    
    try {
      setConnectionError(null);
      await fetchWalletData(user.id);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setConnectionError('Failed to connect to the wallet service');
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      await fetchWalletData(user.id);
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigate to withdraw screen
  const handleWithdraw = () => {
    router.push('/withdraw');
  };

  // Retry loading wallet data after error
  const handleRetry = () => {
    clearError();
    setConnectionError(null);
    loadWalletData();
  };

  // Check network connection to Supabase
  const checkConnection = async () => {
    try {
      const start = Date.now();
      const { data, error } = await supabase.from('user_balances').select('count');
      const duration = Date.now() - start;
      
      if (error) {
        Alert.alert('Connection Error', `Failed to connect to Supabase: ${error.message}`);
      } else {
        Alert.alert('Connection Status', `Connected to Supabase successfully in ${duration}ms`);
      }
    } catch (error) {
      Alert.alert('Connection Error', `Could not connect to Supabase: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // If loading with no data yet, show loading screen
  if ((isLoading && !balance) || !user?.id) {
    return (
      <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  // If there's an error, show error screen
  if (error || connectionError) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="wallet-outline" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>
            {error || connectionError || 'Error loading your wallet data'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.retryButton, { marginTop: 10, backgroundColor: '#64748B' }]}
            onPress={checkConnection}
          >
            <Text style={styles.retryButtonText}>Check Connection</Text>
          </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Electric blue gradient background */}
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Abstract blue/cyan blobs for depth */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: '#0057FF', top: 320, right: -80, width: 180, height: 180, opacity: 0.12, borderRadius: 90 }]} />
        <View style={[styles.blob, { backgroundColor: '#00B2FF', bottom: 60, left: 60, width: 140, height: 140, opacity: 0.14, borderRadius: 70 }]} />
        <View style={[styles.blob, { backgroundColor: '#3ECFFF', bottom: -40, right: 30, width: 120, height: 120, opacity: 0.11, borderRadius: 60 }]} />
      </View>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.backgroundAccent]}
          />
        }
      >
        {/* Revolut-inspired header, now floating on the gradient background */}
        <View style={styles.revHeaderFloating}>
          <Text style={styles.revContextLabel}>Personal · USDT</Text>
          <View style={styles.revBalanceRow}>
            <Text style={styles.revBalanceMain}>$886.10</Text>
            <Text style={styles.revBalanceCurrency}>USDT</Text>
          </View>
          <TouchableOpacity style={styles.revWithdrawPill} onPress={handleWithdraw}>
            <Ionicons name="arrow-up-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.revWithdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
          {/* Single glassy bubble for both stats */}
          <View style={styles.revBubbleWide}>
            <View style={styles.revBubbleHalf}>
              <Ionicons name="stats-chart" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.revBubbleLabel}>Total Earned</Text>
              <Text style={styles.revBubbleValue}>$45.67</Text>
            </View>
            <View style={styles.revBubbleDivider} />
            <View style={styles.revBubbleHalf}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={styles.revBubbleLabel}>Pending</Text>
              <Text style={[styles.revBubbleValue, { color: '#F59E0B' }]}>$3.21</Text>
            </View>
          </View>
        </View>
        {/* Recent Activity */}
        <View style={styles.revTransactionsBox}>
          <FlatList
            data={mockTransactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <>
                <View style={styles.revActivityRow}>
                  <View style={styles.revActivityIconWrap}>
                    <View style={[styles.revActivityIcon, { backgroundColor: item.color }]}> 
                      <Ionicons name={item.icon as any} size={22} color="#fff" />
                    </View>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.revActivityTitle}>{item.description}</Text>
                    <Text style={styles.revActivityDate}>{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                    {item.status === 'PENDING' && (
                      <Text style={styles.pendingTagModern}>Pending</Text>
                    )}
                  </View>
                  <Text style={[styles.revActivityAmount, { color: item.type === 'WITHDRAWAL' ? '#FFB300' : '#fff' }]}> 
                    {item.type === 'WITHDRAWAL' ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
                  </Text>
                </View>
                {index < mockTransactions.length - 1 && <View style={styles.revActivityDivider} />}
              </>
            )}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawButtonDisabled: {
    backgroundColor: '#A7F3D0',
    shadowOpacity: 0,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceFooterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
  },
  balanceFooterLabel: {
    fontSize: 14,
    color: '#fff',
    marginRight: 6,
    fontWeight: '500',
  },
  balanceFooterAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  currency: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  activitySection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  activityDate: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingTag: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerRowGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerTitleGlass: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  balanceCardGlass: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 18,
  },
  balanceRowGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabelGlass: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  refreshButtonGlass: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  balanceAmountRowGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  balanceAmountGlass: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  withdrawButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawButtonDisabledGlass: {
    backgroundColor: '#A7F3D0',
    shadowOpacity: 0,
  },
  withdrawButtonTextGlass: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceFooterRowGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 0,
  },
  balanceFooterBubble: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    minHeight: 44,
  },
  balanceFooterBubbleLast: {
    marginRight: 0,
  },
  activitySectionGlass: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitleGlass: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyStateGlass: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTextGlass: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtextGlass: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  centeredContainerGlass: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTextGlass: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
  },
  blob: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
  },
  activityCardModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 2,
  },
  activityIconModernWrap: {
    marginRight: 18,
  },
  activityIconModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  activityTitleModern: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  activityDateModern: {
    fontSize: 14,
    color: '#B6C7E3',
    marginBottom: 2,
  },
  pendingTagModern: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  activityAmountModern: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    minWidth: 80,
    textAlign: 'right',
  },
  activityCardModernGlassy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 22,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  activityTitleModernGlassy: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  activityDateModernGlassy: {
    fontSize: 14,
    color: '#E0E6F7',
    marginBottom: 2,
  },
  activityAmountModernGlassy: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    minWidth: 80,
    textAlign: 'right',
    color: '#fff',
  },
  balanceCardGlassRedesigned: {
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 28,
    marginTop: 8,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  refreshButtonCircle: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  balanceLabelRedesigned: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  balanceAmountRedesigned: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  balanceCurrencyRedesigned: {
    fontSize: 18,
    color: '#E0E6F7',
    fontWeight: '500',
    marginBottom: 18,
    textAlign: 'center',
  },
  withdrawButtonRedesigned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 0,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawButtonTextRedesigned: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceFooterRowRedesigned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    gap: 16,
  },
  balanceFooterBubbleRedesigned: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    minHeight: 48,
    marginLeft: 0,
  },
  balanceFooterLabelRedesigned: {
    fontSize: 15,
    color: '#fff',
    marginRight: 6,
    fontWeight: '500',
  },
  balanceFooterAmountRedesigned: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  revHeaderFloating: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 18,
    marginBottom: 18,
  },
  revWithdrawPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.22)', // green glassy
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 10,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.32)',
    minWidth: 120,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  revContextLabel: {
    fontSize: 16,
    color: '#E0E6F7',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.85,
  },
  revBalanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 18,
  },
  revBalanceMain: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 8,
  },
  revBalanceCurrency: {
    fontSize: 22,
    color: '#E0E6F7',
    fontWeight: '600',
    marginBottom: 6,
  },
  revBubblesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 16,
    paddingHorizontal: 18,
  },
  revBubble: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    minHeight: 48,
    marginHorizontal: 6,
  },
  revBubbleLabel: {
    fontSize: 15,
    color: '#fff',
    marginRight: 6,
    fontWeight: '500',
  },
  revBubbleValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  revWithdrawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  revActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 22,
    paddingHorizontal: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  revActivityIconWrap: {
    marginRight: 18,
    marginLeft: 8,
  },
  revActivityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revActivityTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  revActivityDate: {
    fontSize: 14,
    color: '#B6C7E3',
    marginBottom: 2,
  },
  revActivityAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    minWidth: 80,
    textAlign: 'right',
    color: '#fff',
  },
  revActivityBubble: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    marginBottom: 10,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 2,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  revBubbleWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    minHeight: 48,
    marginTop: 8,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  revBubbleHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revBubbleDivider: {
    width: 1.5,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 12,
    borderRadius: 1,
  },
  revTransactionsBox: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 12,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 2,
  },
  revActivityDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 18,
  },
});