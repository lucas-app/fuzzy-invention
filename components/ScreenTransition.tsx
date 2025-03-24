import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  children: React.ReactNode;
  entering?: 'fade' | 'slide' | 'zoom' | 'none';
  exiting?: 'fade' | 'slide' | 'zoom' | 'none';
  duration?: number;
  delay?: number;
  style?: any;
  onEntered?: () => void;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  entering = 'fade',
  exiting = 'fade',
  duration = 300,
  delay = 0,
  style,
  onEntered,
}) => {
  const opacity = useSharedValue(entering === 'none' ? 1 : 0);
  const translateY = useSharedValue(entering === 'slide' ? 50 : 0);
  const scale = useSharedValue(entering === 'zoom' ? 0.9 : 1);

  React.useEffect(() => {
    // Entering animation
    if (entering === 'fade' || entering === 'slide' || entering === 'zoom') {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) }, () => {
          if (onEntered) {
            runOnJS(onEntered)();
          }
        })
      );
    }

    if (entering === 'slide') {
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
      );
    }

    if (entering === 'zoom') {
      scale.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );
    }

    // Cleanup function for unmounting (exiting animation)
    return () => {
      if (exiting === 'fade') {
        opacity.value = withTiming(0, { duration: duration * 0.8 });
      }

      if (exiting === 'slide') {
        translateY.value = withTiming(30, { duration: duration * 0.8 });
        opacity.value = withTiming(0, { duration: duration * 0.8 });
      }

      if (exiting === 'zoom') {
        scale.value = withTiming(0.95, { duration: duration * 0.8 });
        opacity.value = withTiming(0, { duration: duration * 0.8 });
      }
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition;