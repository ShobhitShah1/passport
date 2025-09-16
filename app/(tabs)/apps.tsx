import AppIcon from "@/components/ui/AppIcon";
import { ReachPressable } from "@/components/ui/ReachPressable";
import { SpaceNoteCard } from "@/components/notes/SpaceNoteCard";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { getInstalledApps } from "@/services/apps/appDetection";
import { InstalledApp, SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddNoteModal from "../../components/add-note-modal";
import AddPasswordModal from "../../components/add-password-modal";

const TwinklingStar = React.memo(
  ({ style, size }: { style: object; size: number }) => {
    const opacity = useSharedValue(0.2);
    const scale = useSharedValue(1);

    React.useEffect(() => {
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 2000 + Math.random() * 1000 }),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.2, { duration: 3000 + Math.random() * 1000 }),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

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
  }
);

const ParallaxStarfield = React.memo(() => {
  const stars = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        key: `star-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
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
});

const AppCard = React.memo(
  ({
    app,
    index,
    hasPassword,
    onAddPassword,
  }: {
    app: InstalledApp;
    index: number;
    hasPassword: boolean;
    onAddPassword: (app: InstalledApp) => void;
  }) => {
    const cardScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.1);

    React.useEffect(() => {
      glowOpacity.value = withRepeat(
        withTiming(hasPassword ? 0.4 : 0.2, { duration: 2000 }),
        -1,
        true
      );
    }, [index, hasPassword]);

    const handlePress = () => {
      if (hasPassword) {
        Alert.alert(
          "Password Exists",
          `You already have credentials saved for ${app.name}. Would you like to view or edit them?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View",
              onPress: () => {
                /* TODO: Navigate to password details */
              },
            },
          ]
        );
      } else {
        onAddPassword(app);
      }
    };

    const handlePressIn = () => {
      "worklet";
      cardScale.value = withTiming(0.96, { duration: 150 });
    };

    const handlePressOut = () => {
      "worklet";
      cardScale.value = withTiming(1, { duration: 150 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    return (
      <Animated.View style={[styles.appCardContainer, animatedStyle]}>
        <ReachPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.appCardPressable}
          reachScale={1}
          pressScale={1}
        >
          <LinearGradient
            colors={
              hasPassword
                ? [
                    "rgba(0, 255, 136, 0.05)",
                    "rgba(255, 255, 255, 0.02)",
                    "rgba(0, 212, 255, 0.03)",
                  ]
                : [
                    "rgba(255, 255, 255, 0.08)",
                    "rgba(255, 255, 255, 0.02)",
                    "rgba(255, 255, 255, 0.01)",
                  ]
            }
            style={[
              styles.appCard,
              !app.isSupported && styles.appCardUnsupported,
              hasPassword && styles.appCardSecured,
            ]}
          >
            <View style={styles.appCardHeader}>
              <View style={styles.appIconWrapper}>
                <AppIcon
                  appName={app.name}
                  appId={app.id}
                  icon={app.icon}
                  size="medium"
                  showGlow={app.isSupported}
                />
                {hasPassword && (
                  <View style={styles.securityBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={Colors.dark.neonGreen}
                    />
                  </View>
                )}
              </View>
              <View style={styles.appCardInfo}>
                <Text style={styles.appName} numberOfLines={1}>
                  {app.name}
                </Text>
                <View style={styles.appMetaRow}>
                  <Text style={styles.appCategory} numberOfLines={1}>
                    {app.category ||
                      (app.isSupported ? "Supported" : "Custom App")}
                  </Text>
                </View>
                {app.isSupported && (
                  <View style={styles.supportedIndicator}>
                    <View style={styles.supportedDot} />
                    <Text style={styles.supportedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.appCardContent}>
              {app.packageName && (
                <Text style={styles.packageName} numberOfLines={1}>
                  {app.packageName}
                </Text>
              )}
            </View>

            <View style={styles.appCardFooter}>
              <View style={styles.appCardActions}>
                {hasPassword ? (
                  <LinearGradient
                    colors={[
                      "rgba(0, 255, 136, 0.2)",
                      "rgba(0, 255, 136, 0.1)",
                    ]}
                    style={styles.securedActionButton}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={Colors.dark.neonGreen}
                    />
                    <Text style={styles.securedActionText}>Secured</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.addActionButton}>
                    <Ionicons
                      name="add-circle"
                      size={16}
                      color={Colors.dark.primary}
                    />
                    <Text style={styles.addActionText}>Add Credentials</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </ReachPressable>
      </Animated.View>
    );
  }
);


const LoadingSpinner = React.memo(() => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingSpinner, animatedStyle]}>
        <Ionicons name="sync" size={32} color={Colors.dark.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Scanning installed apps...</Text>
      <Text style={styles.loadingSubtext}>This may take a moment</Text>
    </View>
  );
});

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  return (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        renderItem={({ item, index }) => {
          const isSelected = selectedCategory === item;
          return (
            <ReachPressable
              onPress={() => onCategoryChange(item)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              reachScale={1.05}
              pressScale={0.95}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  style={styles.categoryChipGradient}
                >
                  <Text style={styles.categoryTextActive}>{item}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryChipContent}>
                  <Text style={styles.categoryText}>{item}</Text>
                </View>
              )}
            </ReachPressable>
          );
        }}
      />
    </View>
  );
};

