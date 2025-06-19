import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const WITHDRAWAL_OPTIONS = [
  {
    id: 'crypto',
    title: 'Withdraw to Crypto Wallet',
    description: 'Send to any ERC-20 compatible wallet',
    icon: '🔗',
    fields: [
      { id: 'address', label: 'Wallet Address', placeholder: 'Enter your ERC-20 wallet address' },
      { id: 'amount', label: 'Amount (USDC)', placeholder: 'Enter amount to withdraw', keyboardType: 'decimal-pad' },
    ],
  },
  {
    id: 'binance',
    title: 'Withdraw to Binance',
    description: 'Instant transfer to your Binance account',
    icon: '🏦',
    fields: [
      { id: 'email', label: 'Binance Email', placeholder: 'Enter your Binance account email' },
      { id: 'amount', label: 'Amount (USDC)', placeholder: 'Enter amount to withdraw', keyboardType: 'decimal-pad' },
    ],
  },
  {
    id: 'fiat',
    title: 'Withdraw to Bank Account',
    description: 'Transfer to your linked bank account',
    icon: '💵',
    fields: [
      { id: 'accountName', label: 'Account Name', placeholder: 'Enter account holder name' },
      { id: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number' },
      { id: 'routingNumber', label: 'Routing Number', placeholder: 'Enter routing number' },
      { id: 'amount', label: 'Amount (USD)', placeholder: 'Enter amount to withdraw', keyboardType: 'decimal-pad' },
    ],
  },
];

export default function WithdrawModal() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setFormData({});
    setError(null);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validation
      const option = WITHDRAWAL_OPTIONS.find(opt => opt.id === selectedOption);
      const missingFields = option?.fields.filter(field => !formData[field.id]);
      
      if (missingFields?.length) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.amount && parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#020733" />
        </Pressable>
        <Text style={styles.title}>Withdraw Funds</Text>
      </View>

      {!selectedOption && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.optionsContainer}
        >
          {WITHDRAWAL_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionSelect(option.id)}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>{option.icon}</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          ))}
        </Animated.View>
      )}

      {selectedOption && !success && (
        <Animated.View 
          entering={SlideInRight} 
          exiting={SlideOutLeft}
          style={styles.formContainer}
        >
          {WITHDRAWAL_OPTIONS.find(opt => opt.id === selectedOption)?.fields.map((field) => (
            <View key={field.id} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#94a3b8"
                value={formData[field.id]}
                onChangeText={(value) => handleInputChange(field.id, value)}
                keyboardType={field.keyboardType as any || 'default'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Withdrawal</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      {success && (
        <Animated.View 
          entering={FadeIn} 
          style={styles.successContainer}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Withdrawal Initiated!</Text>
          <Text style={styles.successDescription}>
            Your withdrawal request has been submitted successfully. Please allow up to 24 hours for processing.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#020733',
  },
  optionsContainer: {
    padding: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#020733',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#020733',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020733',
    marginBottom: 16,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});