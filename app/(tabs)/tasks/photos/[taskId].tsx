import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_GRADIENT = ['#37D2A0', '#10B386'] as const;
const CATEGORY_COLOR = '#10B386';

// Local copy of tasks for demo
const PHOTO_TASKS = [
  {
    id: '1',
    emoji: '📸',
    title: 'Storefront Snapshot',
    description: 'Take a clear photo of a local shop\'s front sign',
    reward: '$0.25 - $1.00',
    estimatedTime: '~2 min',
    distance: '0.3 km',
    instructions: 'Stand in front of the shop, make sure the sign is visible and readable. Avoid reflections and obstructions.'
  },
  {
    id: '2',
    emoji: '🧾',
    title: 'Menu Capture',
    description: 'Photograph a restaurant\'s menu board or display',
    reward: '$0.50 - $1.50',
    estimatedTime: '~3 min',
    distance: '0.5 km',
    instructions: 'Get close enough so all menu items are readable. Avoid glare and blur.'
  },
  {
    id: '3',
    emoji: '🛒',
    title: 'Product Shelf',
    description: 'Take photos of store shelves with specific products',
    reward: '$0.75 - $2.00',
    estimatedTime: '~4 min',
    distance: '0.8 km',
    instructions: 'Capture the full shelf, making sure product labels are visible.'
  },
  {
    id: '4',
    emoji: '🚧',
    title: 'Construction Update',
    description: 'Document ongoing construction or road work',
    reward: '$1.00 - $2.50',
    estimatedTime: '~5 min',
    distance: '1.2 km',
    instructions: 'Take a wide shot of the construction area. Include any signs or barriers.'
  },
  {
    id: '5',
    emoji: '🌱',
    title: 'Green Space',
    description: 'Capture community gardens or public parks',
    reward: '$0.50 - $1.75',
    estimatedTime: '~3 min',
    distance: '1.5 km',
    instructions: 'Show the main area of the park or garden. Avoid people in the shot if possible.'
  },
];

export default function PhotoTaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const task = PHOTO_TASKS.find(t => t.id === taskId);

  // Camera/photo state (stubbed)
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>Task not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: CATEGORY_COLOR, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Simulate camera/photo
  const handleTakePhoto = () => {
    // In a real app, launch camera and get photo URI
    setTimeout(() => {
      setPhotoUri('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80');
    }, 800);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={CATEGORY_GRADIENT} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.emoji}>{task.emoji}</Text>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.desc}>{task.description}</Text>
        </View>
      </LinearGradient>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={18} color={CATEGORY_COLOR} />
          <Text style={styles.metaText}>{task.reward}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={18} color={CATEGORY_COLOR} />
          <Text style={styles.metaText}>{task.estimatedTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={18} color={CATEGORY_COLOR} />
          <Text style={styles.metaText}>{task.distance}</Text>
        </View>
      </View>

      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>Instructions</Text>
        <Text style={styles.instructionsText}>{task.instructions}</Text>
      </View>

      {/* Camera/photo section */}
      <View style={styles.photoSection}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={32} color="#10B386" />
            <Text style={styles.cameraBtnText}>Take Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit button */}
      {photoUri && !success && (
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Photo'}</Text>
        </TouchableOpacity>
      )}

      {/* Success message */}
      {success && (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={40} color={CATEGORY_COLOR} />
          <Text style={styles.successText}>Photo submitted! You'll be notified once it's reviewed.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FCF9',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 28,
    paddingHorizontal: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 30,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 20,
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  desc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  metaText: {
    color: CATEGORY_COLOR,
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 5,
  },
  instructionsBox: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#10B386',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  instructionsTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#10B386',
    marginBottom: 4,
  },
  instructionsText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 21,
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  cameraBtn: {
    backgroundColor: '#E6F4EF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cameraBtnText: {
    color: '#10B386',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 10,
  },
  photoPreview: {
    width: 220,
    height: 160,
    borderRadius: 18,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#10B386',
  },
  submitBtn: {
    backgroundColor: '#10B386',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginTop: 2,
    shadowColor: '#10B386',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  successBox: {
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 32,
    backgroundColor: '#E6F4EF',
    borderRadius: 18,
    padding: 24,
  },
  successText: {
    color: '#10B386',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
}); 