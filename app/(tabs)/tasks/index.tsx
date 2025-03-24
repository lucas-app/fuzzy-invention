import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { TASKS, WEB3_TASKS } from '../../../data/tasks';
import { useTaskStore } from '../../../store/taskStore';

const TASK_SECTIONS = [
  {
    id: 'image',
    title: 'Image Classification',
    description: 'Help train AI models by classifying images',
    tasks: TASKS.image,
    icon: 'image',
  },
  {
    id: 'text',
    title: 'Sentiment Analysis',
    description: 'Analyze text sentiment to improve services',
    tasks: TASKS.text,
    icon: 'document-text',
  },
  {
    id: 'object',
    title: 'Object Detection',
    description: 'Help train AI by marking objects in images',
    tasks: TASKS.object,
    icon: 'scan',
  },
  {
    id: 'ailabel',
    title: 'AI Label',
    description: 'Advanced AI labeling tasks from Label Studio',
    tasks: [
      {
        id: 'labelstudio',
        title: 'Label Studio Tasks',
        description: 'View and manage Label Studio tasks',
        reward: '5-15 LUCAS',
        time: '10-30 min',
        difficulty: 'Medium',
        type: 'AI',
      }
    ],
    icon: 'code-working',
  },
  {
    id: 'web3',
    title: 'Web3 Tasks',
    description: 'Participate in blockchain and crypto tasks',
    tasks: Object.values(WEB3_TASKS),
    icon: 'globe',
  },
];

