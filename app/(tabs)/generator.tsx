import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Defs,
  G,
  Path,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useNavigationOptimization } from "@/hooks/useNavigationOptimization";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// Optimized Hexagonal Grid Background
const HexGrid = React.memo(() => {
  const hexSize = 60; // Increased size to reduce count
  const cols = Math.ceil(screenWidth / (hexSize * 0.75));
  const rows = Math.ceil(screenHeight / (hexSize * 0.866));

  // Limit total hexagons for performance
  const maxHexagons = 40;

  const hexagonPoints = React.useCallback(
    (cx: number, cy: number, size: number) => {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return points.join(" ");
    },
    []
  );

  const hexagons = React.useMemo(() => {
    const result = [];
    let count = 0;

    for (let row = 0; row < rows && count < maxHexagons; row++) {
      for (let col = 0; col < cols && count < maxHexagons; col++) {
        // Skip more hexagons for better performance
        if (Math.random() > 0.25) continue;

        const x = col * hexSize * 0.75;
        const y = row * hexSize * 0.866 + (col % 2) * (hexSize * 0.433);
        const opacity = Math.random() * 0.5 + 0.1;

        result.push({
          key: `hex-${row}-${col}`,
          points: hexagonPoints(x, y, hexSize * 0.4),
          opacity,
        });
        count++;
      }
    }
    return result;
  }, [hexagonPoints]);

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <SvgLinearGradient id="hexGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop
            offset="0%"
            stopColor={Colors.dark.primary}
            stopOpacity="0.15"
          />
          <Stop
            offset="50%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.08"
          />
          <Stop
            offset="100%"
            stopColor={Colors.dark.secondary}
            stopOpacity="0.12"
          />
        </SvgLinearGradient>
        <SvgLinearGradient id="hexBorder" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.3" />
          <Stop
            offset="100%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.2"
          />
        </SvgLinearGradient>
      </Defs>

      {hexagons.map((hex) => (
        <G key={hex.key} opacity={hex.opacity}>
          <Polygon
            points={hex.points}
            fill="url(#hexGradient)"
            stroke="url(#hexBorder)"
            strokeWidth="0.5"
          />
        </G>
      ))}
    </Svg>
  );
});

// Optimized Floating Particles with Reanimated
const FloatingParticles = React.memo(() => {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        // Reduced from 12 to 6
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 3000 + 5000, // Slower for better performance
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle, index) => (
        <AnimatedParticle key={index} particle={particle} />
      ))}
    </View>
  );
});

const AnimatedParticle = React.memo(({ particle }: { particle: any }) => {
  const translateX = useSharedValue(particle.x);
  const translateY = useSharedValue(particle.y);
  const opacity = useSharedValue(Math.random() * 0.8 + 0.2);

  useEffect(() => {
    // Start continuous animations with better performance
    translateX.value = withRepeat(
      withTiming(Math.random() * screenWidth, {
        duration: particle.speed,
      }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(Math.random() * screenHeight, {
        duration: particle.speed + 2000, // Slower
      }),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000 }), // Slower opacity changes
        withTiming(0.2, { duration: 3000 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
        },
        animatedStyle,
      ]}
    />
  );
});

