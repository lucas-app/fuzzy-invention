import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';

export default function WithdrawScreen() {
  const { user } = useAuthStore();
  const { balance, isLoading, error, fetchWalletData, requestWithdrawal, clearError } = useWalletStore();
  
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('PayPal');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Load wallet data on mount
  useEffect(() => {
    if (user?.id) {
      fetchWalletData(user.id);
    }
  }, [user?.id]);
  
  // Maximum withdrawal amount is the available balance
  const maxAmount = balance?.usdc_balance || 0;
  
  // Handle amount input
  const handleAmountChange = (text: string) => {
    // Only allow valid numeric input (with decimal)
    if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) {
      setAmount(text);
    }
  };
  
  // Set maximum amount
  const handleSetMaxAmount = () => {
    if (maxAmount > 0) {
      setAmount(maxAmount.toFixed(2));
    }
  };
  
  // Handle method selection
  const handleSelectMethod = (method: string) => {
    setWithdrawalMethod(method);
  };
  
  // Handle withdrawal submission
  const handleSubmit = async () => {
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    
    const numericAmount = parseFloat(amount);
    
    if (numericAmount > maxAmount) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
      return;
    }
    
    if (numericAmount < 5) {
      Alert.alert('Minimum Withdrawal', 'The minimum withdrawal amount is 5 USDC.');
      return;
    }
    
    if (!paymentDetails) {
      Alert.alert('Missing Details', 'Please enter your payment details.');
      return;
    }
    
    // Confirm withdrawal
    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${numericAmount.toFixed(2)} USDC to ${withdrawalMethod}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: async () => {
            if (!user?.id) {
              Alert.alert('Authentication Error', 'You must be logged in to withdraw funds.');
              return;
            }
            
            setSubmitting(true);
            
            try {
              // Request withdrawal
              const description = `${withdrawalMethod}: ${paymentDetails}`;
              const success = await requestWithdrawal(user.id, numericAmount, description);
              
              if (success) {
                Alert.alert(
                  'Withdrawal Requested',
                  'Your withdrawal request has been submitted successfully. It will be processed within 24-48 hours.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back()
                    }
                  ]
                );
              } else {
                Alert.alert('Withdrawal Failed', 'Your withdrawal request could not be processed. Please try again later.');
              }
            } catch (error) {
              console.error('Error processing withdrawal:', error);
              Alert.alert('Withdrawal Error', 'An error occurred while processing your withdrawal request.');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  // If there's an error, show error screen
  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Withdraw',
            headerShown: true,
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearError();
              if (user?.id) fetchWalletData(user.id);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen 
        options={{
          title: 'Withdraw',
          headerShown: true,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ${maxAmount.toFixed(2)} <Text style={styles.balanceCurrency}>USDC</Text>
          </Text>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
              editable={!isLoading && !submitting}
            />
            <TouchableOpacity 
              style={styles.maxButton}
              onPress={handleSetMaxAmount}
              disabled={isLoading || submitting || maxAmount <= 0}
            >
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.minWithdrawalNote}>Minimum withdrawal: $5.00 USDC</Text>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          
          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                withdrawalMethod === 'PayPal' && styles.methodButtonSelected
              ]}
              onPress={() => handleSelectMethod('PayPal')}
              disabled={isLoading || submitting}
            >
              <Ionicons 
                name="logo-paypal" 
                size={24} 
                color={withdrawalMethod === 'PayPal' ? '#0070BA' : '#64748B'} 
              />
              <Text 
                style={[
                  styles.methodButtonText,
                  withdrawalMethod === 'PayPal' && styles.methodButtonTextSelected
                ]}
              >
                PayPal
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodButton,
                withdrawalMethod === 'BankTransfer' && styles.methodButtonSelected
              ]}
              onPress={() => handleSelectMethod('BankTransfer')}
              disabled={isLoading || submitting}
            >
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={withdrawalMethod === 'BankTransfer' ? '#0070BA' : '#64748B'} 
              />
              <Text 
                style={[
                  styles.methodButtonText,
                  withdrawalMethod === 'BankTransfer' && styles.methodButtonTextSelected
                ]}
              >
                Bank Transfer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodButton,
                withdrawalMethod === 'Crypto' && styles.methodButtonSelected
              ]}
              onPress={() => handleSelectMethod('Crypto')}
              disabled={isLoading || submitting}
            >
              <Ionicons 
                name="logo-bitcoin" 
                size={24} 
                color={withdrawalMethod === 'Crypto' ? '#0070BA' : '#64748B'} 
              />
              <Text 
                style={[
                  styles.methodButtonText,
                  withdrawalMethod === 'Crypto' && styles.methodButtonTextSelected
                ]}
              >
                Crypto
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <TextInput
            style={styles.detailsInput}
            value={paymentDetails}
            onChangeText={setPaymentDetails}
            placeholder={
              withdrawalMethod === 'PayPal' ? 'PayPal email address' : 
              withdrawalMethod === 'BankTransfer' ? 'Bank account details' : 
              'Wallet address'
            }
            multiline={true}
            numberOfLines={3}
            editable={!isLoading && !submitting}
          />
          <Text style={styles.detailsHelper}>
            {withdrawalMethod === 'PayPal' ? 'Enter the email address associated with your PayPal account' : 
             withdrawalMethod === 'BankTransfer' ? 'Enter your bank name, account number, and routing information' : 
             'Enter your crypto wallet address (USDC on Polygon network)'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isLoading || submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading || submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Request Withdrawal</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Withdrawal requests are processed within 24-48 hours. Minimum withdrawal amount is $5.00 USDC.
          </Text>
        </View>
        
        {/* Add bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceCurrency: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  formSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#0F172A',
  },
  maxButton: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  minWithdrawalNote: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  methodButton: {
    width: '30%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodButtonSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 8,
  },
  methodButtonTextSelected: {
    color: '#0284C7',
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  detailsHelper: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 