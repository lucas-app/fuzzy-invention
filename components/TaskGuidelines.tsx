import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface TaskGuidelinesProps {
  guidelines: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export default function TaskGuidelines({
  guidelines,
  difficulty,
  estimatedTime,
}: TaskGuidelinesProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
    }
  };

  return (
    <Animated.View
      entering={FadeIn.delay(300)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: `${getDifficultyColor()}15` }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: getDifficultyColor() }
          ]}>
            {difficulty.toUpperCase()}
          </Text>
        </View>
        <View style={styles.timeEstimate}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.timeText}>{estimatedTime}</Text>
        </View>
      </View>

      <Text style={styles.title}>Instructions:</Text>
      {guidelines.map((guideline, index) => (
        <View key={index} style={styles.guidelineItem}>
          <Ionicons name="checkmark-circle" size={20} color="#2563EB" style={styles.guidelineIcon} />
          <Text style={styles.guidelineText}>{guideline}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  guidelineIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  guidelineText: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
    lineHeight: 22,
  },
});