export default function GeneratorScreen() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const insets = useSafeAreaInsets();
  const { shouldRenderAnimations } = useNavigationOptimization();

  // Optimized password generation with proper threading
  const generatePassword = React.useCallback(() => {
    const chars = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    let charset = "";
    if (options.uppercase) charset += chars.uppercase;
    if (options.lowercase) charset += chars.lowercase;
    if (options.numbers) charset += chars.numbers;
    if (options.symbols) charset += chars.symbols;

    if (!charset) {
      Alert.alert("Error", "Please select at least one character type");
      return;
    }

    // Use setTimeout to avoid blocking the UI thread for complex generation
    setTimeout(() => {
      let newPassword = "";
      for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(
          Math.floor(Math.random() * charset.length)
        );
      }
      setPassword(newPassword);
    }, 0);
  }, [length, options]);

  const copyToClipboard = () => {
    if (password) {
      // Clipboard.setString(password);
      Alert.alert("Success", "Password copied to clipboard!");
    }
  };

  const getStrengthColor = () => {
    if (length < 8) return Colors.dark.error;
    if (length < 12) return Colors.dark.warning;
    return Colors.dark.neonGreen;
  };

  const getStrengthText = () => {
    if (length < 8) return "WEAK";
    if (length < 12) return "MODERATE";
    return "QUANTUM";
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  // Holographic Container Component with Reanimated
  const HoloContainer = ({
    children,
    title,
    icon,
    style = {},
  }: {
    children: React.ReactNode;
    title?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: any;
  }) => {
    const glowOpacity = useSharedValue(0.2);

    useEffect(() => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.2, { duration: 2000 })
        ),
        -1,
        true
      );

      return () => {
        cancelAnimation(glowOpacity);
      };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      shadowOpacity: glowOpacity.value,
    }));

    return (
      <Animated.View style={[styles.holoContainer, animatedStyle, style]}>
        <View style={styles.holoContainerBg}>
          {/* Corner Brackets */}
          <Svg
            width={20}
            height={20}
            style={[styles.cornerBracket, styles.topLeft]}
          >
            <Path
              d="M0,15 L0,0 L15,0"
              stroke={Colors.dark.primary}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
          <Svg
            width={20}
            height={20}
            style={[styles.cornerBracket, styles.topRight]}
          >
            <Path
              d="M5,0 L20,0 L20,15"
              stroke={Colors.dark.primary}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
          <Svg
            width={20}
            height={20}
            style={[styles.cornerBracket, styles.bottomLeft]}
          >
            <Path
              d="M0,5 L0,20 L15,20"
              stroke={Colors.dark.primary}
              strokeWidth="2"
              fill="none"
            />
          </Svg>
          <Svg
            width={20}
            height={20}
            style={[styles.cornerBracket, styles.bottomRight]}
          >
            <Path
              d="M5,20 L20,20 L20,5"
              stroke={Colors.dark.primary}
              strokeWidth="2"
              fill="none"
            />
          </Svg>

          {title && (
            <View style={styles.holoHeader}>
              {icon && (
                <Ionicons name={icon} size={20} color={Colors.dark.neonGreen} />
              )}
              <Text style={styles.holoTitle}>{title}</Text>
              <View style={styles.holoLine} />
            </View>
          )}

          <View style={styles.holoContent}>{children}</View>
        </View>
      </Animated.View>
    );
  };

  const OptionToggle = ({
    label,
    icon,
    enabled,
    onToggle,
  }: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    enabled: boolean;
    onToggle: () => void;
  }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const handlePress = () => {
      "worklet";
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );

      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );

      // Use runOnJS to call the toggle function
      runOnJS(onToggle)();
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: glowOpacity.value,
    }));

    return (
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            { flexDirection: "row", alignItems: "center", flex: 1, gap: 16 },
            animatedStyle,
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={enabled ? Colors.dark.neonGreen : Colors.dark.textMuted}
          />
          <Text
            style={[
              styles.optionText,
              { color: enabled ? Colors.dark.text : Colors.dark.textMuted },
            ]}
          >
            {label.toUpperCase()}
          </Text>
          <View
            style={[
              styles.toggleDot,
              {
                backgroundColor: enabled
                  ? Colors.dark.neonGreen
                  : Colors.dark.surfaceVariant,
                shadowColor: enabled ? Colors.dark.neonGreen : "transparent",
                shadowOpacity: enabled ? 0.8 : 0,
                shadowRadius: enabled ? 4 : 0,
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const LengthButton = ({
    value,
    onPress,
  }: {
    value: number;
    onPress: () => void;
  }) => {
    const isSelected = length === value;
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const handlePress = () => {
      "worklet";
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );

      glowOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );

      runOnJS(onPress)();
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: isSelected ? 0.6 : glowOpacity.value,
    }));

    return (
      <ReachPressable
        style={[
          styles.lengthButton,
          {
            backgroundColor: isSelected
              ? Colors.dark.neonGreen
              : "rgba(255, 255, 255, 0.1)",
            borderColor: isSelected
              ? Colors.dark.primary
              : "rgba(255, 255, 255, 0.3)",
          },
        ]}
        onPress={handlePress}
        reachScale={1.05}
        pressScale={0.95}
      >
        <Animated.View style={[styles.lengthButtonContent, animatedStyle]}>
          <Text
            style={[
              styles.lengthButtonText,
              {
                color: isSelected ? Colors.dark.background : Colors.dark.text,
                fontWeight: isSelected ? "800" : "600",
              },
            ]}
          >
            {value}
          </Text>
        </Animated.View>
      </ReachPressable>
    );
  };

  // Generate button animation
  const generateButtonScale = useSharedValue(1);
  const generateButtonGlow = useSharedValue(0.8);

  const handleGeneratePress = () => {
    "worklet";
    generateButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    generateButtonGlow.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(0.8, { duration: 300 })
    );

    runOnJS(generatePassword)();
  };

  const generateButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: generateButtonScale.value }],
    shadowOpacity: generateButtonGlow.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {shouldRenderAnimations && <HexGrid />}
      {shouldRenderAnimations && <FloatingParticles />}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Holographic Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Defs>
                <SvgLinearGradient
                  id="headerHexGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0%" stopColor={Colors.dark.primary} />
                  <Stop offset="50%" stopColor={Colors.dark.neonGreen} />
                  <Stop offset="100%" stopColor={Colors.dark.secondary} />
                </SvgLinearGradient>
              </Defs>
              <Polygon
                points="60,15 95,37.5 95,82.5 60,105 25,82.5 25,37.5"
                stroke="url(#headerHexGradient)"
                strokeWidth="3"
                fill="rgba(0, 212, 255, 0.1)"
                opacity={0.8}
              />
              <Polygon
                points="60,25 85,42.5 85,77.5 60,95 35,77.5 35,42.5"
                stroke="url(#headerHexGradient)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
            </Svg>
            <Ionicons
              name="flash"
              size={50}
              color={Colors.dark.neonGreen}
              style={styles.headerIcon}
            />
          </View>
          <Text style={styles.title}>QUANTUM KEY GENERATOR</Text>
          <Text style={styles.subtitle}>
            Neural Password Generation System v2.1
          </Text>
        </View>

        {/* Password Display Container */}
        <HoloContainer title="GENERATED NEURAL KEY" icon="key">
          <View style={styles.passwordDisplay}>
            <Text style={styles.passwordText} numberOfLines={3} selectable>
              {password || "⚡ Initialize quantum generation protocol..."}
            </Text>
            <View style={styles.passwordStrength}>
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>SECURITY LEVEL:</Text>
                <Text
                  style={[styles.strengthValue, { color: getStrengthColor() }]}
                >
                  {getStrengthText()}
                </Text>
              </View>
              <View
                style={[
                  styles.strengthBar,
                  { backgroundColor: getStrengthColor() },
                ]}
              />
            </View>
          </View>

          <View style={styles.passwordActions}>
            <ReachPressable
              style={[styles.actionButton, { opacity: password ? 1 : 0.5 }]}
              onPress={copyToClipboard}
              disabled={!password}
              reachScale={1.02}
              pressScale={0.98}
            >
              <LinearGradient
                colors={
                  password
                    ? ["rgba(0, 212, 255, 0.2)", "rgba(0, 212, 255, 0.4)"]
                    : ["rgba(26, 26, 27, 0.8)", "rgba(26, 26, 27, 0.8)"]
                }
                style={styles.actionButtonGradient}
              >
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={password ? Colors.dark.primary : Colors.dark.textMuted}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: password
                        ? Colors.dark.primary
                        : Colors.dark.textMuted,
                    },
                  ]}
                >
                  COPY KEY
                </Text>
              </LinearGradient>
            </ReachPressable>

            <ReachPressable
              style={styles.actionButton}
              onPress={generatePassword}
              reachScale={1.02}
              pressScale={0.98}
            >
              <LinearGradient
                colors={["rgba(0, 255, 136, 0.2)", "rgba(0, 255, 136, 0.4)"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={Colors.dark.neonGreen}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: Colors.dark.neonGreen },
                  ]}
                >
                  REGENERATE
                </Text>
              </LinearGradient>
            </ReachPressable>
          </View>
        </HoloContainer>

        {/* Length Selection */}
        <HoloContainer title="KEY LENGTH MATRIX" icon="resize">
          <View style={styles.lengthOptions}>
            {[8, 12, 16, 20, 24].map((value) => (
              <LengthButton
                key={value}
                value={value}
                onPress={() => setLength(value)}
              />
            ))}
          </View>
        </HoloContainer>

        {/* Character Options */}
        <HoloContainer title="ENCRYPTION PROTOCOLS" icon="construct">
          <View style={styles.optionsGrid}>
            <OptionToggle
              label="Alpha-Upper"
              icon="chevron-up-circle"
              enabled={options.uppercase}
              onToggle={() =>
                setOptions((prev) => ({ ...prev, uppercase: !prev.uppercase }))
              }
            />
            <OptionToggle
              label="Alpha-Lower"
              icon="chevron-down-circle"
              enabled={options.lowercase}
              onToggle={() =>
                setOptions((prev) => ({ ...prev, lowercase: !prev.lowercase }))
              }
            />
            <OptionToggle
              label="Numeric"
              icon="calculator"
              enabled={options.numbers}
              onToggle={() =>
                setOptions((prev) => ({ ...prev, numbers: !prev.numbers }))
              }
            />
            <OptionToggle
              label="Special-Chars"
              icon="construct"
              enabled={options.symbols}
              onToggle={() =>
                setOptions((prev) => ({ ...prev, symbols: !prev.symbols }))
              }
            />
          </View>
        </HoloContainer>

        {/* Generate Button */}
        <ReachPressable
          style={styles.generateButton}
          onPress={handleGeneratePress}
          reachScale={1}
          pressScale={1}
        >
          <Animated.View style={[generateButtonAnimatedStyle]}>
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.neonGreen]}
              style={styles.generateGradient}
            >
              <Ionicons name="flash" size={28} color={Colors.dark.background} />
              <Text style={styles.generateButtonText}>
                GENERATE QUANTUM KEY
              </Text>
            </LinearGradient>
          </Animated.View>
        </ReachPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  headerIcon: {
    position: "absolute",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.primary,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 1,
  },
  // Holographic Container Styles
  holoContainer: {
    marginBottom: 24,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  holoContainerBg: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surface,
    position: "relative",
    overflow: "hidden",
  },
  cornerBracket: {
    position: "absolute",
  },
  topLeft: { top: -2, left: -2 },
  topRight: { top: -2, right: -2 },
  bottomLeft: { bottom: -2, left: -2 },
  bottomRight: { bottom: -2, right: -2 },
  holoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  holoTitle: {
    fontSize: 16,
    color: Colors.dark.neonGreen,
    fontWeight: "800",
    letterSpacing: 1,
  },
  holoLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.dark.primary,
    marginLeft: 10,
  },
  holoContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  // Password Display Styles
  passwordDisplay: {
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontFamily: "monospace",
    lineHeight: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    minHeight: 90,
    textAlignVertical: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  passwordStrength: {
    marginBottom: 16,
  },
  strengthContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.surfaceVariant,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Length Options - Better Buttons
  lengthOptions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  lengthButton: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lengthButtonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  lengthButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Options Grid - Enhanced Visibility
  optionsGrid: {
    flexDirection: "column",
    gap: 16,
  },
  optionToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
    // minHeight: 72,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.8,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  // Generate Button - Premium Look
  generateButton: {
    borderRadius: 20,
    overflow: "visible",
    marginTop: 16,
    marginBottom: 20,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 32,
    gap: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
  },
  generateButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Alert,
//   Dimensions,
//   Animated as RNAnimated,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Svg, {
//   Defs,
//   G,
//   Path,
//   Polygon,
//   Stop,
//   LinearGradient as SvgLinearGradient,
// } from "react-native-svg";

// import { ReachPressable } from "@/components/ui/ReachPressable";
// import Colors from "@/constants/Colors";

// const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// // Holographic Hexagonal Grid Background
// const HexGrid = () => {
//   const hexSize = 40;
//   const cols = Math.ceil(screenWidth / (hexSize * 0.75));
//   const rows = Math.ceil(screenHeight / (hexSize * 0.866));

//   const hexagonPoints = (cx: number, cy: number, size: number) => {
//     const points = [];
//     for (let i = 0; i < 6; i++) {
//       const angle = (i * Math.PI) / 3;
//       const x = cx + size * Math.cos(angle);
//       const y = cy + size * Math.sin(angle);
//       points.push(`${x},${y}`);
//     }
//     return points.join(" ");
//   };

//   return (
//     <Svg
//       width={screenWidth}
//       height={screenHeight}
//       style={StyleSheet.absoluteFill}
//       viewBox={`0 0 ${screenWidth} ${screenHeight}`}
//     >
//       <Defs>
//         <SvgLinearGradient id="hexGradient" x1="0" y1="0" x2="1" y2="1">
//           <Stop
//             offset="0%"
//             stopColor={Colors.dark.primary}
//             stopOpacity="0.15"
//           />
//           <Stop
//             offset="50%"
//             stopColor={Colors.dark.neonGreen}
//             stopOpacity="0.08"
//           />
//           <Stop
//             offset="100%"
//             stopColor={Colors.dark.secondary}
//             stopOpacity="0.12"
//           />
//         </SvgLinearGradient>
//         <SvgLinearGradient id="hexBorder" x1="0" y1="0" x2="1" y2="1">
//           <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.3" />
//           <Stop
//             offset="100%"
//             stopColor={Colors.dark.neonGreen}
//             stopOpacity="0.2"
//           />
//         </SvgLinearGradient>
//       </Defs>

//       {Array.from({ length: rows }).map((_, row) =>
//         Array.from({ length: cols }).map((_, col) => {
//           const x = col * hexSize * 0.75;
//           const y = row * hexSize * 0.866 + (col % 2) * (hexSize * 0.433);
//           const opacity = Math.random() * 0.5 + 0.1;

//           return (
//             <G key={`hex-${row}-${col}`} opacity={opacity}>
//               <Polygon
//                 points={hexagonPoints(x, y, hexSize * 0.4)}
//                 fill="url(#hexGradient)"
//                 stroke="url(#hexBorder)"
//                 strokeWidth="0.5"
//               />
//             </G>
//           );
//         })
//       )}
//     </Svg>
//   );
// };

// // Animated Floating Particles
// const FloatingParticles = () => {
//   const particles = useMemo(
//     () =>
//       Array.from({ length: 12 }, (_, i) => ({
//         id: i,
//         x: Math.random() * screenWidth,
//         y: Math.random() * screenHeight,
//         size: Math.random() * 4 + 2,
//         speed: Math.random() * 2000 + 3000,
//       })),
//     []
//   );

//   const animatedValues = useRef(
//     particles.map(() => ({
//       translateX: new RNAnimated.Value(Math.random() * screenWidth),
//       translateY: new RNAnimated.Value(Math.random() * screenHeight),
//       opacity: new RNAnimated.Value(Math.random() * 0.8 + 0.2),
//     }))
//   ).current;

//   useEffect(() => {
//     const animations = animatedValues.map((anim, i) => {
//       return RNAnimated.loop(
//         RNAnimated.parallel([
//           RNAnimated.timing(anim.translateX, {
//             toValue: Math.random() * screenWidth,
//             duration: particles[i].speed,
//             useNativeDriver: true,
//           }),
//           RNAnimated.timing(anim.translateY, {
//             toValue: Math.random() * screenHeight,
//             duration: particles[i].speed + 1000,
//             useNativeDriver: true,
//           }),
//           RNAnimated.sequence([
//             RNAnimated.timing(anim.opacity, {
//               toValue: 0.8,
//               duration: 2000,
//               useNativeDriver: true,
//             }),
//             RNAnimated.timing(anim.opacity, {
//               toValue: 0.2,
//               duration: 2000,
//               useNativeDriver: true,
//             }),
//           ]),
//         ])
//       );
//     });

//     animations.forEach((anim) => anim.start());
//     return () => animations.forEach((anim) => anim.stop());
//   }, []);

//   return (
//     <View style={StyleSheet.absoluteFill} pointerEvents="none">
//       {animatedValues.map((anim, i) => (
//         <RNAnimated.View
//           key={i}
//           style={[
//             styles.particle,
//             {
//               transform: [
//                 { translateX: anim.translateX },
//                 { translateY: anim.translateY },
//               ],
//               opacity: anim.opacity,
//               width: particles[i].size,
//               height: particles[i].size,
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );
// };

