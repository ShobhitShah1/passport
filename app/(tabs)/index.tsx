import AppIcon from "@/components/ui/AppIcon";
import { useAppContext } from "@/hooks/useAppContext";
import { Password, PasswordStrength, SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Path,
  Line,
  G,
} from "react-native-svg";
import Colors from "@/constants/Colors";
import { ReachPressable } from "@/components/ui/ReachPressable";

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// Holographic Hexagonal Grid Background
const HexGrid = React.memo(() => {
  const hexSize = 35;
  const cols = Math.ceil(screenWidth / (hexSize * 0.75));
  const rows = Math.ceil(screenHeight / (hexSize * 0.866));

  const hexagonPoints = (cx: number, cy: number, size: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <SvgLinearGradient id="hexGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.1" />
          <Stop offset="50%" stopColor={Colors.dark.neonGreen} stopOpacity="0.06" />
          <Stop offset="100%" stopColor={Colors.dark.secondary} stopOpacity="0.08" />
        </SvgLinearGradient>
        <SvgLinearGradient id="hexBorder" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.2" />
          <Stop offset="100%" stopColor={Colors.dark.neonGreen} stopOpacity="0.15" />
        </SvgLinearGradient>
      </Defs>

      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const x = col * hexSize * 0.75;
          const y = row * hexSize * 0.866 + (col % 2) * (hexSize * 0.433);
          const opacity = Math.random() * 0.3 + 0.1;
          
          return (
            <G key={`hex-${row}-${col}`} opacity={opacity}>
              <Polygon
                points={hexagonPoints(x, y, hexSize * 0.4)}
                fill="url(#hexGradient)"
                stroke="url(#hexBorder)"
                strokeWidth="0.3"
              />
            </G>
          );
        })
      )}
    </Svg>
  );
});

// Floating Particles System
const FloatingParticles = React.memo(() => {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 3 + 1.5,
        speed: Math.random() * 3000 + 4000,
      })),
    []
  );

  const animatedValues = useRef(
    particles.map(() => ({
      translateX: new RNAnimated.Value(Math.random() * screenWidth),
      translateY: new RNAnimated.Value(Math.random() * screenHeight),
      opacity: new RNAnimated.Value(Math.random() * 0.6 + 0.3),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, i) => {
      return RNAnimated.loop(
        RNAnimated.parallel([
          RNAnimated.timing(anim.translateX, {
            toValue: Math.random() * screenWidth,
            duration: particles[i].speed,
            useNativeDriver: true,
          }),
          RNAnimated.timing(anim.translateY, {
            toValue: Math.random() * screenHeight,
            duration: particles[i].speed + 1000,
            useNativeDriver: true,
          }),
          RNAnimated.sequence([
            RNAnimated.timing(anim.opacity, {
              toValue: 0.8,
              duration: 2500,
              useNativeDriver: true,
            }),
            RNAnimated.timing(anim.opacity, {
              toValue: 0.3,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    animations.forEach((anim) => anim.start());
    return () => animations.forEach((anim) => anim.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {animatedValues.map((anim, i) => (
        <RNAnimated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
              ],
              opacity: anim.opacity,
              width: particles[i].size,
              height: particles[i].size,
            },
          ]}
        />
      ))}
    </View>
  );
});

const VaultHeader = React.memo(() => {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "NEURAL SYNC: MORNING";
    if (currentHour < 17) return "NEURAL SYNC: AFTERNOON";
    return "NEURAL SYNC: EVENING";
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <View style={styles.titleRow}>
          <Svg width={40} height={40} viewBox="0 0 40 40">
            <Defs>
              <SvgLinearGradient id="vaultIconGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={Colors.dark.primary} />
                <Stop offset="50%" stopColor={Colors.dark.neonGreen} />
                <Stop offset="100%" stopColor={Colors.dark.secondary} />
              </SvgLinearGradient>
            </Defs>
            <Polygon
              points="20,5 30,12.5 30,27.5 20,35 10,27.5 10,12.5"
              stroke="url(#vaultIconGradient)"
              strokeWidth="2.5"
              fill="rgba(0, 212, 255, 0.15)"
            />
            <Circle cx="20" cy="20" r="6" fill="url(#vaultIconGradient)" />
          </Svg>
          <Text style={styles.title}>QUANTUM VAULT</Text>
        </View>
        <Text style={styles.subtitleText}>Neural Security Matrix - Status: ACTIVE</Text>
      </View>
      <ReachPressable 
        style={styles.profileButton}
        reachScale={1.05}
        pressScale={0.95}
      >
        <View style={styles.profileBlur}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={Colors.dark.neonGreen}
          />
        </View>
      </ReachPressable>
    </View>
  );
});

// Holographic Container Component
const HoloContainer = ({ 
  children, 
  title, 
  icon,
  style = {} 
}: { 
  children: React.ReactNode; 
  title?: string; 
  icon?: keyof typeof Ionicons.glyphMap;
  style?: any;
}) => {
  const glowAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        RNAnimated.timing(glowAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.holoContainer,
        {
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.4],
          }),
        },
        style,
      ]}
    >
      <View style={styles.holoContainerBg}>
        {/* Corner Brackets */}
        <Svg width={18} height={18} style={[styles.cornerBracket, styles.topLeft]}>
          <Path d="M0,13 L0,0 L13,0" stroke={Colors.dark.primary} strokeWidth="1.5" fill="none" />
        </Svg>
        <Svg width={18} height={18} style={[styles.cornerBracket, styles.topRight]}>
          <Path d="M5,0 L18,0 L18,13" stroke={Colors.dark.primary} strokeWidth="1.5" fill="none" />
        </Svg>
        <Svg width={18} height={18} style={[styles.cornerBracket, styles.bottomLeft]}>
          <Path d="M0,5 L0,18 L13,18" stroke={Colors.dark.primary} strokeWidth="1.5" fill="none" />
        </Svg>
        <Svg width={18} height={18} style={[styles.cornerBracket, styles.bottomRight]}>
          <Path d="M5,18 L18,18 L18,5" stroke={Colors.dark.primary} strokeWidth="1.5" fill="none" />
        </Svg>

        {title && (
          <View style={styles.holoHeader}>
            {icon && <Ionicons name={icon} size={18} color={Colors.dark.neonGreen} />}
            <Text style={styles.holoTitle}>{title}</Text>
            <View style={styles.holoLine} />
          </View>
        )}

        <View style={styles.holoContent}>
          {children}
        </View>
      </View>
    </RNAnimated.View>
  );
};

