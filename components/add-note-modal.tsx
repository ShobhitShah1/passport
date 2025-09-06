import HolographicBackground from "@/components/HolographicBackground";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { saveSecureNotes } from "@/services/storage/secureStorage";
import { SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

// Simplified Header
const HolographicHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <View style={styles.holographicHeader}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Ionicons
            name="document-lock"
            size={40}
            color={Colors.dark.neonGreen}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.holoAppName}>Secure Note</Text>
            <Text style={styles.holoSubtitle}>Create Encrypted Note</Text>
          </View>
        </View>

        <ReachPressable
          onPress={onClose}
          style={styles.holoCloseButton}
          reachScale={1.1}
          pressScale={0.9}
        >
          <Ionicons name="close-circle" size={32} color={Colors.dark.error} />
        </ReachPressable>
      </View>
    </View>
  );
};

// Futuristic Input Container
const HoloInput = ({
  children,
  title,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  icon: string;
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.holoInputContainer}>
      <Animated.View
        style={[
          styles.holoInputGlow,
          {
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.8],
            }),
          },
        ]}
      >
        <View style={styles.holoInputBg}>
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

          <View style={styles.holoInputHeader}>
            <Ionicons
              name={icon as any}
              size={24}
              color={Colors.dark.neonGreen}
            />
            <Text style={styles.holoInputTitle}>{title}</Text>
            <View style={styles.holoLine} />
          </View>

          <View style={styles.holoInputContent}>{children}</View>
        </View>
      </Animated.View>
    </View>
  );
};

const NOTE_CATEGORIES = [
  "Personal",
  "Work",
  "Finance",
  "Travel",
  "Health",
  "Important",
  "Other",
];

export default function AddNoteModal({ visible, onClose }: AddNoteModalProps) {
  const { state, dispatch } = useAppContext();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Personal",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert(
        "SECURITY BREACH",
        "Neural title required for data encryption"
      );
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert("ACCESS DENIED", "Data content matrix incomplete");
      return;
    }

    setIsSaving(true);
    try {
      const newNote: SecureNote = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "ADD_SECURE_NOTE", payload: newNote });

      if (state.masterPassword) {
        const updatedNotes = [...state.secureNotes, newNote];
        await saveSecureNotes(updatedNotes, state.masterPassword);
      }

      Alert.alert(
        "NEURAL LINK SUCCESS",
        `Quantum encrypted note stored securely ⚡`
      );

      setFormData({
        title: "",
        content: "",
        category: "Personal",
        tags: "",
      });
      onClose();
    } catch (error) {
      Alert.alert("SYSTEM FAILURE", "Neural network encryption failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <HolographicBackground />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <HolographicHeader onClose={onClose} />

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <HoloInput title="NOTE IDENTITY" icon="document-text">
              <Input
                label="Neural Title"
                value={formData.title}
                onChangeText={(title) =>
                  setFormData((prev) => ({ ...prev, title }))
                }
                placeholder="Enter quantum note identifier"
                leftIcon="text-outline"
              />
            </HoloInput>

            <HoloInput title="CLASSIFICATION MATRIX" icon="library">
              <Text style={styles.categoryLabel}>Security Classification</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                <View style={styles.categoryOptions}>
                  {NOTE_CATEGORIES.map((category) => (
                    <ReachPressable
                      key={category}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, category }))
                      }
                      style={[
                        styles.categoryOption,
                        formData.category === category &&
                          styles.categoryOptionSelected,
                      ]}
                      reachScale={1.05}
                      pressScale={0.95}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === category &&
                            styles.categoryOptionTextSelected,
                        ]}
                      >
                        {category.toUpperCase()}
                      </Text>
                    </ReachPressable>
                  ))}
                </View>
              </ScrollView>
            </HoloInput>

            <HoloInput title="DATA ENCRYPTION" icon="document-lock">
              <Input
                label="Encrypted Content"
                value={formData.content}
                onChangeText={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Enter classified data content..."
                leftIcon="document-text-outline"
                multiline
                numberOfLines={8}
                containerStyle={styles.contentInput}
              />
            </HoloInput>

            <HoloInput title="NEURAL TAGS" icon="pricetag">
              <Input
                label="Meta Tags (Optional)"
                value={formData.tags}
                onChangeText={(tags) =>
                  setFormData((prev) => ({ ...prev, tags }))
                }
                placeholder="Enter quantum tags separated by commas"
                leftIcon="pricetag-outline"
              />
            </HoloInput>
          </ScrollView>

          {/* Holographic Action Panel */}
          <View style={styles.actionPanel}>
            <LinearGradient
              colors={[
                "rgba(0, 212, 255, 0.15)",
                "rgba(0, 255, 136, 0.1)",
                "rgba(139, 92, 246, 0.15)",
              ]}
              style={styles.actionGradient}
            >
              <Button
                title="ABORT MISSION"
                onPress={onClose}
                variant="outline"
                style={styles.cancelButton}
              />

              <Button
                title={
                  isSaving ? "⚡ ENCRYPTING DATA..." : "⚡ SECURE DATA LINK"
                }
                onPress={handleSave}
                variant="primary"
                disabled={
                  isSaving || !formData.title.trim() || !formData.content.trim()
                }
                style={styles.saveButton}
              />
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    marginHorizontal: 0,
  },
  holographicHeader: {
    paddingVertical: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surface,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    minHeight: 60,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  holoAppName: {
    fontSize: 20,
    color: Colors.dark.text,
    fontWeight: "700",
    marginBottom: 5,
  },
  holoSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  holoCloseButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
    minHeight: 48,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    paddingBottom: 32,
    gap: 24,
  },
  holoInputContainer: {
    marginBottom: 0,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  holoInputGlow: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  holoInputBg: {
    borderRadius: 15,
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
  holoInputHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  holoInputTitle: {
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
  holoInputContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
    gap: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: Colors.dark.neonGreen,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 4,
  },
  categoryOptions: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 24,
    alignItems: "center",
  },
  categoryOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.dark.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryOptionSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  categoryOptionText: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  categoryOptionTextSelected: {
    color: Colors.dark.background,
    fontWeight: "800",
  },
  contentInput: {
    minHeight: 160,
    alignSelf: "stretch",
  },
  actionPanel: {
    borderTopWidth: 2,
    borderTopColor: Colors.dark.primary,
  },
  actionGradient: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
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
});
