import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LabelStudioService from '../../../../services/LabelStudioService';
import { useWalletStore } from '../../../../store/walletStore';
import { useAuthStore } from '../../../../store/authStore';
import { submitAnnotation } from '../../../../services/LabelStudioService';

const MODERN_ORANGE = '#FF8500';
const CATEGORY_GRADIENT = [MODERN_ORANGE, '#FFB366'] as const;
const CATEGORY_COLOR = MODERN_ORANGE;
const CTA_COLOR = MODERN_ORANGE;

const { width } = Dimensions.get('window');

const LANGUAGE_OPTIONS = ['All', 'Spanish', 'Portuguese'];

// Rating options with icons and colors
const RATING_OPTIONS = [
  { value: 'positive', label: 'Positive', icon: 'thumbs-up', color: '#4CAF50' },
  { value: 'neutral', label: 'Neutral', icon: 'help-circle', color: '#FFB300' },
  { value: 'negative', label: 'Negative', icon: 'thumbs-down', color: '#F44336' },
];

export default function AIChatTasksScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuthStore();
  const { addReward, fetchWalletData } = useWalletStore();

  // Fetch tasks from Label Studio
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const fetchedTasks = await LabelStudioService.fetchTasks('TEXT_SENTIMENT');
        console.log('Fetched tasks:', fetchedTasks);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        Alert.alert('Error', 'Could not load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Filter real tasks by language if possible
  const filteredTasks = tasks.filter(task => {
    if (selectedLanguage === 'All') return true;
    // Try to infer language from context or text
    const text = task.data?.text?.toLowerCase() || '';
    const context = task.data?.context?.toLowerCase() || '';
    if (selectedLanguage === 'Spanish') {
      return text.match(/[áéíóúñ¿¡]/) || context.includes('spanish');
    }
    if (selectedLanguage === 'Portuguese') {
      return text.match(/[ãõçáéíóú]/) || context.includes('portuguese');
    }
    return true;
  });

  // Helper for timeout
  const withTimeout = (promise: Promise<any>, ms: number, errorMsg: string) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
    ]);
  };

  // Handler for opening the rating modal
  const handleStartRating = (task: any) => {
    setSelectedTask(task);
    setSelectedRating(null);
    setFeedback('');
    setIsRatingModalVisible(true);
  };

  // Handler for submitting the rating
  const handleSubmitRating = async () => {
    if (!selectedTask || !selectedRating) {
      Alert.alert('Error', 'Please select a rating before submitting.');
      return;
    }
    setIsSubmitting(true);
    let didError = false;
    try {
      const annotation = {
        result: [
          {
            from_name: 'sentiment_choice',
            to_name: 'text_sentiment',
            type: 'choices',
            value: {
              choices: [selectedRating]
            }
          },
          {
            from_name: 'feedback',
            to_name: 'text_sentiment',
            type: 'textarea',
            value: {
              text: feedback
            }
          }
        ]
      };
      console.log('Submitting annotation for task:', selectedTask.id);
      console.log('Annotation payload:', JSON.stringify(annotation));
      // Submit annotation to Label Studio
      const response = await LabelStudioService.submitAnnotation(Number(selectedTask.id), annotation, 'TEXT_SENTIMENT');
      console.log('Annotation submission response:', response);
      // Credit the user (timeout after 5s)
      console.log('Calling addReward...');
      await withTimeout(
        addReward(user?.id || 'demo-user', 0.25, `Task: ${selectedTask.data?.text?.slice(0, 30) || 'AI Chat Task'}`),
        5000,
        'addReward timed out'
      );
      console.log('addReward complete');
      // Refresh wallet data (timeout after 5s)
      console.log('Calling fetchWalletData...');
      await withTimeout(
        fetchWalletData(user?.id || 'demo-user'),
        5000,
        'fetchWalletData timed out'
      );
      console.log('fetchWalletData complete');
      setIsRatingModalVisible(false);
      setSelectedTask(null);
      setSelectedRating(null);
      setFeedback('');
      console.log('State reset after successful submission');
      Alert.alert('¡Éxito!', 'Has calificado la respuesta y ganado $0.25 USDC.');
    } catch (err: any) {
      didError = true;
      console.error('Error submitting annotation:', err);
      setIsRatingModalVisible(false);
      setSelectedTask(null);
      setSelectedRating(null);
      setFeedback('');
      console.log('State reset after error');
      Alert.alert('Error', `No se pudo enviar la calificación.\n${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
      if (!didError) {
        setIsRatingModalVisible(false);
        setSelectedTask(null);
        setSelectedRating(null);
        setFeedback('');
        console.log('State reset in finally block');
      }
    }
  };

  // Rating Modal Component
  const RatingModal = () => {
    if (!selectedTask) return null;
    
    // Find the task data from Label Studio
    const chatResponse = selectedTask.data || {
      text: "Loading response...",
      context: "Loading context..."
    };
    
    return (
      <Modal
        visible={isRatingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRatingModalVisible(false)}
      >
        <View style={styles.modalOverlaySleek}>
          <View style={styles.modalContentSleek}>
            <View style={styles.modalHeaderSleek}>
              <Text style={styles.modalTitleSleek}>Rate AI Response</Text>
              <TouchableOpacity 
                onPress={() => setIsRatingModalVisible(false)}
                style={styles.closeButtonSleek}
              >
                <Ionicons name="close" size={26} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.chatContainerSleek}>
              <Text style={styles.chatContextSleek}>{chatResponse.context || "AI Response"}</Text>
              <View style={styles.chatBubbleSleek}>
                <Text style={styles.chatTextSleek}>{chatResponse.text}</Text>
              </View>
            </View>

            <View style={styles.ratingContainerSleek}>
              <Text style={styles.ratingPromptSleek}>How would you rate this response?</Text>
              <View style={styles.ratingButtonsSleekVertical}>
                {RATING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.ratingButtonSleek,
                      { backgroundColor: option.color },
                      selectedRating === option.value && styles.ratingButtonSelectedSleek
                    ]}
                    onPress={() => setSelectedRating(option.value)}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                  >
                    <Ionicons name={option.icon as any} size={22} color="#fff" />
                    <Text style={styles.ratingButtonTextSleek}>{option.label}</Text>
                    {selectedRating === option.value && (
                      <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.feedbackContainerSleek}>
                <Text style={styles.feedbackLabelSleek}>Additional Feedback (Optional)</Text>
                <TextInput
                  style={styles.feedbackInputSleek}
                  multiline
                  numberOfLines={3}
                  placeholder="Share your thoughts about the response..."
                  value={feedback}
                  onChangeText={setFeedback}
                  editable={!isSubmitting}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.submitButtonSleek,
                  selectedRating ? null : styles.submitButtonDisabledSleek
                ]}
                onPress={handleSubmitRating}
                disabled={!selectedRating || isSubmitting}
                activeOpacity={selectedRating ? 0.85 : 1}
              >
                <Text style={styles.submitButtonTextSleek}>
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Text>
              </TouchableOpacity>
            </View>
            {isSubmitting && (
              <View style={styles.loadingOverlaySleek}>
                <ActivityIndicator size="large" color={MODERN_ORANGE} />
                <Text style={styles.loadingTextSleek}>Submitting rating...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FF7E58" style={styles.icon} />
        </View>
        <Text style={styles.prompt}>{item.prompt}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.reward}><Ionicons name="cash-outline" size={15} color="#FF7E58" /> {item.reward}</Text>
          <Text style={styles.time}><Ionicons name="time-outline" size={15} color="#FF7E58" /> {item.estimatedTime}</Text>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => handleStartRating(item)}>
            <LinearGradient
              colors={["#FF7E58", "#FF5630"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Ionicons name="star-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Calificar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Rate AI Chat Responses</Text>
        <Text style={styles.subtext}>Ayuda a mejorar la calidad de las respuestas de IA en español y portugués</Text>
      </View>

      {/* Language Filter */}
      <View style={styles.filterRow}>
        <View style={styles.filterPillRow}>
          {LANGUAGE_OPTIONS.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setSelectedLanguage(lang)}
              style={[styles.filterPill, selectedLanguage === lang && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, selectedLanguage === lang && styles.filterPillTextActive]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Task List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MODERN_ORANGE} />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {filteredTasks.map((task, index) => (
              <View key={task.id} style={styles.cardOuter}>
                <View style={styles.cardSleek}>
                  <View style={styles.cardHeaderSleek}>
                    <Ionicons name="chatbubble-ellipses" size={26} color={MODERN_ORANGE} style={styles.icon} />
                  </View>
                  <Text style={styles.promptSleek}>{task.data?.text || 'No text'}</Text>
                  <Text style={styles.contextSleek}>{task.data?.context || ''}</Text>
                  <View style={styles.cardFooterSleek}>
                    <TouchableOpacity style={styles.buttonContainerSleek} onPress={() => handleStartRating(task)}>
                      <LinearGradient
                        colors={CATEGORY_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonSleek}
                      >
                        <Ionicons name="star-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextSleek}>Calificar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal />

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: CTA_COLOR }]}
          onPress={() => {
            // Handle start mission
            console.log('Start AI Chat Rating Mission');
          }}
        >
          <Text style={styles.ctaButtonText}>Start Rating Chats</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CARD_HEIGHT = 120;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF7E58',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5630',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: '#FF7E58',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
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
    backgroundColor: '#FFE3D6',
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
    color: '#FF5630',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#222',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF7F4',
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
    shadowColor: '#FF7E58',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFF7F5',
    borderWidth: 1.5,
    borderColor: '#FFD6C6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  prompt: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reward: {
    color: '#FF7E58',
    fontWeight: 'bold',
    fontSize: 13,
  },
  time: {
    color: '#FF7E58',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
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
    borderTopColor: '#FFE3D6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5630',
  },
  closeButton: {
    padding: 4,
  },
  chatContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chatContext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  chatBubble: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE3D6',
  },
  chatText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingPrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedbackContainer: {
    marginTop: 20,
    width: '100%',
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE3D6',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF5630',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#FFB3A3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF5630',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  ratingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardSleek: {
    borderRadius: 18,
    padding: 22,
    backgroundColor: '#fff',
    shadowColor: MODERN_ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeaderSleek: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptSleek: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  contextSleek: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  cardFooterSleek: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  buttonContainerSleek: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonSleek: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
    justifyContent: 'center',
    backgroundColor: MODERN_ORANGE,
  },
  buttonTextSleek: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  modalOverlaySleek: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentSleek: {
    backgroundColor: '#fff',
    borderRadius: 22,
    width: '92%',
    maxHeight: '85%',
    padding: 24,
    shadowColor: MODERN_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeaderSleek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitleSleek: {
    fontSize: 21,
    fontWeight: 'bold',
    color: MODERN_ORANGE,
  },
  closeButtonSleek: {
    padding: 6,
  },
  chatContainerSleek: {
    backgroundColor: '#FFF7F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  chatContextSleek: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  chatBubbleSleek: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE3D6',
  },
  chatTextSleek: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  ratingContainerSleek: {
    alignItems: 'center',
    marginTop: 6,
  },
  ratingPromptSleek: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  ratingButtonsSleekVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  ratingButtonSleek: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 110,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  ratingButtonSelectedSleek: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2,
    borderColor: MODERN_ORANGE,
    shadowColor: MODERN_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonTextSleek: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 7,
  },
  feedbackContainerSleek: {
    marginTop: 10,
    width: '100%',
  },
  feedbackLabelSleek: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  feedbackInputSleek: {
    backgroundColor: '#FFF7F0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFD6B0',
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  submitButtonSleek: {
    backgroundColor: MODERN_ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
  },
  submitButtonDisabledSleek: {
    backgroundColor: '#FFD6B0',
  },
  submitButtonTextSleek: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingOverlaySleek: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  loadingTextSleek: {
    marginTop: 10,
    fontSize: 16,
    color: MODERN_ORANGE,
    fontWeight: '500',
  },
}); 