// export default function GeneratorScreen() {
//   const [password, setPassword] = useState("");
//   const [length, setLength] = useState(16);
//   const [options, setOptions] = useState({
//     uppercase: true,
//     lowercase: true,
//     numbers: true,
//     symbols: true,
//   });
//   const insets = useSafeAreaInsets();

//   const generatePassword = () => {
//     const chars = {
//       uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
//       lowercase: "abcdefghijklmnopqrstuvwxyz",
//       numbers: "0123456789",
//       symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
//     };

//     let charset = "";
//     if (options.uppercase) charset += chars.uppercase;
//     if (options.lowercase) charset += chars.lowercase;
//     if (options.numbers) charset += chars.numbers;
//     if (options.symbols) charset += chars.symbols;

//     if (!charset) {
//       Alert.alert("Error", "Please select at least one character type");
//       return;
//     }

//     let newPassword = "";
//     for (let i = 0; i < length; i++) {
//       newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
//     }
//     setPassword(newPassword);
//   };

//   const copyToClipboard = () => {
//     if (password) {
//       // Clipboard.setString(password);
//       Alert.alert("Success", "Password copied to clipboard!");
//     }
//   };

//   const getStrengthColor = () => {
//     if (length < 8) return Colors.dark.error;
//     if (length < 12) return Colors.dark.warning;
//     return Colors.dark.neonGreen;
//   };

