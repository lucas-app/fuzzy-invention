import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Platform,
  Dimensions,
  GestureResponderEvent,
  ViewStyle,
  TextStyle
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
  badgeText?: 'NEW' | 'HOT' | 'QUICK' | 'PREMIUM' | 'TRENDING' | 'SPECIAL';
  iconName: 'camera' | 'mic' | 'chatbubble-ellipses' | 'star' | 'logo-bitcoin' | 'gift' | string;
  reward: string;
  gradientStart: string;
  gradientEnd: string;
  badgeColor: string;
  showProgress?: boolean;
  progressPercent?: number;
  description?: string;
  estimatedTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
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
  estimatedTime = '5-10 min',
  difficulty = 'Easy',
  onPress
}) => {
  // Animation values for pressed state
  const pressed = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);
  
  // Scale and shadow animation when pressed
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, 0.97], Extrapolate.CLAMP) },
        { translateY: interpolate(pressed.value, [0, 1], [0, 2], Extrapolate.CLAMP) }
      ],
      shadowOpacity: interpolate(pressed.value, [0, 1], [0.25, 0.15], Extrapolate.CLAMP),
    };
  });
  
  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 12, stiffness: 120 });
    setIsPressed(true);
  };
  
  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 12, stiffness: 120 });
    setIsPressed(false);
  };

  // Get badge background color based on type
  const getBadgeBackgroundColor = (type?: string): string => {
    switch(type) {
      case 'NEW':
        return 'rgba(55, 210, 160, 0.9)';
      case 'HOT':
        return 'rgba(255, 126, 88, 0.9)';
      case 'QUICK':
        return 'rgba(255, 217, 61, 0.9)';
      case 'PREMIUM':
        return 'rgba(249, 134, 229, 0.9)';
      case 'TRENDING':
        return 'rgba(255, 184, 105, 0.9)';
      case 'SPECIAL':
        return 'rgba(108, 93, 211, 0.9)';
      default:
        return 'rgba(255,255,255,0.2)';
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
      <Animated.View 
        entering={FadeIn.duration(600)}
        style={[styles.cardShadowContainer, animatedStyle]}
      >
        {/* Main card with gradient */}
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Top highlight for depth */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            style={styles.topHighlight}
          />

          {/* Badge */}
          {badgeText && (
            <View style={[styles.badgeContainer, { backgroundColor: getBadgeBackgroundColor(badgeText) }]}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.iconBackground}
            >
              {iconName === 'camera' ? (
                <Ionicons name="camera-outline" size={24} color="rgba(255,255,255,0.9)" />
              ) : iconName === 'mic' ? (
                <Ionicons name="mic-outline" size={24} color="rgba(255,255,255,0.9)" />
              ) : iconName === 'chatbubble-ellipses' ? (
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="rgba(255,255,255,0.9)" />
              ) : iconName === 'star' ? (
                <Ionicons name="star-outline" size={24} color="rgba(255,255,255,0.9)" />
              ) : iconName === 'logo-bitcoin' ? (
                <Ionicons name="logo-bitcoin" size={24} color="rgba(255,255,255,0.9)" />
              ) : iconName === 'gift' ? (
                <Ionicons name="gift-outline" size={24} color="rgba(255,255,255,0.9)" />
              ) : (
                <Ionicons name={iconName as any} size={24} color="rgba(255,255,255,0.9)" />
              )}
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.titleText}>{title}</Text>
            {description && (
              <Text style={styles.descriptionText}>{description}</Text>
            )}
            {/* Info row */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={[styles.difficultyDot, {
                  backgroundColor: difficulty === 'Easy' ? '#4CAF50' : 
                                 difficulty === 'Medium' ? '#FFC107' : '#FF5722'
                }]} />
                <Text style={styles.infoText}>{difficulty}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>{estimatedTime}</Text>
              </View>
            </View>

            {/* Reward */}
            <View style={styles.rewardContainer}>
              <FontAwesome5 name="coins" size={14} color="rgba(255,215,0,0.9)" />
              <Text style={styles.rewardText}>{reward}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: cardWidth * 1.2,
    marginBottom: 16,
    borderRadius: 24,
  },
  cardShadowContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  iconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  descriptionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
});

export default TaskCard;
