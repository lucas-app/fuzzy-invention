import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

interface WithdrawalField {
  id: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
  value?: string;
}

interface WithdrawalOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: WithdrawalField[];
  recommended?: boolean;
}

const WITHDRAWAL_OPTIONS: WithdrawalOption[] = [
  {
    id: 'binance',
    title: 'Withdraw to Binance',
    description: 'Fast and free transfer to your Binance account',
    icon: '🏦',
    fields: [
      { id: 'email', label: 'Binance Email', placeholder: 'Enter your Binance account email' },
      { id: 'amount', label: 'Amount (USDT)', placeholder: 'Enter amount to withdraw', keyboardType: 'decimal-pad' },
    ],
    recommended: true,
  },
  {
    id: 'crypto',
    title: 'Withdraw to Crypto Wallet',
    description: 'Send to any ERC-20 compatible wallet (Gas fees apply)',
    icon: '🔗',
    fields: [
      { id: 'address', label: 'Wallet Address', placeholder: 'Enter your ERC-20 wallet address' },
      { id: 'amount', label: 'Amount (USDT)', placeholder: 'Enter amount to withdraw', keyboardType: 'decimal-pad' },
    ],
  },
  {
    id: 'fiat',
    title: 'Withdraw to Bank Account',
    description: 'Transfer to your linked bank account (3-5 business days)',
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
  const [selectedOption, setSelectedOption] = useState<WithdrawalOption | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = selectedOption && selectedOption.fields.every(field => 
    formValues[field.id] && formValues[field.id].trim() !== ''
  );

  const handleOptionSelect = (option: WithdrawalOption) => {
    setSelectedOption(option);
    setFormValues({});
    setError(null);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validation
      const missingFields = selectedOption?.fields.filter(field => !formValues[field.id]);
      
      if (missingFields?.length) {
        throw new Error('Please fill in all required fields');
      }

      if (formValues.amount && parseFloat(formValues.amount) <= 0) {
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
        <Pressable 
          onPress={() => router.back()} 
          style={styles.closeButton}
          hitSlop={8}
        >
          <Ionicons name="close" size={24} color="#020733" />
        </Pressable>
        <Text style={styles.title}>Withdraw Funds</Text>
      </View>

      <View style={styles.handle} />

      {!selectedOption && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.optionsContainer}
        >
          {WITHDRAWAL_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
                option.recommended && styles.recommendedOption
              ]}
              onPress={() => handleOptionSelect(option)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              {option.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              )}
              <Text style={styles.optionDescription}>{option.description}</Text>
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
          {selectedOption.fields.map((field) => (
            <View key={field.id} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#94a3b8"
                value={formValues[field.id]}
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

          <TouchableOpacity
            style={[
              styles.withdrawButton,
              !isValid && styles.withdrawButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.withdrawButtonText}>
                Withdraw {formValues.amount || '0'} USDT
              </Text>
            )}
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    top: 8,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedOption: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    flex: 1,
  },
  recommendedBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
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
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#020733',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  withdrawButtonText: {
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