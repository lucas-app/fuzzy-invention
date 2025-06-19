import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New Features' },
  { id: 'partner', label: 'Partnerships' },
  { id: 'survey', label: 'Surveys' },
  { id: 'referral', label: 'Referrals' },
];

const BONUS_MISSIONS = [
  {
    id: '1',
    emoji: '🧪',
    title: 'Try a New Task Type',
    description: 'Help us test an experimental data task.',
    reward: '$0.50 – $2.00',
    time: '~3–5 min',
    type: 'new',
  },
  {
    id: '2',
    emoji: '🤝',
    title: 'Partner Promo — Fintech App',
    description: 'Download and review a new Latin American fintech tool.',
    reward: '$1.00 – $3.00',
    time: '~5–10 min',
    type: 'partner',
  },
  {
    id: '3',
    emoji: '📊',
    title: 'Feedback Challenge',
    description: 'Complete a short feedback survey about your recent tasks.',
    reward: '$0.25 – $0.75',
    time: '~2 min',
    type: 'survey',
  },
  {
    id: '4',
    emoji: '📸',
    title: 'Seasonal Photo Drop',
    description: 'Take photos of seasonal products or ads near you.',
    reward: '$1.00 – $2.00',
    time: '~4 min',
    type: 'new',
  },
  {
    id: '5',
    emoji: '🎉',
    title: 'Refer-a-Friend Bonus',
    description: 'Invite a friend and earn when they complete their first task.',
    reward: '$1.00 per referral',
    time: 'varies',
    type: 'referral',
  },
];

export default function BonusMissionsScreen() {
  const [filter, setFilter] = useState('all');

  const filteredMissions = filter === 'all'
    ? BONUS_MISSIONS
    : BONUS_MISSIONS.filter(m => m.type === filter);

  const renderCard = ({ item }: any) => (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.rewardTimeRow}>
            <Text style={styles.reward}><Ionicons name="cash-outline" size={15} color="#FFD700" /> {item.reward}</Text>
            <Text style={styles.time}><Ionicons name="time-outline" size={15} color="#6C5DD3" /> {item.time}</Text>
          </View>
          <TouchableOpacity style={styles.startBtn}>
            <LinearGradient
              colors={["#FFD700", "#FFB869"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtnGradient}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>🎯 Explore Bonus Missions</Text>
        <Text style={styles.headerSubtitle}>Try limited-time tasks, feature pilots, and partner drops to earn extra rewards.</Text>
        {/* Filter Dropdown */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Cards List */}
      <FlatList
        data={filteredMissions}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {/* Footer Note */}
      <Text style={styles.footerNote}>
        🎁 Bonus missions change weekly. Complete them early to secure your rewards.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#6C5DD3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5DD3',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#4731D3',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 2,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F0FF',
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: '#6C5DD3',
  },
  filterText: {
    color: '#6C5DD3',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  cardOuter: {
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: '#6C5DD3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F8F7FF',
    borderWidth: 1.5,
    borderColor: '#E0DEFA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 26,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2D217C',
    flex: 1,
  },
  cardDesc: {
    fontSize: 14,
    color: '#222',
    marginBottom: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardTimeRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  reward: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  time: {
    color: '#6C5DD3',
    fontWeight: '600',
    fontSize: 13,
  },
  startBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  startBtnGradient: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  footerNote: {
    textAlign: 'center',
    color: '#6C5DD3',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 18 : 8,
  },
}); 