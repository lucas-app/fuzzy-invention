import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PressableScaleProps extends PressableProps {
  scaleAmount?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  scaleAmount = 0.95,
  style,
  contentContainerStyle,
  springConfig = { damping: 15, stiffness: 150 },
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleAmount, springConfig);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, springConfig);
    onPressOut?.(e);
  };

  return (
    <Pressable
      style={style}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View style={[animatedStyle, contentContainerStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default PressableScale;