//   const getStrengthText = () => {
//     if (length < 8) return "WEAK";
//     if (length < 12) return "MODERATE";
//     return "QUANTUM";
//   };

//   useEffect(() => {
//     generatePassword();
//   }, [length, options]);

//   // Holographic Container Component
//   const HoloContainer = ({
//     children,
//     title,
//     icon,
//     style = {},
//   }: {
//     children: React.ReactNode;
//     title?: string;
//     icon?: keyof typeof Ionicons.glyphMap;
//     style?: any;
//   }) => {
//     const glowAnim = useRef(new RNAnimated.Value(0)).current;

//     useEffect(() => {
//       RNAnimated.loop(
//         RNAnimated.sequence([
//           RNAnimated.timing(glowAnim, {
//             toValue: 1,
//             duration: 2000,
//             useNativeDriver: false,
//           }),
//           RNAnimated.timing(glowAnim, {
//             toValue: 0,
//             duration: 2000,
//             useNativeDriver: false,
//           }),
//         ])
//       ).start();
//     }, []);

//     return (
//       <RNAnimated.View
//         style={[
//           styles.holoContainer,
//           {
//             shadowOpacity: glowAnim.interpolate({
//               inputRange: [0, 1],
//               outputRange: [0.2, 0.6],
//             }),
//           },
//           style,
//         ]}
//       >
//         <View style={styles.holoContainerBg}>
//           {/* Corner Brackets */}
//           <Svg
//             width={20}
//             height={20}
//             style={[styles.cornerBracket, styles.topLeft]}
//           >
//             <Path
//               d="M0,15 L0,0 L15,0"
//               stroke={Colors.dark.primary}
//               strokeWidth="2"
//               fill="none"
//             />
//           </Svg>
//           <Svg
//             width={20}
//             height={20}
//             style={[styles.cornerBracket, styles.topRight]}
//           >
//             <Path
//               d="M5,0 L20,0 L20,15"
//               stroke={Colors.dark.primary}
//               strokeWidth="2"
//               fill="none"
//             />
//           </Svg>
//           <Svg
//             width={20}
//             height={20}
//             style={[styles.cornerBracket, styles.bottomLeft]}
//           >
//             <Path
//               d="M0,5 L0,20 L15,20"
//               stroke={Colors.dark.primary}
//               strokeWidth="2"
//               fill="none"
//             />
//           </Svg>
//           <Svg
//             width={20}
//             height={20}
//             style={[styles.cornerBracket, styles.bottomRight]}
//           >
//             <Path
//               d="M5,20 L20,20 L20,5"
//               stroke={Colors.dark.primary}
//               strokeWidth="2"
//               fill="none"
//             />
//           </Svg>

