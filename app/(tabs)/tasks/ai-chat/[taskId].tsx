import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_GRADIENT = ['#FF7E58', '#FF5630'] as const;
const CATEGORY_COLOR = '#FF5630';

// Local copy of tasks for demo
const CHAT_TASKS = [
  {
    id: '1',
    emoji: '💬',
    title: 'Rate a Spanish AI Reply',
    description: 'Read a chatbot response in Spanish and rate its helpfulness and tone.',
    reward: '$0.25 - $0.75',
    estimatedTime: '~2 min',
    language: 'Spanish',
    sampleMessage: '¡Hola! ¿En qué puedo ayudarte hoy?'
  },
  {
    id: '2',
    emoji: '📝',
    title: 'Correct AI Grammar',
    description: 'Spot and correct grammar mistakes in an AI-generated message.',
    reward: '$0.20 - $0.60',
    estimatedTime: '~2 min',
    language: 'Portuguese',
    sampleMessage: 'Eu está muito feliz de ajudar você com sua pergunta.'
  },
  {
    id: '3',
    emoji: '🌐',
    title: 'Rate Multilingual Chat',
    description: 'Evaluate the quality of a chatbot reply in your preferred language.',
    reward: '$0.25 - $0.80',
    estimatedTime: '~2 min',
    language: 'Spanish',
    sampleMessage: 'Por favor, dime más sobre lo que necesitas.'
  },
];

export default function AIChatTaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const task = CHAT_TASKS.find(t => t.id === taskId);

  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = useState('');
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
          <Ionicons name="language-outline" size={18} color={CATEGORY_COLOR} />
          <Text style={styles.metaText}>{task.language}</Text>
        </View>
      </View>

      {/* Sample AI message */}
      <View style={styles.messageBox}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={CATEGORY_COLOR} style={{ marginRight: 6 }} />
        <Text style={styles.messageText}>{task.sampleMessage}</Text>
      </View>

      {/* Rating options */}
      <View style={styles.ratingRow}>
        <TouchableOpacity
          style={[styles.ratingBtn, rating === 'up' && styles.ratingBtnActive]}
          onPress={() => setRating('up')}
        >
          <Ionicons name="thumbs-up" size={28} color={rating === 'up' ? '#fff' : CATEGORY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ratingBtn, rating === 'down' && styles.ratingBtnActive]}
          onPress={() => setRating('down')}
        >
          <Ionicons name="thumbs-down" size={28} color={rating === 'down' ? '#fff' : CATEGORY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* Feedback input */}
      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackLabel}>Optional feedback</Text>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Explain your rating (optional)"
          placeholderTextColor="#aaa"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit button */}
      {!success && (
        <TouchableOpacity
          style={[styles.submitBtn, (!rating || submitting) && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={!rating || submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
        </TouchableOpacity>
      )}

      {/* Success message */}
      {success && (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={40} color={CATEGORY_COLOR} />
          <Text style={styles.successText}>Thank you for your feedback! Your rating has been submitted.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F4',
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
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#FF5630',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FF7E58',
  },
  ratingBtnActive: {
    backgroundColor: CATEGORY_COLOR,
    borderColor: CATEGORY_COLOR,
  },
  feedbackBox: {
    marginHorizontal: 24,
    marginBottom: 10,
  },
  feedbackLabel: {
    color: '#FF5630',
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 15,
  },
  feedbackInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#FFE3D6',
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#FF5630',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginTop: 2,
    shadowColor: '#FF5630',
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
    backgroundColor: '#FFE3D6',
    borderRadius: 18,
    padding: 24,
  },
  successText: {
    color: '#FF5630',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
}); 