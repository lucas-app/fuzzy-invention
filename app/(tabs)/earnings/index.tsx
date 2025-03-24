import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTaskStore } from '../../../store/taskStore';
import { supabase } from '../../../lib/supabase';

export default function EarningsScreen() {
  const { stats, fetchUserStats } = useTaskStore();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch user stats
      await fetchUserStats();

      // Fetch recent activity
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (submissionsError) throw submissionsError;
      setRecentActivity(submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings data');
      console.error('Error loading earnings data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    router.push('/withdraw');
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
        <Pressable style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Earnings</Text>
        <LinearGradient
          colors={['#22D3EE', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Pressable onPress={handleWithdraw} style={styles.withdrawButton}>
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </Pressable>
          </View>
          <Text style={styles.balanceAmount}>
            ${stats.totalEarnings.toFixed(2)} <Text style={styles.currency}>USDC</Text>
          </Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {stats.totalCompleted} tasks completed • {stats.streak} day streak
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={recentActivity}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons 
                  name="checkmark-circle"
                  size={20} 
                  color="#22D3EE" 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>
                  Task Completed
                </Text>
                <Text style={styles.activityMeta}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.activityAmount}>+${item.reward.toFixed(2)}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No earnings yet. Complete tasks to start earning!</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

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
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020733',
    marginBottom: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
  },
  withdrawButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  currency: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    padding: 20,
    paddingBottom: 12,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#020733',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: '#64748b',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});