//           {title && (
//             <View style={styles.holoHeader}>
//               {icon && (
//                 <Ionicons name={icon} size={20} color={Colors.dark.neonGreen} />
//               )}
//               <Text style={styles.holoTitle}>{title}</Text>
//               <View style={styles.holoLine} />
//             </View>
//           )}

//           <View style={styles.holoContent}>{children}</View>
//         </View>
//       </RNAnimated.View>
//     );
//   };

//   const OptionToggle = ({
//     label,
//     icon,
//     enabled,
//     onToggle,
//   }: {
//     label: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     enabled: boolean;
//     onToggle: () => void;
//   }) => {
//     return (
//       <ReachPressable
//         style={[
//           styles.optionToggle,
//           {
//             backgroundColor: enabled
//               ? "rgba(0, 212, 255, 0.1)"
//               : "rgba(26, 26, 27, 0.8)",
//             borderColor: enabled
//               ? Colors.dark.primary
//               : Colors.dark.borderLight,
//           },
//         ]}
//         onPress={onToggle}
//         reachScale={1.02}
//         pressScale={0.98}
//       >
//         <Ionicons
//           name={icon}
//           size={22}
//           color={enabled ? Colors.dark.neonGreen : Colors.dark.textMuted}
//         />
//         <Text
//           style={[
//             styles.optionText,
//             { color: enabled ? Colors.dark.text : Colors.dark.textMuted },
//           ]}
//         >
//           {label.toUpperCase()}
//         </Text>
//         <View
//           style={[
//             styles.toggleDot,
//             {
//               backgroundColor: enabled
//                 ? Colors.dark.neonGreen
//                 : Colors.dark.surfaceVariant,
//               shadowColor: enabled ? Colors.dark.neonGreen : "transparent",
//               shadowOpacity: enabled ? 0.8 : 0,
//               shadowRadius: enabled ? 4 : 0,
//             },
//           ]}
//         />
//       </ReachPressable>
//     );
//   };

