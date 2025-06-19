import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  Platform,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WEB3_TASKS } from '../../../data/tasks';
import { useTaskStore } from '../../../store/taskStore';
import { Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import TaskCard from './CardDesign'; // Import our new premium card design

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

// Color palette as specified - refined for more pastel look
const COLORS = {
  // Background gradient (electric blue)
  backgroundStart: '#0057FF', // Electric blue
  backgroundEnd: '#00B2FF',   // Bright blue
  backgroundAccent: '#3ECFFF', // Cyan accent for shapes
  
  // Card colors (with softer pastel gradients)
  imageCardStart: '#37EED9',  // Lighter, more pastel teal
  imageCardEnd: '#28BBAF',    // Base teal
  imageLabel: '#147C73',      // Darker teal for label
  
  textCardStart: '#FFB869',   // Lighter, more pastel orange
  textCardEnd: '#FF7860',     // Base orange
  textLabel: '#D13F00',       // Darker orange for label
  
  audioCardStart: '#FFD93D',  // Modern golden yellow
  audioCardEnd: '#FFB800',    // Deeper golden yellow
  audioLabel: '#B8860B',      // Dark goldenrod for label
  
  surveyCardStart: '#F986E5', // Lighter, more pastel purple
  surveyCardEnd: '#BA5EDC',   // Base purple
  surveyLabel: '#7B3797',     // Darker purple for label
  
  // UI Elements
  lucasLogo: '#00C4B4',       // Teal logo color
  hotText: '#FF6A3D',         // Hot orange text
  statsPanel: 'rgba(255,255,255,0.6)', // Match 'Hey Max' background
  cardText: '#FFFFFF',        // White text on cards
  subtleText: '#FDFDFD',      // Very light gray text
  coinIcon: '#FFD700',        // Gold coin color
  
  // Enhanced neumorphism effects
  shadowLight: 'rgba(255,255,255,0.2)',
  shadowDark: 'rgba(86,86,102,0.3)',
  innerGlow: 'rgba(255,255,255,0.10)',
  cardOverlay: 'rgba(255,255,255,0.08)',
  badgeGlow: 'rgba(0,0,0,0.15)',

  // New colors for filters and progress
  filterBg: 'rgba(255,255,255,0.08)',
  filterText: '#E0E6F7',
  filterActive: '#5E5CE6',
  filterActiveText: '#FFF',
  progressTrack: 'rgba(255,255,255,0.2)',
  progressFill: '#5E5CE6',
};

// Task types that connect to Label Studio API
type TaskType = {
  id: string;
  title: string;
  description: string;
  icon: string;
  labelColor: string;
  gradientStart: string;
  gradientEnd: string;
  projectType: string;
  reward: string;
  badgeType?: 'NEW' | 'HOT' | 'QUICK' | 'PREMIUM' | 'TRENDING' | 'SPECIAL';
  tasks?: any[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

// Task type definitions with exact colors from the palette
const TASK_TYPES: TaskType[] = [
  {
    id: 'rlhf',
    title: 'Rate AI Chat Responses',
    description: 'Help train better AI by ranking model responses',
    icon: 'chatbubbles',
    labelColor: '#FF6A3D',
    gradientStart: '#FF6A3D',
    gradientEnd: '#FF3D71',
    projectType: 'RLHF',
    reward: '$1.00-$4.00',
    badgeType: 'HOT',
    estimatedTime: '1-3 min',
    difficulty: 'Easy',
    tasks: [],
  },
  {
    id: 'photos',
    title: 'Capture Real-World Photos',
    description: 'Take pictures of stores, signs, streets & more',
    icon: 'camera',
    labelColor: '#37D2A0',
    gradientStart: '#37D2A0',
    gradientEnd: '#10B386',
    projectType: 'IMAGE_CAPTURE',
    reward: '$0.50-$5.00',
    badgeType: 'NEW',
    estimatedTime: '2-5 min',
    difficulty: 'Easy',
  },
  {
    id: 'voice',
    title: 'Record Your Voice',
    description: 'Speak, read, and transcribe to teach Voice AI',
    icon: 'mic',
    labelColor: '#FFD93D',
    gradientStart: '#FFD93D',
    gradientEnd: '#FFB800',
    projectType: 'VOICE_RECORDING',
    reward: '$0.75-$8.00',
    badgeType: 'QUICK',
    estimatedTime: '3-5 min',
    difficulty: 'Medium',
  },
  {
    id: 'feedback',
    title: 'Give Feedback on an App',
    description: 'Review design, language & cultural fit',
    icon: 'star',
    labelColor: '#F986E5',
    gradientStart: '#F986E5',
    gradientEnd: '#E55EDF',
    projectType: 'APP_FEEDBACK',
    reward: '$1.00-$10.00',
    badgeType: 'PREMIUM',
    estimatedTime: '5-10 min',
    difficulty: 'Medium',
  },
  {
    id: 'bonus',
    title: 'Explore Bonus Missions',
    description: 'Try new tasks, features & partner drops',
    icon: 'gift',
    labelColor: '#6C5DD3',
    gradientStart: '#6C5DD3',
    gradientEnd: '#4731D3',
    projectType: 'BONUS_MISSIONS',
    reward: '$1.00-$20.00',
    badgeType: 'SPECIAL',
    estimatedTime: '5-15 min',
    difficulty: 'Medium',
  }
];

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All Tasks', icon: 'apps' },
  { id: 'hot', label: 'Hot', icon: 'flame' },
  { id: 'quick', label: 'Quick', icon: 'flash' },
  { id: 'new', label: 'New', icon: 'star' },
];

// Shimmer particle component for background effects
function ShimmerParticle({ style }: { style: any }) {
  return (
    <View
      style={[{
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
      }, style]}
    />
  );
}

function TaskTypeCard({ taskType }: { taskType: TaskType }) {
  // Navigation functions
  const handlePress = () => {
    // Add haptic feedback here if needed
    console.log('Button pressed for:', taskType.id);
    
    if (taskType.id === 'web3') {
      router.push(`/tasks/${taskType.id}`);
    } else if (taskType.id === 'photos') {
      router.push('/tasks/photos');
    } else if (taskType.id === 'rlhf') {
      router.push('/tasks/rlhf');
    } else if (taskType.id === 'voice') {
      router.push('/tasks/voice');
    } else if (taskType.id === 'feedback') {
      router.push('/tasks/feedback');
    } else if (taskType.id === 'bonus') {
      router.push('/tasks/bonus');
    } else {
      router.push({
        pathname: '/labelstudio',
        params: { projectType: taskType.projectType }
      });
    }
  };

  // Use our premium card component with perfect neumorphic styling
  return (
    <TaskCard
      title={taskType.title}
      badgeText={taskType.badgeType}
      iconName={taskType.id === 'image' ? 'image' : 
               taskType.id === 'audio' ? 'audio' : 
               taskType.id === 'survey' ? 'checkmark-circle' : 'chatbubbles'}
      reward={taskType.reward}
      gradientStart={taskType.gradientStart}
      gradientEnd={taskType.gradientEnd}
      badgeColor={taskType.labelColor}
      showProgress={taskType.id === 'survey'}
      description="Complete 3 tasks to earn a bonus!"
      onPress={handlePress}
    />
  );
}

// Custom LUCAS logo component
function LucasLogo() {
  return (
    <View style={styles.logoContainer}>
      {/* Primary image logo */}
      <Image 
        source={require('../../../assets/images/transparente.png')} 
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

function TasksScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { completedTasks, fetchUserStats } = useTaskStore();
  const [taskProgress, setTaskProgress] = useState({
    daily: 0,
    weekly: 40,
    monthly: 65,
  });
  
  // Animation values for pull-to-search
  const scrollY = useSharedValue(0);
  const searchBarHeight = useSharedValue(0);
  const searchBarOpacity = useSharedValue(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Define constants for the pull-to-search feature
  const SEARCH_BAR_MAX_HEIGHT = 60;
  const PULL_THRESHOLD = 80; // How far to pull down to reveal search
  
  // Handle scroll events for pull-to-search
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Update scroll position
      scrollY.value = event.contentOffset.y;
      
      // Only handle pull-down animation if search isn't already visible
      if (!isSearchVisible && event.contentOffset.y < 0) {
        // Calculate height and opacity based on pull distance
        const pullDistance = Math.abs(event.contentOffset.y);
        // Set height proportional to pull distance
        searchBarHeight.value = Math.min(pullDistance * 0.5, SEARCH_BAR_MAX_HEIGHT);
        // Set opacity based on how close to threshold
        searchBarOpacity.value = Math.min(pullDistance / PULL_THRESHOLD, 1);
      }
    },
    onEndDrag: (event) => {
      // When user stops dragging and search isn't already visible
      if (!isSearchVisible && event.contentOffset.y < -PULL_THRESHOLD) {
        // If pulled enough, show search bar
        searchBarHeight.value = withSpring(SEARCH_BAR_MAX_HEIGHT);
        searchBarOpacity.value = withSpring(1);
        // Update state to track visibility
        runOnJS(setIsSearchVisible)(true);
      } else if (!isSearchVisible && event.contentOffset.y < 0) {
        // If not pulled enough and search not visible, hide it
        searchBarHeight.value = withSpring(0);
        searchBarOpacity.value = withSpring(0);
      }
    }
  });
  
  // Effect to update animated values when visibility changes
  useEffect(() => {
    if (isSearchVisible) {
      searchBarHeight.value = withSpring(SEARCH_BAR_MAX_HEIGHT);
      searchBarOpacity.value = withSpring(1);
    } else {
      searchBarHeight.value = withSpring(0);
      searchBarOpacity.value = withSpring(0);
    }
  }, [isSearchVisible]);
  
  // Animated styles for search container
  const searchContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: isSearchVisible ? SEARCH_BAR_MAX_HEIGHT : searchBarHeight.value,
      opacity: isSearchVisible ? 1 : searchBarOpacity.value,
      overflow: 'hidden',
    };
  });
  
  // Hide search function
  const hideSearch = () => {
    setIsSearchVisible(false);
  };

  useEffect(() => {
    // Load user stats
    fetchUserStats();
    // Simulate fetching task progress
    // In real app, this would come from your backend
    setTaskProgress({
      daily: Math.floor(Math.random() * 100),
      weekly: Math.floor(Math.random() * 100),
      monthly: Math.floor(Math.random() * 100),
    });
  }, []);

  // Filter tasks based on search and filter
  const filteredTasks = TASK_TYPES.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         (task.badgeType?.toLowerCase() === activeFilter);
    return matchesSearch && matchesFilter;
  });

  const goToDebugger = () => {
    router.push({
      pathname: '/labelstudio',
      params: { projectType: 'DEBUG' }
    });
  };

  // Generate random positions for shimmer particles
  const particles = Array(15).fill(0).map((_, i) => ({
    left: Math.random() * width,
    top: Math.random() * (width * 1.5),
    opacity: Math.random() * 0.2 + 0.1,
    size: Math.random() * 3 + 2,
  }));

  // User avatar and greeting
  function renderHeader() {
    return (
      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        {/* User info container with improved compact styling */}
        <View style={styles.userInfoContainer}>
          {/* Avatar with person icon */}
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../../assets/images/capy.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          
          {/* Welcome text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Hey Max!</Text>
          </View>
        </View>
        
        {/* LUCAS logo */}
        <LucasLogo />
      </Animated.View>
    )
  }

  // New search component that appears on pull-down
  function renderPullToSearchBar() {
    return (
      <Animated.View style={[styles.pullSearchContainer, searchContainerAnimatedStyle]}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            autoFocus={isSearchVisible}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={hideSearch} style={styles.closeButton}>
            <Ionicons name="chevron-up" size={22} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_OPTIONS.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={activeFilter === filter.id ? '#FFF' : '#666'} 
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }

  // Enhanced stats section with progress
  function renderStats() {
    const monthlyGoal = 12; // Mock value
    const completed = 7; // Mock value for demonstration
    const monthlyProgress = Math.min(completed / monthlyGoal, 1);
    return (
      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.statsContainerOuter}>
        <View style={styles.statsContainerInner}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{taskProgress.daily}</Text>
              <Text style={styles.statLabel}>Daily Progress</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${taskProgress.daily}%` }]} />
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{taskProgress.weekly}</Text>
              <Text style={styles.statLabel}>Weekly Goal</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${taskProgress.weekly}%` }]} />
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{monthlyGoal}</Text>
              <Text style={styles.statLabel}>Monthly Goal</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${monthlyProgress * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false, // Hide default header for custom design
        }}
      />
      
      {/* Background gradient with subtle texture */}
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Abstract blue shapes overlay for depth */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Electric blue and cyan blurred blobs/circles for depth */}
        <View style={[styles.blob, { backgroundColor: COLORS.backgroundAccent, top: 80, left: -60, width: 200, height: 200, opacity: 0.13, borderRadius: 100 }]} />
        <View style={[styles.blob, { backgroundColor: '#0057FF', top: 320, right: -80, width: 180, height: 180, opacity: 0.12, borderRadius: 90 }]} />
        <View style={[styles.blob, { backgroundColor: '#00B2FF', bottom: 60, left: 60, width: 140, height: 140, opacity: 0.14, borderRadius: 70 }]} />
        <View style={[styles.blob, { backgroundColor: '#3ECFFF', bottom: -40, right: 30, width: 120, height: 120, opacity: 0.11, borderRadius: 60 }]} />
      </View>
      
      {/* Subtle glow in corners */}
      <View style={styles.cornerGlow1} />
      <View style={styles.cornerGlow2} />
      
      {/* Shimmer particles for background effect */}
      {particles.map((particle, index) => (
        <View 
          key={index} 
          style={{
            position: 'absolute',
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: 'rgba(255,255,255,0.4)',
          }} 
        />
      ))}
      
      {/* Custom header with logo */}
      {renderHeader()}
      
      {/* Pull-to-reveal search bar */}
      {renderPullToSearchBar()}
      
      {/* Stats section */}
      {renderStats()}

      {/* Task type cards */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.tasksGrid}>
          {filteredTasks.map((taskType, index) => (
            <Animated.View
              key={taskType.id}
              entering={FadeInRight.delay(index * 100).duration(600)}
            >
              <TaskCard
                title={taskType.title}
                badgeText={taskType.badgeType}
                iconName={taskType.icon as any}
                reward={taskType.reward}
                gradientStart={taskType.gradientStart}
                gradientEnd={taskType.gradientEnd}
                badgeColor={taskType.labelColor}
                showProgress={taskType.id === 'survey'}
                description={taskType.description}
                estimatedTime={taskType.estimatedTime}
                difficulty={taskType.difficulty}
                onPress={() => {
                  if (taskType.id === 'web3') {
                    router.push(`/tasks/${taskType.id}`);
                  } else if (taskType.id === 'photos') {
                    router.push('/tasks/photos');
                  } else if (taskType.id === 'rlhf') {
                    router.push('/tasks/rlhf');
                  } else if (taskType.id === 'voice') {
                    router.push('/tasks/voice');
                  } else if (taskType.id === 'feedback') {
                    router.push('/tasks/feedback');
                  } else if (taskType.id === 'bonus') {
                    router.push('/tasks/bonus');
                  } else {
                    router.push({
                      pathname: '/labelstudio',
                      params: { projectType: taskType.projectType }
                    });
                  }
                }}
              />
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.textCardStart} />
        </View>
      )}
      
      {/* Pull down indicator */}
      {!isSearchVisible && (
        <Animated.View 
          style={[
            styles.pullDownIndicator,
            {
              opacity: searchBarOpacity.value,
              transform: [{ translateY: scrollY.value < 0 ? scrollY.value / 2 : 0 }]
            }
          ]}
        >
          <Ionicons name="search" size={24} color="#666" />
          <Text style={styles.pullDownText}>Pull down to search</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%)',
    backgroundSize: '50px 50px',
  },
  cornerGlow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,180,180,0.2)',
    opacity: 0.5,
  },
  cornerGlow2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(180,255,255,0.15)',
    opacity: 0.5,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 42 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: Platform.OS === 'ios' ? 6 : 2,
    marginBottom: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 6,
    paddingRight: 14,
    // Refined neumorphic effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    // Light inner border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  welcomeContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, 
    width: 140,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    overflow: 'hidden',
  },
  logoImage: {
    width: 130,
    height: 40,
  },
  statsContainerOuter: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    // Enhanced neumorphic outer shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsContainerInner: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.statsPanel,
    // Enhanced inner shadow effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  hotStatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.hotText,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Add slight text shadow for pop
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  filterIcon: {
    position: 'absolute',
    right: -8,
    top: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskTypeCardContainer: {
    width: cardWidth,
    height: cardWidth * 1.1, // Make cards slightly taller
    marginBottom: 16,
    padding: 4, // Space for external glow effect
  },
  taskTypeCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    // Enhanced neumorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    // Second light shadow for more depth
    backgroundColor: 'transparent',
    position: 'relative',
    // For Android elevation effect
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  taskTypeCard: {
    width: '100%',
    height: '100%',
    padding: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    // Enhanced inner border
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cardInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.innerGlow, // Enhanced inner glow
    opacity: 0.6,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
    // Enhanced neumorphic badge
    shadowColor: COLORS.badgeGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Inner glow effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // Enhanced inner shadow/highlight
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    // Subtle shadow for depth
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  imageIconPlaceholder: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.cardText,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  surveyInfo: {
    marginTop: 8,
  },
  surveyText: {
    color: COLORS.cardText,
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 8,
    // Add subtle inner shadow for depth
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
    // Add subtle glow to progress fill
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  rewardContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    // Add subtle background for better readability
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    paddingLeft: 10,
    borderRadius: 16,
    // Add inner glow
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  taskTypeReward: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.cardText,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Add subtle glow to text
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New styles for search and filters
  pullSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 84 : 64,
    left: 0,
    right: 0,
    zIndex: 10,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
    // Add a subtle inner shadow
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 40,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.filterBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.filterActive,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.filterText,
    marginLeft: 4,
  },
  filterTextActive: {
    color: COLORS.filterActiveText,
  },
  // Enhanced stats styles
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 2,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  closeButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pullDownIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  pullDownText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  blob: {
    position: 'absolute',
    // For blur, use shadow for iOS/Android, or add a BlurView if available
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    // For web, you could use filter: 'blur(32px)', but not in RN
  },
});

export default TasksScreen;
