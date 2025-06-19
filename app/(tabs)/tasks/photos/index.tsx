import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Main category color/gradient
const CATEGORY_GRADIENT = ['#37D2A0', '#10B386'] as const;
const CATEGORY_COLOR = '#10B386';
const CTA_COLOR = '#10B386';

const { width } = Dimensions.get('window');

const PHOTO_TASKS = [
  {
    id: '1',
    emoji: '📸',
    title: 'Carrefour Storefront Snapshot',
    description: 'Take a clear photo of a Carrefour storefront sign in Brazil',
    reward: '$0.25 - $1.00',
    estimatedTime: '~2 min',
    distance: '0.3 km',
    instructions: 'Stand in front of the Carrefour shop, make sure the sign is visible and readable. Avoid reflections and obstructions.'
  },
  {
    id: '2',
    emoji: '🧾',
    title: 'Menu Capture',
    description: 'Photograph a restaurant\'s menu board or display',
    reward: '$0.50 - $1.50',
    estimatedTime: '~3 min',
    distance: '0.5 km',
  },
  {
    id: '3',
    emoji: '🛒',
    title: 'Product Shelf',
    description: 'Take photos of store shelves with specific products',
    reward: '$0.75 - $2.00',
    estimatedTime: '~4 min',
    distance: '0.8 km',
  },
  {
    id: '4',
    emoji: '🚧',
    title: 'Construction Update',
    description: 'Document ongoing construction or road work',
    reward: '$1.00 - $2.50',
    estimatedTime: '~5 min',
    distance: '1.2 km',
  },
  {
    id: '5',
    emoji: '🌾',
    title: 'Crop Field Snapshot',
    description: 'Take a clear photo of a crop field (e.g., corn, soy, rice) in your area',
    reward: '$0.60 - $2.00',
    estimatedTime: '~4 min',
    distance: '2.0 km',
    instructions: 'Stand at the edge of the field, make sure the crop is visible and identifiable. Avoid blurry or distant shots.'
  },
];

const RADIUS_OPTIONS = ['1 km', '5 km', 'All'];

export default function PhotoMissionsScreen() {
  const [selectedRadius, setSelectedRadius] = useState('All');
  const router = useRouter();

  // Filter tasks based on selected radius
  const filteredTasks = PHOTO_TASKS.filter(task => {
    if (selectedRadius === 'All') return true;
    const taskDistance = parseFloat(task.distance);
    const radiusLimit = selectedRadius === '1 km' ? 1 : 5;
    return taskDistance <= radiusLimit;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 Real-World Photo Missions Near You</Text>
        <Text style={styles.headerSubtitle}>
          Take photos of real places, products, and signs to help AI see the world better. Tasks are geo-tagged and reviewed before payout.
        </Text>
      </View>

      {/* Radius Filter */}
      <View style={styles.filterRow}>
        <View style={styles.filterPillRow}>
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              onPress={() => setSelectedRadius(radius)}
              style={[styles.filterPill, selectedRadius === radius && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, selectedRadius === radius && styles.filterPillTextActive]}>
                {radius}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Task List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsList}>
          {filteredTasks.map((task, index) => (
            <View key={task.id} style={styles.cardOuter}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.accentBar} />
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{task.emoji}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                </View>
                <Text style={styles.cardDesc}>{task.description}</Text>
                <View style={styles.cardInfoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={16} color={CATEGORY_COLOR} />
                    <Text style={styles.infoText}>{task.reward}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color={CATEGORY_COLOR} />
                    <Text style={styles.infoText}>{task.estimatedTime}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={16} color={CATEGORY_COLOR} />
                    <Text style={styles.infoText}>{task.distance}</Text>
                  </View>
                </View>
                {task.instructions && (
                  <Text style={styles.instructions}>{task.instructions}</Text>
                )}
                <TouchableOpacity
                  style={styles.buttonContainer}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/tasks/photos/${task.id}`)}
                >
                  <LinearGradient
                    colors={CATEGORY_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Ionicons name="camera-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Start Mission</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerMsgRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={CATEGORY_COLOR} />
          <Text style={[styles.footerMsgText, { color: CATEGORY_COLOR }]}>Photos are reviewed by humans. You'll be notified once approved.</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: CTA_COLOR }]}
          onPress={() => {
            // Handle mission start
            console.log('Starting mission...');
          }}
        >
          <Text style={styles.ctaButtonText}>Start This Mission</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CARD_HEIGHT = 120;
const ACCENT_WIDTH = 7;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FCF9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4EF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterPillRow: {
    flexDirection: 'row',
    backgroundColor: '#E6F4EF',
    borderRadius: 999,
    padding: 2,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 2,
  },
  filterPillActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 14,
    color: '#10B386',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#222',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F6FCF9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardsList: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  cardOuter: {
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: CATEGORY_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#B6F2DF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accentBar: {
    width: 6,
    height: 36,
    borderRadius: 4,
    backgroundColor: CATEGORY_COLOR,
    marginRight: 12,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B386',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
    flex: 1,
    flexWrap: 'wrap',
  },
  cardDesc: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  infoText: {
    color: CATEGORY_COLOR,
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E6F4EF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  footerMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  footerMsgText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  ctaButton: {
    backgroundColor: CTA_COLOR,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: CTA_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
}); 