//   const LengthButton = ({
//     value,
//     onPress,
//   }: {
//     value: number;
//     onPress: () => void;
//   }) => {
//     const isSelected = length === value;

//     return (
//       <ReachPressable
//         style={[
//           styles.lengthButton,
//           {
//             backgroundColor: isSelected
//               ? Colors.dark.primary
//               : "rgba(26, 26, 27, 0.8)",
//             borderColor: isSelected
//               ? Colors.dark.neonGreen
//               : Colors.dark.borderLight,
//             shadowColor: isSelected ? Colors.dark.primary : "transparent",
//             shadowOpacity: isSelected ? 0.6 : 0,
//             shadowRadius: isSelected ? 8 : 0,
//           },
//         ]}
//         onPress={onPress}
//         reachScale={1.05}
//         pressScale={0.95}
//       >
//         <Text
//           style={[
//             styles.lengthButtonText,
//             {
//               color: isSelected ? Colors.dark.background : Colors.dark.text,
//               fontWeight: isSelected ? "800" : "600",
//             },
//           ]}
//         >
//           {value}
//         </Text>
//       </ReachPressable>
//     );
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <HexGrid />
//       <FloatingParticles />
//       <ScrollView
//         contentContainerStyle={[
//           styles.scrollContent,
//           { paddingBottom: insets.bottom + 110 },
//         ]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Holographic Header */}
//         <View style={styles.header}>
//           <View style={styles.iconContainer}>
//             <Svg width={120} height={120} viewBox="0 0 120 120">
//               <Defs>
//                 <SvgLinearGradient
//                   id="headerHexGradient"
//                   x1="0"
//                   y1="0"
//                   x2="1"
//                   y2="1"
//                 >
//                   <Stop offset="0%" stopColor={Colors.dark.primary} />
//                   <Stop offset="50%" stopColor={Colors.dark.neonGreen} />
//                   <Stop offset="100%" stopColor={Colors.dark.secondary} />
//                 </SvgLinearGradient>
//               </Defs>
//               <Polygon
//                 points="60,15 95,37.5 95,82.5 60,105 25,82.5 25,37.5"
//                 stroke="url(#headerHexGradient)"
//                 strokeWidth="3"
//                 fill="rgba(0, 212, 255, 0.1)"
//                 opacity={0.8}
//               />
//               <Polygon
//                 points="60,25 85,42.5 85,77.5 60,95 35,77.5 35,42.5"
//                 stroke="url(#headerHexGradient)"
//                 strokeWidth="1"
//                 fill="none"
//                 opacity="0.6"
//               />
//             </Svg>
//             <Ionicons
//               name="flash"
//               size={50}
//               color={Colors.dark.neonGreen}
//               style={styles.headerIcon}
//             />
//           </View>
//           <Text style={styles.title}>QUANTUM KEY GENERATOR</Text>
//           <Text style={styles.subtitle}>
//             Neural Password Generation System v2.1
//           </Text>
//         </View>