const getScoreColors = (s: number): [string, string] => {
  if (s >= 80) return ["#00ff88", "#00d4ff"];
  if (s >= 60) return ["#00d4ff", "#4d7cff"];
  if (s >= 40) return ["#ffab00", "#ffd200"];
  return ["#ff4757", "#ff7b59"];
};


const StatPod = ({
  icon,
  value,
  label,
  visible,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  visible: boolean;
}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.statPod}>
      <Ionicons name={icon} size={20} color={Colors.dark.primary} />
      <Text style={styles.statPodValue}>{value}</Text>
      <Text style={styles.statPodLabel}>{label}</Text>
    </View>
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
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const gradient = getScoreColors(score);

  const onAnalyzePress = () => {
    if (isAnalyzed) return;
    setIsAnalyzed(true);
  };

  return (
    <View style={styles.analysisContainer}>
      <View style={styles.simpleAnalysisCard}>
        <Pressable style={styles.pressableArea} onPress={onAnalyzePress}>
          {!isAnalyzed ? (
            <View style={styles.promptContainer}>
              <Ionicons name="shield-checkmark-outline" size={40} color={Colors.dark.primary} />
              <Text style={styles.promptText}>Analyze Security</Text>
            </View>
          ) : (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}</Text>
              <Text style={styles.scoreLabel}>Health</Text>
            </View>
          )}
        </Pressable>

        {isAnalyzed && (
          <View style={styles.statsRow}>
            <StatPod icon="file-tray-full-outline" value={total} label="Total" visible={true} />
            <StatPod icon="lock-open-outline" value={weak} label="Weak" visible={true} />
            <StatPod icon="copy-outline" value={0} label="Reused" visible={true} />
          </View>
        )}
      </View>
    </View>
  );
};

const SearchBar = React.memo(() => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.searchInnerContainer}>
      <View style={[styles.searchContent, isFocused && styles.searchFocused]}>
        <Ionicons name="search" size={20} color={Colors.dark.neonGreen} />
        <Text style={styles.searchPlaceholder}>
          Scan neural patterns...
        </Text>
        <Ionicons name="qr-code" size={20} color={Colors.dark.primary} />
      </View>
    </View>
  );
});

