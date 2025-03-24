import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface TaskFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  reward: number;
  onClose: () => void;
}

export default function TaskFeedback({ 
  isCorrect, 
  explanation, 
  reward,
  onClose 
}: TaskFeedbackProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const progress = useSharedValue(0);
  
  useEffect(() => {
    // Animate the feedback
    scale.value = withSequence(
      withTiming(1.05, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200 })
    );
    
    // Subtle pulse animation
    const pulseAnimation = () => {
      scale.value = withSequence(
        withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) })
      );
      
      // Start a new pulse after a short delay
      setTimeout(pulseAnimation, 1800);
    };
    
    // Start the pulse animation after initial entrance
    const pulseTimeout = setTimeout(pulseAnimation, 500);
    
    // If correct, start progress animation for auto-close
    if (isCorrect) {
      progress.value = withTiming(1, { duration: 3000 });
    }
    
    // Auto-close after delay
    const timer = setTimeout(onClose, 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimeout);
    };
  }, [onClose]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ]
  }));
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const iconBounceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withDelay(300, withSpring(1.2, { damping: 5 })) }
      ],
    };
  });

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutDown.springify().damping(15)}
      style={[
        styles.container,
        { backgroundColor: isCorrect ? '#10B981' : '#EF4444' },
        animatedStyle
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconBounceStyle]}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={36}
            color="#fff"
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </Text>
          <Text style={styles.explanation}>{explanation}</Text>
          {isCorrect && (
            <Animated.Text
              entering={FadeIn.delay(300).duration(500)}
              exiting={FadeOut}
              style={styles.reward}
            >
              +${reward.toFixed(2)} USDC
            </Animated.Text>
          )}
        </View>
      </View>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>
      
      {isCorrect && (
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[styles.progressBar, progressStyle]} 
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  reward: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});