//         {/* Password Display Container */}
//         <HoloContainer title="GENERATED NEURAL KEY" icon="key">
//           <View style={styles.passwordDisplay}>
//             <Text style={styles.passwordText} numberOfLines={3} selectable>
//               {password || "⚡ Initialize quantum generation protocol..."}
//             </Text>
//             <View style={styles.passwordStrength}>
//               <View style={styles.strengthContainer}>
//                 <Text style={styles.strengthLabel}>SECURITY LEVEL:</Text>
//                 <Text
//                   style={[styles.strengthValue, { color: getStrengthColor() }]}
//                 >
//                   {getStrengthText()}
//                 </Text>
//               </View>
//               <View
//                 style={[
//                   styles.strengthBar,
//                   { backgroundColor: getStrengthColor() },
//                 ]}
//               />
//             </View>
//           </View>

//           <View style={styles.passwordActions}>
//             <ReachPressable
//               style={[styles.actionButton, { opacity: password ? 1 : 0.5 }]}
//               onPress={copyToClipboard}
//               disabled={!password}
//               reachScale={1.02}
//               pressScale={0.98}
//             >
//               <LinearGradient
//                 colors={
//                   password
//                     ? ["rgba(0, 212, 255, 0.2)", "rgba(0, 212, 255, 0.4)"]
//                     : ["rgba(26, 26, 27, 0.8)", "rgba(26, 26, 27, 0.8)"]
//                 }
//                 style={styles.actionButtonGradient}
//               >
//                 <Ionicons
//                   name="copy-outline"
//                   size={20}
//                   color={password ? Colors.dark.primary : Colors.dark.textMuted}
//                 />
//                 <Text
//                   style={[
//                     styles.actionButtonText,
//                     {
//                       color: password
//                         ? Colors.dark.primary
//                         : Colors.dark.textMuted,
//                     },
//                   ]}
//                 >
//                   COPY KEY
//                 </Text>
//               </LinearGradient>
//             </ReachPressable>

//             <ReachPressable
//               style={styles.actionButton}
//               onPress={generatePassword}
//               reachScale={1.02}
//               pressScale={0.98}
//             >
//               <LinearGradient
//                 colors={["rgba(0, 255, 136, 0.2)", "rgba(0, 255, 136, 0.4)"]}
//                 style={styles.actionButtonGradient}
//               >
//                 <Ionicons
//                   name="refresh-outline"
//                   size={20}
//                   color={Colors.dark.neonGreen}
//                 />
//                 <Text
//                   style={[
//                     styles.actionButtonText,
//                     { color: Colors.dark.neonGreen },
//                   ]}
//                 >
//                   REGENERATE
//                 </Text>
//               </LinearGradient>
//             </ReachPressable>
//           </View>
//         </HoloContainer>

//         {/* Length Selection */}
//         <HoloContainer title="KEY LENGTH MATRIX" icon="resize">
//           <View style={styles.lengthOptions}>
//             {[8, 12, 16, 20, 24].map((value) => (
//               <LengthButton
//                 key={value}
//                 value={value}
//                 onPress={() => setLength(value)}
//               />
//             ))}
//           </View>
//         </HoloContainer>

//         {/* Character Options */}
//         <HoloContainer title="ENCRYPTION PROTOCOLS" icon="construct">
//           <View style={styles.optionsGrid}>
//             <OptionToggle
//               label="Alpha-Upper"
//               icon="chevron-up-circle"
//               enabled={options.uppercase}
//               onToggle={() =>
//                 setOptions((prev) => ({ ...prev, uppercase: !prev.uppercase }))
//               }
//             />
//             <OptionToggle
//               label="Alpha-Lower"
//               icon="chevron-down-circle"
//               enabled={options.lowercase}
//               onToggle={() =>
//                 setOptions((prev) => ({ ...prev, lowercase: !prev.lowercase }))
//               }
//             />
//             <OptionToggle
//               label="Numeric"
//               icon="calculator"
//               enabled={options.numbers}
//               onToggle={() =>
//                 setOptions((prev) => ({ ...prev, numbers: !prev.numbers }))
//               }
//             />
//             <OptionToggle
//               label="Special-Chars"
//               icon="construct"
//               enabled={options.symbols}
//               onToggle={() =>
//                 setOptions((prev) => ({ ...prev, symbols: !prev.symbols }))
//               }
//             />
//           </View>
//         </HoloContainer>

