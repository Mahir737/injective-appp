import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  MessageCircle,
  Twitter,
  Github,
  Youtube,
  Send,
  Globe,
  X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SOCIAL_LINKS = [
  {
    name: 'Discord',
    url: 'https://discord.com/invite/NK4qdbv',
    icon: MessageCircle,
    color: '#5865F2',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/Injective',
    icon: Twitter,
    color: '#1DA1F2',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/InjectiveLabs',
    icon: Github,
    color: '#FFFFFF',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCN99m0dicoMjNmJV9mxioqQ',
    icon: Youtube,
    color: '#FF0000',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/joininjective',
    icon: Send,
    color: '#0088cc',
  },
  {
    name: 'Website',
    url: 'https://injective.com/',
    icon: Globe,
    color: '#9E7FFF',
  },
];

export default function SocialHub() {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(SOCIAL_LINKS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isExpanded) {
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        ...itemAnims.map((anim, index) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            delay: index * 50,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        ...itemAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [isExpanded]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Expanded menu */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: expandAnim,
              transform: [
                {
                  translateY: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView intensity={80} tint="dark" style={styles.menuBlur}>
            {SOCIAL_LINKS.map((link, index) => {
              const Icon = link.icon;
              return (
                <Animated.View
                  key={link.name}
                  style={{
                    opacity: itemAnims[index],
                    transform: [
                      {
                        translateX: itemAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => openLink(link.url)}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.menuIconContainer,
                        { backgroundColor: `${link.color}20` },
                      ]}
                    >
                      <Icon size={20} color={link.color} />
                    </View>
                    <Text style={styles.menuItemText}>{link.name}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </BlurView>
        </Animated.View>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
        style={styles.fabContainer}
      >
        <LinearGradient
          colors={['#9E7FFF', '#38bdf8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            {isExpanded ? (
              <X size={24} color="#FFFFFF" />
            ) : (
              <MessageCircle size={24} color="#FFFFFF" />
            )}
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuBlur: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fabContainer: {
    shadowColor: '#9E7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
