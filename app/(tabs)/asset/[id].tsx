import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

const ASSET_DATA = {
  'btc': {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 52341.23,
    change: 2.45,
    description: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.',
    marketCap: '990.6B',
    volume: '23.8B',
    circulatingSupply: '19.7M BTC',
    allTimeHigh: '$69,045 (Nov 10, 2021)',
    chartUrl: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9',
  },
  'eth': {
    name: 'Ethereum',
    symbol: 'ETH',
    price: 2843.12,
    change: -1.23,
    description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. Amongst cryptocurrencies, Ether is second only to Bitcoin in market capitalization.',
    marketCap: '340.7B',
    volume: '12.4B',
    circulatingSupply: '120.2M ETH',
    allTimeHigh: '$4,891 (Nov 16, 2021)',
    chartUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
  },
  'sol': {
    name: 'Solana',
    symbol: 'SOL',
    price: 108.45,
    change: 5.67,
    description: 'Solana is a public blockchain platform with smart contract functionality. Its native cryptocurrency is SOL. Solana achieves consensus using a proof-of-stake mechanism and a unique proof-of-history mechanism.',
    marketCap: '46.5B',
    volume: '2.1B',
    circulatingSupply: '429.8M SOL',
    allTimeHigh: '$259.96 (Nov 6, 2021)',
    chartUrl: 'https://images.unsplash.com/photo-1649742465637-ac1b4906b6b9',
  },
  'spy': {
    name: 'S&P 500 ETF',
    symbol: 'SPY',
    price: 478.12,
    change: 0.89,
    description: 'The SPDR S&P 500 ETF Trust is an exchange-traded fund which trades on the NYSE Arca under the ticker symbol SPY. It seeks to track the S&P 500 stock market index. This is the largest ETF in the world.',
    type: 'ETF',
    expense: '0.09%',
    dividendYield: '1.42%',
    aum: '$410.77B',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
  },
  'qqq': {
    name: 'Nasdaq 100 ETF',
    symbol: 'QQQ',
    price: 412.34,
    change: 1.12,
    description: 'The Invesco QQQ Trust is an exchange-traded fund that tracks the Nasdaq-100 Index. The index includes 100 of the largest non-financial companies listed on the Nasdaq exchange, with heavy weightings in technology sectors.',
    type: 'ETF',
    expense: '0.20%',
    dividendYield: '0.55%',
    aum: '$205.45B',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
  },
  'usdc-aave': {
    name: 'USDC on Aave',
    symbol: 'USDC',
    apy: 4.23,
    provider: 'Aave',
    description: 'Aave is a decentralized finance protocol that allows people to lend and borrow crypto across 20 different types of cryptocurrencies. By depositing USDC stablecoin on the Aave platform, users can earn yield on their holdings.',
    protocol: 'Aave v3',
    risk: 'Low',
    lockup: 'None',
    tvl: '1.2B USDC',
    chartUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
  },
  'usdc-comp': {
    name: 'USDC on Compound',
    symbol: 'USDC',
    apy: 3.89,
    provider: 'Compound',
    description: 'Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications. By depositing USDC stablecoin on the Compound platform, users can earn yield.',
    protocol: 'Compound v3',
    risk: 'Low',
    lockup: 'None',
    tvl: '983.5M USDC',
    chartUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
  },
};