//         {/* Generate Button */}
//         <ReachPressable
//           style={styles.generateButton}
//           onPress={generatePassword}
//           reachScale={1.02}
//           pressScale={0.98}
//         >
//           <LinearGradient
//             colors={[Colors.dark.primary, Colors.dark.neonGreen]}
//             style={styles.generateGradient}
//           >
//             <Ionicons name="flash" size={28} color={Colors.dark.background} />
//             <Text style={styles.generateButtonText}>
//               ⚡ GENERATE QUANTUM KEY
//             </Text>
//           </LinearGradient>
//         </ReachPressable>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.dark.background,
//   },
//   particle: {
//     position: "absolute",
//     borderRadius: 50,
//     backgroundColor: Colors.dark.primary,
//     shadowColor: Colors.dark.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 3,
//   },
//   scrollContent: {
//     paddingHorizontal: 24,
//     paddingTop: 20,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   iconContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 24,
//     position: "relative",
//   },
//   headerIcon: {
//     position: "absolute",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: Colors.dark.text,
//     marginBottom: 8,
//     textAlign: "center",
//     letterSpacing: 2,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: Colors.dark.primary,
//     textAlign: "center",
//     fontWeight: "600",
//     letterSpacing: 1,
//   },
//   // Holographic Container Styles
//   holoContainer: {
//     marginBottom: 24,
//     shadowColor: Colors.dark.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowRadius: 20,
//   },
//   holoContainerBg: {
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: Colors.dark.primary,
//     backgroundColor: Colors.dark.surface,
//     position: "relative",
//     overflow: "hidden",
//   },
//   cornerBracket: {
//     position: "absolute",
//   },
//   topLeft: { top: -2, left: -2 },
//   topRight: { top: -2, right: -2 },
//   bottomLeft: { bottom: -2, left: -2 },
//   bottomRight: { bottom: -2, right: -2 },
//   holoHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 12,
//     gap: 12,
//   },
//   holoTitle: {
//     fontSize: 16,
//     color: Colors.dark.neonGreen,
//     fontWeight: "800",
//     letterSpacing: 1,
//   },
//   holoLine: {
//     flex: 1,
//     height: 2,
//     backgroundColor: Colors.dark.primary,
//     marginLeft: 10,
//   },
//   holoContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     paddingTop: 0,
//   },
//   // Password Display Styles
//   passwordDisplay: {
//     marginBottom: 20,
//   },
//   passwordText: {
//     fontSize: 16,
//     color: Colors.dark.text,
//     fontFamily: "monospace",
//     lineHeight: 24,
//     marginBottom: 16,
//     padding: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: Colors.dark.primary,
//     minHeight: 80,
//     textAlignVertical: "center",
//   },
//   passwordStrength: {
//     marginBottom: 16,
//   },
//   strengthContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   strengthLabel: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: Colors.dark.textSecondary,
//     letterSpacing: 1,
//   },
//   strengthValue: {
//     fontSize: 12,
//     fontWeight: "800",
//     letterSpacing: 1,
//   },
//   strengthBar: {
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: Colors.dark.surfaceVariant,
//     shadowColor: Colors.dark.neonGreen,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.6,
//     shadowRadius: 6,
//   },
//   passwordActions: {
//     flexDirection: "row",
//     gap: 16,
//   },
//   actionButton: {
//     flex: 1,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   actionButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: Colors.dark.primary,
//     borderRadius: 12,
//   },
//   actionButtonText: {
//     fontSize: 12,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   // Length Options
//   lengthOptions: {
//     flexDirection: "row",
//     gap: 12,
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   lengthButton: {
//     borderRadius: 14,
//     borderWidth: 2,
//     paddingHorizontal: 18,
//     paddingVertical: 14,
//     minWidth: 56,
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: 52,
//   },
//   lengthButtonText: {
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   // Options Grid
//   optionsGrid: {
//     flexDirection: "column",
//     gap: 16,
//   },
//   optionToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 2,
//     gap: 16,
//     minHeight: 68,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   optionText: {
//     fontSize: 15,
//     fontWeight: "700",
//     flex: 1,
//     letterSpacing: 0.8,
//   },
//   toggleDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//     shadowOffset: { width: 0, height: 0 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   // Generate Button
//   generateButton: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginTop: 8,
//     shadowColor: Colors.dark.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.8,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   generateGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   generateButtonText: {
//     color: Colors.dark.background,
//     fontSize: 16,
//     fontWeight: "800",
//     letterSpacing: 1.2,
//     textAlign: "center",
//     flex: 1,
//   },
// });