const QuickActions = () => {
  const actions = [
    { 
      icon: "add-circle", 
      label: "Add Entry", 
      route: "/(tabs)/apps",
      color: Colors.dark.neonGreen 
    },
    { 
      icon: "flash", 
      label: "Generate", 
      route: "/(tabs)/generator",
      color: Colors.dark.primary
    },
    { 
      icon: "shield-checkmark", 
      label: "Analyze", 
      color: "#8b5cf6"
    },
    { 
      icon: "cloud-upload", 
      label: "Import", 
      color: Colors.dark.warning
    },
  ];

  const ActionButton = ({ item }: { item: (typeof actions)[0] }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    return (
      <AnimatedPressable
        onPress={() => item.route && router.push(item.route as any)}
        onPressIn={() => {
          scale.value = withSpring(0.9);
          glowOpacity.value = withTiming(1);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
          glowOpacity.value = withTiming(0);
        }}
        style={[styles.actionButtonContainer, animatedStyle]}
      >
        <AnimatedView style={[styles.actionButtonGlow, glowStyle, { shadowColor: item.color }]} />
        <BlurView intensity={30} tint="dark" style={styles.actionButton}>
          <View style={[styles.actionIconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons
              name={item.icon as any}
              size={24}
              color={item.color}
            />
          </View>
          <Text style={styles.actionLabel}>{item.label}</Text>
        </BlurView>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.sectionTitle}>Mission Control</Text>
      <FlatList
        data={actions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => <ActionButton item={item} />}
      />
    </View>
  );
};

const RecentPasswords = ({ passwords }: { passwords: Password[] }) => {
  const PasswordCard = ({ item }: { item: Password }) => {
    const getStrengthColor = (strength: PasswordStrength) => {
      if (strength >= PasswordStrength.VERY_STRONG) return Colors.dark.neonGreen;
      if (strength >= PasswordStrength.STRONG) return Colors.dark.primary;
      if (strength >= PasswordStrength.MODERATE) return Colors.dark.warning;
      return Colors.dark.error;
    };

    const getStrengthText = (strength: PasswordStrength) => {
      if (strength >= PasswordStrength.VERY_STRONG) return 'Very Strong';
      if (strength >= PasswordStrength.STRONG) return 'Strong';
      if (strength >= PasswordStrength.MODERATE) return 'Moderate';
      if (strength >= PasswordStrength.WEAK) return 'Weak';
      return 'Very Weak';
    };

    return (
      <Pressable style={styles.passwordCardContainer}>
        <View style={styles.passwordCard}>
          <View style={styles.passwordCardHeader}>
            <AppIcon appName={item.appName} size="small" />
            <View style={[
              styles.strengthIndicator, 
              { backgroundColor: getStrengthColor(item.strength) }
            ]} />
          </View>
          <Text style={styles.passwordAppName} numberOfLines={1}>
            {item.appName}
          </Text>
          <Text style={styles.passwordUsername} numberOfLines={1}>
            {item.username || 'No username'}
          </Text>
          <View style={styles.passwordStrength}>
            <Text style={[styles.passwordStrengthText, { color: getStrengthColor(item.strength) }]}>
              {getStrengthText(item.strength)}
            </Text>
          </View>
          <View style={styles.passwordFooter}>
            <Text style={styles.passwordDate}>
              {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never used'}
            </Text>
            <Ionicons name="copy-outline" size={16} color={Colors.dark.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.panelContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Access</Text>
        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAll}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.dark.primary} />
        </Pressable>
      </View>
      <FlatList
        data={passwords}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PasswordCard item={item} />}
      />
    </View>
  );
};

const RecentNotes = ({ notes }: { notes: SecureNote[] }) => {
  const NoteCard = ({ item }: { item: SecureNote }) => {
    const previewText = item.content.length > 50 
      ? item.content.substring(0, 50) + '...' 
      : item.content;

    return (
      <Pressable 
        style={styles.noteCardContainer}
        onPress={() => {
          Alert.alert('Note Selected', `Opening: ${item.title}`);
        }}
      >
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <Ionicons name="document-lock" size={18} color={Colors.dark.primary} />
            <View style={styles.noteCategoryBadge}>
              <Text style={styles.noteCategoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notePreview} numberOfLines={2}>
            {previewText}
          </Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
            {item.isFavorite && (
              <Ionicons name="heart" size={12} color={Colors.dark.neonGreen} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.panelContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Notes</Text>
        <Pressable 
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/apps")}
        >
          <Text style={styles.viewAll}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.dark.primary} />
        </Pressable>
      </View>
      <FlatList
        data={notes}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard item={item} />}
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
      <Text style={styles.emptyTitle}>Your Vault Awaits</Text>
      <Text style={styles.emptyDescription}>
        Begin your journey by securing your first digital credential in the cosmos.
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/apps")}
      >
        <Text style={styles.emptyButtonText}>Start Mission</Text>
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
      <HexGrid />
      <FloatingParticles />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
      >
        <VaultHeader />

        <HoloContainer title="NEURAL SEARCH INTERFACE" icon="search">
          <SearchBar />
        </HoloContainer>

        <HoloContainer title="SECURITY ANALYSIS MATRIX" icon="analytics">
          <AnalysisSecurityCard
            score={securityScore}
            total={totalPasswords}
            weak={weakPasswords}
          />
        </HoloContainer>

        <HoloContainer title="MISSION CONTROL PROTOCOLS" icon="terminal">
          <QuickActions />
        </HoloContainer>

        {recentPasswords.length > 0 && (
          <HoloContainer title="RECENT ACCESS LOGS" icon="time">
            <RecentPasswords passwords={recentPasswords} />
          </HoloContainer>
        )}

        {state.secureNotes.length > 0 && (
          <HoloContainer title="ENCRYPTED DATA FRAGMENTS" icon="document-lock">
            <RecentNotes notes={state.secureNotes.slice(0, 3)} />
          </HoloContainer>
        )}

        {totalPasswords > 6 && (
          <HoloContainer style={{ marginTop: 8 }}>
            <ReachPressable 
              style={styles.viewAllPasswordsButton}
              onPress={() => {
                router.push("/(tabs)/apps");
              }}
              reachScale={1.01}
              pressScale={0.99}
            >
              <LinearGradient
                colors={[
                  "rgba(0, 212, 255, 0.1)",
                  "rgba(0, 255, 136, 0.05)",
                  "rgba(139, 92, 246, 0.1)",
                ]}
                style={styles.viewAllPasswordsGradient}
              >
                <Text style={styles.viewAllPasswordsText}>⚡ ACCESS ALL {totalPasswords} NEURAL KEYS</Text>
                <Ionicons name="arrow-forward-circle" size={24} color={Colors.dark.primary} />
              </LinearGradient>
            </ReachPressable>
          </HoloContainer>
        )}

        {totalPasswords === 0 && (
          <HoloContainer title="VAULT INITIALIZATION" icon="rocket">
            <EmptyState />
          </HoloContainer>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.dark.background 
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  scrollContent: { 
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 16,
    marginBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  greetingText: { 
    fontSize: 12, 
    color: Colors.dark.neonGreen,
    marginBottom: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: Colors.dark.text,
    letterSpacing: 1.5,
  },
  subtitleText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  profileButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  profileBlur: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  // Holographic Container Styles
  holoContainer: {
    marginBottom: 24,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
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
    gap: 10,
  },
  holoTitle: {
    fontSize: 14,
    color: Colors.dark.neonGreen,
    fontWeight: "800",
    letterSpacing: 1,
  },
  holoLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.dark.primary,
    marginLeft: 10,
  },
  holoContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  searchInnerContainer: {
    padding: 20,
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  searchFocused: {
    borderColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  viewAllPasswordsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  panelContainer: { marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAll: { fontSize: 14, color: Colors.dark.primary, fontWeight: "600" },
  analysisContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
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
  actionButtonContainer: {
    position: "relative",
  },
  actionButtonGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  actionButton: {
    width: 100,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
    padding: 16,
    gap: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
  },
  passwordCardContainer: {
    marginBottom: 8,
  },
  passwordCard: {
    width: 140,
    height: 160,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  strengthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  passwordAppName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  passwordUsername: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  passwordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passwordDate: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  passwordStrength: {
    marginBottom: 8,
  },
  passwordStrengthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyStateGlassPanel: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
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
  allPasswordsButton: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  viewAllPasswordsButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  viewAllPasswordsBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  simpleAnalysisCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.primary + '20',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  viewAllPasswordsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  noteCardContainer: {
    marginBottom: 8,
  },
  noteCard: {
    width: 160,
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
    padding: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteCategoryBadge: {
    backgroundColor: Colors.dark.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noteCategoryText: {
    fontSize: 9,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    lineHeight: 14,
    flex: 1,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noteDate: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
});
