import AppIcon from "@/components/ui/AppIcon";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { getInstalledApps } from "@/services/apps/appDetection";
import { InstalledApp, SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddNoteModal from "../../components/add-note-modal";
import AddPasswordModal from "../../components/add-password-modal";

const AnimatedView = Animated.createAnimatedComponent(View);

const TwinklingStar = React.memo(
  ({ style, size }: { style: object; size: number }) => {
    return (
      <View
        style={[
          styles.star,
          { width: size, height: size, borderRadius: size / 2, opacity: 0.4 },
          style,
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

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.appCardContainer,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.appCard,
            !app.isSupported && styles.appCardUnsupported,
          ]}
        >
          <View style={styles.appCardHeader}>
            <AppIcon
              appName={app.name}
              appId={app.id}
              icon={app.icon}
              size="medium"
              showGlow={app.isSupported}
            />
            <View style={styles.appCardInfo}>
              <Text style={styles.appName} numberOfLines={1}>
                {app.name}
              </Text>
              <Text style={styles.appCategory} numberOfLines={1}>
                {app.category || (app.isSupported ? "Supported" : "Custom App")}
              </Text>
            </View>
          </View>

          <View style={styles.appCardFooter}>
            <View
              style={[
                styles.categoryBadge,
                !app.isSupported && styles.categoryBadgeUnsupported,
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  !app.isSupported && styles.categoryBadgeTextUnsupported,
                ]}
              >
                {app.isSupported ? app.category : "Custom"}
              </Text>
            </View>

            <View
              style={[
                styles.actionButton,
                hasPassword && styles.actionButtonSaved,
              ]}
            >
              {hasPassword ? (
                <>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={Colors.dark.neonGreen}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: Colors.dark.neonGreen },
                    ]}
                  >
                    Secured
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={14}
                    color={Colors.dark.primary}
                  />
                  <Text style={styles.actionText}>Add Password</Text>
                </>
              )}
            </View>
          </View>

          {app.packageName && (
            <Text style={styles.packageName} numberOfLines={1}>
              {app.packageName}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
);

const SecureNoteCard = ({
  note,
  index,
  onPress,
}: {
  note: SecureNote;
  index: number;
  onPress: (note: SecureNote) => void;
}) => {
  const previewText =
    note.content.length > 80
      ? note.content.substring(0, 80) + "..."
      : note.content;

  return (
    <Pressable onPress={() => onPress(note)} style={styles.noteCardContainer}>
      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Ionicons
            name="document-lock"
            size={20}
            color={Colors.dark.primary}
          />
          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {note.title}
            </Text>
            <Text style={styles.noteCategory}>
              {note.category} • {note.tags.length} tags
            </Text>
          </View>
        </View>

        <Text style={styles.notePreview} numberOfLines={3}>
          {previewText}
        </Text>

        <View style={styles.noteFooter}>
          <View style={styles.noteDate}>
            <Text style={styles.noteDateText}>
              {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          {note.isFavorite && (
            <Ionicons name="heart" size={14} color={Colors.dark.neonGreen} />
          )}
        </View>
      </View>
    </Pressable>
  );
};

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
      <AnimatedView style={[styles.loadingSpinner, animatedStyle]}>
        <Ionicons name="sync" size={32} color={Colors.dark.primary} />
      </AnimatedView>
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
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onCategoryChange(item)}
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
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
  };

  const handleNotePress = (note: SecureNote) => {
    // TODO: Navigate to note details or edit
    Alert.alert("Note Selected", `Opening: ${note.title}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ParallaxStarfield />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>
              {viewMode === "apps" ? "Your Apps" : "Secure Notes"}
            </Text>
            <Text style={styles.subtitle}>
              {viewMode === "apps"
                ? loading
                  ? "Scanning your device for installed apps..."
                  : `${installedApps.length} apps found • Choose one to add credentials`
                : "Store sensitive information securely"}
            </Text>
          </View>

          {viewMode === "notes" && (
            <Pressable
              onPress={() => setNoteModalVisible(true)}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={Colors.dark.background} />
            </Pressable>
          )}
        </View>

        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setViewMode("apps")}
            style={[
              styles.toggleButton,
              viewMode === "apps" && styles.toggleButtonActive,
            ]}
          >
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
          </Pressable>
          <Pressable
            onPress={() => setViewMode("notes")}
            style={[
              styles.toggleButton,
              viewMode === "notes" && styles.toggleButtonActive,
            ]}
          >
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
          </Pressable>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <BlurView intensity={20} tint="dark" style={styles.searchBlur}>
          <View
            style={[
              styles.searchContent,
              searchQuery.length > 0 && styles.searchContentActive,
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={
                searchQuery.length > 0
                  ? Colors.dark.primary
                  : Colors.dark.textMuted
              }
            />
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
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.dark.primary}
                />
              </Pressable>
            )}
            <Pressable style={styles.filterButton}>
              <Ionicons name="options" size={20} color={Colors.dark.primary} />
            </Pressable>
          </View>
        </BlurView>

        {searchQuery.length > 0 && (
          <View style={styles.searchSummary}>
            <Text style={styles.searchSummaryText}>
              {viewMode === "apps"
                ? `${filteredApps.length} ${
                    filteredApps.length === 1 ? "app" : "apps"
                  } found`
                : `${filteredNotes.length} ${
                    filteredNotes.length === 1 ? "note" : "notes"
                  } found`}
            </Text>
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllText}>Clear</Text>
              </Pressable>
            )}
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
          renderItem={({ item, index }) => (
            <SecureNoteCard
              note={item}
              index={index}
              onPress={handleNotePress}
            />
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

      <AddNoteModal visible={noteModalVisible} onClose={handleCloseNoteModal} />
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
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  toggleTextActive: {
    color: Colors.dark.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBlur: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 27, 0.6)",
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 48,
  },
  searchContentActive: {
    backgroundColor: "rgba(26, 26, 27, 0.9)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(26, 26, 27, 0.6)",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.dark.primary + "20",
    borderColor: Colors.dark.borderAccent,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  appsList: {
    paddingHorizontal: 16,
  },
  appsRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  appCardContainer: {
    width: "48%",
  },
  appCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
    padding: 14,
    minHeight: 130,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  appCardInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  appCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 10,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  actionButtonSaved: {
    backgroundColor: Colors.dark.neonGreen + "15",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  packageName: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 6,
    fontStyle: "italic",
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
    paddingHorizontal: 16,
  },
  noteCardContainer: {
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  noteCategory: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  notePreview: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDate: {
    backgroundColor: Colors.dark.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noteDateText: {
    fontSize: 10,
    color: Colors.dark.primary,
    fontWeight: "600",
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
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
  searchSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  searchSummaryText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
});
