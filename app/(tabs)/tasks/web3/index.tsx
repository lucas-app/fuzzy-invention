import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Dimensions 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { WEB3_TASKS } from '../../../../data/tasks';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

export default function Web3TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState(Object.values(WEB3_TASKS));

  // Navigation handler
  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  // Render category label based on task category
  const renderCategoryLabel = (category?: string) => {
    let color = '#6C5DD3'; // Default color
    
    switch(category) {
      case 'DeFi':
        color = '#00C4B4'; // Teal
        break;
      case 'NFTs':
        color = '#FF6A3D'; // Orange
        break;
      case 'DAO':
        color = '#5CDBF2'; // Blue
        break;
      case 'Education':
        color = '#F986E5'; // Purple
        break;
      case 'Community':
        color = '#FFB869'; // Light orange
        break;
    }
    
    return (
      <View style={[styles.categoryLabel, { backgroundColor: color }]}>
        <Text style={styles.categoryText}>{category || 'Web3'}</Text>
      </View>
    );
  };

  // Render difficulty indicator
  const renderDifficulty = (difficulty?: string) => {
    const dots = difficulty === 'easy' ? 1 : 
                difficulty === 'medium' ? 2 : 
                difficulty === 'advanced' ? 3 : 1;
    
    return (
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>Difficulty: </Text>
        <View style={styles.dotsContainer}>
          {Array(3).fill(0).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.difficultyDot, 
                { backgroundColor: i < dots ? '#6C5DD3' : '#E0E0E0' }
              ]} 
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Web3 Tasks',
          headerStyle: {
            backgroundColor: '#6C5DD3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.headerContainer}
        >
          <LinearGradient
            colors={['rgba(108, 93, 211, 0.1)', 'rgba(71, 49, 211, 0.05)']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>Choose a Task</Text>
            <Text style={styles.headerSubtitle}>
              Complete web3 tasks to earn LUCAS tokens and learn about blockchain technology
            </Text>
          </LinearGradient>
        </Animated.View>

        {tasks.map((task, index) => (
          <Animated.View
            key={task.id}
            entering={FadeInDown.delay(index * 100).duration(500)}
            style={styles.taskCardOuter}
          >
            <TouchableOpacity
              style={styles.taskCard}
              onPress={() => handleTaskPress(task.id)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6C5DD3', '#4731D3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.taskCardGradient}
              >
                {/* Card inner shadow */}
                <View style={styles.cardInnerHighlight} />
                
                {/* Task details */}
                <View style={styles.taskInfoContainer}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {renderCategoryLabel(task.category)}
                  </View>
                  
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  
                  <View style={styles.taskFooter}>
                    <View style={styles.rewardContainer}>
                      <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
                      <Text style={styles.rewardText}>{task.reward}</Text>
                    </View>
                    
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={16} color="#fff" />
                      <Text style={styles.timeText}>{task.estimatedTime}</Text>
                    </View>
                  </View>
                  
                  {renderDifficulty(task.difficulty)}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    // Neumorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 16,
    // Inner highlight border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4731D3',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskCardOuter: {
    marginBottom: 16,
    borderRadius: 16,
    // Neumorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  taskCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskCardGradient: {
    borderRadius: 16,
    padding: 16,
    // Inner highlight border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    // Bottom border for depth
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardInnerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    opacity: 0.7,
  },
  taskInfoContainer: {
    position: 'relative',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Text shadow for depth
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    // Inner highlight
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    // Inner highlight
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rewardText: {
    marginLeft: 4,
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    color: '#fff',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: '#fff',
  },
});
