import HolographicBackground from "@/components/HolographicBackground";
import AppIcon from "@/components/ui/AppIcon";
import { ReachPressable } from "@/components/ui/ReachPressable";
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
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddPasswordModal from "../../components/add-password-modal";

const SpaceHeader = React.memo(
  ({
    userName,
    totalPasswords,
    totalNotes,
  }: {
    userName?: string;
    totalPasswords: number;
    totalNotes: number;
  }) => {
    const currentHour = new Date().getHours();
    const currentDate = new Date();

    const getGreeting = () => {
      if (currentHour < 12) return "MORNING";
      if (currentHour < 17) return "AFTERNOON";
      return "EVENING";
    };

    const getUserGreeting = () => {
      if (userName) return `Welcome back, ${userName}`;
      return "Welcome, Space Voyager";
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
  }
);

const SpaceQuickActions = React.memo(
  ({
    totalPasswords,
    totalNotes,
    securityScore,
  }: {
    totalPasswords: number;
    totalNotes: number;
    securityScore: number;
  }) => {
    const actions = [
      {
        icon: "add-circle",
        title: "Add Password",
        description: `${totalPasswords} stored`,
        color: Colors.dark.neonGreen,
        gradient: ["rgba(0, 255, 136, 0.15)", "rgba(0, 255, 136, 0.05)"],
        onPress: () => router.push("/(tabs)/apps"),
      },
      {
        icon: "document-text",
        title: "New Note",
        description: `${totalNotes} created`,
        color: Colors.dark.primary,
        gradient: ["rgba(0, 212, 255, 0.15)", "rgba(0, 212, 255, 0.05)"],
        onPress: () => {},
      },
      {
        icon: "flash",
        title: "Generator",
        description: "Create strong",
        color: Colors.dark.warning,
        gradient: ["rgba(255, 171, 0, 0.15)", "rgba(255, 171, 0, 0.05)"],
        onPress: () => router.push("/(tabs)/generator"),
      },
    ];

    return (
      <View style={styles.spaceQuickActions}>
        <Text style={styles.quickActionsTitle}>🚀 Mission Control</Text>
        <View style={styles.quickActionsGrid}>
          {actions.map((action, index) => (
            <SpaceActionCard key={action.title} action={action} index={index} />
          ))}
        </View>
      </View>
    );
  }
);

const SpaceActionCard = ({ action, index }: { action: any; index: number }) => {
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.1);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 500 + index * 100,
    });

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000 + index * 500 }),
        withTiming(0.1, { duration: 2000 + index * 500 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(cardOpacity);
      cancelAnimation(glowOpacity);
    };
  }, []);

  const handlePress = () => {
    "worklet";
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    runOnJS(action.onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.spaceActionCard, animatedStyle]}>
      <ReachPressable
        onPress={handlePress}
        style={styles.spaceActionContent}
        reachScale={1}
        pressScale={1}
      >
        <LinearGradient
          colors={action.gradient as readonly [string, string, ...string[]]}
          style={styles.spaceActionGradient}
        >
          <View
            style={[
              styles.spaceActionIcon,
              { backgroundColor: action.color + "20" },
            ]}
          >
            <Ionicons
              name={action.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={action.color}
            />
          </View>

          <View style={styles.spaceActionText}>
            <Text style={styles.spaceActionTitle}>{action.title}</Text>
            <Text
              style={[styles.spaceActionDescription, { color: action.color }]}
            >
              {action.description}
            </Text>
          </View>

          <View style={styles.spaceActionArrow}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.dark.textMuted}
            />
          </View>
        </LinearGradient>
      </ReachPressable>
    </Animated.View>
  );
};

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

const SecureNotesSection = ({ notes }: { notes: SecureNote[] }) => {
  return (
    <View style={styles.notesSection}>
      <View style={styles.notesSectionHeader}>
        <Text style={styles.notesSectionTitle}>Secure Notes</Text>
        <ReachPressable
          style={styles.addNoteButton}
          onPress={() => {}}
          reachScale={1.05}
          pressScale={0.95}
        >
          <Ionicons name="add" size={20} color={Colors.dark.neonGreen} />
        </ReachPressable>
      </View>

      <View style={styles.notesGrid}>
        {notes.map((note, index) => (
          <SpaceNoteCard key={note.id} note={note} index={index} />
        ))}
      </View>

      {notes.length === 0 && (
        <View style={styles.emptyNotes}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={Colors.dark.textMuted}
          />
          <Text style={styles.emptyNotesText}>No secure notes yet</Text>
          <Text style={styles.emptyNotesSubtext}>
            Create your first encrypted note
          </Text>
        </View>
      )}
    </View>
  );
};

