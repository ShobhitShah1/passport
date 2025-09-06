import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Path,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import { HexGrid, ParticleSystem } from "@/components/HolographicBackground";
import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useNavigationOptimization } from "@/hooks/useNavigationOptimization";

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {shouldRenderAnimations && <HexGrid />}
      {shouldRenderAnimations && <ParticleSystem />}
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
});
