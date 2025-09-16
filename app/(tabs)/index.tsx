import HolographicBackground from "@/components/HolographicBackground";
import AppIcon from "@/components/ui/AppIcon";
import { ReachPressable } from "@/components/ui/ReachPressable";
import { SecureNotesSection } from "@/components/notes/SecureNotesSection";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { useNavigationOptimization } from "@/hooks/useNavigationOptimization";
import { usePasswordStore } from "@/stores/passwordStore";
import { Password, PasswordStrength, SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddNoteModal from "../../components/add-note-modal";
import AddPasswordModal from "../../components/add-password-modal";

const SpaceHeader = React.memo(({ userName }: { userName?: string }) => {
  const currentHour = new Date().getHours();
  const currentDate = new Date();

  const getGreeting = () => {
    if (currentHour < 12) return "MORNING";
    if (currentHour < 17) return "AFTERNOON";
    return "EVENING";
  };

  const getUserGreeting = () => {
    if (userName) return `Welcome back, ${userName}`;
    return "Welcome, Stranger 👋";
  };

  const formatDate = () => {
    return currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.spaceHeader}>
      {/* Background Glow Effects */}
      <View style={styles.headerGlow} />

      {/* Main Header Content */}
      <View style={styles.headerMainContainer}>
        <View style={styles.headerLeft}>
          {/* Greeting Section */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTime}>GOOD {getGreeting()}</Text>
            <Text style={styles.greetingDate}>{formatDate()}</Text>
          </View>

          {/* Welcome Message */}
          <Text style={styles.welcomeMessage}>{getUserGreeting()}</Text>
          <Text style={styles.vaultSubtitle}>
            🛡️ Your digital fortress is secure
          </Text>
        </View>
      </View>
    </View>
  );
});