export default function AppsScreen() {
  const { state, dispatch } = useAppContext();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(null);
  const [editingNote, setEditingNote] = useState<SecureNote | null>(null);
  const [viewMode, setViewMode] = useState<"apps" | "notes">("apps");
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const apps = await getInstalledApps();
      setInstalledApps(apps);
    } catch (err) {
      setError("Failed to load installed apps");
      console.error("Error loading installed apps:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = useMemo(() => {
    let filtered = installedApps;

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((app) => app.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory, installedApps]);

  const filteredNotes = useMemo(() => {
    let filtered = state.secureNotes || [];

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [searchQuery, state.secureNotes]);

  const appsWithPasswords = useMemo(() => {
    const passwordAppIds = new Set(state.passwords.map((p) => p.appId));
    const passwordPackageNames = new Set(
      state.passwords.map((p) => p.appName?.toLowerCase())
    );
    return new Set([...passwordAppIds, ...passwordPackageNames]);
  }, [state.passwords]);

  const handleAddPassword = (app: InstalledApp) => {
    setSelectedApp(app);
    setPasswordModalVisible(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalVisible(false);
    setSelectedApp(null);
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setEditingNote(null);
  };

  const handleNotePress = (note: SecureNote) => {
    // Show note details in a full view
    Alert.alert(note.title, note.content, [
      {
        text: "Copy Note",
        onPress: () => copyToClipboard(note.content, "Note content"),
      },
      {
        text: "Edit",
        onPress: () => handleEditNote(note),
      },
      {
        text: "Close",
        style: "cancel",
      },
    ]);
  };

  const handleEditNote = (note: SecureNote) => {
    setEditingNote(note);
    setNoteModalVisible(true);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Copied", `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert("❌ Error", "Failed to copy to clipboard");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ParallaxStarfield />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              {viewMode === "apps" ? "🚀 Digital Vault" : "📝 Secure Notes"}
            </Text>
            <Text style={styles.subtitle}>
              {viewMode === "apps"
                ? loading
                  ? "Scanning quantum space for installed applications..."
                  : `${installedApps.length} apps detected • Select to secure credentials`
                : "Store classified information with quantum encryption"}
            </Text>
          </View>

          {viewMode === "notes" && (
            <ReachPressable
              onPress={() => setNoteModalVisible(true)}
              style={styles.addButton}
              reachScale={1.05}
              pressScale={0.95}
            >
              <LinearGradient
                colors={[Colors.dark.neonGreen, Colors.dark.primary]}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={20} color={Colors.dark.background} />
              </LinearGradient>
            </ReachPressable>
          )}
        </View>

        <View style={styles.toggleContainer}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.02)"]}
            style={styles.toggleBackground}
          >
            <ReachPressable
              onPress={() => setViewMode("apps")}
              style={[
                styles.toggleButton,
                viewMode === "apps" && styles.toggleButtonActive,
              ]}
              reachScale={1.02}
              pressScale={0.98}
            >
              {viewMode === "apps" && (
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  style={styles.toggleButtonGradient}
                />
              )}
              <Ionicons
                name="apps"
                size={16}
                color={
                  viewMode === "apps"
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "apps" && styles.toggleTextActive,
                ]}
              >
                Apps
              </Text>
            </ReachPressable>
            <ReachPressable
              onPress={() => setViewMode("notes")}
              style={[
                styles.toggleButton,
                viewMode === "notes" && styles.toggleButtonActive,
              ]}
              reachScale={1.02}
              pressScale={0.98}
            >
              {viewMode === "notes" && (
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  style={styles.toggleButtonGradient}
                />
              )}
              <Ionicons
                name="document-lock"
                size={16}
                color={
                  viewMode === "notes"
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "notes" && styles.toggleTextActive,
                ]}
              >
                Notes
              </Text>
            </ReachPressable>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.12)",
              "rgba(255, 255, 255, 0.04)",
              "rgba(255, 255, 255, 0.02)",
            ]}
            style={styles.searchGradient}
          >
            <View style={styles.searchIconContainer}>
              <Ionicons
                name="search"
                size={20}
                color={
                  searchQuery.length > 0
                    ? Colors.dark.primary
                    : Colors.dark.textMuted
                }
              />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={
                viewMode === "apps"
                  ? "Search apps by name or package..."
                  : "Search notes by title, content, or tags..."
              }
              placeholderTextColor={Colors.dark.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="never"
            />
            {searchQuery.length > 0 && (
              <ReachPressable
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchButton}
                reachScale={1.1}
                pressScale={0.9}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.dark.primary}
                />
              </ReachPressable>
            )}
          </LinearGradient>
        </View>

        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <LinearGradient
              colors={["rgba(0, 212, 255, 0.08)", "rgba(0, 255, 136, 0.04)"]}
              style={styles.searchResultsGradient}
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.dark.primary}
              />
              <Text style={styles.searchResultsText}>
                {viewMode === "apps"
                  ? `${filteredApps.length} ${
                      filteredApps.length === 1 ? "app" : "apps"
                    } found`
                  : `${filteredNotes.length} ${
                      filteredNotes.length === 1 ? "note" : "notes"
                    } found`}
              </Text>
              <ReachPressable
                onPress={() => setSearchQuery("")}
                style={styles.clearResultsButton}
                reachScale={1.05}
                pressScale={0.95}
              >
                <Text style={styles.clearResultsText}>Clear</Text>
              </ReachPressable>
            </LinearGradient>
          </View>
        )}
      </View>

      {viewMode === "apps" && !loading && (
        <CategoryFilter
          categories={[
            "All",
            ...new Set(
              installedApps
                .filter((app) => app.category)
                .map((app) => app.category!)
            ),
          ]}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {viewMode === "apps" &&
        (loading ? (
          <LoadingSpinner />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="warning-outline"
              size={48}
              color={Colors.dark.error}
            />
            <Text style={styles.errorTitle}>Unable to Load Apps</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadInstalledApps}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={[
              styles.appsList,
              { paddingBottom: insets.bottom + 110 },
            ]}
            columnWrapperStyle={styles.appsRow}
            renderItem={({ item, index }) => (
              <AppCard
                app={item}
                index={index}
                hasPassword={
                  appsWithPasswords.has(item.id) ||
                  appsWithPasswords.has(item.name.toLowerCase())
                }
                onAddPassword={handleAddPassword}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadInstalledApps}
                tintColor={Colors.dark.primary}
                colors={[Colors.dark.primary]}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="apps-outline"
                  size={48}
                  color={Colors.dark.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? "No Apps Found" : "No Installed Apps"}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Install some apps and pull to refresh"}
                </Text>
              </View>
            )}
          />
        ))}

      {viewMode === "notes" && (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.notesList,
            { paddingBottom: insets.bottom + 110 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.noteSeparator} />}
          renderItem={({ item, index }) => (
            <View style={styles.noteItemContainer}>
              <SpaceNoteCard
                note={item}
                index={index}
                onEdit={handleEditNote}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-lock"
                size={48}
                color={Colors.dark.textMuted}
              />
              <Text style={styles.emptyTitle}>No Notes Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first secure note"}
              </Text>
            </View>
          )}
        />
      )}

      <AddPasswordModal
        visible={passwordModalVisible}
        app={selectedApp}
        onClose={handleClosePasswordModal}
      />

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
    backgroundColor: Colors.dark.background,
  },
  star: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  backgroundGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
  },
  headerBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  headerGradient: {
    flex: 1,
    borderRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    zIndex: 1,
    paddingTop: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
  },
  toggleContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleBackground: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  toggleButtonActive: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    letterSpacing: 0.3,
  },
  toggleTextActive: {
    color: Colors.dark.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 212, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  searchWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    minHeight: 56,
    paddingHorizontal: 4,
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "500",
    paddingVertical: 0,
    includeFontPadding: false,
    paddingRight: 16,
  },
  categoryContainer: {
    marginBottom: 18,
  },
  categoryChip: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryChipActive: {
    shadowColor: Colors.dark.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryChipContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  categoryTextActive: {
    color: Colors.dark.background,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  appsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  appsRow: {
    justifyContent: "space-between",
    marginBottom: 5,
  },
  appCardContainer: {
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  appCardPressable: {
    borderRadius: 20,
    overflow: "hidden",
  },
  appCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 15,
    minHeight: 160,
    justifyContent: "space-between",
  },
  appCardSecured: {
    borderColor: "rgba(0, 255, 136, 0.3)",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  appIconWrapper: {
    position: "relative",
  },
  securityBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 255, 136, 0.2)",
    borderWidth: 2,
    borderColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  appCardInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  appMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  appCategory: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  supportedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  supportedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.neonGreen,
  },
  supportedText: {
    fontSize: 10,
    color: Colors.dark.neonGreen,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  appCardContent: {
    flex: 1,
    marginVertical: 8,
  },
  packageName: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontStyle: "italic",
    fontFamily: "monospace",
  },
  appCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  appCardActions: {
    flex: 1,
  },
  securedActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  securedActionText: {
    fontSize: 12,
    color: Colors.dark.neonGreen,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  addActionText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  notesList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  noteItemContainer: {
    paddingHorizontal: 2,
  },
  noteSeparator: {
    height: 20,
  },
  noteDateText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  appCardUnsupported: {
    opacity: 0.7,
    borderColor: Colors.dark.textMuted + "40",
  },
  categoryBadgeUnsupported: {
    backgroundColor: Colors.dark.textMuted + "20",
  },
  categoryBadgeTextUnsupported: {
    color: Colors.dark.textMuted,
  },
  loadingContainer: {
    flex: 1,
    marginBottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "40",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: Colors.dark.background,
    fontWeight: "600",
    fontSize: 14,
  },
  clearSearchButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  searchResults: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchResultsGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    borderRadius: 16,
  },
  searchResultsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  clearResultsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
  },
  clearResultsText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
