import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

interface TaskProgressProps {
  current: number;
  total: number;
  earnings: number;
}

export default function TaskProgress({ current, total, earnings }: TaskProgressProps) {
  const progress = current / total;
  const progressWidth = useSharedValue(progress);
  const scale = useSharedValue(1);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    transform: [{ scale: scale.value }],
  }));

  // Animate progress bar when props change
  if (progressWidth.value !== progress) {
    progressWidth.value = withTiming(progress, { duration: 1000 });
    scale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Progress</Text>
        <Text style={styles.earnings}>
          ${earnings.toFixed(2)} <Text style={styles.earningsLabel}>earned</Text>
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]}>
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.progressText}>
          {current} of {total} tasks completed ({Math.round(progress * 100)}%)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
  },
  earnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
});