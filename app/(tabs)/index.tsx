import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Flame,
  Activity,
  Coins,
  ExternalLink,
  Award,
  Zap,
  Target,
  Trophy,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import SocialHub from '@/components/SocialHub';
import { usePoints } from '@/context/PointsContext';

const { width } = Dimensions.get('window');

interface InjectiveStats {
  price: number;
  priceChange24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  burnedSupply: number;
  volume24h: number;
}

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  url: string;
}

interface DApp {
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
}

const DAPPS: DApp[] = [
  {
    name: 'MultiVM',
    description: 'Cross-chain virtual machine',
    url: 'https://multivm.injective.com/',
    icon: '🔗',
    category: 'Infrastructure',
  },
  {
    name: 'Injective Bridge',
    description: 'Bridge assets across chains',
    url: 'https://bridge.injective.network/',
    icon: '🌉',
    category: 'Bridge',
  },
  {
    name: 'Paradyze',
    description: 'AI-powered perpetual DEX',
    url: 'https://paradyze.io/',
    icon: '🤖',
    category: 'Trading',
  },
  {
    name: 'Ninjablaze',
    description: 'Fast trading platform',
    url: 'https://blaze.ninja/',
    icon: '⚡',
    category: 'Trading',
  },
  {
    name: 'Hodlher',
    description: 'AI portfolio management',
    url: 'https://dapp.hodlher.ai/',
    icon: '💎',
    category: 'DeFi',
  },
  {
    name: 'Campclash',
    description: 'Gaming on Injective',
    url: 'https://www.campclash.fun/',
    icon: '🎮',
    category: 'Gaming',
  },
  {
    name: 'Neptune Finance',
    description: 'DeFi protocol',
    url: 'https://www.nept.finance/',
    icon: '🔱',
    category: 'DeFi',
  },
  {
    name: 'Hyperninja',
    description: 'Play-to-earn gaming',
    url: 'https://www.game.hyperninja.io/',
    icon: '🥷',
    category: 'Gaming',
  },
  {
    name: 'Talis',
    description: 'NFT Marketplace',
    url: 'https://injective.talis.art/',
    icon: '🖼️',
    category: 'NFT',
  },
  {
    name: 'INJHub',
    description: 'Staking & Governance',
    url: 'https://injhub.com/',
    icon: '🏛️',
    category: 'Staking',
  },
  {
    name: 'Helix',
    description: 'Trading & Swaps',
    url: 'https://helixapp.com/',
    icon: '🧬',
    category: 'Trading',
  },
  {
    name: 'Choice Exchange',
    description: 'Decentralized exchange',
    url: 'https://choice.exchange/',
    icon: '✨',
    category: 'Trading',
  },
];

