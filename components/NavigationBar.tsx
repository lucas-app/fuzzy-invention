import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const TABS = [
  { route: '/(tabs)/tasks', label: 'Tasks', icon: 'list' },
  { route: '/(tabs)/earnings', label: 'Earnings', icon: 'wallet' },
  { route: '/(tabs)/invest', label: 'Invest', icon: 'trending-up' },
  { route: '/(tabs)/community', label: 'Community', icon: 'people' },
  { route: '/(tabs)/profile', label: 'Profile', icon: 'person' },
];

function TabButton({ 
  route, 
  label, 
  icon, 
  isActive 
}: { 
  route: string;
  label: string;
  icon: string;
  isActive: boolean;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    if (isActive) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1.1, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      
      translateY.value = withSpring(-8, {
        damping: 12,
        stiffness: 100,
      });
      
      opacity.value = withTiming(1, {
        duration: 200,
      });
    } else {
      translateY.value = withSpring(0, { damping: 10, stiffness: 100 });
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0.8, {
        duration: 200,
      });
    }

    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  }, [isActive]);

  return (
    <Pressable
      onPress={() => router.push(route)}
      style={styles.tab}
      accessible={true}
      accessibilityRole="tab"
      accessibilityLabel={`${label} tab`}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {isActive && (
          <LinearGradient
            colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeBackground}
          />
        )}
        <View
          style={[
            styles.iconContainer,
            isActive && styles.activeIconContainer
          ]}
        >
          <Ionicons 
            name={isActive ? icon : `${icon}-outline`}
            size={isActive ? 26 : 24} 
            color={isActive ? '#00d4ff' : 'rgba(255,255,255,0.5)'}
            style={{
              opacity: isActive ? 1 : 0.8,
            }}
          />
        </View>
        <Text style={[
          styles.label,
          isActive && styles.activeLabel
        ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function NavigationBar() {
  const pathname = usePathname();
  
  // Don't render navigation bar on auth screens, onboarding, or initial screen
  if (pathname?.startsWith('/(auth)') || 
      pathname?.startsWith('/(onboarding)') || 
      pathname === '/') {
    return null;
  }

  const currentRoute = pathname?.replace(/\/index$/, '') || '/(tabs)/tasks';

  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TabButton
          key={tab.route}
          {...tab}
          isActive={currentRoute.startsWith(tab.route)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0a0a2a',
    borderTopColor: 'rgba(255,255,255,0.1)',
    height: 84,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 12,
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.9,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
    fontFamily: Platform.select({
      ios: '-apple-system',
      default: 'sans-serif',
    }),
  },
  activeLabel: {
    color: '#00d4ff',
  },
});