function TaskCard({ task, index, completedTasks }: { 
  task: any; 
  index: number;
  completedTasks: string[];
}) {
  const isCompleted = completedTasks.includes(task.id);

  const handlePress = () => {
    if (!isCompleted) {
      if (task.id === 'labelstudio') {
        // Navigate to our Label Studio integration screen
        router.push('/labelstudio');
      } else {
        router.push(`/tasks/${task.id}`);
      }
    }
  };

  const getTaskIcon = () => {
    if (task.type === 'image') return 'image';
    if (task.type === 'text') return 'text';
    if (task.type === 'object') return 'scan';
    if (task.id === 'airdrop') return 'gift';
    if (task.id === 'community') return 'people';
    return 'checkmark-circle';
  };

  const isWeb3Task = !task.type;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={[
        styles.taskCardContainer,
        isCompleted && styles.taskCardCompleted
      ]}
    >
      <Pressable
        style={styles.taskCard}
        onPress={handlePress}
        disabled={isCompleted}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <LinearGradient
          colors={['rgba(34,211,238,0.1)', 'rgba(45,212,191,0.1)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.taskHeader}>
          <View style={[
            styles.taskIcon,
            isWeb3Task && styles.web3TaskIcon,
            isCompleted && styles.taskIconCompleted
          ]}>
            <Ionicons 
              name={isCompleted ? 'checkmark' : getTaskIcon()} 
              size={24} 
              color={isCompleted ? '#10b981' : (isWeb3Task ? '#9333ea' : '#2563eb')} 
            />
          </View>
          
          <View style={styles.taskMeta}>
            <View style={[
              styles.availabilityBadge,
              isCompleted && styles.completedBadge
            ]}>
              <Text style={[
                styles.availabilityText,
                isCompleted && styles.completedText
              ]}>
                {isCompleted ? 'Completed' : 'New Task'}
              </Text>
            </View>
            <Text style={[
              styles.reward,
              isWeb3Task && styles.web3Reward,
              isCompleted && styles.completedReward
            ]}>
              ${typeof task.reward === 'string' ? task.reward : task.reward.toFixed(2)} <Text style={styles.rewardUnit}>USDC</Text>
            </Text>
          </View>
        </View>

        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            isCompleted && styles.completedText
          ]}>{task.title}</Text>
          <Text style={[
            styles.taskDescription,
            isCompleted && styles.completedDescription
          ]}>
            {task.description || (task.type === 'image' ? 'Help train our AI by classifying this image' : 'Help improve our text analysis models')}
          </Text>
        </View>

        <View style={[
          styles.taskFooter,
          isWeb3Task && styles.web3TaskFooter,
          isCompleted && styles.completedFooter
        ]}>
          <Text style={[
            styles.startTask,
            isWeb3Task && styles.web3StartTask,
            isCompleted && styles.completedStartTask
          ]}>{isCompleted ? 'Task Completed' : 'Start Task'}</Text>
          <Ionicons 
            name={isCompleted ? 'checkmark-circle' : 'arrow-forward'}
            size={20} 
            color={isCompleted ? '#10b981' : (isWeb3Task ? '#9333ea' : '#2563eb')} 
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function TaskSection({ section, isExpanded, onToggle, completedTasks }: { 
  section: typeof TASK_SECTIONS[0];
  isExpanded: boolean;
  onToggle: () => void;
  completedTasks: string[];
}) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      style={styles.section}
    >
      <Pressable 
        style={styles.sectionHeader}
        onPress={onToggle}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <View style={styles.sectionIcon}>
          <Ionicons name={section.icon} size={22} color="#020733" />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDescription}>{section.description}</Text>
        </View>
        <Animated.View
          style={{
            transform: [{ 
              rotate: isExpanded ? '180deg' : '0deg' 
            }]
          }}
        >
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color="#64748b" 
          />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn}
          style={styles.sectionContent}
        >
          {section.tasks.map((task, index) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              index={index}
              completedTasks={completedTasks}
            />
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function TasksScreen() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['image']);
  const { completedTasks, fetchUserStats } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const web3SectionRef = useRef<View>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUserStats();
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const scrollToWeb3Section = useCallback(() => {
    // First ensure the web3 section is expanded
    if (!expandedSections.includes('web3')) {
      setExpandedSections(prev => [...prev, 'web3']);
    }
    
    // Use a timeout to ensure the section is rendered before scrolling
    setTimeout(() => {
      if (web3SectionRef.current && scrollViewRef.current) {
        web3SectionRef.current.measureLayout(
          scrollViewRef.current as any,
          (_, y) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => console.error('Failed to measure layout')
        );
      }
    }, 100);
  }, [expandedSections]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020733', '#041454']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://i.ibb.co/Rk8yV57s/LUCAS-transparente.png' }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>   Task Marketplace</Text>
            <Text style={styles.subtitle}>     Complete tasks, Earn, Invest
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{TASK_SECTIONS.reduce((sum, section) => sum + section.tasks.length, 0)}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <Pressable 
          style={styles.statItem}
          onPress={scrollToWeb3Section}
          android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
        >
          <View style={styles.hotTaskBadge}>
            <Text style={styles.hotTaskText}>HOT</Text>
          </View>
          <Text style={styles.statLabel}>Web3 Tasks</Text>
        </Pressable>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TASK_SECTIONS.map((section) => (
          <View 
            key={section.id}
            ref={section.id === 'web3' ? web3SectionRef : undefined}
          >
            <TaskSection
              section={section}
              isExpanded={expandedSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
              completedTasks={completedTasks}
            />
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 48,
    height: 59,
    borderRadius: 8,
    backgroundColor: '',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 110,
    height: 110,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020733',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  hotTaskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    marginBottom: 4,
  },
  hotTaskText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: expandedSections => expandedSections.length > 0 ? 1 : 0,
    borderBottomColor: '#e2e8f0',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  sectionContent: {
    padding: 12,
  },
  taskCardContainer: {
    marginBottom: 12,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,235,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconCompleted: {
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  web3TaskIcon: {
    backgroundColor: 'rgba(147,51,234,0.1)',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  completedBadge: {
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  availabilityText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  completedText: {
    color: '#10b981',
  },
  reward: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  completedReward: {
    color: '#10b981',
  },
  web3Reward: {
    color: '#9333ea',
  },
  rewardUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
  },
  taskContent: {
    padding: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  completedDescription: {
    color: '#94a3b8',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(37,99,235,0.05)',
  },
  completedFooter: {
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  web3TaskFooter: {
    backgroundColor: 'rgba(147,51,234,0.05)',
  },
  startTask: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  completedStartTask: {
    color: '#10b981',
  },
  web3StartTask: {
    color: '#9333ea',
  },
});