import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const slides = [
  {
    id: 1,
    title: 'Welcome to LUCAS',
    description: 'Earn crypto by completing simple tasks anytime, anywhere.',
  },
  {
    id: 2,
    title: 'How It Works',
    steps: [
      {
        icon: 'list',
        title: 'Pick a Task',
        description: 'Choose easy tasks like data labeling or surveys.',
      },
      {
        icon: 'checkmark-circle',
        title: 'Complete & Submit',
        description: 'Finish the task and submit it in seconds.',
      },
      {
        icon: 'cash',
        title: 'Get Paid in Crypto',
        description: 'Earn USDT directly to your wallet.',
      },
    ],
  },
  {
    id: 3,
    title: "Let's Get Started!",
    description: "You're all set! Start completing tasks and earning crypto now.",
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      slideRef.current?.scrollTo({
        x: (activeSlide + 1) * width,
        animated: true,
      });
      setActiveSlide(activeSlide + 1);
    } else {
      router.replace('/(tabs)/tasks');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={slideRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveSlide(newIndex);
        }}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {index === 0 && (
              <LinearGradient
                colors={['#020733', '#041454']}
                style={styles.gradientSlide}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: 'https://i.ibb.co/rnTcSMX/LUCAS-bluegreen-gradient-logo-and-white-text-on-dark-background-RGB-V-01.png' }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.description}>{slide.description}</Text>
                <View style={styles.illustration}>
                  <Ionicons name="phone-portrait" size={120} color="#22D3EE" />
                  <View style={styles.floatingCoins}>
                    {[...Array(3)].map((_, i) => (
                      <View key={i} style={[styles.coin, styles[`coin${i + 1}`]]}>
                        <Ionicons name="logo-usd" size={24} color="#2DD4BF" />
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            )}
            
            {index === 1 && (
              <View style={styles.whiteSlide}>
                <Text style={[styles.title, styles.darkTitle]}>{slide.title}</Text>
                <View style={styles.stepsContainer}>
                  {slide.steps.map((step, i) => (
                    <View key={i} style={styles.step}>
                      <View style={styles.stepIcon}>
                        <Ionicons name={step.icon} size={32} color="#22D3EE" />
                      </View>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  ))}
                </View>
                <LinearGradient
                  colors={['rgba(34,211,238,0.1)', 'rgba(45,212,191,0.1)']}
                  style={styles.wave}
                />
              </View>
            )}
            
            {index === 2 && (
              <LinearGradient
                colors={['#020733', '#041454']}
                style={styles.gradientSlide}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: 'https://i.ibb.co/rnTcSMX/LUCAS-bluegreen-gradient-logo-and-white-text-on-dark-background-RGB-V-01.png' }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
                <Link href="/learn" style={styles.learnLink}>
                  <Text style={styles.learnLinkText}>Learn More</Text>
                </Link>
              </LinearGradient>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                i === activeSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext}>
          <LinearGradient
            colors={['#22D3EE', '#2DD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {activeSlide === slides.length - 1 ? 'Go to Dashboard' : 'Next'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020733',
  },
  slide: {
    flex: 1,
  },
  gradientSlide: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  whiteSlide: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 240,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  darkTitle: {
    color: '#020733',
  },
  description: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  illustration: {
    position: 'relative',
    marginTop: 20,
  },
  floatingCoins: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  coin: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,211,238,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin1: {
    top: '20%',
    right: -20,
  },
  coin2: {
    top: '40%',
    left: -20,
  },
  coin3: {
    bottom: '30%',
    right: -30,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34,211,238,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    backgroundColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#22D3EE',
    width: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  learnLink: {
    marginTop: 24,
  },
  learnLinkText: {
    fontSize: 16,
    color: '#22D3EE',
    textDecorationLine: 'underline',
  },
});