const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    title: 'Injective Launches Revolutionary Cross-Chain Protocol',
    excerpt: 'A new era of interoperability begins with our latest protocol upgrade...',
    date: '2025-01-15',
    image: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=400',
    url: 'https://injective.com/blog/',
  },
  {
    title: 'INJ Token Burns Reach New Milestone',
    excerpt: 'Over 6 million INJ tokens have been burned, reducing total supply...',
    date: '2025-01-12',
    image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=400',
    url: 'https://injective.com/blog/',
  },
  {
    title: 'DeFi Innovation: New Yield Strategies',
    excerpt: 'Discover the latest yield optimization strategies on Injective...',
    date: '2025-01-10',
    image: 'https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg?auto=compress&cs=tinysrgb&w=400',
    url: 'https://injective.com/blog/',
  },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<InjectiveStats>({
    price: 24.56,
    priceChange24h: 5.23,
    marketCap: 2340000000,
    totalSupply: 100000000,
    circulatingSupply: 95000000,
    burnedSupply: 6200000,
    volume24h: 156000000,
  });
  const { points, level, streak, badges, addPoints } = usePoints();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    fetchStats();
  }, []);

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/injective-protocol'
      );
      const data = await response.json();
      setStats({
        price: data.market_data?.current_price?.usd || 24.56,
        priceChange24h: data.market_data?.price_change_percentage_24h || 5.23,
        marketCap: data.market_data?.market_cap?.usd || 2340000000,
        totalSupply: data.market_data?.total_supply || 100000000,
        circulatingSupply: data.market_data?.circulating_supply || 95000000,
        burnedSupply: 6200000,
        volume24h: data.market_data?.total_volume?.usd || 156000000,
      });
    } catch (error) {
      console.log('Using mock data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    addPoints(5, 'refresh');
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatSupply = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    return num.toLocaleString();
  };

  const openDApp = (url: string) => {
    Linking.openURL(url);
    addPoints(10, 'dapp_visit');
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#171717', '#1a1a2e', '#171717']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9E7FFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Injective</Text>
          <Text style={styles.headerSubtitle}>The Future of Finance</Text>
        </View>

        {/* Price Card */}
        <Animated.View style={[styles.priceCardContainer, { transform: [{ scale: pulseAnim }] }]}>
          <GlassCard style={styles.priceCard}>
            <Animated.View style={[styles.priceGlow, { opacity: glowOpacity }]} />
            <View style={styles.priceHeader}>
              <View style={styles.priceIconContainer}>
                <LinearGradient
                  colors={['#9E7FFF', '#38bdf8']}
                  style={styles.priceIconGradient}
                >
                  <Text style={styles.priceIcon}>INJ</Text>
                </LinearGradient>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>INJ Price</Text>
                <Text style={styles.priceValue}>${stats.price.toFixed(2)}</Text>
              </View>
              <View style={[
                styles.priceChange,
                { backgroundColor: stats.priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
              ]}>
                <TrendingUp
                  size={14}
                  color={stats.priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                  style={stats.priceChange24h < 0 ? { transform: [{ rotate: '180deg' }] } : {}}
                />
                <Text style={[
                  styles.priceChangeText,
                  { color: stats.priceChange24h >= 0 ? '#10b981' : '#ef4444' }
                ]}>
                  {stats.priceChange24h >= 0 ? '+' : ''}{stats.priceChange24h.toFixed(2)}%
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Coins size={20} color="#9E7FFF" />
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>{formatNumber(stats.marketCap)}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Activity size={20} color="#38bdf8" />
            <Text style={styles.statLabel}>24h Volume</Text>
            <Text style={styles.statValue}>{formatNumber(stats.volume24h)}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Zap size={20} color="#f472b6" />
            <Text style={styles.statLabel}>Circulating</Text>
            <Text style={styles.statValue}>{formatSupply(stats.circulatingSupply)}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Flame size={20} color="#f59e0b" />
            <Text style={styles.statLabel}>Burned</Text>
            <Text style={styles.statValue}>{formatSupply(stats.burnedSupply)}</Text>
          </GlassCard>
        </View>

        {/* Points & Gamification */}
        <View style={styles.sectionHeader}>
          <Trophy size={20} color="#9E7FFF" />
          <Text style={styles.sectionTitle}>Your Progress</Text>
        </View>
        <GlassCard style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>Total Points</Text>
              <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
            </View>
            <View style={styles.levelBadge}>
              <LinearGradient
                colors={['#9E7FFF', '#f472b6']}
                style={styles.levelGradient}
              >
                <Text style={styles.levelText}>Level {level}</Text>
              </LinearGradient>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#9E7FFF', '#38bdf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${(points % 1000) / 10}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{1000 - (points % 1000)} points to next level</Text>

          <View style={styles.streakContainer}>
            <Flame size={18} color="#f59e0b" />
            <Text style={styles.streakText}>{streak} Day Streak</Text>
          </View>

          <View style={styles.badgesContainer}>
            <Text style={styles.badgesTitle}>Badges Earned</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <LinearGradient
                    colors={['rgba(158, 127, 255, 0.3)', 'rgba(56, 189, 248, 0.3)']}
                    style={styles.badgeGradient}
                  >
                    <Award size={24} color="#9E7FFF" />
                  </LinearGradient>
                  <Text style={styles.badgeName}>{badge}</Text>
                </View>
              ))}
              {badges.length === 0 && (
                <Text style={styles.noBadges}>Complete actions to earn badges!</Text>
              )}
            </ScrollView>
          </View>
        </GlassCard>

        {/* DApps Section */}
        <View style={styles.sectionHeader}>
          <Target size={20} color="#9E7FFF" />
          <Text style={styles.sectionTitle}>Ecosystem DApps</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dappsContainer}
        >
          {DAPPS.map((dapp, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openDApp(dapp.url)}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.dappCard}>
                <View style={styles.dappIconContainer}>
                  <Text style={styles.dappIcon}>{dapp.icon}</Text>
                </View>
                <Text style={styles.dappName}>{dapp.name}</Text>
                <Text style={styles.dappDescription} numberOfLines={2}>
                  {dapp.description}
                </Text>
                <View style={styles.dappCategory}>
                  <Text style={styles.dappCategoryText}>{dapp.category}</Text>
                </View>
                <ExternalLink size={14} color="#A3A3A3" style={styles.dappLink} />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* News Section */}
        <View style={styles.sectionHeader}>
          <Star size={20} color="#9E7FFF" />
          <Text style={styles.sectionTitle}>Latest News</Text>
        </View>
        {MOCK_BLOG_POSTS.map((post, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => Linking.openURL(post.url)}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.newsCard}>
              <Image source={{ uri: post.image }} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <Text style={styles.newsDate}>{post.date}</Text>
                <Text style={styles.newsTitle}>{post.title}</Text>
                <Text style={styles.newsExcerpt} numberOfLines={2}>
                  {post.excerpt}
                </Text>
                <View style={styles.readMore}>
                  <Text style={styles.readMoreText}>Read More</Text>
                  <ChevronRight size={16} color="#9E7FFF" />
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <SocialHub />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    marginTop: 4,
  },
  priceCardContainer: {
    marginBottom: 20,
  },
  priceCard: {
    padding: 20,
    overflow: 'hidden',
  },
  priceGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#9E7FFF',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIconContainer: {
    marginRight: 16,
  },
  priceIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointsCard: {
    padding: 20,
    marginBottom: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsInfo: {},
  pointsLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelBadge: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  levelGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#A3A3A3',
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  badgesContainer: {
    marginTop: 8,
  },
  badgesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badge: {
    alignItems: 'center',
    marginRight: 16,
  },
  badgeGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 11,
    color: '#A3A3A3',
    textAlign: 'center',
    maxWidth: 70,
  },
  noBadges: {
    fontSize: 14,
    color: '#A3A3A3',
    fontStyle: 'italic',
  },
  dappsContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  dappCard: {
    width: 160,
    padding: 16,
    marginRight: 12,
  },
  dappIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dappIcon: {
    fontSize: 24,
  },
  dappName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dappDescription: {
    fontSize: 12,
    color: '#A3A3A3',
    marginBottom: 8,
    minHeight: 32,
  },
  dappCategory: {
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dappCategoryText: {
    fontSize: 10,
    color: '#9E7FFF',
    fontWeight: '600',
  },
  dappLink: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  newsCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
  },
  newsImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  newsContent: {
    flex: 1,
    marginLeft: 12,
  },
  newsDate: {
    fontSize: 11,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  newsExcerpt: {
    fontSize: 12,
    color: '#A3A3A3',
    marginBottom: 8,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    color: '#9E7FFF',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 120,
  },
});
