import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Image, Pressable, Platform, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing,
  FadeIn,
  FadeOut 
} from 'react-native-reanimated';
import { BoundingBox, ObjectDetection } from '../types/tasks';

interface BoundingBoxEditorProps {
  imageUrl: string;
  objectType: string;
  onBoxDrawn: (box: ObjectDetection) => void;
  multipleBoxes?: boolean;
  existingBoxes?: ObjectDetection[];
  onReset?: () => void;
}

export default function BoundingBoxEditor({
  imageUrl,
  objectType,
  onBoxDrawn,
  multipleBoxes = false,
  existingBoxes = [],
  onReset,
}: BoundingBoxEditorProps) {
  const [boxes, setBoxes] = useState<ObjectDetection[]>(existingBoxes);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [touchActive, setTouchActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const containerRef = useRef<View>(null);
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Animation values
  const tutorialOpacity = useSharedValue(1);
  const boxScaleAnim = useSharedValue(1);
  const boxOpacityAnim = useSharedValue(1);

  useEffect(() => {
    // Cross-platform image loading using Image.getSize
    const loadImage = () => {
      setIsLoading(true);
      setLoadError(null);

      Image.getSize(
        imageUrl,
        (width, height) => {
          setImageSize({ width, height });
          setIsLoading(false);
        },
        (error) => {
          console.error('Error loading image:', error);
          setLoadError('Failed to load image');
          setIsLoading(false);
        }
      );
    };

    loadImage();

    // Hide tutorial after delay
    const timer = setTimeout(() => {
      tutorialOpacity.value = withTiming(0, { duration: 1000 });
      setShowTutorial(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [imageUrl]);

  const handleLayout = useCallback((event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setContainerLayout({ x, y, width, height });
  }, []);

  const normalizeCoordinates = (x: number, y: number): { x: number, y: number } => {
    if (containerLayout.width === 0 || containerLayout.height === 0) return { x: 0, y: 0 };
    const normalizedX = Math.max(0, Math.min(1, x / containerLayout.width));
    const normalizedY = Math.max(0, Math.min(1, y / containerLayout.height));
    return { x: normalizedX, y: normalizedY };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isLoading && !loadError,
    onMoveShouldSetPanResponder: () => !isLoading && !loadError,
    onPanResponderGrant: (evt) => {
      setTouchActive(true);
      const { locationX, locationY } = evt.nativeEvent;
      const { x, y } = normalizeCoordinates(locationX, locationY);
      setCurrentBox({ x, y, width: 0, height: 0 });
      
      if (showTutorial) {
        tutorialOpacity.value = withTiming(0, { duration: 300 });
        setShowTutorial(false);
      }
    },
    onPanResponderMove: (evt) => {
      if (!currentBox || !touchActive) return;

      const { locationX, locationY } = evt.nativeEvent;
      const { x: endX, y: endY } = normalizeCoordinates(locationX, locationY);
      
      const width = Math.abs(endX - currentBox.x);
      const height = Math.abs(endY - currentBox.y);
      const x = Math.min(endX, currentBox.x);
      const y = Math.min(endY, currentBox.y);

      setCurrentBox({ x, y, width, height });
    },
    onPanResponderRelease: () => {
      setTouchActive(false);
      if (!currentBox) return;

      // Minimum size threshold
      const MIN_SIZE = 0.05;
      if (currentBox.width > MIN_SIZE && currentBox.height > MIN_SIZE) {
        const newBox: ObjectDetection = {
          type: objectType,
          position: currentBox,
        };

        if (multipleBoxes) {
          const updatedBoxes = [...boxes, newBox];
          setBoxes(updatedBoxes);
          
          boxScaleAnim.value = withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1)
          );
          
          if (updatedBoxes.length === 2) {
            onBoxDrawn(newBox);
          }
        } else {
          setBoxes([newBox]);
          boxScaleAnim.value = withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1)
          );
          onBoxDrawn(newBox);
        }
      }
      setCurrentBox(null);
    },
    onPanResponderTerminate: () => {
      setTouchActive(false);
      setCurrentBox(null);
    },
  });

  const handleReset = () => {
    boxOpacityAnim.value = withTiming(0, { duration: 300 }, () => {
      setBoxes([]);
      setCurrentBox(null);
      boxOpacityAnim.value = withTiming(1, { duration: 300 });
      onReset?.();
    });
  };

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boxScaleAnim.value }],
    opacity: boxOpacityAnim.value,
  }));

  const imageAspectRatio = imageSize.width > 0 ? imageSize.height / imageSize.width : 1;

  return (
    <View style={styles.container}>
      <View 
        ref={containerRef}
        onLayout={handleLayout}
        style={[
          styles.imageContainer,
          { aspectRatio: 1 / imageAspectRatio }
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
        
        {boxes.map((box, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.box,
              {
                left: `${box.position.x * 100}%`,
                top: `${box.position.y * 100}%`,
                width: `${box.position.width * 100}%`,
                height: `${box.position.height * 100}%`,
              },
              index === boxes.length - 1 ? boxAnimatedStyle : null
            ]}
          >
            <View style={styles.boxLabel}>
              <Text style={styles.boxLabelText}>{objectType}</Text>
            </View>
          </Animated.View>
        ))}
        
        {currentBox && touchActive && (
          <View style={[
            styles.currentBox,
            {
              left: `${currentBox.x * 100}%`,
              top: `${currentBox.y * 100}%`,
              width: `${currentBox.width * 100}%`,
              height: `${currentBox.height * 100}%`,
            }
          ]} />
        )}

        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#22D3EE" />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        )}

        {loadError && (
          <View style={styles.overlay}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable 
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                setLoadError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {showTutorial && (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.tutorial, { opacity: tutorialOpacity }]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tutorialContent}>
              <Ionicons name="finger-print" size={48} color="#22D3EE" />
              <Text style={styles.tutorialTitle}>
                Draw a box around {multipleBoxes ? "each" : "the"} {objectType}
              </Text>
              <Text style={styles.tutorialText}>
                Touch and drag to create a bounding box
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.controls}>
        {boxes.length > 0 && (
          <View style={styles.boxCountContainer}>
            <Text style={styles.boxCountText}>
              {boxes.length} {boxes.length === 1 ? 'box' : 'boxes'} drawn
              {multipleBoxes && ` (${Math.max(0, 2 - boxes.length)} remaining)`}
            </Text>
          </View>
        )}

        <View style={styles.buttons}>
          <Pressable 
            style={[styles.button, styles.resetButton]} 
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={20} color="#ef4444" />
            <Text style={[styles.buttonText, styles.resetButtonText]}>
              Reset
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  currentBox: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  boxLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    backgroundColor: '#22D3EE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  boxLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tutorial: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContent: {
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  tutorialText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  boxCountContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  boxCountText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#fee2e2',
  },
  resetButtonText: {
    color: '#ef4444',
  },
});