const SecurityStatus = ({
  score,
  total,
  weak,
}: {
  score: number;
  total: number;
  weak: number;
}) => {
  const getStatusData = (score: number) => {
    if (score >= 80)
      return {
        icon: "shield-checkmark",
        color: Colors.dark.neonGreen,
        text: "Fortress Secure",
        description: "Your vault is well protected",
        bgColor: "rgba(0, 255, 127, 0.1)",
      };
    if (score >= 60)
      return {
        icon: "shield",
        color: Colors.dark.primary,
        text: "Moderately Safe",
        description: "Room for improvement",
        bgColor: "rgba(0, 212, 255, 0.1)",
      };
    return {
      icon: "warning",
      color: Colors.dark.warning,
      text: "Security Risk",
      description: "Immediate attention needed",
      bgColor: "rgba(255, 171, 0, 0.1)",
    };
  };

  const { icon, color, text, description, bgColor } = getStatusData(score);
  const progress = Math.min(score / 100, 1);

  return (
    <View style={styles.securityStatus}>
      <LinearGradient
        colors={[bgColor, "rgba(255, 255, 255, 0.02)"]}
        style={styles.securityStatusGradient}
      >
        {/* Header */}
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <LinearGradient
              colors={[color + "20", color + "10"]}
              style={styles.statusIconGradient}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={26}
                color={color}
              />
            </LinearGradient>
          </View>
          <View style={styles.statusHeaderText}>
            <Text style={styles.statusTitle}>🛡️ Vault Security</Text>
            <Text style={[styles.statusText, { color }]}>{text}</Text>
            <Text style={styles.statusDescription}>{description}</Text>
          </View>
          <View style={styles.statusScoreContainer}>
            <Text style={styles.statusScore}>{score}</Text>
            <Text style={styles.statusScoreLabel}>Score</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress * 100}%`, backgroundColor: color },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>{total} Total Items</Text>
            {weak > 0 && (
              <Text style={styles.weakText}>{weak} Need Attention</Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};



const PasswordPreviewSection = ({
  passwords,
  copyToClipboard,
}: {
  passwords: Password[];
  copyToClipboard: (text: string, label?: string) => Promise<void>;
}) => {
  const [revealedPasswords, setRevealedPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(
    null
  );

  const PasswordPreviewCard = ({
    item,
    copyToClipboard,
    index = 0,
  }: {
    item: Password;
    copyToClipboard: (text: string, label?: string) => Promise<void>;
    index?: number;
  }) => {
    const cardScale = useSharedValue(1);
    const isRevealed = revealedPasswords[item.id] || false;

    const getStrengthData = (strength: PasswordStrength) => {
      if (strength >= PasswordStrength.VERY_STRONG)
        return {
          color: Colors.dark.neonGreen,
          text: "Very Strong",
          icon: "shield-checkmark",
        };
      if (strength >= PasswordStrength.STRONG)
        return { color: Colors.dark.primary, text: "Strong", icon: "shield" };
      if (strength >= PasswordStrength.MODERATE)
        return {
          color: Colors.dark.warning,
          text: "Moderate",
          icon: "warning",
        };
      return { color: Colors.dark.error, text: "Weak", icon: "alert-circle" };
    };

    const strengthData = getStrengthData(item.strength);

    const handlePressIn = () => {
      "worklet";
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 150 }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );
    };

    const handlePressOut = () => {
      "worklet";
      cardScale.value = withTiming(1, { duration: 150 });
    };

    const handlePress = () => {
      handlePressIn();
    };

    const togglePasswordVisibility = () => {
      setRevealedPasswords((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    };

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    // Static border color based on strength
    const getBorderColor = () => {
      if (strengthData.color === Colors.dark.neonGreen)
        return "rgba(0, 255, 136, 0.2)";
      if (strengthData.color === Colors.dark.primary)
        return "rgba(0, 212, 255, 0.2)";
      if (strengthData.color === Colors.dark.warning)
        return "rgba(255, 171, 0, 0.2)";
      return "rgba(255, 71, 87, 0.2)";
    };

    const maskedPassword = item.password.replace(/./g, "•");

    const handleCopy = React.useCallback(
      async (text: string, label: string) => {
        try {
          await copyToClipboard(text, label);
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          Alert.alert("Copied!", `${label} copied to clipboard`);
        } catch (error) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          Alert.alert("Error", "Failed to copy to clipboard");
        }
      },
      [copyToClipboard]
    );

    return (
      <Animated.View style={[styles.passwordPreviewCard, cardAnimatedStyle]}>
        <ReachPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.passwordPreviewContent}
          reachScale={1}
          pressScale={1}
        >
          <View
            style={[
              styles.passwordCardBorder,
              { borderColor: getBorderColor() },
            ]}
          >
            <LinearGradient
              colors={[
                `rgba(${
                  strengthData.color === Colors.dark.neonGreen
                    ? "0, 255, 136"
                    : strengthData.color === Colors.dark.primary
                    ? "0, 212, 255"
                    : strengthData.color === Colors.dark.warning
                    ? "255, 171, 0"
                    : "255, 71, 87"
                }, 0.08)`,
                "rgba(255, 255, 255, 0.04)",
                "rgba(255, 255, 255, 0.01)",
              ]}
              style={styles.passwordPreviewGradient}
            >
              <View style={styles.passwordPreviewHeader}>
                <View style={styles.passwordAppInfo}>
                  <View style={styles.appIconWrapper}>
                    <AppIcon appName={item.appName} size="medium" />
                    <View
                      style={[
                        styles.strengthIndicator,
                        { backgroundColor: strengthData.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={
                          strengthData.icon as keyof typeof Ionicons.glyphMap
                        }
                        size={10}
                        color={strengthData.color}
                      />
                    </View>
                  </View>
                  <View style={styles.passwordAppText}>
                    <Text style={styles.passwordAppName} numberOfLines={1}>
                      {item.appName}
                    </Text>
                    <View style={styles.passwordMetaRow}>
                      <View
                        style={[
                          styles.strengthBadge,
                          { backgroundColor: strengthData.color + "15" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.strengthBadgeText,
                            { color: strengthData.color },
                          ]}
                        >
                          {strengthData.text}
                        </Text>
                      </View>
                      <Text style={styles.passwordLastUsed}>
                        {item.lastUsed
                          ? new Date(item.lastUsed).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "Never"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.passwordActions}>
                  <ReachPressable
                    style={[styles.actionChip, styles.viewActionChip]}
                    onPress={() => {
                      setSelectedPassword(item);
                      setEditModalVisible(true);
                    }}
                    reachScale={1.1}
                    pressScale={0.9}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={14}
                      color={Colors.dark.primary}
                    />
                  </ReachPressable>
                  <ReachPressable
                    style={[styles.actionChip, styles.copyActionChip]}
                    onPress={() => handleCopy(item.password, "Password")}
                    reachScale={1.1}
                    pressScale={0.9}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color={Colors.dark.neonGreen}
                    />
                  </ReachPressable>
                </View>
              </View>

              <View style={styles.passwordCredentials}>
                <View style={styles.credentialRow}>
                  <View style={styles.credentialInfo}>
                    <Text style={styles.credentialLabel}>
                      {item.email
                        ? "📧 Email"
                        : item.username
                        ? "👤 Username"
                        : "🔑 Account"}
                    </Text>
                    <Text style={styles.credentialValue} numberOfLines={1}>
                      {item.email || item.username || "No account info"}
                    </Text>
                  </View>
                  {(item.email || item.username) && (
                    <ReachPressable
                      style={styles.inlineActionButton}
                      onPress={() => {
                        const value = item?.email || item?.username;
                        if (value) {
                          handleCopy(value, item.email ? "Email" : "Username");
                        }
                      }}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(0, 212, 255, 0.2)",
                          "rgba(0, 212, 255, 0.1)",
                        ]}
                        style={styles.inlineActionGradient}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={14}
                          color={Colors.dark.primary}
                        />
                      </LinearGradient>
                    </ReachPressable>
                  )}
                </View>

                <View style={styles.credentialRow}>
                  <View style={styles.credentialInfo}>
                    <Text style={styles.credentialLabel}>🔐 Password</Text>
                    <View style={styles.passwordDisplayContainer}>
                      <Text
                        style={styles.passwordDisplayText}
                        numberOfLines={1}
                      >
                        {isRevealed ? item.password : maskedPassword}
                      </Text>
                      <View style={styles.passwordStrengthBar}>
                        <View
                          style={[
                            styles.strengthBarFill,
                            {
                              width: `${(item.strength / 4) * 100}%`,
                              backgroundColor: strengthData.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.passwordActionButtons}>
                    <ReachPressable
                      style={styles.inlineActionButton}
                      onPress={togglePasswordVisibility}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255, 171, 0, 0.2)",
                          "rgba(255, 171, 0, 0.1)",
                        ]}
                        style={styles.inlineActionGradient}
                      >
                        <Ionicons
                          name={isRevealed ? "eye-off-outline" : "eye-outline"}
                          size={14}
                          color={Colors.dark.warning}
                        />
                      </LinearGradient>
                    </ReachPressable>
                    <ReachPressable
                      style={styles.inlineActionButton}
                      onPress={() => handleCopy(item.password, "Password")}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(0, 255, 136, 0.2)",
                          "rgba(0, 255, 136, 0.1)",
                        ]}
                        style={styles.inlineActionGradient}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={14}
                          color={Colors.dark.neonGreen}
                        />
                      </LinearGradient>
                    </ReachPressable>
                  </View>
                </View>
              </View>

              <View style={styles.passwordCardFooter}>
                <View style={styles.footerStats}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={Colors.dark.textMuted}
                    />
                    <Text style={styles.statText}>
                      {item.lastUsed ? "Used recently" : "Never used"}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={strengthData.color}
                    />
                    <Text
                      style={[styles.statText, { color: strengthData.color }]}
                    >
                      {strengthData.text}
                    </Text>
                  </View>
                </View>
                <ReachPressable
                  style={styles.quickLaunchButton}
                  onPress={() => {
                    if (item.url) {
                      Alert.alert(
                        "Open App",
                        `Would you like to open ${item.appName}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Open",
                            onPress: () => {
                              Alert.alert(
                                "Feature Coming Soon",
                                "Deep linking to apps will be available in a future update!"
                              );
                            },
                          },
                        ]
                      );
                    }
                  }}
                  reachScale={1.05}
                  pressScale={0.95}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.secondary]}
                    style={styles.quickLaunchGradient}
                  >
                    <Ionicons
                      name="rocket"
                      size={14}
                      color={Colors.dark.background}
                    />
                    <Text style={styles.quickLaunchText}>Launch</Text>
                  </LinearGradient>
                </ReachPressable>
              </View>
            </LinearGradient>
          </View>
        </ReachPressable>
      </Animated.View>
    );
  };

  if (passwords.length === 0) return null;

  return (
    <View style={styles.passwordPreviewSection}>
      <View style={styles.passwordPreviewHeader}>
        <Text style={styles.passwordPreviewTitle}>🔐 Saved Passwords</Text>
      </View>

      <View style={styles.passwordPreviewGrid}>
        {passwords.slice(0, 4).map((item, index) => (
          <PasswordPreviewCard
            key={item.id}
            item={item}
            index={index}
            copyToClipboard={copyToClipboard}
          />
        ))}
      </View>

      {passwords.length > 4 && (
        <ReachPressable
          style={styles.viewAllPasswordsLink}
          onPress={() => router.push("/(tabs)/apps")}
          reachScale={1.02}
          pressScale={0.98}
        >
          <Text style={styles.viewAllPasswordsLinkText}>
            View all {passwords.length} passwords →
          </Text>
        </ReachPressable>
      )}

      <AddPasswordModal
        visible={editModalVisible}
        app={null}
        existingPassword={selectedPassword}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedPassword(null);
        }}
      />
    </View>
  );
};