const TimeframeOptions = ['1D', '1W', '1M', '3M', '1Y', 'All'];

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isInvestedIn, setIsInvestedIn] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const assetData = ASSET_DATA[id as keyof typeof ASSET_DATA];
        if (!assetData) {
          throw new Error('Asset not found');
        }
        
        setAsset(assetData);
        // Simulate user already having some investments
        setIsInvestedIn(['btc', 'eth', 'usdc-aave'].includes(id as string));
      } catch (err) {
        setError('Failed to load asset data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  const handleInvest = () => {
    router.push('/invest-modal');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !asset) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Asset not found'}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderCryptoDetails = () => (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>{asset.marketCap}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>24h Volume</Text>
          <Text style={styles.statValue}>{asset.volume}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Circulating Supply</Text>
          <Text style={styles.statValue}>{asset.circulatingSupply}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>All-Time High</Text>
        <Text style={styles.infoValue}>{asset.allTimeHigh}</Text>
      </View>
    </>
  );

  const renderETFDetails = () => (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Type</Text>
          <Text style={styles.statValue}>{asset.type}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Expense Ratio</Text>
          <Text style={styles.statValue}>{asset.expense}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Dividend Yield</Text>
          <Text style={styles.statValue}>{asset.dividendYield}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Assets Under Management</Text>
        <Text style={styles.infoValue}>{asset.aum}</Text>
      </View>
    </>
  );

  const renderYieldDetails = () => (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Protocol</Text>
          <Text style={styles.statValue}>{asset.protocol}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Risk Level</Text>
          <Text style={styles.statValue}>{asset.risk}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Lockup Period</Text>
          <Text style={styles.statValue}>{asset.lockup}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Total Value Locked</Text>
        <Text style={styles.infoValue}>{asset.tvl}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#020733" />
        </Pressable>
        
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{asset.name}</Text>
          <Text style={styles.assetSymbol}>{asset.symbol}</Text>
        </View>
        
        <Pressable style={styles.favoriteButton}>
          <Ionicons name="star-outline" size={24} color="#020733" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Animated.View 
          entering={FadeIn} 
          style={styles.priceSection}
        >
          {asset.price && (
            <>
              <Text style={styles.price}>${asset.price.toLocaleString()}</Text>
              <Text style={[
                styles.change,
                asset.change >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {asset.change >= 0 ? '+' : ''}{asset.change}%
              </Text>
            </>
          )}
          
          {asset.apy && (
            <>
              <Text style={styles.apyLabel}>Current APY</Text>
              <Text style={styles.apy}>{asset.apy}%</Text>
              <Text style={styles.provider}>via {asset.provider}</Text>
            </>
          )}
        </Animated.View>

        <View style={styles.chartContainer}>
          <View style={styles.timeframeOptions}>
            {TimeframeOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.timeframeOption,
                  selectedTimeframe === option && styles.selectedTimeframeOption
                ]}
                onPress={() => setSelectedTimeframe(option)}
              >
                <Text style={[
                  styles.timeframeText,
                  selectedTimeframe === option && styles.selectedTimeframeText
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <View style={styles.chart}>
            <Animated.Image
              entering={FadeIn.delay(300)}
              source={{ uri: asset.chartUrl }}
              style={styles.chartImage}
              resizeMode="cover"
            />
            <View style={styles.chartOverlay} />
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About {asset.name}</Text>
          <Text style={styles.description}>{asset.description}</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          {asset.marketCap && renderCryptoDetails()}
          {asset.type && renderETFDetails()}
          {asset.protocol && renderYieldDetails()}
        </View>

        {isInvestedIn && (
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>Your Investment</Text>
            <View style={styles.portfolioBox}>
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioLabel}>Current Value</Text>
                <Text style={styles.portfolioValue}>$243.78</Text>
              </View>
              <View style={styles.portfolioDetails}>
                <View style={styles.portfolioItem}>
                  <Text style={styles.portfolioItemLabel}>Quantity</Text>
                  <Text style={styles.portfolioItemValue}>
                    {asset.symbol === 'BTC' ? '0.00458 BTC' : 
                     asset.symbol === 'ETH' ? '0.0821 ETH' : 
                     asset.symbol === 'USDC' ? '200 USDC' : '0'}
                  </Text>
                </View>
                <View style={styles.portfolioItem}>
                  <Text style={styles.portfolioItemLabel}>Purchase Price</Text>
                  <Text style={styles.portfolioItemValue}>
                    {asset.symbol === 'BTC' ? '$51,234.10' : 
                     asset.symbol === 'ETH' ? '$2,912.45' : 
                     asset.symbol === 'USDC' ? '$1.00' : '$0'}
                  </Text>
                </View>
                <View style={styles.portfolioItem}>
                  <Text style={styles.portfolioItemLabel}>Profit/Loss</Text>
                  <Text style={[
                    styles.portfolioItemValue,
                    asset.change >= 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {asset.change >= 0 ? '+$5.12 (+2.18%)' : '-$2.34 (-0.95%)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          <Pressable onPress={handleInvest} style={styles.actionButton}>
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isInvestedIn ? 'Buy More' : 'Invest Now'}
            </Text>
          </Pressable>
          
          {isInvestedIn && (
            <Pressable style={[styles.actionButton, styles.sellButton]}>
              <Ionicons name="remove-circle" size={20} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.sellButtonText]}>
                Sell
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  assetInfo: {
    alignItems: 'center',
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020733',
  },
  assetSymbol: {
    fontSize: 14,
    color: '#64748b',
  },
  favoriteButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#020733',
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  apyLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  apy: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  provider: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
    marginBottom: 16,
  },
  timeframeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeframeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  selectedTimeframeOption: {
    backgroundColor: 'rgba(37,99,235,0.1)',
  },
  timeframeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedTimeframeText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  chart: {
    height: 200,
    position: 'relative',
  },
  chartImage: {
    width: '100%',
    height: '100%',
  },
  chartOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#020733',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#020733',
  },
  portfolioSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  portfolioBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioHeader: {
    padding: 16,
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020733',
  },
  portfolioDetails: {
    padding: 16,
  },
  portfolioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  portfolioItemLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  portfolioItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#020733',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sellButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  sellButtonText: {
    color: '#ef4444',
  },
});