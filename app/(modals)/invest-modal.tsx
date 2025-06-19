import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const INVESTMENT_OPTIONS = [
  {
    id: 'bitcoin',
    title: 'Bitcoin (BTC)',
    description: 'The world\'s first cryptocurrency',
    icon: '₿',
    currentPrice: '$52,341.23',
    change: '+2.45%',
    apy: null,
  },
  {
    id: 'ethereum',
    title: 'Ethereum (ETH)',
    description: 'Programmable blockchain and smart contracts platform',
    icon: 'Ξ',
    currentPrice: '$2,843.12',
    change: '-1.23%',
    apy: null,
  },
  {
    id: 'index',
    title: 'Crypto Index Fund',
    description: 'Diversified portfolio of top 10 cryptocurrencies',
    icon: '📊',
    currentPrice: null,
    change: '+3.21%',
    apy: '12.4%',
  },
  {
    id: 'usdc-aave',
    title: 'USDC Yield',
    description: 'Earn interest on your USDC stablecoin holdings',
    icon: '💰',
    currentPrice: null,
    change: null,
    apy: '4.23%',
  },
];

export default function InvestModal() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setError(null);
  };

  const handleNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setConfirmation(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validation
      if (!selectedOption) {
        throw new Error('Please select an investment option');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedOption = () => {
    const option = INVESTMENT_OPTIONS.find(opt => opt.id === selectedOption);
    if (!option) return null;

    return (
      <View style={styles.selectedOption}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>{option.icon}</Text>
        </View>
        <View style={styles.optionDetails}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
          {option.currentPrice && (
            <Text style={styles.optionPrice}>{option.currentPrice}</Text>
          )}
          {option.apy && (
            <Text style={styles.optionApy}>{option.apy} APY</Text>
          )}
          {option.change && (
            <Text style={[
              styles.optionChange,
              option.change.startsWith('+') ? styles.positiveChange : styles.negativeChange
            ]}>{option.change}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#020733" />
        </Pressable>
        <Text style={styles.title}>Invest</Text>
      </View>

      {!selectedOption && (
        <Animated.ScrollView 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.optionsContainer}
        >
          <Text style={styles.sectionTitle}>Select an investment</Text>
          {INVESTMENT_OPTIONS.map((option) => (
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
                <View style={styles.optionStats}>
                  {option.currentPrice && (
                    <Text style={styles.optionStat}>{option.currentPrice}</Text>
                  )}
                  {option.apy && (
                    <Text style={[styles.optionStat, styles.optionApy]}>{option.apy} APY</Text>
                  )}
                  {option.change && (
                    <Text style={[
                      styles.optionStat,
                      option.change.startsWith('+') ? styles.positiveChange : styles.negativeChange
                    ]}>{option.change}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          ))}
        </Animated.ScrollView>
      )}

      {selectedOption && !confirmation && !success && (
        <Animated.View 
          entering={SlideInRight} 
          exiting={SlideOutLeft}
          style={styles.formContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Investment details</Text>
            
            {renderSelectedOption()}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Investment Amount (USDC)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(value) => {
                  setAmount(value);
                  setError(null);
                }}
              />
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563eb" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Investment returns are variable and not guaranteed. Past performance does not guarantee future results.
              </Text>
            </View>

            <Pressable onPress={handleNext} style={styles.actionButton}>
              <LinearGradient
                colors={['#22D3EE', '#2DD4BF'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.actionButtonText}>Continue</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setSelectedOption(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back to options</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      )}

      {confirmation && !success && (
        <Animated.View 
          entering={SlideInRight} 
          exiting={SlideOutLeft}
          style={styles.confirmationContainer}
        >
          <Text style={styles.sectionTitle}>Confirm Investment</Text>
          
          {renderSelectedOption()}
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Investment Amount</Text>
              <Text style={styles.summaryValue}>${parseFloat(amount).toFixed(2)} USDC</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transaction Fee</Text>
              <Text style={styles.summaryValue}>$0.00 USDC</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>${parseFloat(amount).toFixed(2)} USDC</Text>
            </View>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.actionButtons}>
            <Pressable 
              onPress={() => setConfirmation(false)} 
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleConfirm} 
              style={[styles.actionButton, styles.confirmButton]}
              disabled={loading}
            >
              <LinearGradient
                colors={['#22D3EE', '#2DD4BF'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Confirm</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {success && (
        <Animated.View 
          entering={FadeIn} 
          style={styles.successContainer}
        >
          <View style={styles.successIcon}>
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.successIconGradient}
            >
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.successTitle}>Investment Successful!</Text>
          <Text style={styles.successDescription}>
            Your investment of ${parseFloat(amount).toFixed(2)} USDC in {INVESTMENT_OPTIONS.find(opt => opt.id === selectedOption)?.title} has been processed successfully.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.doneButton}>
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </LinearGradient>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 16,
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
    marginBottom: 6,
  },
  optionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionStat: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  optionApy: {
    color: '#2563eb',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionDetails: {
    flex: 1,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  optionChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#020733',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#020733',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#2563eb',
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmationContainer: {
    padding: 20,
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#020733',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  successIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});