const SpaceWelcome = React.memo(({ onAddNote }: { onAddNote: () => void }) => {
  return (
    <View style={styles.emptyStateContainer}>
      {/* Main Empty State Card */}
      <View style={styles.emptyStateCard}>
        <LinearGradient
          colors={[
            "rgba(0, 212, 255, 0.08)",
            "rgba(139, 92, 246, 0.06)",
            "rgba(0, 255, 136, 0.04)",
          ]}
          style={styles.emptyStateGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header Section */}
          <View style={styles.emptyStateHeader}>
            <View style={styles.emptyStateIconWrapper}>
              <LinearGradient
                colors={[Colors.dark.electricBlue, Colors.dark.purpleGlow]}
                style={styles.emptyStateIcon}
              >
                <Ionicons
                  name="shield"
                  size={28}
                  color={Colors.dark.background}
                />
              </LinearGradient>
            </View>

            <Text style={styles.emptyStateTitle}>Your Vault is Empty</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start securing your digital life by adding passwords and notes
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.emptyStateActions}>
            <ReachPressable
              style={styles.emptyStatePrimaryAction}
              onPress={() => router.push("/(tabs)/apps")}
              reachScale={1.02}
              pressScale={0.98}
            >
              <LinearGradient
                colors={[Colors.dark.electricBlue, Colors.dark.purpleGlow]}
                style={styles.emptyStatePrimaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="key" size={18} color={Colors.dark.background} />
                <Text style={styles.emptyStatePrimaryText}>
                  Add First Password
                </Text>
              </LinearGradient>
            </ReachPressable>

            <ReachPressable
              style={styles.emptyStateSecondaryAction}
              onPress={onAddNote}
              reachScale={1.02}
              pressScale={0.98}
            >
              <View style={styles.emptyStateSecondaryContent}>
                <Ionicons
                  name="document-text"
                  size={16}
                  color={Colors.dark.electricBlue}
                />
                <Text style={styles.emptyStateSecondaryText}>
                  Create Secure Note
                </Text>
              </View>
            </ReachPressable>
          </View>

          {/* Features Preview */}
          <View style={styles.emptyStateFeatures}>
            <View style={styles.emptyStateFeature}>
              <View
                style={[
                  styles.emptyStateFeatureIcon,
                  { backgroundColor: "rgba(0, 212, 255, 0.1)" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={Colors.dark.electricBlue}
                />
              </View>
              <Text style={styles.emptyStateFeatureText}>Secure</Text>
            </View>
            <View style={styles.emptyStateFeature}>
              <View
                style={[
                  styles.emptyStateFeatureIcon,
                  { backgroundColor: "rgba(0, 212, 255, 0.1)" },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={16}
                  color={Colors.dark.electricBlue}
                />
              </View>
              <Text style={styles.emptyStateFeatureText}>Fast</Text>
            </View>
            <View style={styles.emptyStateFeature}>
              <View
                style={[
                  styles.emptyStateFeatureIcon,
                  { backgroundColor: "rgba(0, 212, 255, 0.1)" },
                ]}
              >
                <Ionicons
                  name="cloud"
                  size={16}
                  color={Colors.dark.electricBlue}
                />
              </View>
              <Text style={styles.emptyStateFeatureText}>Synced</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
});

export default function VaultScreen() {
  const { state } = useAppContext();
  const passwordStore = usePasswordStore();
  const { copyToClipboard } = usePasswordStore();
  const insets = useSafeAreaInsets();
  const { shouldRenderAnimations } = useNavigationOptimization();
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<SecureNote | null>(null);

  const allPasswords = passwordStore.isAuthenticated
    ? passwordStore.passwords
    : state.passwords;

  const recentPasswords: any = allPasswords
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 6);

  const passwordsData = useMemo(() => {
    return {
      passwords: allPasswords,
      total: allPasswords.length,
    };
  }, [allPasswords]);

  const { securityScore, weakPasswords, totalPasswords } = useMemo(() => {
    const { passwords, total } = passwordsData;
    if (total === 0) {
      return { securityScore: 100, weakPasswords: 0, totalPasswords: 0 };
    }

    const scores = passwords.map((p) => (p.strength / 4) * 100);
    const scoreSum = scores.reduce((sum, score) => sum + score, 0);
    const weakCount = passwords.filter(
      (p) => p.strength <= PasswordStrength.WEAK
    ).length;

    return {
      securityScore: Math.round(scoreSum / total),
      weakPasswords: weakCount,
      totalPasswords: total,
    };
  }, [passwordsData]);

  const handleEditNote = (note: SecureNote) => {
    setEditingNote(note);
    setNoteModalVisible(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setEditingNote(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {shouldRenderAnimations && <HolographicBackground />}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SpaceHeader userName={undefined} />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(0, 212, 255, 0.1)", "rgba(0, 212, 255, 0.05)"]}
              style={styles.statCardGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="key" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{totalPasswords}</Text>
                <Text style={styles.statLabel}>Passwords</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(0, 255, 127, 0.1)", "rgba(0, 255, 127, 0.05)"]}
              style={styles.statCardGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="document-lock"
                  size={20}
                  color={Colors.dark.neonGreen}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {state.secureNotes.length}
                </Text>
                <Text style={styles.statLabel}>Secure Notes</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <SecurityStatus
          score={securityScore}
          total={totalPasswords}
          weak={weakPasswords}
        />

        {recentPasswords.length > 0 && (
          <PasswordPreviewSection
            passwords={recentPasswords || []}
            copyToClipboard={copyToClipboard}
          />
        )}

        {state.secureNotes.length > 0 && (
          <SecureNotesSection
            notes={state.secureNotes}
            onAddNote={() => setNoteModalVisible(true)}
            onEditNote={handleEditNote}
          />
        )}

        {totalPasswords === 0 && state.secureNotes.length > 0 && (
          <View style={styles.emptyPasswordsSection}>
            <LinearGradient
              colors={[
                "rgba(0, 212, 255, 0.05)",
                "rgba(0, 255, 136, 0.03)",
                "rgba(139, 92, 246, 0.05)",
              ]}
              style={styles.emptyPasswordsCard}
            >
              <View style={styles.emptyPasswordsContent}>
                <Text style={styles.emptyPasswordsIcon}>🔐</Text>
                <Text style={styles.emptyPasswordsTitle}>
                  NO NEURAL KEYS DETECTED
                </Text>
                <Text style={styles.emptyPasswordsSubtitle}>
                  Your quantum vault is ready for password storage
                </Text>
                <ReachPressable
                  style={styles.emptyPasswordsButton}
                  onPress={() => router.push("/(tabs)/apps")}
                  reachScale={1.05}
                  pressScale={0.95}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.secondary]}
                    style={styles.emptyPasswordsButtonGradient}
                  >
                    <Text style={styles.emptyPasswordsButtonText}>
                      ⚡ ADD FIRST PASSWORD
                    </Text>
                  </LinearGradient>
                </ReachPressable>
              </View>
            </LinearGradient>
          </View>
        )}

        {totalPasswords > 6 && (
          <View style={styles.spaceAccessButton}>
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
                <Text style={styles.viewAllPasswordsText}>
                  ⚡ ACCESS ALL {totalPasswords} NEURAL KEYS
                </Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={24}
                  color={Colors.dark.primary}
                />
              </LinearGradient>
            </ReachPressable>
          </View>
        )}

        {totalPasswords === 0 && state.secureNotes.length === 0 && (
          <SpaceWelcome onAddNote={() => setNoteModalVisible(true)} />
        )}
      </ScrollView>

      <AddNoteModal
        visible={noteModalVisible}
        onClose={handleCloseNoteModal}
        existingNote={editingNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0b",
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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 32,
  },
  // Enhanced Space Header
  spaceHeader: {
    paddingHorizontal: 10,
    marginBottom: 0,
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    letterSpacing: 1,
    marginBottom: 4,
  },
  vaultTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.dark.text,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 4,
  },
  headerStat: {
    alignItems: "center",
  },
  headerStatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
  },
  spaceButton: {
    borderRadius: 24,
    overflow: "hidden",
  },
  spaceButtonInner: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  viewAllPasswordsGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  // Simple Security Status
  securityStatus: {
    marginBottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  statusInfo: {
    flex: 1,
  },
  statusStats: {
    alignItems: "flex-end",
  },
  statusTotal: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  viewAllPasswordsButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  // Space Access Button
  spaceAccessButton: {
    marginBottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  spaceEmptyContainer: {
    marginBottom: 32,
  },
  viewAllPasswordsText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
    letterSpacing: 0.5,
  },
  // Modern Empty State Design
  emptyStateContainer: {
    marginBottom: 20,
  },
  emptyStateCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyStateGradient: {
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.dark.borderLight,
    borderRadius: 24,
  },
  emptyStateHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  emptyStateIconWrapper: {
    marginBottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.dark.electricBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
    fontWeight: "400",
  },
  emptyStateActions: {
    gap: 12,
    marginBottom: 32,
  },
  emptyStatePrimaryAction: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.dark.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStatePrimaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
  },
  emptyStatePrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.background,
    letterSpacing: 0.1,
  },
  emptyStateSecondaryAction: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.borderLight,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  emptyStateSecondaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  emptyStateSecondaryText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  emptyStateFeatures: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    marginHorizontal: -8,
  },
  emptyStateFeature: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyStateFeatureIcon: {
    width: 45,
    height: 45,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.borderLight,
  },
  emptyStateFeatureText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  welcomeIconContainer: {
    marginBottom: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeTextContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.neonGreen,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  welcomeActions: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  primaryWelcomeButton: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0b",
    letterSpacing: 0.5,
  },
  secondaryWelcomeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  welcomeStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  welcomeStatItem: {
    alignItems: "center",
  },
  welcomeStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  welcomeStatLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  welcomeStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // Password Preview Section
  passwordPreviewSection: {
    marginBottom: 0,
  },
  passwordPreviewTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 20,
    letterSpacing: 0.4,
    textShadowColor: "rgba(0, 212, 255, 0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  passwordPreviewGrid: {
    gap: 20,
  },
  passwordPreviewCard: {
    borderRadius: 24,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 5,
  },
  passwordPreviewContent: {
    borderRadius: 24,
    overflow: "hidden",
  },
  passwordCardBorder: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    transform: [{ skewX: "-20deg" }],
  },
  passwordPreviewGradient: {
    padding: 24,
    borderRadius: 24,
    minHeight: 200,
    position: "relative",
    overflow: "hidden",
  },
  passwordPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  appIconWrapper: {
    position: "relative",
    marginRight: 12,
  },
  strengthIndicator: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  viewActionChip: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  copyActionChip: {
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  passwordAppInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  passwordAppText: {
    flex: 1,
  },
  passwordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  strengthBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  passwordAppName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  passwordLastUsed: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  passwordCredentials: {
    gap: 16,
    marginBottom: 20,
  },
  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  credentialInfo: {
    flex: 1,
  },
  credentialLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  credentialValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  passwordDisplayContainer: {
    gap: 8,
  },
  passwordDisplayText: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  passwordStrengthBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  passwordActionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  inlineActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  inlineActionGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  passwordCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  footerStats: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  quickLaunchButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLaunchGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  quickLaunchText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.background,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewAllPasswordsLink: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  viewAllPasswordsLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  // Empty Passwords Section Styles
  emptyPasswordsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyPasswordsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    overflow: "hidden",
  },
  emptyPasswordsContent: {
    padding: 32,
    alignItems: "center",
  },
  emptyPasswordsIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyPasswordsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.primary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyPasswordsSubtitle: {
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyPasswordsButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyPasswordsButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPasswordsButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.dark.background,
    letterSpacing: 1,
  },

  // New Enhanced Header Styles
  headerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: "rgba(0, 212, 255, 0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.08)",
  },
  headerMainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 16,
    overflow: "hidden",
    paddingHorizontal: 4,
    zIndex: 1,
    height: 110,
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greetingTime: {
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  greetingDate: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.2,
    marginVertical: 5,
  },
  vaultSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Enhanced Security Status Styles
  securityStatusGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  statusIconContainer: {
    marginTop: 2,
  },
  statusIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusHeaderText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  statusDescription: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  statusScoreContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusScore: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  statusScoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  progressContainer: {
    gap: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
  },
  weakText: {
    fontSize: 12,
    color: Colors.dark.warning,
    fontWeight: "600",
  },

  // Floating Decoration Elements
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingOrb: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.4,
  },
  floatingOrb1: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    top: "15%",
    right: "10%",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  floatingOrb2: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 255, 127, 0.08)",
    top: "40%",
    left: "5%",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  floatingOrb3: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    top: "70%",
    right: "15%",
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  floatingHex: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    transform: [{ rotate: "30deg" }],
  },
  floatingHex1: {
    top: "25%",
    left: "20%",
  },
  floatingHex2: {
    top: "60%",
    right: "25%",
    borderColor: "rgba(0, 255, 127, 0.2)",
  },
});
