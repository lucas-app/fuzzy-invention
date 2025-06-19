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
            backgroundColor: '#FFF9EC',
          },
          headerTintColor: '#FFB869',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFB869" />
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
          <Text style={styles.headerTitle}>Choose a Web3 Task</Text>
            <Text style={styles.headerSubtitle}>
              Complete web3 tasks to earn LUCAS tokens and learn about blockchain technology
            </Text>
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
              <View style={styles.accentBar} />
                <View style={styles.taskInfoContainer}>
                  <View style={styles.taskHeader}>
                  <Ionicons name="logo-bitcoin" size={22} color="#FFB869" style={{ marginRight: 8 }} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.rewardContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rewardText}>Earn crypto</Text>
                  </View>
                  <TouchableOpacity style={styles.actionButton}>
                    <LinearGradient
                      colors={['#FFD700', '#FFB869']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Text style={styles.actionButtonText}>Start</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: '#FFF9EC',
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB869',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A6A1C',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    textAlign: 'center',
  },
  taskCardOuter: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#FFB869',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 110,
  },
  accentBar: {
    width: 6,
    backgroundColor: '#FFB869',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  taskInfoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.10)',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rewardText: {
    marginLeft: 4,
    color: '#FFB869',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  actionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
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