const SpaceNoteCard = ({
  note,
  index,
}: {
  note: SecureNote;
  index: number;
}) => {
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad), // Stagger animation
    });
  }, []);

  const getCategoryData = (category: string) => {
    switch (category?.toLowerCase()) {
      case "personal":
        return {
          color: Colors.dark.neonGreen,
          gradient: ["rgba(0, 255, 136, 0.15)", "rgba(0, 255, 136, 0.05)"],
          icon: "person",
        };
      case "work":
        return {
          color: Colors.dark.primary,
          gradient: ["rgba(0, 212, 255, 0.15)", "rgba(0, 212, 255, 0.05)"],
          icon: "briefcase",
        };
      case "finance":
        return {
          color: Colors.dark.warning,
          gradient: ["rgba(255, 171, 0, 0.15)", "rgba(255, 171, 0, 0.05)"],
          icon: "card",
        };
      default:
        return {
          color: Colors.dark.textMuted,
          gradient: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
          icon: "document-text",
        };
    }
  };

  const { color, gradient, icon } = getCategoryData(note.category);
  const previewText =
    note.content.length > 120
      ? note.content.substring(0, 120) + "..."
      : note.content;

  const handlePress = () => {
    "worklet";
    cardScale.value = withSequence(
      withTiming(0.96, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    runOnJS(() => {
      Alert.alert(note.title, previewText);
    })();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  return (
    <Animated.View style={[styles.spaceNoteCard, animatedStyle]}>
      <ReachPressable
        style={styles.spaceNoteContent}
        onPress={handlePress}
        reachScale={1}
        pressScale={1}
      >
        <LinearGradient
          colors={gradient as unknown as readonly [string, string, ...string[]]}
          style={styles.spaceNoteGradient}
        >
          <View style={styles.spaceNoteHeader}>
            <View
              style={[styles.spaceNoteIcon, { backgroundColor: color + "20" }]}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={color}
              />
            </View>
            <View
              style={[
                styles.spaceCategoryBadge,
                { backgroundColor: color + "10" },
              ]}
            >
              <Text style={[styles.spaceCategoryText, { color }]}>
                {note.category}
              </Text>
            </View>
            {note.isFavorite && (
              <Ionicons name="star" size={16} color={Colors.dark.warning} />
            )}
          </View>

          <Text style={styles.spaceNoteTitle} numberOfLines={2}>
            {note.title}
          </Text>
          <Text style={styles.spaceNotePreview} numberOfLines={4}>
            {previewText}
          </Text>

          <View style={styles.spaceNoteFooter}>
            <Text style={styles.spaceNoteDate}>
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <View style={styles.spaceNoteActions}>
              <Ionicons
                name="lock-closed"
                size={12}
                color={Colors.dark.textMuted}
              />
              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.dark.textMuted}
              />
            </View>
          </View>
        </LinearGradient>
      </ReachPressable>
    </Animated.View>
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
  }: {
    item: Password;
    copyToClipboard: (text: string, label?: string) => Promise<void>;
  }) => {
    const cardScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.1);
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

    React.useEffect(() => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 3000 }),
          withTiming(0.1, { duration: 3000 })
        ),
        -1,
        true
      );

      return () => {
        cancelAnimation(glowOpacity);
      };
    }, []);

    const handlePress = () => {
      "worklet";
      cardScale.value = withSequence(
        withTiming(0.96, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
    };

    const togglePasswordVisibility = () => {
      setRevealedPasswords((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
      shadowOpacity: glowOpacity.value * 0.6,
    }));

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
      <Animated.View style={[styles.passwordPreviewCard, animatedStyle]}>
        <ReachPressable
          onPress={handlePress}
          style={styles.passwordPreviewContent}
          reachScale={1}
          pressScale={1}
        >
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.09)", "rgba(255, 255, 255, 0.01)"]}
            style={styles.passwordPreviewGradient}
          >
            <View style={styles.passwordPreviewHeader}>
              <View style={styles.passwordAppInfo}>
                <AppIcon appName={item.appName} size="medium" />
                <View style={styles.passwordAppText}>
                  <Text style={styles.passwordAppName} numberOfLines={1}>
                    {item.appName}
                  </Text>
                  <View style={styles.passwordStrengthRow}>
                    <Ionicons
                      name={strengthData.icon as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={strengthData.color}
                    />
                    <Text
                      style={[
                        styles.passwordStrengthText,
                        { color: strengthData.color },
                      ]}
                    >
                      {strengthData.text}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.passwordLastUsed}>
                {item.lastUsed
                  ? new Date(item.lastUsed).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Never"}
              </Text>
            </View>

            <View style={styles.passwordCredentials}>
              <View style={styles.passwordField}>
                <Text style={styles.passwordFieldLabel}>
                  {item.email
                    ? "Email"
                    : item.username
                    ? "Username"
                    : "Account"}
                </Text>
                <View style={styles.passwordFieldValue}>
                  <Text style={styles.passwordFieldText} numberOfLines={1}>
                    {item.email || item.username || "No account info"}
                  </Text>
                  {(item.email || item.username) && (
                    <ReachPressable
                      style={styles.copyButton}
                      onPress={() => {
                        const value = item?.email || item?.username;
                        if (value) {
                          handleCopy(value, item.email ? "Email" : "Username");
                        }
                      }}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={16}
                        color={Colors.dark.textMuted}
                      />
                    </ReachPressable>
                  )}
                </View>
              </View>

              <View style={styles.passwordField}>
                <Text style={styles.passwordFieldLabel}>Password</Text>
                <View style={styles.passwordFieldValue}>
                  <Text style={styles.passwordFieldText} numberOfLines={1}>
                    {isRevealed ? item.password : maskedPassword}
                  </Text>
                  <View style={styles.passwordActions}>
                    <ReachPressable
                      style={styles.copyButton}
                      onPress={togglePasswordVisibility}
                    >
                      <Ionicons
                        name={isRevealed ? "eye-off-outline" : "eye-outline"}
                        size={16}
                        color={Colors.dark.textMuted}
                      />
                    </ReachPressable>
                    <ReachPressable
                      style={styles.copyButton}
                      onPress={() => handleCopy(item.password, "Password")}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={16}
                        color={Colors.dark.textMuted}
                      />
                    </ReachPressable>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.passwordQuickActions}>
              <ReachPressable
                style={styles.passwordQuickAction}
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
                            // TODO: Add deep linking to open the app
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
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={Colors.dark.primary}
                />
                <Text style={styles.passwordQuickActionText}>Open</Text>
              </ReachPressable>

              <ReachPressable
                style={styles.passwordQuickAction}
                onPress={() => {
                  setSelectedPassword(item);
                  setEditModalVisible(true);
                }}
                reachScale={1.05}
                pressScale={0.95}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={Colors.dark.textMuted}
                />
                <Text style={styles.passwordQuickActionText}>Edit</Text>
              </ReachPressable>
            </View>
          </LinearGradient>
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
        {passwords.slice(0, 4).map((item) => (
          <PasswordPreviewCard
            key={item.id}
            item={item}
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

const SpaceWelcome = React.memo(() => {
  const glowAnimation = useSharedValue(0.3);
  const scaleAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);

  React.useEffect(() => {
    // Glow effect
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );

    // Gentle scale pulse
    scaleAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      true
    );

    // Slow rotation
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );

    return () => {
      cancelAnimation(glowAnimation);
      cancelAnimation(scaleAnimation);
      cancelAnimation(rotateAnimation);
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowAnimation.value,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  return (
    <View style={styles.spaceWelcomeContainer}>
      {/* Animated Background Elements */}

      {/* Main Content */}
      <Animated.View style={[styles.welcomeContent, glowStyle]}>
        <LinearGradient
          colors={[
            "rgba(0, 255, 136, 0.15)",
            "rgba(0, 212, 255, 0.1)",
            "rgba(139, 92, 246, 0.12)",
          ]}
          style={styles.welcomeGradient}
        >
          {/* Welcome Text */}
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>🚀 SECURE VAULT</Text>
            <Text style={styles.welcomeSubtitle}>
              Your Digital Fortress in Space
            </Text>
            <Text style={styles.welcomeDescription}>
              Begin your cosmic journey by securing your first digital
              credentials. Every password is a star in your personal
              constellation of security.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.welcomeActions}>
            <ReachPressable
              style={styles.primaryWelcomeButton}
              onPress={() => router.push("/(tabs)/apps")}
              reachScale={1.05}
              pressScale={0.95}
            >
              <LinearGradient
                colors={[Colors.dark.neonGreen, Colors.dark.primary]}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="rocket" size={24} color="#0a0a0b" />
                <Text style={styles.primaryButtonText}>Start Mission</Text>
              </LinearGradient>
            </ReachPressable>

            <ReachPressable
              style={styles.secondaryWelcomeButton}
              onPress={() => {}}
              reachScale={1.02}
              pressScale={0.98}
            >
              <View style={styles.secondaryButtonContent}>
                <Ionicons
                  name="document-text"
                  size={20}
                  color={Colors.dark.primary}
                />
                <Text style={styles.secondaryButtonText}>Create Note</Text>
              </View>
            </ReachPressable>
          </View>

          {/* Stats Preview */}
          <View style={styles.welcomeStats}>
            <View style={styles.welcomeStatItem}>
              <Text style={styles.welcomeStatNumber}>∞</Text>
              <Text style={styles.welcomeStatLabel}>Possibilities</Text>
            </View>
            <View style={styles.welcomeStatDivider} />
            <View style={styles.welcomeStatItem}>
              <Text style={styles.welcomeStatNumber}>🔒</Text>
              <Text style={styles.welcomeStatLabel}>Ultra Secure</Text>
            </View>
            <View style={styles.welcomeStatDivider} />
            <View style={styles.welcomeStatItem}>
              <Text style={styles.welcomeStatNumber}>🌟</Text>
              <Text style={styles.welcomeStatLabel}>Space Tech</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

export default function VaultScreen() {
  const { state } = useAppContext();
  const passwordStore = usePasswordStore();
  const { copyToClipboard } = usePasswordStore();
  const insets = useSafeAreaInsets();
  const { shouldRenderAnimations } = useNavigationOptimization();

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
        <SpaceHeader
          userName={undefined}
          totalPasswords={totalPasswords}
          totalNotes={state.secureNotes.length}
        />

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
          <SecureNotesSection notes={state.secureNotes} />
        )}

        {(totalPasswords > 0 || state.secureNotes.length > 0) && (
          <SpaceQuickActions
            totalPasswords={totalPasswords}
            totalNotes={state.secureNotes.length}
            securityScore={securityScore}
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
          <SpaceWelcome />
        )}
      </ScrollView>
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
    paddingTop: 16,
    gap: 28,
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
  // Secure Notes Section - Priority #1
  notesSection: {
    marginBottom: 0,
  },
  notesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notesSectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  addNoteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notesGrid: {
    gap: 16,
  },
  emptyNotes: {
    alignItems: "center",
    padding: 60,
    gap: 12,
  },
  emptyNotesText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
  // Beautiful Space Note Card
  spaceNoteCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  spaceNoteContent: {
    borderRadius: 20,
    overflow: "hidden",
  },
  spaceNoteGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    minHeight: 180,
  },
  spaceNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  spaceNoteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  spaceCategoryBadge: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  spaceCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  spaceNoteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 26,
  },
  spaceNotePreview: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  spaceNoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  spaceNoteDate: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  spaceNoteActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  // Beautiful Space Welcome Screen
  spaceWelcomeContainer: {
    marginHorizontal: -20,
    marginBottom: 0,
    minHeight: 600,
    position: "relative",
  },
  welcomeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  welcomeOrb1: {
    position: "absolute",
    top: 50,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 255, 136, 0.08)",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  welcomeOrb2: {
    position: "absolute",
    bottom: 100,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  welcomeGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundImage:
      "linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)",
  },
  welcomeContent: {
    margin: 20,
    borderRadius: 24,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    minHeight: 520,
    justifyContent: "space-evenly",
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
  // Space Quick Actions - Fixed shadows
  spaceQuickActions: {
    marginBottom: 0,
  },
  quickActionsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  quickActionsGrid: {
    gap: 14,
  },
  spaceActionCard: {
    borderRadius: 16,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  spaceActionContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  spaceActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    minHeight: 80,
  },
  spaceActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  spaceActionText: {
    flex: 1,
  },
  spaceActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  spaceActionDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  spaceActionArrow: {
    marginLeft: 12,
  },
  // Password Preview Section
  passwordPreviewSection: {
    marginBottom: 0,
  },
  passwordPreviewTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  passwordPreviewGrid: {
    gap: 18,
  },
  passwordPreviewCard: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  passwordPreviewContent: {
    borderRadius: 20,
    overflow: "hidden",
  },
  passwordPreviewGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    minHeight: 180,
  },
  passwordPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  passwordAppInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  passwordAppText: {
    marginLeft: 12,
    flex: 1,
  },
  passwordAppName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  passwordStrengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  passwordLastUsed: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  passwordCredentials: {
    gap: 16,
    marginBottom: 20,
  },
  passwordField: {
    gap: 8,
  },
  passwordFieldLabel: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  passwordFieldValue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  passwordFieldText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
  },
  copyButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  passwordQuickActions: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  passwordQuickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    alignSelf: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  passwordQuickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
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
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
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
