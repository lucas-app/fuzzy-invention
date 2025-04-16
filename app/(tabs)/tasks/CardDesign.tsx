import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Platform,
  Dimensions,
  GestureResponderEvent
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

// Define the props interface for our TaskCard component
interface TaskCardProps {
  title: string;
  badgeText?: string;
  iconName: 'image' | 'audio' | 'checkmark-circle' | 'chatbubble-ellipses' | string;
  reward: string;
  gradientStart: string;
  gradientEnd: string;
  badgeColor: string;
  showProgress?: boolean;
  progressPercent?: number;
  description?: string;
  onPress: (event: GestureResponderEvent) => void;
}

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

// Custom card component with premium neumorphic styling
const TaskCard: React.FC<TaskCardProps> = ({ 
  title, 
  badgeText, 
  iconName,  
  reward,
  gradientStart, 
  gradientEnd,
  badgeColor,
  showProgress = false,
  progressPercent = 40,
  description,
  onPress
}) => {
  // Animation values for pressed state
  const pressed = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);
  
  // Scale and shadow animation when pressed
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, 0.98], Extrapolate.CLAMP) },
        { translateY: interpolate(pressed.value, [0, 1], [0, 2], Extrapolate.CLAMP) }
      ],
      shadowOpacity: interpolate(pressed.value, [0, 1], [0.25, 0.15], Extrapolate.CLAMP),
    };
  });
  
  // Handle press in/out
  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 12, stiffness: 120 });
    setIsPressed(true);
  };
  
  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 12, stiffness: 120 });
    setIsPressed(false);
  };
  // Generate perfectly positioned glowing dots for enhanced depth
  const generateGlowDots = () => {
    return Array(3).fill(0).map((_, i) => (
      <View 
        key={i}
        style={{
          position: 'absolute',
          width: 4 + Math.random() * 3,
          height: 4 + Math.random() * 3,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.5)',
          top: Math.random() * cardWidth,
          right: 10 + Math.random() * (cardWidth - 20),
          opacity: 0.1 + Math.random() * 0.3,
        }}
      />
    ));
  };

  // Custom icon based on task type
  const renderIcon = () => {
    if (iconName === 'image') {
      return (
        <View style={styles.imageIconContainer}>
          <View style={styles.imageIconOutline} />
          <View style={styles.imageIconDot} />
          <View style={styles.imageIconMountain} />
        </View>
      );
    } else if (iconName === 'audio') {
      return (
        <View style={styles.audioIconContainer}>
          <View style={[styles.audioBar, { height: 12 }]} />
          <View style={[styles.audioBar, { height: 18 }]} />
          <View style={[styles.audioBar, { height: 14 }]} />
          <View style={[styles.audioBar, { height: 8 }]} />
        </View>
      );
    } else if (iconName === 'checkmark-circle') {
      return <Ionicons name="checkmark-circle-outline" size={28} color="rgba(255,255,255,0.9)" />;
    } else {
      return <Ionicons name="chatbubble-ellipses-outline" size={28} color="rgba(255,255,255,0.9)" />;
    }
  };

  return (
    <Pressable 
      style={styles.cardContainer}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
    >
      {/* Outer shadow container with press animation */}
      <Animated.View 
        entering={FadeIn.duration(600)}
        style={[styles.cardShadowContainer, animatedStyle]}
      >
        {/* Main card with gradient */}
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.cardGradient}
        >
          {/* Inner highlight effects */}
          <View style={styles.innerHighlightTop} />
          <View style={styles.innerHighlightLeft} />
          
          {/* Subtle glow dots for enhanced depth */}
          {generateGlowDots()}
          
          {/* Badge */}
          {badgeText && (
            <View style={[styles.badgeContainer, { backgroundColor: badgeColor }]}>
              <View style={styles.badgeHighlight} />
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}
          
          {/* Icon container with inner shadow */}
          <View style={styles.iconContainer}>
            <View style={styles.iconInnerShadow} />
            {renderIcon()}
          </View>
          
          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>
          
          {/* Progress bar or description */}
          {showProgress ? (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{description}</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground} />
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                <View style={styles.progressBarHighlight} />
              </View>
            </View>
          ) : (
            <View style={styles.rewardContainer}>
              <View style={styles.rewardHighlight} />
              <FontAwesome5 name="coins" size={16} color="rgba(255, 215, 0, 0.9)" />
              <Text style={styles.rewardText}>{reward}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Card Container with 3D effect
  pressEffect: {
    transform: [{ scale: 0.98 }, { translateY: 2 }],
    shadowOpacity: 0.15,
  },
  cardContainer: {
    width: cardWidth,
    height: cardWidth * 1.1,
    marginBottom: 16,
  },
  cardShadowContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    // Perfect neumorphic shadow system
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    // Subtle light shadow on top left 
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    // Enhanced 3D border system
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    // Adds depth with semi-transparent bottom border
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  innerHighlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    opacity: 0.7,
  },
  innerHighlightLeft: {
    position: 'absolute',
    top: 30,
    left: 0,
    width: 30,
    bottom: 30,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0.6,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
    // Premium badge shadow system
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
    // Enhanced tactile border with bottom depth
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  badgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    // Subtle inner shadow for depth
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Text shadow
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    // Premium icon container styling
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    // Bottom shadow for 3D button effect
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    // Inner shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0, 
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    // Text shadow
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressText: {
    fontSize: 13,
    color: '#FFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    position: 'relative',
    // Premium progress bar styling
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Inner shadow for inset effect
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    // Subtle shine effect
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  progressBarHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '50%',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  rewardContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 8,
    paddingLeft: 10,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    // Premium reward container styling
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
    // Bottom shadow for tactile feel
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    // Shadow for popping effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  // Custom image icon
  imageIconContainer: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  imageIconOutline: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
  },
  imageIconDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  imageIconMountain: {
    position: 'absolute',
    bottom: 6,
    left: 5,
    right: 5,
    height: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    transform: [{ rotate: '180deg' }],
  },
  // Custom audio icon
  audioIconContainer: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  audioBar: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
    margin: 1,
  },
});

export default TaskCard;
