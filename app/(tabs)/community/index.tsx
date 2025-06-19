import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, RefreshControl, TextInput, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import type { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_LEADERBOARD = [
  {
    id: '1',
    username: 'cryptomaster',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    earnings: 2584.32,
    country: 'US',
    tasksCompleted: 1253,
    tier: 'gold',
  },
  {
    id: '2',
    username: 'datawhiz',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    earnings: 1892.45,
    country: 'UK',
    tasksCompleted: 945,
    tier: 'gold',
  },
  {
    id: '3',
    username: 'aiexpert',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    earnings: 1245.78,
    country: 'CA',
    tasksCompleted: 621,
    tier: 'silver',
  },
];

const ACTIVE_QUESTS = [
  {
    id: '1',
    type: 'daily',
    title: 'Data Labeling Sprint',
    description: 'Complete 5 data-labeling tasks',
    reward: 2.00,
    progress: 3,
    target: 5,
    expiresIn: 14400, // 4 hours in seconds
  },
  {
    id: '2',
    type: 'weekly',
    title: 'Community Champion',
    description: 'Help label 1,000 images with the community',
    reward: 25.00,
    progress: 750,
    target: 1000,
    expiresIn: 259200, // 3 days in seconds
  },
  {
    id: '3',
    type: 'monthly',
    title: 'Investment Master',
    description: 'Complete all investment tutorials',
    reward: 50.00,
    progress: 4,
    target: 10,
    expiresIn: 1209600, // 14 days in seconds
  },
];

const COMMUNITY_POSTS = [
  {
    id: '1',
    user: {
      username: 'cryptomaster',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
    type: 'achievement',
    content: '🎉 Just completed my 1,000th task! Thanks to this amazing community for all the support!',
    likes: 42,
    comments: 12,
    timestamp: '2h ago',
  },
  {
    id: '2',
    user: {
      username: 'datawhiz',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    type: 'milestone',
    content: '💰 Reached $1,000 in earnings! LUCAS has been a game-changer for me.',
    likes: 38,
    comments: 8,
    timestamp: '4h ago',
  },
];

const STORIES = [
  {
    id: '1',
    user: {
      username: 'cryptomaster',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
    type: 'achievement',
    title: 'Reached Diamond!',
  },
  {
    id: '2',
    user: {
      username: 'aiexpert',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    },
    type: 'milestone',
    title: '$5K Earned',
  },
];

const TRENDING_TOPICS = [
  { id: '1', name: 'AI Ethics', count: 324 },
  { id: '2', name: 'Data Quality', count: 256 },
  { id: '3', name: 'Earnings Tips', count: 198 },
];

const CHALLENGES = [
  {
    id: '1',
    title: 'Speed Champion',
    description: 'Label 100 images in under 1 hour',
    reward: 50,
    participants: 234,
    endTime: '2d 5h',
    type: 'solo',
  },
  {
    id: '2',
    title: 'Team Quest',
    description: 'Collaborate to label 1000 audio files',
    reward: 100,
    participants: 56,
    endTime: '5d',
    type: 'team',
  },
];

// Define the colors type to match expo-linear-gradient's requirements
type GradientColors = [string, string];

function LeaderboardSection() {
  const [filter, setFilter] = useState('global');

  const getTierColor = (tier: string): readonly [string, string] => {
    switch (tier) {
      case 'diamond': return ['#B2F5EA', '#4FD1C5'] as const;
      case 'gold': return ['#FBD38D', '#F6AD55'] as const;
      case 'silver': return ['#CBD5E0', '#A0AEC0'] as const;
      default: return ['#BEE3F8', '#63B3ED'] as const;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
        <View style={styles.filterButtons}>
          <Pressable
            style={[styles.filterButton, filter === 'global' && styles.filterButtonActive]}
            onPress={() => setFilter('global')}
          >
            <Text style={[styles.filterButtonText, filter === 'global' && styles.filterButtonTextActive]}>
              Global
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'local' && styles.filterButtonActive]}
            onPress={() => setFilter('local')}
          >
            <Text style={[styles.filterButtonText, filter === 'local' && styles.filterButtonTextActive]}>
              Your Country
            </Text>
          </Pressable>
        </View>
      </View>

      {MOCK_LEADERBOARD.map((user, index) => (
        <Animated.View
          key={user.id}
          entering={FadeIn.delay(index * 100)}
          style={styles.leaderboardItem}
        >
          <LinearGradient
            colors={getTierColor(user.tier)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rankBadge}
          >
            <Text style={styles.rankText}>{index + 1}</Text>
          </LinearGradient>
          
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.userStats}>
              ${user.earnings.toLocaleString()} • {user.tasksCompleted} tasks
            </Text>
          </View>

          <Pressable style={styles.followButton}>
            <Ionicons name="person-add" size={20} color="#2563eb" />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

function QuestsSection() {
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎯 Active Quests</Text>
      
      {ACTIVE_QUESTS.map((quest) => (
        <View key={quest.id} style={styles.questCard}>
          <LinearGradient
            colors={['rgba(34,211,238,0.1)', 'rgba(45,212,191,0.1)'] as const}
            style={styles.questGradient}
          />
          
          <View style={styles.questHeader}>
            <View style={styles.questType}>
              <Text style={styles.questTypeText}>
                {quest.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.questTimeLeft}>
              {formatTimeLeft(quest.expiresIn)} left
            </Text>
          </View>

          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>

          <View style={styles.questProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(quest.progress / quest.target) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {quest.progress}/{quest.target}
            </Text>
          </View>

          <View style={styles.questReward}>
            <Ionicons name="gift" size={20} color="#2563eb" />
            <Text style={styles.rewardText}>
              ${quest.reward.toFixed(2)} USDC
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function StoriesSection() {
  const storyGradientColors = ['#FF6B6B', '#4ECDC4'] as const;
  return (
    <View style={styles.storiesContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STORIES}
        renderItem={({ item }) => (
          <Pressable style={styles.storyItem}>
            <LinearGradient
              colors={storyGradientColors}
              style={styles.storyGradient}
            >
              <Image source={{ uri: item.user.avatar }} style={styles.storyAvatar} />
            </LinearGradient>
            <Text style={styles.storyUsername} numberOfLines={1}>
              {item.user.username}
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storiesList}
      />
    </View>
  );
}

function SearchBar() {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#64748b" />
      <TextInput
        placeholder="Search posts, users, or topics..."
        style={styles.searchInput}
        placeholderTextColor="#64748b"
      />
      <Pressable style={styles.filterButton}>
        <Ionicons name="filter" size={20} color="#2563eb" />
      </Pressable>
    </View>
  );
}

function TrendingTopics() {
  return (
    <View style={styles.trendingContainer}>
      <Text style={styles.trendingTitle}>Trending Topics</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TRENDING_TOPICS}
        renderItem={({ item }) => (
          <Pressable style={styles.topicChip}>
            <Text style={styles.topicName}>#{item.name}</Text>
            <Text style={styles.topicCount}>{item.count}</Text>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.topicsList}
      />
    </View>
  );
}

function ChallengesSection() {
  const teamGradientColors = ['#4F46E5', '#7C3AED'] as const;
  const soloGradientColors = ['#2563EB', '#3B82F6'] as const;
  
  return (
    <View style={styles.challengesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏆 Active Challenges</Text>
        <Link href={{ pathname: '/(tabs)/challenges' } as any} asChild>
          <Pressable style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </Link>
      </View>
      {CHALLENGES.map((challenge) => (
        <Animated.View
          key={challenge.id}
          entering={FadeInRight.delay(200)}
          style={styles.challengeCard}
        >
          <LinearGradient
            colors={challenge.type === 'team' ? teamGradientColors : soloGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.challengeGradient}
          >
            <View style={styles.challengeContent}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.challengeType}>
                  <MaterialCommunityIcons
                    name={challenge.type === 'team' ? 'account-group' : 'account'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.challengeTypeText}>
                    {challenge.type === 'team' ? 'Team' : 'Solo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeStats}>
                <View style={styles.challengeStat}>
                  <Ionicons name="people" size={16} color="#fff" />
                  <Text style={styles.challengeStatText}>{challenge.participants}</Text>
                </View>
                <View style={styles.challengeStat}>
                  <Ionicons name="time" size={16} color="#fff" />
                  <Text style={styles.challengeStatText}>{challenge.endTime}</Text>
                </View>
                <View style={styles.challengeStat}>
                  <Ionicons name="gift" size={16} color="#fff" />
                  <Text style={styles.challengeStatText}>${challenge.reward}</Text>
                </View>
              </View>
              <Pressable style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Challenge</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      ))}
    </View>
  );
}

function CommunitySection() {
  return (
    <View style={styles.communityContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Posts</Text>
        <Link href={{ pathname: '/(tabs)/community/new-post' } as any} asChild>
          <Pressable style={styles.newPostButton}>
            <Text style={styles.newPostText}>New Post</Text>
          </Pressable>
        </Link>
      </View>

      {COMMUNITY_POSTS.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
            <View style={styles.postMeta}>
              <Text style={styles.postUsername}>{post.user.username}</Text>
              <Text style={styles.postTimestamp}>{post.timestamp}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postActions}>
            <Pressable style={styles.postAction}>
              <Ionicons name="heart-outline" size={24} color="#64748b" />
              <Text style={styles.actionCount}>{post.likes}</Text>
            </Pressable>
            <Pressable style={styles.postAction}>
              <Ionicons name="chatbubble-outline" size={24} color="#64748b" />
              <Text style={styles.actionCount}>{post.comments}</Text>
            </Pressable>
            <Pressable style={styles.postAction}>
              <Ionicons name="share-social-outline" size={24} color="#64748b" />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

type StickyHeaderProps = { onSearch?: (text: string) => void };
function StickyHeader({ onSearch = () => {} }: StickyHeaderProps) {
  return (
    <View style={styles.stickyHeader}>
      <View style={styles.headerSearchBar}>
        <Ionicons name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search community..."
          style={styles.headerSearchInput}
          placeholderTextColor="#64748b"
          onChangeText={onSearch}
        />
      </View>
      <TouchableOpacity style={styles.headerNotifBtn}>
        <Ionicons name="notifications-outline" size={24} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
}

function FeedTab() {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <StoriesSection />
      <TrendingTopics />
      <ChallengesSection />
      <LeaderboardSection />
      <CommunitySection />
    </ScrollView>
  );
}

function QATab() {
  return (
    <View style={styles.tabPlaceholder}><Text style={styles.tabPlaceholderText}>Q&A coming soon...</Text></View>
  );
}

function EventsTab() {
  return (
    <View style={styles.tabPlaceholder}><Text style={styles.tabPlaceholderText}>Events coming soon...</Text></View>
  );
}

function LeaderboardTab() {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <LeaderboardSection />
    </ScrollView>
  );
}

export default function CommunityScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const scrollRef = useRef(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StickyHeader />
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]} onPress={() => setActiveTab('feed')}>
          <Text style={[styles.tabBtnText, activeTab === 'feed' && styles.tabBtnTextActive]}>Feed</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'qa' && styles.tabBtnActive]} onPress={() => setActiveTab('qa')}>
          <Text style={[styles.tabBtnText, activeTab === 'qa' && styles.tabBtnTextActive]}>Q&A</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'events' && styles.tabBtnActive]} onPress={() => setActiveTab('events')}>
          <Text style={[styles.tabBtnText, activeTab === 'events' && styles.tabBtnTextActive]}>Events</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'leaderboard' && styles.tabBtnActive]} onPress={() => setActiveTab('leaderboard')}>
          <Text style={[styles.tabBtnText, activeTab === 'leaderboard' && styles.tabBtnTextActive]}>Leaderboard</Text>
        </Pressable>
      </View>
      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'qa' && <QATab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </View>
      {/* Floating action button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#020733',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 14,
    color: '#64748b',
  },
  followButton: {
    padding: 8,
  },
  questCard: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questType: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(37,99,235,0.1)',
  },
  questTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  questTimeLeft: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  questProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  newPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postMeta: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 14,
    color: '#64748b',
  },
  postContent: {
    fontSize: 16,
    color: '#020733',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  postAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 14,
    color: '#64748b',
  },
  topicBadge: {
    marginRight: 12,
  },
  topicButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  topicCount: {
    fontSize: 12,
    color: '#64748b',
  },
  eventsContainer: {
    paddingVertical: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#e2e8f0',
  },
  eventsScroll: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 8,
  },
  eventCard: {
    width: 240,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(239,68,68,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  eventHost: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventParticipantsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  storiesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  storiesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 4,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyUsername: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#020733',
  },
  trendingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 12,
  },
  topicsList: {
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 4,
  },
  challengesContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  challengeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 16,
  },
  challengeContent: {
    gap: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  challengeTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: 14,
    color: '#fff',
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  communityContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  newPostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#f8fafc',
    zIndex: 10,
  },
  headerSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  headerNotifBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
    zIndex: 5,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabBtnActive: {
    backgroundColor: '#2563eb',
  },
  tabBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  tabPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  tabPlaceholderText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
});