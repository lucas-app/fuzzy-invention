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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WEB3_TASKS } from '../../../data/tasks';
import { useTaskStore } from '../../../store/taskStore';
import { Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import TaskCard from './CardDesign'; // Import our new premium card design

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

// Color palette as specified - refined for more pastel look
const COLORS = {
  // Background gradient
  backgroundStart: '#FFEFEA',
  backgroundEnd: '#FBDDE3',
  
  // Card colors (with softer pastel gradients)
  imageCardStart: '#37EED9',  // Lighter, more pastel teal
  imageCardEnd: '#28BBAF',    // Base teal
  imageLabel: '#147C73',      // Darker teal for label
  
  textCardStart: '#FFB869',   // Lighter, more pastel orange
  textCardEnd: '#FF7860',     // Base orange
  textLabel: '#D13F00',       // Darker orange for label
  
  audioCardStart: '#5CDBF2',  // Lighter, more pastel blue
  audioCardEnd: '#22AAC1',    // Base blue
  audioLabel: '#167788',      // Darker blue for label
  
  surveyCardStart: '#F986E5', // Lighter, more pastel purple
  surveyCardEnd: '#BA5EDC',   // Base purple
  surveyLabel: '#7B3797',     // Darker purple for label
  
  // UI Elements
  lucasLogo: '#00C4B4',       // Teal logo color
  hotText: '#FF6A3D',         // Hot orange text
  statsPanel: 'rgba(255,255,255,0.6)', // Translucent white
  cardText: '#FFFFFF',        // White text on cards
  subtleText: '#FDFDFD',      // Very light gray text
  coinIcon: '#FFD700',        // Gold coin color
  
  // Enhanced neumorphism effects
  shadowLight: 'rgba(255,255,255,0.9)',  // Brighter highlight
  shadowDark: 'rgba(86,86,102,0.3)',     // Darker shadow for more contrast
  innerGlow: 'rgba(255,255,255,0.25)',   // Stronger inner glow
  cardOverlay: 'rgba(255,255,255,0.08)', // Card surface sheen
  badgeGlow: 'rgba(0,0,0,0.15)',         // Subtle glow under badges
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
  badgeType?: 'NEW' | 'HOT' | 'QUICK';
  tasks?: any[];
};

// Task type definitions with exact colors from the palette
const TASK_TYPES: TaskType[] = [
  {
    id: 'image',
    title: 'Image Classification',
    description: 'Help train AI models by classifying images',
    icon: 'image',
    labelColor: COLORS.imageLabel,
    gradientStart: COLORS.imageCardStart,
    gradientEnd: COLORS.imageCardEnd,
    projectType: 'IMAGE_CLASSIFICATION',
    reward: '0,05-$10,00',
    badgeType: 'NEW',
  },
  {
    id: 'text',
    title: 'Text Analysis',
    description: 'Analyze text sentiment to improve services',
    icon: 'chatbubble-ellipses',
    labelColor: COLORS.textLabel,
    gradientStart: COLORS.textCardStart,
    gradientEnd: COLORS.textCardEnd,
    projectType: 'TEXT_SENTIMENT',
    reward: '0,05-$10,00',
    badgeType: 'HOT',
  },
  {
    id: 'audio',
    title: 'Audio Classification',
    description: 'Classify sounds and audio recordings',
    icon: 'musical-notes',
    labelColor: COLORS.audioLabel,
    gradientStart: COLORS.audioCardStart,
    gradientEnd: COLORS.audioCardEnd,
    projectType: 'AUDIO_CLASSIFICATION',
    reward: '0,05-$10,00',
    badgeType: 'QUICK',
  },
  {
    id: 'survey',
    title: 'Survey Tasks',
    description: 'Complete 3 tasks to earn a bonus!',
    icon: 'checkmark-circle',
    labelColor: COLORS.surveyLabel,
    gradientStart: COLORS.surveyCardStart,
    gradientEnd: COLORS.surveyCardEnd,
    projectType: 'SURVEY',
    reward: '0,05-$10,00',
    badgeType: 'QUICK',
  },
  {
    id: 'geospatial',
    title: 'Geospatial Labeling',
    description: 'Identify features in satellite imagery',
    icon: 'globe',
    labelColor: '#CC4B00', // Dark orange label
    gradientStart: '#FF8C38', // Warm orange gradient
    gradientEnd: '#FF6A3D',
    projectType: 'GEOSPATIAL_LABELING',
    reward: '0,05-$10,00',
    badgeType: 'HOT',
  },
  {
    id: 'web3',
    title: 'Web3 Tasks',
    description: 'Earn crypto rewards for DeFi, NFT, and DAO contributions',
    icon: 'logo-bitcoin',
    labelColor: '#4731D3',
    gradientStart: '#6C5DD3',
    gradientEnd: '#4731D3',
    projectType: 'WEB3',
    reward: '10-30 LUCAS',
    tasks: Object.values(WEB3_TASKS),
    badgeType: 'NEW',
  },
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
    
    // Preserve the original navigation logic
    if (taskType.id === 'web3') {
      // For Web3 tasks, use the existing navigation
      router.push(`/tasks/${taskType.id}`);
    } else {
      // For Label Studio tasks, navigate to the dedicated Label Studio screens
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
               taskType.id === 'survey' ? 'checkmark-circle' : 'chatbubble-ellipses'}
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

function TasksScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { completedTasks, fetchUserStats } = useTaskStore();

  useEffect(() => {
    // Load user stats
    fetchUserStats();
  }, []);

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
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(240,240,255,0.85)']}
              style={styles.avatarGradient}
            >
              <Ionicons name="person-circle" size={22} color="#5E5CE6" />
            </LinearGradient>
          </View>
          
          {/* Welcome text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Hey Max!</Text>
          </View>
        </View>
        
        {/* LUCAS logo with glow effect */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>LUCAS</Text>
        </View>
      </Animated.View>
    )
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
      
      {/* Create subtle texture pattern */}
      <View style={styles.patternOverlay} />
      
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
      
      {/* Stats bar with neumorphic styling */}
      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.statsContainerOuter}>
        <View style={styles.statsContainerInner}>
          {/* Render stats - more compact layout */}
          <View style={styles.statsContainer}>
            {/* Available Tasks */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            
            {/* Separator */}
            <View style={styles.statDivider}></View>
            
            {/* Completed Tasks */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            {/* Separator */}
            <View style={styles.statDivider}></View>
            
            {/* New Tasks with HOT badge */}
            <View style={styles.statItem}>
              <Text style={styles.hotStatText}>HOT</Text>
              <Text style={styles.statLabel}>New Tasks</Text>
              <Ionicons name="filter" size={14} color="#555" style={styles.filterIcon} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Task type cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tasksGrid}>
          {TASK_TYPES.map((taskType) => (
            <TaskTypeCard key={taskType.id} taskType={taskType} />
          ))}
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.textCardStart} />
        </View>
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
    right: -100,
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
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
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
  },
  logoText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.lucasLogo,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Add glow to logo text
    textShadowColor: 'rgba(0,196,180,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    // Slight padding for better appearance
    paddingHorizontal: 5,
    letterSpacing: 0.5,
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
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
});

export default TasksScreen;
