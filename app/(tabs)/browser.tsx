import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Plus,
  X,
  Bookmark,
  Clock,
  Search,
  Globe,
  Star,
  Trash2,
} from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import { usePoints } from '@/context/PointsContext';
import AsyncStorage from '@/utils/storage';

const { width, height } = Dimensions.get('window');

interface Tab {
  id: string;
  url: string;
  title: string;
}

interface BookmarkItem {
  url: string;
  title: string;
  favicon?: string;
}

interface HistoryItem {
  url: string;
  title: string;
  timestamp: number;
}

const QUICK_LINKS = [
  { name: 'Helix', url: 'https://helixapp.com/', icon: '🧬' },
  { name: 'Bridge', url: 'https://bridge.injective.network/', icon: '🌉' },
  { name: 'INJHub', url: 'https://injhub.com/', icon: '🏛️' },
  { name: 'Talis', url: 'https://injective.talis.art/', icon: '🖼️' },
  { name: 'Neptune', url: 'https://www.nept.finance/', icon: '🔱' },
  { name: 'Paradyze', url: 'https://paradyze.io/', icon: '🤖' },
];

export default function BrowserScreen() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: '', title: 'New Tab' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const webViewRef = useRef<WebView>(null);
  const { addPoints } = usePoints();
  const loadingAnim = useRef(new Animated.Value(0)).current;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    loadBookmarks();
    loadHistory();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [isLoading]);

  const loadBookmarks = async () => {
    try {
      const saved = await AsyncStorage.getItem('bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading bookmarks');
    }
  };

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading history');
    }
  };

  const saveBookmarks = async (newBookmarks: BookmarkItem[]) => {
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (e) {
      console.log('Error saving bookmarks');
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem('history', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.log('Error saving history');
    }
  };

  const navigateToUrl = (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url: finalUrl } : t
      )
    );
    setInputUrl(finalUrl);
    addPoints(5, 'browser_navigate');
  };

  const addToHistory = (url: string, title: string) => {
    const newItem: HistoryItem = {
      url,
      title,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history.filter((h) => h.url !== url)].slice(0, 100);
    saveHistory(newHistory);
  };

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);
    if (isBookmarked) {
      saveBookmarks(bookmarks.filter((b) => b.url !== activeTab.url));
    } else {
      saveBookmarks([...bookmarks, { url: activeTab.url, title: activeTab.title }]);
      addPoints(10, 'bookmark_add');
    }
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: '',
      title: 'New Tab',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl('');
    setShowTabs(false);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      setTabs([{ id: Date.now().toString(), url: '', title: 'New Tab' }]);
      setActiveTabId(tabs[0].id);
    } else {
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    }
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);

  const loadingTranslate = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#171717', '#1a1a2e', '#171717']}
        style={StyleSheet.absoluteFill}
      />

      {/* URL Bar */}
      <View style={styles.urlBarContainer}>
        <BlurView intensity={80} tint="dark" style={styles.urlBarBlur}>
          <View style={styles.urlBar}>
            <TouchableOpacity
              onPress={() => webViewRef.current?.goBack()}
              disabled={!canGoBack}
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            >
              <ArrowLeft size={20} color={canGoBack ? '#FFFFFF' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => webViewRef.current?.goForward()}
              disabled={!canGoForward}
              style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            >
              <ArrowRight size={20} color={canGoForward ? '#FFFFFF' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => webViewRef.current?.reload()}
              style={styles.navButton}
            >
              <RotateCcw size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.urlInputContainer}>
              <Search size={16} color="#A3A3A3" />
              <TextInput
                style={styles.urlInput}
                value={inputUrl}
                onChangeText={setInputUrl}
                onSubmitEditing={() => navigateToUrl(inputUrl)}
                placeholder="Search or enter URL"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {activeTab.url && (
                <TouchableOpacity onPress={toggleBookmark}>
                  <Star
                    size={18}
                    color={isBookmarked ? '#f59e0b' : '#A3A3A3'}
                    fill={isBookmarked ? '#f59e0b' : 'transparent'}
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowTabs(true)}
              style={styles.tabsButton}
            >
              <View style={styles.tabsCount}>
                <Text style={styles.tabsCountText}>{tabs.length}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingProgress,
                  { transform: [{ translateX: loadingTranslate }] },
                ]}
              />
            </View>
          )}
        </BlurView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          onPress={() => setShowBookmarks(true)}
          style={styles.quickAction}
        >
          <Bookmark size={18} color="#9E7FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowHistory(true)}
          style={styles.quickAction}
        >
          <Clock size={18} color="#38bdf8" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTabs((prev) =>
              prev.map((t) =>
                t.id === activeTabId ? { ...t, url: '' } : t
              )
            );
            setInputUrl('');
          }}
          style={styles.quickAction}
        >
          <Home size={18} color="#f472b6" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab.url ? (
        <WebView
          ref={webViewRef}
          source={{ uri: activeTab.url }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
            setInputUrl(navState.url);
            setTabs((prev) =>
              prev.map((t) =>
                t.id === activeTabId
                  ? { ...t, url: navState.url, title: navState.title || 'Loading...' }
                  : t
              )
            );
            if (navState.title && navState.url) {
              addToHistory(navState.url, navState.title);
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          allowsBackForwardNavigationGestures
        />
      ) : (
        <ScrollView
          style={styles.newTabContent}
          contentContainerStyle={styles.newTabContentContainer}
        >
          <Text style={styles.newTabTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            {QUICK_LINKS.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToUrl(link.url)}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.quickLinkCard}>
                  <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                  <Text style={styles.quickLinkName}>{link.name}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          {bookmarks.length > 0 && (
            <>
              <Text style={styles.newTabTitle}>Bookmarks</Text>
              {bookmarks.slice(0, 5).map((bookmark, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigateToUrl(bookmark.url)}
                >
                  <GlassCard style={styles.bookmarkItem}>
                    <Globe size={18} color="#9E7FFF" />
                    <View style={styles.bookmarkInfo}>
                      <Text style={styles.bookmarkTitle} numberOfLines={1}>
                        {bookmark.title}
                      </Text>
                      <Text style={styles.bookmarkUrl} numberOfLines={1}>
                        {bookmark.url}
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* Tabs Modal */}
      <Modal visible={showTabs} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tabs ({tabs.length})</Text>
              <TouchableOpacity onPress={() => setShowTabs(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tabsList}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => {
                    setActiveTabId(tab.id);
                    setInputUrl(tab.url);
                    setShowTabs(false);
                  }}
                >
                  <GlassCard
                    style={[
                      styles.tabItem,
                      tab.id === activeTabId && styles.tabItemActive,
                    ]}
                  >
                    <Globe size={18} color="#9E7FFF" />
                    <View style={styles.tabInfo}>
                      <Text style={styles.tabTitle} numberOfLines={1}>
                        {tab.title}
                      </Text>
                      <Text style={styles.tabUrl} numberOfLines={1}>
                        {tab.url || 'New Tab'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => closeTab(tab.id)}
                      style={styles.closeTabButton}
                    >
                      <X size={18} color="#A3A3A3" />
                    </TouchableOpacity>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={addNewTab} style={styles.addTabButton}>
              <LinearGradient
                colors={['#9E7FFF', '#38bdf8']}
                style={styles.addTabGradient}
              >
                <Plus size={24} color="#FFFFFF" />
                <Text style={styles.addTabText}>New Tab</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Bookmarks Modal */}
      <Modal visible={showBookmarks} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bookmarks</Text>
              <TouchableOpacity onPress={() => setShowBookmarks(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tabsList}>
              {bookmarks.length === 0 ? (
                <Text style={styles.emptyText}>No bookmarks yet</Text>
              ) : (
                bookmarks.map((bookmark, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      navigateToUrl(bookmark.url);
                      setShowBookmarks(false);
                    }}
                  >
                    <GlassCard style={styles.tabItem}>
                      <Star size={18} color="#f59e0b" fill="#f59e0b" />
                      <View style={styles.tabInfo}>
                        <Text style={styles.tabTitle} numberOfLines={1}>
                          {bookmark.title}
                        </Text>
                        <Text style={styles.tabUrl} numberOfLines={1}>
                          {bookmark.url}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          saveBookmarks(bookmarks.filter((b) => b.url !== bookmark.url))
                        }
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </GlassCard>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>History</Text>
              <View style={styles.modalHeaderActions}>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.tabsList}>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No history yet</Text>
              ) : (
                history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      navigateToUrl(item.url);
                      setShowHistory(false);
                    }}
                  >
                    <GlassCard style={styles.tabItem}>
                      <Clock size={18} color="#38bdf8" />
                      <View style={styles.tabInfo}>
                        <Text style={styles.tabTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.tabUrl} numberOfLines={1}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
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
  urlBarContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  urlBarBlur: {
    overflow: 'hidden',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  urlInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 14,
  },
  tabsButton: {
    padding: 8,
  },
  tabsCount: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '30%',
    backgroundColor: '#9E7FFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47, 47, 47, 0.5)',
  },
  quickAction: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  newTabContent: {
    flex: 1,
  },
  newTabContentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  newTabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickLinkCard: {
    width: (width - 56) / 3,
    padding: 16,
    alignItems: 'center',
  },
  quickLinkIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLinkName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookmarkUrl: {
    fontSize: 12,
    color: '#A3A3A3',
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsList: {
    flex: 1,
    padding: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  tabItemActive: {
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  tabInfo: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabUrl: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  closeTabButton: {
    padding: 4,
  },
  addTabButton: {
    margin: 16,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#A3A3A3',
    textAlign: 'center',
    marginTop: 40,
  },
});
