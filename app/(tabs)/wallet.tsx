import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  Plus,
  Import,
  Send,
  ArrowDownLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Shield,
  Key,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import { useWallet } from '@/context/WalletContext';
import { usePoints } from '@/context/PointsContext';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  token: string;
  address: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    amount: '10.5',
    token: 'INJ',
    address: 'inj1abc...xyz',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'send',
    amount: '5.0',
    token: 'INJ',
    address: 'inj1def...uvw',
    timestamp: Date.now() - 7200000,
    status: 'confirmed',
  },
  {
    id: '3',
    type: 'receive',
    amount: '100',
    token: 'USDT',
    address: 'inj1ghi...rst',
    timestamp: Date.now() - 86400000,
    status: 'confirmed',
  },
];

const MOCK_NFTS: NFT[] = [
  {
    id: '1',
    name: 'Ninja #1234',
    collection: 'Injective Ninjas',
    image: 'https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '2',
    name: 'Cosmic Warrior',
    collection: 'INJ Warriors',
    image: 'https://images.pexels.com/photos/8369520/pexels-photo-8369520.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export default function WalletScreen() {
  const {
    wallet,
    balance,
    tokens,
    createWallet,
    importWallet,
    deleteWallet,
    refreshBalance,
  } = useWallet();
  const { addPoints } = usePoints();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('INJ');
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newMnemonic, setNewMnemonic] = useState<string[]>([]);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    await refreshBalance();
    addPoints(5, 'wallet_refresh');

    setTimeout(() => {
      setIsRefreshing(false);
      rotateAnim.setValue(0);
    }, 1000);
  };

  const handleCreateWallet = async () => {
    const mnemonic = await createWallet();
    if (mnemonic) {
      setNewMnemonic(mnemonic.split(' '));
      addPoints(100, 'wallet_create');
    }
  };

  const handleImportWallet = async () => {
    if (importMnemonic.trim().split(' ').length < 12) {
      Alert.alert('Error', 'Please enter a valid 12 or 24 word mnemonic');
      return;
    }
    const success = await importWallet(importMnemonic.trim());
    if (success) {
      setShowImportModal(false);
      setImportMnemonic('');
      addPoints(50, 'wallet_import');
    }
  };

  const handleSend = async () => {
    if (!sendAddress || !sendAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Mock send transaction
    Alert.alert('Success', `Sent ${sendAmount} ${selectedToken} to ${sendAddress}`);
    setShowSendModal(false);
    setSendAddress('');
    setSendAmount('');
    addPoints(20, 'transaction_send');
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (!wallet) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#171717', '#1a1a2e', '#171717']}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.noWalletContent}
        >
          <Animated.View style={[styles.walletIconContainer, { opacity: glowOpacity }]}>
            <LinearGradient
              colors={['#9E7FFF', '#38bdf8']}
              style={styles.walletIconGradient}
            >
              <Wallet size={64} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.noWalletTitle}>Welcome to Injective Wallet</Text>
          <Text style={styles.noWalletSubtitle}>
            Create a new wallet or import an existing one to get started
          </Text>

          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={['#9E7FFF', '#38bdf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Create New Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowImportModal(true)}
            style={styles.secondaryButton}
          >
            <Import size={24} color="#9E7FFF" />
            <Text style={styles.secondaryButtonText}>Import Existing Wallet</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Create Wallet Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Wallet</Text>
                <TouchableOpacity onPress={() => {
                  setShowCreateModal(false);
                  setNewMnemonic([]);
                }}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {newMnemonic.length === 0 ? (
                <View style={styles.modalContent}>
                  <View style={styles.warningBox}>
                    <Shield size={24} color="#f59e0b" />
                    <Text style={styles.warningText}>
                      Your recovery phrase is the only way to recover your wallet.
                      Write it down and store it in a safe place.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCreateWallet}
                    style={styles.primaryButton}
                  >
                    <LinearGradient
                      colors={['#9E7FFF', '#38bdf8']}
                      style={styles.primaryButtonGradient}
                    >
                      <Key size={24} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Generate Wallet</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.mnemonicTitle}>Your Recovery Phrase</Text>
                  <View style={styles.mnemonicGrid}>
                    {newMnemonic.map((word, index) => (
                      <View key={index} style={styles.mnemonicWord}>
                        <Text style={styles.mnemonicIndex}>{index + 1}</Text>
                        <Text style={styles.mnemonicText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(newMnemonic.join(' '))}
                    style={styles.copyButton}
                  >
                    <Copy size={18} color="#9E7FFF" />
                    <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCreateModal(false);
                      setNewMnemonic([]);
                    }}
                    style={styles.primaryButton}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.primaryButtonGradient}
                    >
                      <Check size={24} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>I've Saved It</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </BlurView>
          </View>
        </Modal>

        {/* Import Wallet Modal */}
        <Modal visible={showImportModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Import Wallet</Text>
                <TouchableOpacity onPress={() => setShowImportModal(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>Recovery Phrase</Text>
                <TextInput
                  style={styles.mnemonicInput}
                  value={importMnemonic}
                  onChangeText={setImportMnemonic}
                  placeholder="Enter your 12 or 24 word recovery phrase"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={handleImportWallet}
                  style={styles.primaryButton}
                >
                  <LinearGradient
                    colors={['#9E7FFF', '#38bdf8']}
                    style={styles.primaryButtonGradient}
                  >
                    <Import size={24} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Import Wallet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#171717', '#1a1a2e', '#171717']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <GlassCard style={styles.balanceCard}>
          <Animated.View style={[styles.balanceGlow, { opacity: glowOpacity }]} />
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <RefreshCw size={20} color="#A3A3A3" />
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1}>
              {wallet.address}
            </Text>
            <TouchableOpacity onPress={() => copyToClipboard(wallet.address)}>
              <Copy size={16} color="#A3A3A3" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => setShowSendModal(true)}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={['#9E7FFF', '#38bdf8']}
                style={styles.actionButtonGradient}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowReceiveModal(true)}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={['#38bdf8', '#9E7FFF']}
                style={styles.actionButtonGradient}
              >
                <ArrowDownLeft size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['tokens', 'nfts', 'activity'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'tokens' && (
          <View style={styles.tokensList}>
            {tokens.map((token, index) => (
              <GlassCard key={index} style={styles.tokenItem}>
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenIconText}>
                    {token.symbol.charAt(0)}
                  </Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                </View>
                <View style={styles.tokenBalance}>
                  <Text style={styles.tokenAmount}>{token.balance}</Text>
                  <Text style={styles.tokenValue}>${token.value.toFixed(2)}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'nfts' && (
          <View style={styles.nftsGrid}>
            {MOCK_NFTS.map((nft) => (
              <GlassCard key={nft.id} style={styles.nftCard}>
                <View style={styles.nftImagePlaceholder}>
                  <ImageIcon size={32} color="#A3A3A3" />
                </View>
                <Text style={styles.nftName}>{nft.name}</Text>
                <Text style={styles.nftCollection}>{nft.collection}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.activityList}>
            {MOCK_TRANSACTIONS.map((tx) => (
              <GlassCard key={tx.id} style={styles.txItem}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.type === 'receive'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                    },
                  ]}
                >
                  {tx.type === 'receive' ? (
                    <TrendingDown size={20} color="#10b981" />
                  ) : (
                    <TrendingUp size={20} color="#ef4444" />
                  )}
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>
                    {tx.type === 'receive' ? 'Received' : 'Sent'}
                  </Text>
                  <Text style={styles.txAddress}>{tx.address}</Text>
                </View>
                <View style={styles.txAmount}>
                  <Text
                    style={[
                      styles.txAmountText,
                      { color: tx.type === 'receive' ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {tx.type === 'receive' ? '+' : '-'}
                    {tx.amount} {tx.token}
                  </Text>
                  <Text style={styles.txTime}>
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Security Section */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity onPress={() => setShowMnemonic(!showMnemonic)}>
            <GlassCard style={styles.securityItem}>
              <Key size={20} color="#9E7FFF" />
              <Text style={styles.securityItemText}>View Recovery Phrase</Text>
              {showMnemonic ? (
                <EyeOff size={20} color="#A3A3A3" />
              ) : (
                <Eye size={20} color="#A3A3A3" />
              )}
            </GlassCard>
          </TouchableOpacity>
          {showMnemonic && (
            <GlassCard style={styles.mnemonicDisplay}>
              <Text style={styles.mnemonicDisplayText}>{wallet.mnemonic}</Text>
            </GlassCard>
          )}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Wallet',
                'Are you sure you want to delete this wallet? Make sure you have backed up your recovery phrase.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: deleteWallet,
                  },
                ]
              );
            }}
          >
            <GlassCard style={[styles.securityItem, styles.dangerItem]}>
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.securityItemText, { color: '#ef4444' }]}>
                Delete Wallet
              </Text>
              <ChevronRight size={20} color="#ef4444" />
            </GlassCard>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Send Modal */}
      <Modal visible={showSendModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send</Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Recipient Address</Text>
              <TextInput
                style={styles.input}
                value={sendAddress}
                onChangeText={setSendAddress}
                placeholder="Enter address"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={sendAmount}
                  onChangeText={setSendAmount}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity style={styles.tokenSelector}>
                  <Text style={styles.tokenSelectorText}>{selectedToken}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSend} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#9E7FFF', '#38bdf8']}
                  style={styles.primaryButtonGradient}
                >
                  <Send size={24} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Receive Modal */}
      <Modal visible={showReceiveModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receive</Text>
              <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>QR Code</Text>
              </View>
              <Text style={styles.receiveAddress}>{wallet.address}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(wallet.address)}
                style={styles.copyAddressButton}
              >
                <Copy size={18} color="#9E7FFF" />
                <Text style={styles.copyAddressText}>Copy Address</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  noWalletContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  walletIconContainer: {
    marginBottom: 32,
  },
  walletIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWalletTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  noWalletSubtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#9E7FFF',
    borderRadius: 16,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9E7FFF',
  },
  balanceCard: {
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  balanceGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#9E7FFF',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addressText: {
    fontSize: 14,
    color: '#A3A3A3',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#9E7FFF',
  },
  tokensList: {
    gap: 12,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9E7FFF',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenValue: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  nftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nftCard: {
    width: (width - 44) / 2,
    padding: 12,
  },
  nftImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nftCollection: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  activityList: {
    gap: 12,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  txAddress: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  txTime: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  securitySection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  securityItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  mnemonicDisplay: {
    padding: 16,
    marginBottom: 8,
  },
  mnemonicDisplayText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 120,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBlur: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47, 47, 47, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#f59e0b',
    lineHeight: 20,
  },
  mnemonicTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  mnemonicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  mnemonicWord: {
    width: (width - 56) / 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  mnemonicIndex: {
    fontSize: 12,
    color: '#A3A3A3',
    width: 20,
  },
  mnemonicText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#9E7FFF',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  mnemonicInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tokenSelector: {
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  tokenSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9E7FFF',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  qrPlaceholderText: {
    fontSize: 16,
    color: '#171717',
  },
  receiveAddress: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  copyAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(158, 127, 255, 0.1)',
    borderRadius: 12,
  },
  copyAddressText: {
    fontSize: 16,
    color: '#9E7FFF',
    fontWeight: '600',
  },
});
