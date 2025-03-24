import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  useSharedValue,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface RewardParticle {
  id: number;
  x: number;
  y: number;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  rotate: Animated.SharedValue<number>;
}

interface RewardAnimationProps {
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export default function RewardAnimation({ amount, x, y, onComplete }: RewardAnimationProps) {
  // Main reward animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(0);
  
  // Star animation values
  const starScale = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  
  // Checkmark animation values
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  
  // Confetti animation
  const confettiOpacity = useSharedValue(0);
  
  // Create particles
  const particles: RewardParticle[] = Array.from({ length: 12 }).map((_, index) => ({
    id: index,
    x: x + (Math.random() * 140 - 70),
    y: y + (Math.random() * 60 - 30),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    translateY: useSharedValue(0),
    rotate: useSharedValue(0),
  }));

  useEffect(() => {
    // Main reward animation
    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.25, { damping: 8, stiffness: 90 }),
      withDelay(1000, withTiming(0.9, { duration: 300 })),
      withDelay(500, withTiming(0, { duration: 300 }))
    );
    
    opacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0, { duration: 500 }))
    );
    
    rotate.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(8, { duration: 120 }),
      withTiming(-8, { duration: 150 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    glow.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(0.5, { duration: 300 }),
      withTiming(0.8, { duration: 200 }),
      withTiming(0, { duration: 700, easing: Easing.in(Easing.cubic) })
    );
    
    // Star animation
    starScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(200, withSpring(1.5, { damping: 6 })),
      withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })
    );
    
    starOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(200, withTiming(1, { duration: 100 })),
      withDelay(700, withTiming(0, { duration: 300 }))
    );
    
    // Checkmark animation
    checkmarkScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(300, withSpring(1.2, { damping: 8 })),
      withDelay(800, withTiming(0, { duration: 300 }))
    );
    
    checkmarkOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(300, withTiming(1, { duration: 200 })),
      withDelay(800, withTiming(0, { duration: 300 }))
    );
    
    // Confetti animation
    confettiOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 200 }),
      withDelay(1800, withTiming(0, { duration: 400 }))
    );

    // Animate particles
    particles.forEach((particle, index) => {
      const delay = index * 40;

      particle.scale.value = withSequence(
        withDelay(
          delay,
          withSpring(1, { damping: 5, stiffness: 100 })
        ),
        withDelay(800, withTiming(0, { duration: 300 }))
      );

      particle.opacity.value = withSequence(
        withDelay(
          delay,
          withTiming(1, { duration: 200 })
        ),
        withDelay(800, withTiming(0, { duration: 300 }))
      );

      particle.translateY.value = withSequence(
        withDelay(
          delay,
          withSpring(-200 - Math.random() * 100, { damping: 12, stiffness: 60 })
        )
      );

      particle.rotate.value = withSequence(
        withDelay(
          delay,
          withSpring(Math.random() * 360, { damping: 10, stiffness: 50 })
        )
      );
    });

    const timeout = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }));
  
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    shadowOpacity: glow.value * 0.8,
  }));
  
  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
    opacity: starOpacity.value,
  }));
  
  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkOpacity.value,
  }));
  
  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {/* Confetti background effect */}
      <Animated.View style={[styles.confettiContainer, confettiStyle]}>
        {Array.from({ length: 30 }).map((_, index) => (
          <View 
            key={`confetti-${index}`}
            style={[
              styles.confetti,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#22D3EE', '#2DD4BF', '#FFD700', '#10B981', '#3B82F6'][Math.floor(Math.random() * 5)],
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              }
            ]}
          />
        ))}
      </Animated.View>
      
      {/* Main reward */}
      <Animated.View
        style={[
          styles.rewardContainer,
          { top: y, left: x },
          animatedStyle,
        ]}
      >
        <Animated.View style={[styles.glowEffect, glowStyle]} />
        <LinearGradient
          colors={['#22D3EE', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rewardGradient}
        >
          <Text style={styles.rewardText}>+${amount.toFixed(2)}</Text>
        </LinearGradient>
      </Animated.View>
      
      {/* Stars behind the reward */}
      <Animated.View
        style={[
          styles.starContainer,
          { top: y - 50, left: x - 70 },
          starAnimatedStyle,
        ]}
      >
        <Ionicons name="star" size={50} color="#FFD700" />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.starContainer,
          { top: y - 30, left: x + 70 },
          starAnimatedStyle,
        ]}
      >
        <Ionicons name="star" size={40} color="#FFD700" />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.starContainer,
          { top: y + 60, left: x - 40 },
          starAnimatedStyle,
        ]}
      >
        <Ionicons name="star" size={30} color="#FFD700" />
      </Animated.View>
      
      {/* Checkmark */}
      <Animated.View
        style={[
          styles.checkmarkContainer,
          { top: y + 40, left: x },
          checkmarkAnimatedStyle,
        ]}
      >
        <View style={styles.checkmarkBg}>
          <Ionicons name="checkmark" size={32} color="#fff" />
        </View>
      </Animated.View>

      {/* Particles */}
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
            },
            useAnimatedStyle(() => ({
              transform: [
                { scale: particle.scale.value },
                { translateY: particle.translateY.value },
                { rotate: `${particle.rotate.value}deg` },
              ],
              opacity: particle.opacity.value,
            })),
          ]}
        >
          {particle.id % 4 === 0 ? (
            <Ionicons name="star" size={16} color="#FFD700" />
          ) : particle.id % 4 === 1 ? (
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.particleCoin}
            >
              <Text style={styles.particleText}>$</Text>
            </LinearGradient>
          ) : particle.id % 4 === 2 ? (
            <View style={[styles.particleCircle, { backgroundColor: '#10B981' }]} />
          ) : (
            <View style={[styles.particleCircle, { backgroundColor: '#3B82F6' }]} />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  rewardContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    marginLeft: -60,
    marginTop: -60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34,211,238,0.2)',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    top: -10,
    left: -10,
  },
  rewardGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rewardText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    marginLeft: -25,
    marginTop: -25,
  },
  checkmarkContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
  },
  particleCoin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  particleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  particleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
});