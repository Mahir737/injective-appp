import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Initial fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Glow effect
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Text reveal
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Liquid motion
      Animated.loop(
        Animated.sequence([
          Animated.timing(liquidAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(liquidAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),
      // Exit animation
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  const liquidTranslateY = liquidAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const liquidScale = liquidAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated background orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            opacity: glowAnim,
            transform: [
              { translateY: liquidTranslateY },
              { scale: liquidScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            opacity: glowAnim,
            transform: [
              { translateY: Animated.multiply(liquidTranslateY, -1) },
              { scale: liquidScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            opacity: glowAnim,
            transform: [{ scale: liquidScale }],
          },
        ]}
      />

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { translateY: liquidTranslateY },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#9E7FFF', '#38bdf8', '#f472b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>INJ</Text>
          </LinearGradient>
          <Animated.View
            style={[
              styles.logoGlow,
              { opacity: glowAnim },
            ]}
          />
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <Text style={styles.titleText}>THE FUTURE</Text>
          <View style={styles.startsHereContainer}>
            <LinearGradient
              colors={['#9E7FFF', '#38bdf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startsHereGradient}
            >
              <Text style={styles.startsHereText}>STARTS HERE</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Liquid glass effect lines */}
        <Animated.View
          style={[
            styles.liquidLine,
            styles.liquidLine1,
            {
              opacity: glowAnim,
              transform: [{ translateX: liquidTranslateY }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.liquidLine,
            styles.liquidLine2,
            {
              opacity: glowAnim,
              transform: [{ translateX: Animated.multiply(liquidTranslateY, -1) }],
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(158, 127, 255, 0.15)',
    top: height * 0.1,
    left: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    bottom: height * 0.15,
    right: -80,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
    top: height * 0.4,
    right: width * 0.3,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 48,
    position: 'relative',
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(158, 127, 255, 0.3)',
    top: -20,
    left: -20,
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 8,
  },
  startsHereContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  startsHereGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startsHereText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  liquidLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(158, 127, 255, 0.3)',
    borderRadius: 1,
  },
  liquidLine1: {
    width: 100,
    top: -60,
    left: -50,
  },
  liquidLine2: {
    width: 80,
    bottom: -40,
    right: -30,
  },
});
