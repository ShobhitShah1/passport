import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const LoadingDots = () => {
  const dot1 = useSharedValue(0.6);
  const dot2 = useSharedValue(0.6);
  const dot3 = useSharedValue(0.6);

  useEffect(() => {
    const animateDot = (dot: Animated.SharedValue<number>, delay: number) => {
      dot.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.6, { duration: 400 })
        ),
        -1
      );
    };

    setTimeout(() => animateDot(dot1, 0), 0);
    setTimeout(() => animateDot(dot2, 200), 200);
    setTimeout(() => animateDot(dot3, 400), 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: dot3.value }],
  }));

  return (
    <View style={styles.loadingDots}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

export default function SplashScreen() {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });

    // Title fade in after logo
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
    }, 400);

    // Continuous pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1
    );

    // Glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000 }),
        withTiming(0.1, { duration: 2000 })
      ),
      -1
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a1b', '#0a0a0b']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated glow background */}
      <Animated.View style={[styles.glowBackground, glowAnimatedStyle]}>
        <LinearGradient
          colors={['transparent', Colors.dark.electricBlue + '20', 'transparent']}
          style={styles.glow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <View style={styles.content}>
        {/* Main logo container with pulse effect */}
        <Animated.View style={[styles.logoContainer, pulseAnimatedStyle]}>
          <Animated.View style={[styles.logo, logoAnimatedStyle]}>
            {/* Minimalist P logo */}
            <View style={styles.logoShape}>
              <LinearGradient
                colors={[Colors.dark.electricBlue, Colors.dark.purpleGlow]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoText}>P</Text>
              </LinearGradient>
            </View>

            {/* Subtle ring around logo */}
            <View style={styles.logoRing} />
          </Animated.View>
        </Animated.View>

        {/* App title */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.title}>PASSPORT</Text>
          <Text style={styles.subtitle}>Secure Password Manager</Text>
        </Animated.View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <LoadingDots />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShape: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.dark.electricBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.dark.electricBlue + '40',
    top: -10,
    left: -10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    fontFamily: 'SpaceMono',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '400',
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.electricBlue,
    opacity: 0.6,
  },
});