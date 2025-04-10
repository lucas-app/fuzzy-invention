import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { WEB3_TASKS } from '../../../data/tasks';
import { useTaskStore } from '../../../store/taskStore';

// Task types that connect to Label Studio API
type TaskType = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  projectType: string;
  reward: string;
  tasks?: any[];
};

const TASK_TYPES: TaskType[] = [
  {
    id: 'image',
    title: 'Image Classification',
    description: 'Help train AI models by classifying images',
    icon: 'image' as const,
    color: '#3b82f6',
    projectType: 'IMAGE_CLASSIFICATION',
    reward: '5-15 LUCAS',
  },
  {
    id: 'text',
    title: 'Text Analysis',
    description: 'Analyze text sentiment to improve services',
    icon: 'document-text' as const,
    color: '#10b981',
    projectType: 'TEXT_SENTIMENT',
    reward: '3-10 LUCAS',
  },
  {
    id: 'audio',
    title: 'Audio Classification',
    description: 'Classify sounds and audio recordings',
    icon: 'musical-notes' as const,
    color: '#f59e0b',
    projectType: 'AUDIO_CLASSIFICATION',
    reward: '5-12 LUCAS',
  },
  {
    id: 'survey',
    title: 'Survey Tasks',
    description: 'Answer questions and provide feedback',
    icon: 'clipboard' as const,
    color: '#8b5cf6',
    projectType: 'SURVEY',
    reward: '2-8 LUCAS',
  },
  {
    id: 'geospatial',
    title: 'Geospatial Labeling',
    description: 'Identify features in satellite imagery',
    icon: 'globe' as const,
    color: '#ec4899',
    projectType: 'GEOSPATIAL_LABELING',
    reward: '6-18 LUCAS',
  },
  {
    id: 'web3',
    title: 'Web3 Tasks',
    description: 'Participate in blockchain and crypto tasks',
    icon: 'logo-bitcoin' as const,
    color: '#6366f1',
    projectType: 'WEB3',
    reward: '10-30 LUCAS',
    tasks: Object.values(WEB3_TASKS),
  },
];

function TaskTypeCard({ taskType, index }: { 
  taskType: TaskType; 
  index: number;
}) {
  const handlePress = () => {
    if (taskType.id === 'web3') {
      // For Web3 tasks, use the existing navigation
      router.push(`/tasks/${taskType.id}`);
    } else {
      // For Label Studio tasks, navigate to the task screen with the project type
      router.push({
        pathname: '/labelstudio',
        params: { projectType: taskType.projectType }
      });
    }
  };
  
  const handleFixGeospatial = (e: any) => {
    e.stopPropagation();
    router.push({
      pathname: '/labelstudio',
      params: { projectType: 'FIX_GEOSPATIAL' }
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={styles.taskTypeCardContainer}
    >
      <Pressable
        style={styles.taskTypeCard}
        onPress={handlePress}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <LinearGradient
          colors={[`${taskType.color}15`, `${taskType.color}10`]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={[styles.taskTypeIconContainer, { backgroundColor: `${taskType.color}15` }]}>
          <Ionicons 
            name={taskType.icon as any} 
            size={32} 
            color={taskType.color} 
          />
        </View>
        
        <Text style={styles.taskTypeTitle}>{taskType.title}</Text>
        
        <Text style={styles.taskTypeDescription} numberOfLines={2}>
          {taskType.description}
        </Text>
        
        <View style={styles.taskTypeFooter}>
          <Text style={[styles.taskTypeReward, { color: taskType.color }]}>
            {taskType.reward}
          </Text>
          
          {taskType.id === 'geospatial' ? (
            <View style={styles.buttonGroup}>
              <Pressable 
                onPress={handleFixGeospatial}
                style={[styles.fixButton, { backgroundColor: '#ef4444' }]}
              >
                <Text style={styles.fixButtonText}>Fix</Text>
              </Pressable>
              <View style={[styles.startButton, { backgroundColor: `${taskType.color}15` }]}>
                <Text style={[styles.startButtonText, { color: taskType.color }]}>Start</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.startButton, { backgroundColor: `${taskType.color}15` }]}>
              <Text style={[styles.startButtonText, { color: taskType.color }]}>Start</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// This component is no longer used with the new grid layout
/* function TaskSection({ section, isExpanded, onToggle, completedTasks }: { 
  section: any;
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
*/

export default function TasksScreen() {
  const { completedTasks, fetchUserStats } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

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
        colors={['#0f172a', '#1e293b']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="layers-outline"
              size={32}
              color="#ffffff"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>LUCAS Tasks</Text>
            <Text style={styles.subtitle}>Earn rewards by completing tasks</Text>
          </View>
        </View>
        
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.hotTaskBadge}>
              <Text style={styles.hotTaskText}>HOT</Text>
            </View>
            <Text style={styles.statLabel}>New Tasks</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.taskGrid}>
            {TASK_TYPES.map((taskType, index) => (
              <TaskTypeCard 
                key={taskType.id}
                taskType={taskType}
                index={index}
              />
            ))}
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskTypeCardContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskTypeCard: {
    padding: 16,
    height: 200,
    justifyContent: 'space-between',
  },
  taskTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  taskTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
    flexGrow: 1,
  },
  taskTypeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTypeReward: {
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  fixButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  hotTaskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    marginBottom: 4,
  },
  hotTaskText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bottomPadding: {
    height: 100,
  },
});