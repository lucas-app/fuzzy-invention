import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

const INVESTMENT_OPTIONS = {
  crypto: [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 52341.23, change: 2.45 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 2843.12, change: -1.23 },
    { id: 'sol', name: 'Solana', symbol: 'SOL', price: 108.45, change: 5.67 },
  ],
  stocks: [
    { id: 'spy', name: 'S&P 500', symbol: 'SPY', price: 478.12, change: 0.89 },
    { id: 'qqq', name: 'Nasdaq 100', symbol: 'QQQ', price: 412.34, change: 1.12 },
  ],
  yield: [
    { id: 'usdt-aave', name: 'USDT on Aave', apy: 4.23, provider: 'Aave' },
    { id: 'usdt-comp', name: 'USDT on Compound', apy: 3.89, provider: 'Compound' },
  ],
};

// Learning guides content
const LEARNING_GUIDES = {
  'crypto-guide': {
    title: 'Understanding Cryptocurrency',
    content: 'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. Unlike traditional currencies, it operates on decentralized networks based on blockchain technology. This guide explains the fundamentals of cryptocurrency, how it works, and its potential benefits and risks.',
  },
  'index-fund-guide': {
    title: 'Index Fund Investing',
    content: 'An index fund is a type of investment that tracks a market index, such as the S&P 500. It offers broad market exposure, low operating expenses, and low portfolio turnover. This guide explains how index funds work, their advantages over actively managed funds, and how to incorporate them into your investment strategy.',
  },
  'yield-farming-guide': {
    title: 'Yield Farming Explained',
    content: 'Yield farming involves lending your cryptocurrency assets to earn interest. Platforms like Aave and Compound allow you to deposit assets and earn yields through lending and liquidity provision. This guide covers the basics of yield farming, associated risks, and strategies to maximize your returns.',
  },
};

const FAQ_ITEMS = [
  {
    question: 'What is cryptocurrency?',
    answer: 'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. Unlike traditional currencies, it operates on decentralized networks based on blockchain technology.',
    learnMoreUrl: 'crypto-guide',
  },
  {
    question: 'What is an index fund?',
    answer: 'An index fund is a type of investment that tracks a market index, such as the S&P 500. It offers broad market exposure, low operating expenses, and low portfolio turnover.',
    learnMoreUrl: 'index-fund-guide',
  },
  {
    question: 'How does yield farming work?',
    answer: 'Yield farming involves lending your cryptocurrency assets to earn interest. Platforms like Aave and Compound allow you to deposit assets and earn yields through lending and liquidity provision.',
    learnMoreUrl: 'yield-farming-guide',
  },
];

