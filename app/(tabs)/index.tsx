import AppIcon from "@/components/ui/AppIcon";
import { useAppContext } from "@/hooks/useAppContext";
import { Password, PasswordStrength } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Stop,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

const Colors = {
  dark: {
    background: "#02000a",
    surface: "rgba(26, 26, 27, 0.7)",
    text: "#f0f2f5",
    textSecondary: "#a3a3a3",
    textMuted: "#666666",
    primary: "#00d4ff",
    neonGreen: "#00ff88",
    warning: "#ffab00",
    error: "#ff4757",
    glassBorder: "rgba(255, 255, 255, 0.2)",
  },
};

const TwinklingStar = ({ style, size }: { style: object; size: number }) => {
  const opacity = useSharedValue(0);
  useEffect(() => {
    const randomDelay = Math.random() * 5000;
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.9 + Math.random() * 0.1, {
            duration: 1500 + Math.random() * 2000,
          }),
          withTiming(0.3 + Math.random() * 0.2, {
            duration: 1500 + Math.random() * 2000,
          })
        ),
        -1,
        true
      );
    }, randomDelay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(opacity);
    };
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        styles.star,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        animatedStyle,
      ]}
    />
  );
};

const ParallaxStarfield = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        key: `s1-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 1.5 + 0.5,
      })),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar
          key={star.key}
          style={{ left: star.left, top: star.top }}
          size={star.size}
        />
      ))}
    </View>
  );
};

const AnimatedHeader = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <View>
        <Text style={styles.welcomeText}>Your Vault</Text>
        <Text style={styles.title}>Passport</Text>
      </View>
      <Pressable>
        <Ionicons
          name="person-circle-outline"
          size={36}
          color={Colors.dark.textSecondary}
        />
      </Pressable>
    </Animated.View>
  );
};

const AnimatedSection = ({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 18, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const getScoreColors = (s: number): [string, string] => {
  if (s >= 80) return ["#00ff88", "#00d4ff"];
  if (s >= 60) return ["#00d4ff", "#4d7cff"];
  if (s >= 40) return ["#ffab00", "#ffd200"];
  return ["#ff4757", "#ff7b59"];
};

const HexGrid = ({
  isAnalyzed,
}: {
  isAnalyzed: Animated.SharedValue<boolean>;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAnalyzed.value ? 0.15 : 0),
    transform: [{ scale: withTiming(isAnalyzed.value ? 1 : 0.8) }],
  }));

  const hexPoints = (size: number) =>
    Array.from({ length: 6 })
      .map((_, i) => {
        const angle_deg = 60 * i - 30;
        const angle_rad = (Math.PI / 180) * angle_deg;
        return `${size * Math.cos(angle_rad)},${size * Math.sin(angle_rad)}`;
      })
      .join(" ");

  return (
    <AnimatedView
      style={[StyleSheet.absoluteFill, styles.hexGridContainer, animatedStyle]}
    >
      <Svg width="100%" height="100%">
        {Array.from({ length: 5 }).map((_, i) => (
          <Polygon
            key={i}
            points={hexPoints(60 + i * 25)}
            stroke={Colors.dark.primary}
            strokeWidth="1"
            fill="none"
          />
        ))}
      </Svg>
    </AnimatedView>
  );
};

const StatPod = ({
  icon,
  value,
  label,
  angle,
  radius,
  delay,
  isAnalyzed,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  angle: number;
  radius: number;
  delay: number;
  isAnalyzed: Animated.SharedValue<boolean>;
}) => {
  const podStyle = useAnimatedStyle(() => {
    const isVisible = isAnalyzed.value;
    const transformX = Math.cos(angle * (Math.PI / 180)) * radius;
    const transformY = Math.sin(angle * (Math.PI / 180)) * radius;

    return {
      opacity: withDelay(delay, withSpring(isVisible ? 1 : 0)),
      transform: [
        {
          translateX: withDelay(
            delay,
            withSpring(isVisible ? transformX : 0, {
              damping: 12,
              stiffness: 100,
            })
          ),
        },
        {
          translateY: withDelay(
            delay,
            withSpring(isVisible ? transformY : 0, {
              damping: 12,
              stiffness: 100,
            })
          ),
        },
        { scale: withDelay(delay, withSpring(isVisible ? 1 : 0.5)) },
      ],
    };
  });

  return (
    <AnimatedView style={[styles.statPod, podStyle]}>
      <Ionicons name={icon} size={20} color={Colors.dark.primary} />
      <Text style={styles.statPodValue}>{value}</Text>
      <Text style={styles.statPodLabel}>{label}</Text>
    </AnimatedView>
  );
};

const AnalysisSecurityCard = ({
  score,
  total,
  weak,
}: {
  score: number;
  total: number;
  weak: number;
}) => {
  const isAnalyzed = useSharedValue(false);
  const progress = useSharedValue(0);
  const animatedScore = useSharedValue(0);

  const CIRCLE_RADIUS = 80;
  const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;
  const gradient = getScoreColors(score);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const animatedScoreProps = useAnimatedProps(() => ({
    text: `${Math.round(animatedScore.value)}`,
  }));

  const onAnalyzePress = () => {
    if (isAnalyzed.value) return;
    isAnalyzed.value = true;
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
    animatedScore.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  };

  const promptStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAnalyzed.value ? 0 : 1),
    transform: [{ scale: withTiming(isAnalyzed.value ? 0.8 : 1) }],
  }));

  const scoreContainerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAnalyzed.value ? 1 : 0),
    transform: [{ scale: withTiming(isAnalyzed.value ? 1 : 0.8) }],
  }));

  return (
    <View style={styles.analysisContainer}>
      <HexGrid isAnalyzed={isAnalyzed} />
      <Svg width={280} height={280} viewBox="0 0 280 280">
        <Defs>
          <SvgLinearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={gradient[0]} />
            <Stop offset="100%" stopColor={gradient[1]} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx="140"
          cy="140"
          r={CIRCLE_RADIUS}
          stroke={Colors.dark.glassBorder}
          strokeWidth={2}
        />
        <AnimatedCircle
          cx="140"
          cy="140"
          r={CIRCLE_RADIUS}
          stroke="url(#gradient)"
          strokeWidth={4}
          strokeDasharray={CIRCLE_LENGTH}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          transform="rotate(-90 140 140)"
        />
      </Svg>
      <View style={styles.centerHub}>
        <AnimatedPressable
          style={styles.pressableArea}
          onPress={onAnalyzePress}
        >
          <AnimatedView style={[styles.promptContainer, promptStyle]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={40}
              color={Colors.dark.primary}
            />
            <Text style={styles.promptText}>Analyze Security</Text>
          </AnimatedView>
          <AnimatedView style={[styles.scoreContainer, scoreContainerStyle]}>
            <AnimatedText
              style={styles.scoreText}
              animatedProps={animatedScoreProps}
            />
            <Text style={styles.scoreLabel}>Health</Text>
          </AnimatedView>
        </AnimatedPressable>

        <StatPod
          icon="file-tray-full-outline"
          value={total}
          label="Total"
          angle={-90}
          radius={120}
          delay={200}
          isAnalyzed={isAnalyzed}
        />
        <StatPod
          icon="lock-open-outline"
          value={weak}
          label="Weak"
          angle={30}
          radius={120}
          delay={400}
          isAnalyzed={isAnalyzed}
        />
        <StatPod
          icon="copy-outline"
          value={0}
          label="Reused"
          angle={150}
          radius={120}
          delay={600}
          isAnalyzed={isAnalyzed}
        />
      </View>
    </View>
  );
};

const QuickActions = () => {
  const actions = [
    { icon: "add-circle-outline", label: "Add", route: "/(tabs)/generator" },
    { icon: "key-outline", label: "Generate", route: "/(tabs)/generator" },
    { icon: "cloud-upload-outline", label: "Import" },
    { icon: "settings-outline", label: "Settings", route: "/(tabs)/settings" },
  ];

  const ActionButton = ({ item }: { item: (typeof actions)[0] }) => {
    const scale = useSharedValue(1);
    return (
      <AnimatedPressable
        onPress={() => item.route && router.push(item.route as any)}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={{ transform: [{ scale }] }}
      >
        <BlurView intensity={25} tint="dark" style={styles.actionButton}>
          <Ionicons
            name={item.icon as any}
            size={28}
            color={Colors.dark.primary}
          />
          <Text style={styles.actionLabel}>{item.label}</Text>
        </BlurView>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <FlatList
        data={actions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => <ActionButton item={item} />}
      />
    </View>
  );
};

const RecentPasswords = ({ passwords }: { passwords: Password[] }) => {
  const PasswordCard = ({ item }: { item: Password }) => {
    const scale = useSharedValue(1);
    return (
      <AnimatedPressable
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={{ transform: [{ scale }] }}
      >
        <BlurView intensity={25} tint="dark" style={styles.passwordCard}>
          <AppIcon appName={item.appName} size="small" />
          <Text style={styles.passwordAppName} numberOfLines={1}>
            {item.appName}
          </Text>
        </BlurView>
      </AnimatedPressable>
    );
  };
  return (
    <View style={styles.panelContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent</Text>
        <Pressable>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>
      <FlatList
        data={passwords}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PasswordCard item={item} />}
      />
    </View>
  );
};

const EmptyState = () => (
  <BlurView intensity={25} tint="dark" style={styles.emptyStateGlassPanel}>
    <View style={styles.emptyContent}>
      <Ionicons
        name="lock-open-outline"
        size={48}
        color={Colors.dark.primary}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyTitle}>Your Vault is Empty</Text>
      <Text style={styles.emptyDescription}>
        Start by adding your first password to secure your digital life.
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/generator")}
      >
        <Text style={styles.emptyButtonText}>Add First Password</Text>
      </Pressable>
    </View>
  </BlurView>
);

export default function VaultScreen() {
  const { state } = useAppContext();
  const insets = useSafeAreaInsets();
  const recentPasswords = state.passwords
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 6);

  const { securityScore, weakPasswords, totalPasswords } = useMemo(() => {
    const total = state.passwords.length;
    if (total === 0)
      return { securityScore: 100, weakPasswords: 0, totalPasswords: 0 };

    let scoreSum = 0;
    state.passwords.forEach((p) => {
      scoreSum += (p.strength / 4) * 100;
    });

    return {
      securityScore: Math.round(scoreSum / total),
      weakPasswords: state.passwords.filter(
        (p) => p.strength <= PasswordStrength.WEAK
      ).length,
      totalPasswords: total,
    };
  }, [state.passwords]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ParallaxStarfield />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <AnimatedHeader delay={100} />

        <AnimatedSection delay={200}>
          <AnalysisSecurityCard
            score={securityScore}
            total={totalPasswords}
            weak={weakPasswords}
          />
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <QuickActions />
        </AnimatedSection>

        {recentPasswords.length > 0 && (
          <AnimatedSection delay={400}>
            <RecentPasswords passwords={recentPasswords} />
          </AnimatedSection>
        )}

        {totalPasswords === 0 && (
          <AnimatedSection delay={300}>
            <EmptyState />
          </AnimatedSection>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  star: { position: "absolute", backgroundColor: "white" },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  welcomeText: { fontSize: 16, color: Colors.dark.textSecondary },
  title: { fontSize: 32, fontWeight: "700", color: Colors.dark.text },
  panelContainer: { marginTop: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  viewAll: { fontSize: 14, color: Colors.dark.primary, fontWeight: "600" },
  analysisContainer: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  hexGridContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerHub: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pressableArea: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 75,
  },
  promptContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  promptText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  scoreContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 56,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: -4,
  },
  statPod: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(26, 26, 27, 0.8)",
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  statPodValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  statPodLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  actionButton: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    backgroundColor: Colors.dark.surface,
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  passwordCard: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    backgroundColor: Colors.dark.surface,
    padding: 8,
    gap: 8,
  },
  passwordAppName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
  },
  emptyStateGlassPanel: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 20,
  },
  emptyContent: { padding: 32, alignItems: "center", gap: 8 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginVertical: 8,
  },
  emptyButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 16,
  },
  emptyButtonText: {
    color: Colors.dark.background,
    fontWeight: "700",
    fontSize: 16,
  },
});
