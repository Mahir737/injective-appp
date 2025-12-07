import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Bell,
  Palette,
  Globe,
  Users,
  Download,
  Info,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Lock,
  Fingerprint,
  Key,
  X,
  Check,
  Plus,
} from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import { useSettings } from '@/context/SettingsContext';
import { useWallet } from '@/context/WalletContext';
import AsyncStorage from '@/utils/storage';

interface Contact {
  name: string;
  address: string;
}

export default function SettingsScreen() {
  const {
    theme,
    setTheme,
    notifications,
    setNotifications,
    biometrics,
    setBiometrics,
    language,
    setLanguage,
    glassIntensity,
    setGlassIntensity,
  } = useSettings();
  const { wallet } = useWallet();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleSetPassword = () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password set successfully');
    setShowSecurityModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setContacts([...contacts, { name: newContactName, address: newContactAddress }]);
    setNewContactName('');
    setNewContactAddress('');
    Alert.alert('Success', 'Contact added successfully');
  };

  const handleDeleteContact = (index: number) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

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
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={() => setShowSecurityModal(true)}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <Lock size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Password Protection</Text>
            </View>
            <ChevronRight size={20} color="#A3A3A3" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Fingerprint size={20} color="#38bdf8" />
              <Text style={styles.settingText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#3e3e3e', true: '#9E7FFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {wallet && (
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Key size={20} color="#f472b6" />
                <Text style={styles.settingText}>Backup Recovery Phrase</Text>
              </View>
              <ChevronRight size={20} color="#A3A3A3" />
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassCard style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#3e3e3e', true: '#9E7FFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={() => setShowAppearanceModal(true)}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <Palette size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Theme</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <ChevronRight size={20} color="#A3A3A3" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.glassIcon}>
                <Text style={styles.glassIconText}>◇</Text>
              </View>
              <Text style={styles.settingText}>Glass Intensity</Text>
            </View>
            <View style={styles.intensityButtons}>
              {['low', 'medium', 'high'].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setGlassIntensity(level as 'low' | 'medium' | 'high')}
                  style={[
                    styles.intensityButton,
                    glassIntensity === level && styles.intensityButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      glassIntensity === level && styles.intensityButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Language Section */}
        <Text style={styles.sectionTitle}>Language</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={() => setShowLanguageModal(true)}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <Globe size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {languages.find((l) => l.code === language)?.name || 'English'}
              </Text>
              <ChevronRight size={20} color="#A3A3A3" />
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* Contacts Section */}
        <Text style={styles.sectionTitle}>Address Book</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={() => setShowContactsModal(true)}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <Users size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Manage Contacts</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{contacts.length} contacts</Text>
              <ChevronRight size={20} color="#A3A3A3" />
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>Data</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity onPress={handleClearCache} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.settingText, { color: '#ef4444' }]}>
                Clear Cache
              </Text>
            </View>
            <ChevronRight size={20} color="#ef4444" />
          </TouchableOpacity>
        </GlassCard>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <GlassCard style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Info size={20} color="#9E7FFF" />
              <Text style={styles.settingText}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color="#38bdf8" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color="#A3A3A3" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Info size={20} color="#f472b6" />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color="#A3A3A3" />
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Security Modal */}
      <Modal visible={showSecurityModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security Settings</Text>
              <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#666"
                secureTextEntry
              />
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#666"
                secureTextEntry
              />
              <TouchableOpacity onPress={handleSetPassword} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#9E7FFF', '#38bdf8']}
                  style={styles.primaryButtonGradient}
                >
                  <Check size={24} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Set Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </BlurView>
        </View>
      </Modal>

      {/* Contacts Modal */}
      <Modal visible={showContactsModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Address Book</Text>
              <TouchableOpacity onPress={() => setShowContactsModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={newContactName}
                onChangeText={setNewContactName}
                placeholder="Contact name"
                placeholderTextColor="#666"
              />
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={newContactAddress}
                onChangeText={setNewContactAddress}
                placeholder="Wallet address"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={handleAddContact} style={styles.addContactButton}>
                <Plus size={20} color="#9E7FFF" />
                <Text style={styles.addContactText}>Add Contact</Text>
              </TouchableOpacity>

              {contacts.length > 0 && (
                <View style={styles.contactsList}>
                  <Text style={styles.contactsListTitle}>Saved Contacts</Text>
                  {contacts.map((contact, index) => (
                    <GlassCard key={index} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactAddress} numberOfLines={1}>
                          {contact.address}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteContact(index)}>
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </GlassCard>
                  ))}
                </View>
              )}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => {
                    setLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <GlassCard
                    style={[
                      styles.languageItem,
                      language === lang.code && styles.languageItemActive,
                    ]}
                  >
                    <Text style={styles.languageName}>{lang.name}</Text>
                    {language === lang.code && <Check size={20} color="#9E7FFF" />}
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>

      {/* Appearance Modal */}
      <Modal visible={showAppearanceModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appearance</Text>
              <TouchableOpacity onPress={() => setShowAppearanceModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => {
                  setTheme('dark');
                  setShowAppearanceModal(false);
                }}
              >
                <GlassCard
                  style={[
                    styles.themeOption,
                    theme === 'dark' && styles.themeOptionActive,
                  ]}
                >
                  <Moon size={24} color="#9E7FFF" />
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>Dark Mode</Text>
                    <Text style={styles.themeDescription}>
                      Easy on the eyes, perfect for night
                    </Text>
                  </View>
                  {theme === 'dark' && <Check size={20} color="#9E7FFF" />}
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTheme('light');
                  setShowAppearanceModal(false);
                }}
              >
                <GlassCard
                  style={[
                    styles.themeOption,
                    theme === 'light' && styles.themeOptionActive,
                  ]}
                >
                  <Sun size={24} color="#f59e0b" />
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>Light Mode</Text>
                    <Text style={styles.themeDescription}>
                      Bright and clear for daytime use
                    </Text>
                  </View>
                  {theme === 'light' && <Check size={20} color="#9E7FFF" />}
                </GlassCard>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A3A3A3',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsGroup: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(47, 47, 47, 0.5)',
    marginHorizontal: 16,
  },
  glassIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassIconText: {
    fontSize: 18,
    color: '#f472b6',
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  intensityButtonActive: {
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
  },
  intensityButtonText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontWeight: '600',
  },
  intensityButtonTextActive: {
    color: '#9E7FFF',
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
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
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
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#9E7FFF',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: 16,
    color: '#9E7FFF',
    fontWeight: '600',
  },
  contactsList: {
    marginTop: 24,
  },
  contactsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactAddress: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
  },
  languageItemActive: {
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  languageName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  themeOptionActive: {
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  themeDescription: {
    fontSize: 14,
    color: '#A3A3A3',
  },
});