export default function InvestScreen() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('crypto');
  const [showingGuide, setShowingGuide] = useState<string | null>(null);

  const mockPortfolio = {
    totalInvested: 1250.45,
    availableBalance: 458.32,
    performance: 12.3,
  };

  const handleInvestMore = () => {
    router.push('/invest-modal');
  };

  const handleWithdraw = () => {
    router.push('/withdraw');
  };

  const handleAssetPress = (assetId: string) => {
    router.push(`/asset/${assetId}`);
  };

  const handleLearnMore = (guideId: string) => {
    setShowingGuide(guideId);
  };

  const renderAssetCard = (asset: any) => (
    <Pressable
      key={asset.id}
      style={styles.assetCard}
      onPress={() => handleAssetPress(asset.id)}
    >
      <LinearGradient
        colors={['rgba(34,211,238,0.1)', 'rgba(45,212,191,0.1)']}
        style={styles.assetGradient}
      />
      <View style={styles.assetIcon}>
        <Ionicons
          name={
            asset.symbol ? 'logo-bitcoin' :
            asset.apy ? 'trending-up' :
            'stats-chart'
          }
          size={24}
          color="#22D3EE"
        />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{asset.name}</Text>
        {asset.symbol ? (
          <>
            <Text style={styles.assetPrice}>${asset.price.toLocaleString()}</Text>
            <Text style={[
              styles.assetChange,
              { color: asset.change >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {asset.change >= 0 ? '+' : ''}{asset.change}%
            </Text>
          </>
        ) : (
          <Text style={styles.assetYield}>{asset.apy}% APY</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </Pressable>
  );

  // Render learning guide modal
  const renderLearningGuide = () => {
    if (!showingGuide) return null;
    
    const guide = LEARNING_GUIDES[showingGuide as keyof typeof LEARNING_GUIDES];
    
    return (
      <View style={styles.guideOverlay}>
        <View style={styles.guideContainer}>
          <View style={styles.guideHeader}>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowingGuide(null)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>
          </View>
          
          <ScrollView style={styles.guideContent}>
            <Text style={styles.guideText}>{guide.content}</Text>
            
            <View style={styles.guideTips}>
              <Text style={styles.tipsTitle}>Key Points:</Text>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.tipText}>Start with small investments to learn the market</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.tipText}>Diversify your portfolio to reduce risk</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.tipText}>Research thoroughly before investing</Text>
              </View>
            </View>
          </ScrollView>
          
          <Pressable 
            style={styles.doneButton}
            onPress={() => setShowingGuide(null)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          style={styles.header}
        >
          <View style={styles.portfolioCard}>
            <Text style={styles.portfolioLabel}>Total Investments</Text>
            <Text style={styles.portfolioValue}>
              ${mockPortfolio.totalInvested.toLocaleString()}
            </Text>
            <View style={styles.portfolioStats}>
              <View style={styles.portfolioStat}>
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>
                  ${mockPortfolio.availableBalance.toLocaleString()}
                </Text>
              </View>
              <View style={styles.portfolioStat}>
                <Text style={styles.statLabel}>Performance</Text>
                <Text style={[
                  styles.statValue,
                  { color: mockPortfolio.performance >= 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }
                ]}>
                  {mockPortfolio.performance >= 0 ? '+' : ''}{mockPortfolio.performance}%
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, styles.investButton]}
                onPress={handleInvestMore}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Invest More</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={handleWithdraw}
              >
                <Ionicons name="arrow-down-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.categorySelector}>
            <Pressable
              style={[
                styles.categoryButton,
                selectedCategory === 'yield' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('yield')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'yield' && styles.categoryButtonTextActive
              ]}>Savings</Text>
            </Pressable>
            <Pressable
              style={[
                styles.categoryButton,
                selectedCategory === 'crypto' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('crypto')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'crypto' && styles.categoryButtonTextActive
              ]}>Crypto</Text>
            </Pressable>
            <Pressable
              style={[
                styles.categoryButton,
                selectedCategory === 'stocks' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('stocks')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'stocks' && styles.categoryButtonTextActive
              ]}>Stocks</Text>
            </Pressable>
          </View>

          <View style={styles.assetList}>
            {INVESTMENT_OPTIONS[selectedCategory as keyof typeof INVESTMENT_OPTIONS].map(renderAssetCard)}
          </View>

          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Learn Before You Invest</Text>
            {FAQ_ITEMS.map((item, index) => (
              <Pressable
                key={index}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(expandedFaq === item.question ? null : item.question)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={expandedFaq === item.question ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#64748B"
                  />
                </View>
                {expandedFaq === item.question && (
                  <Animated.View
                    entering={FadeIn}
                    style={styles.faqContent}
                  >
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                    <Pressable 
                      style={styles.learnMoreButton}
                      onPress={() => handleLearnMore(item.learnMoreUrl)}
                    >
                      <Text style={styles.learnMoreText}>Learn More</Text>
                      <Ionicons name="arrow-forward" size={16} color="#2563eb" />
                    </Pressable>
                  </Animated.View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Learning guide modal */}
      {renderLearningGuide()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  portfolioCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
  },
  portfolioLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  portfolioStat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  investButton: {
    backgroundColor: '#22D3EE',
  },
  withdrawButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryButtonActive: {
    backgroundColor: '#020733',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  assetList: {
    gap: 12,
    marginBottom: 24,
  },
  assetCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  assetGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34,211,238,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetYield: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  faqSection: {
    gap: 12,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#020733',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    flex: 1,
    marginRight: 16,
  },
  faqContent: {
    marginTop: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guideContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#020733',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  guideContent: {
    maxHeight: 400,
  },
  guideText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 20,
  },
  guideTips: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});