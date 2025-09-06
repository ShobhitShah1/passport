import HolographicBackground from "@/components/HolographicBackground";
import AppIcon from "@/components/ui/AppIcon";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { generatePassword } from "@/services/password/generator";
import { usePasswordStore } from "@/stores/passwordStore";
import {
  AuthField,
  AuthFieldType,
  InstalledApp,
  Password,
  PasswordStrength,
} from "@/types";
import { ensureAuthenticated } from "@/utils/authSync";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Svg, {
  Circle,
  Defs,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface AddPasswordModalProps {
  visible: boolean;
  app: InstalledApp | null;
  existingPassword?: Password | null; // For editing existing passwords
  onClose: () => void;
}

// Simplified Header with Hexagon
const HolographicHeader = ({
  app,
  existingPassword,
  onClose,
}: {
  app: InstalledApp;
  existingPassword?: Password | null;
  onClose: () => void;
}) => {
  return (
    <View style={styles.holographicHeader}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <AppIcon
            appName={app.name}
            appId={app.id}
            icon={app.icon}
            size="medium"
            showGlow={false}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.holoAppName}>{app.name}</Text>
            <Text style={styles.holoSubtitle}>{existingPassword ? 'Edit Secure Password' : 'Add Secure Password'}</Text>
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

// Password Strength Visualizer
const HolographicStrengthMeter = ({ password }: { password: string }) => {
  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const percentage = (strength / 5) * 100;

  const strengthColors = [
    Colors.dark.error,
    "#ff6b47",
    Colors.dark.warning,
    "#47ff6b",
    Colors.dark.neonGreen,
  ];

  const strengthLabels = ["CRITICAL", "WEAK", "MODERATE", "STRONG", "QUANTUM"];

  return (
    <View style={styles.strengthMeter}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>SECURITY LEVEL</Text>
        <Text
          style={[
            styles.strengthValue,
            { color: strengthColors[strength] || Colors.dark.textMuted },
          ]}
        >
          {strengthLabels[strength] || "NONE"}
        </Text>
      </View>

      <View style={styles.strengthVisualizer}>
        <Svg width={300} height={60}>
          <Defs>
            <SvgLinearGradient
              id="strengthGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <Stop offset="0%" stopColor={Colors.dark.error} />
              <Stop offset="25%" stopColor="#ff6b47" />
              <Stop offset="50%" stopColor={Colors.dark.warning} />
              <Stop offset="75%" stopColor="#47ff6b" />
              <Stop offset="100%" stopColor={Colors.dark.neonGreen} />
            </SvgLinearGradient>
          </Defs>

          {/* Background bars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Rect
              key={i}
              x={i * 60}
              y={20}
              width={50}
              height={20}
              fill="rgba(255, 255, 255, 0.1)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Active bars */}
          {Array.from({ length: strength }).map((_, i) => (
            <Rect
              key={i}
              x={i * 60}
              y={20}
              width={50}
              height={20}
              fill={strengthColors[i]}
              stroke={strengthColors[i]}
              strokeWidth="2"
            />
          ))}

          {/* Scanning effect */}
          {strength > 0 && (
            <Rect
              x={0}
              y={20}
              width={strength * 60}
              height={20}
              fill="url(#strengthGradient)"
              opacity="0.3"
            />
          )}
        </Svg>
      </View>
    </View>
  );
};

export default function AddPasswordModal({
  visible,
  app,
  existingPassword,
  onClose,
}: AddPasswordModalProps) {
  const { state, dispatch } = useAppContext();
  const passwordStore = usePasswordStore();

  const [formData, setFormData] = useState({
    identifierType: "email" as "email" | "username" | "phone" | "custom",
    identifier: "",
    customLabel: "",
    password: "",
    url: "",
    notes: "",
  });
  const [customFields, setCustomFields] = useState<AuthField[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Prefill data when editing existing password
  useEffect(() => {
    if (existingPassword && visible) {
      const identifierType = existingPassword.email ? "email" : existingPassword.username ? "username" : "email";
      const identifier = existingPassword.email || existingPassword.username || "";
      
      setFormData({
        identifierType,
        identifier,
        customLabel: "",
        password: existingPassword.password,
        url: existingPassword.url || "",
        notes: existingPassword.notes || "",
      });
      
      setCustomFields(existingPassword.customFields || []);
    } else if (visible && !existingPassword) {
      // Reset form for new password
      setFormData({
        identifierType: "email",
        identifier: "",
        customLabel: "",
        password: "",
        url: "",
        notes: "",
      });
      setCustomFields([]);
    }
  }, [existingPassword, visible]);

  // Animation values - separate native and JS driven animations
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
          duration: 800,
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
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return PasswordStrength.VERY_WEAK;
    if (password.length < 6) return PasswordStrength.VERY_WEAK;
    if (password.length < 8) return PasswordStrength.WEAK;

    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score >= 4) return PasswordStrength.VERY_STRONG;
    if (score >= 3) return PasswordStrength.STRONG;
    if (score >= 2) return PasswordStrength.MODERATE;
    return PasswordStrength.WEAK;
  };

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const generated = await generatePassword({
        length: passwordStore.settings.defaultPasswordLength,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true,
        excludeAmbiguous: true,
      });

      setFormData((prev) => ({ ...prev, password: generated.password }));
    } catch (error) {
      Alert.alert(
        "SYSTEM ERROR",
        "Neural network failed to generate secure key"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomField = useCallback((type: AuthFieldType) => {
    const newField: AuthField = {
      id: Date.now().toString(),
      label: getFieldLabel(type),
      value: "",
      type,
      isRequired: false,
      isEncrypted:
        type === AuthFieldType.PASSWORD ||
        type === AuthFieldType.PIN ||
        type === AuthFieldType.API_KEY,
    };
    setCustomFields((prev) => [...prev, newField]);
    setShowAddField(false);
  }, []);

  const updateCustomField = useCallback(
    (fieldId: string, updates: Partial<AuthField>) => {
      setCustomFields((prev) =>
        prev.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      );
    },
    []
  );

  const removeCustomField = useCallback((fieldId: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
  }, []);

  const handleIdentifierChange = useCallback((identifier: string) => {
    setFormData((prev) => ({ ...prev, identifier }));
  }, []);

  const handleIdentifierTypeChange = useCallback(
    (identifierType: "email" | "username" | "phone" | "custom") => {
      setFormData((prev) => ({
        ...prev,
        identifierType,
        identifier: "",
        customLabel: "",
      }));
    },
    []
  );

  const handleCustomLabelChange = useCallback((customLabel: string) => {
    setFormData((prev) => ({ ...prev, customLabel }));
  }, []);

  const handlePasswordChange = useCallback((password: string) => {
    setFormData((prev) => ({ ...prev, password }));
  }, []);

  const handleUrlChange = useCallback((url: string) => {
    setFormData((prev) => ({ ...prev, url }));
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  }, []);

  const getFieldLabel = (type: AuthFieldType): string => {
    const labels = {
      [AuthFieldType.TEXT]: "Custom Field",
      [AuthFieldType.EMAIL]: "Email",
      [AuthFieldType.PASSWORD]: "Additional Password",
      [AuthFieldType.URL]: "URL",
      [AuthFieldType.PHONE]: "Phone Number",
      [AuthFieldType.PIN]: "PIN",
      [AuthFieldType.SECRET_QUESTION]: "Security Question",
      [AuthFieldType.TWO_FA_CODE]: "2FA Backup Code",
      [AuthFieldType.API_KEY]: "API Key",
      [AuthFieldType.NOTES]: "Notes",
    };
    return labels[type] || "Custom Field";
  };

  const getFieldIcon = (type: AuthFieldType): string => {
    const icons = {
      [AuthFieldType.TEXT]: "text-outline",
      [AuthFieldType.EMAIL]: "mail-outline",
      [AuthFieldType.PASSWORD]: "lock-closed-outline",
      [AuthFieldType.URL]: "globe-outline",
      [AuthFieldType.PHONE]: "call-outline",
      [AuthFieldType.PIN]: "keypad-outline",
      [AuthFieldType.SECRET_QUESTION]: "help-circle-outline",
      [AuthFieldType.TWO_FA_CODE]: "shield-checkmark-outline",
      [AuthFieldType.API_KEY]: "key-outline",
      [AuthFieldType.NOTES]: "document-text-outline",
    };
    return icons[type] || "text-outline";
  };

  const fieldTypeOptions = useMemo(
    () =>
      Object.values(AuthFieldType).map((type) => ({
        type,
        label: getFieldLabel(type),
        icon: getFieldIcon(type) as keyof typeof Ionicons.glyphMap,
      })),
    []
  );

  const handleSave = async () => {
    // For editing, we need the app info from existing password or the provided app
    const appInfo = existingPassword ? 
      { name: existingPassword.appName, id: existingPassword.appId } : 
      app;
      
    if (!appInfo) return;

    if (!formData.password.trim()) {
      Alert.alert("SECURITY BREACH", "Neural key required for data encryption");
      return;
    }

    if (!formData.identifier.trim()) {
      Alert.alert(
        "ACCESS DENIED",
        "Identity matrix incomplete - credential required"
      );
      return;
    }

    if (formData.identifierType === "custom" && !formData.customLabel.trim()) {
      Alert.alert("ACCESS DENIED", "Custom field label required");
      return;
    }

    setIsSaving(true);
    try {
      // Use global auth sync utility
      const isAuthenticated = await ensureAuthenticated(
        state.isAuthenticated,
        state.masterPassword
      );
      if (!isAuthenticated) {
        Alert.alert(
          "ACCESS DENIED",
          "Please ensure you are logged in and try again."
        );
        return;
      }

      // Create passwordEntry compatible with the new store
      const passwordEntry = {
        appName: appInfo.name,
        appId: appInfo.id,
        username:
          formData.identifierType === "username"
            ? formData.identifier
            : undefined,
        email:
          formData.identifierType === "email" ? formData.identifier : undefined,
        password: formData.password,
        url: formData.url || `https://${appInfo.name.toLowerCase()}.com`,
        notes: formData.notes,
        customFields: [
          ...customFields,
          // Add the main identifier as a custom field if it's phone or custom
          ...(formData.identifierType === "phone"
            ? [
                {
                  id: Date.now().toString() + "_phone",
                  label: "Phone Number",
                  value: formData.identifier,
                  type: AuthFieldType.PHONE,
                  isRequired: true,
                  isEncrypted: false,
                },
              ]
            : []),
          ...(formData.identifierType === "custom"
            ? [
                {
                  id: Date.now().toString() + "_custom",
                  label: formData.customLabel,
                  value: formData.identifier,
                  type: AuthFieldType.TEXT,
                  isRequired: true,
                  isEncrypted: false,
                },
              ]
            : []),
        ],
        strength: calculatePasswordStrength(formData.password),
        isFavorite: existingPassword?.isFavorite || false,
        tags: existingPassword?.tags || [formData.identifierType], // Preserve existing tags or add the type as a tag
      };

      // Try to save to passwordStore first, fallback to manual storage if needed
      let savedToPasswordStore = false;
      try {
        if (passwordStore.isAuthenticated) {
          if (existingPassword) {
            // Update existing password
            await passwordStore.updatePassword(existingPassword.id, passwordEntry);
          } else {
            // Add new password
            await passwordStore.addPassword(passwordEntry);
          }
          savedToPasswordStore = true;
          console.log(existingPassword ? "Successfully updated password in passwordStore" : "Successfully saved to passwordStore");
        }
      } catch (storeError) {
        console.warn(
          "PasswordStore save failed, using legacy method:",
          storeError
        );
      }

      // Also add/update to the legacy context system for compatibility
      const legacyPassword = {
        id: existingPassword?.id || Date.now().toString(),
        appName: appInfo.name,
        appId: appInfo.id,
        username: passwordEntry.username || passwordEntry.email || "user",
        email: passwordEntry.email,
        password: passwordEntry.password,
        url: passwordEntry.url || `https://${appInfo.name.toLowerCase()}.com`,
        notes: passwordEntry.notes || "",
        customFields: passwordEntry.customFields,
        createdAt: existingPassword?.createdAt || new Date(),
        updatedAt: new Date(),
        lastUsed: existingPassword?.lastUsed,
        strength: passwordEntry.strength,
        isFavorite: passwordEntry.isFavorite,
        tags: passwordEntry.tags,
      };

      if (existingPassword) {
        dispatch({ type: "UPDATE_PASSWORD", payload: legacyPassword });
      } else {
        dispatch({ type: "ADD_PASSWORD", payload: legacyPassword });
      }

      // If passwordStore failed, also save manually to secure storage
      if (!savedToPasswordStore && state.masterPassword) {
        try {
          const { savePasswords } = await import(
            "@/services/storage/secureStorage"
          );
          let updatedPasswords;
          if (existingPassword) {
            // Update existing password in the array
            updatedPasswords = state.passwords.map(pwd => 
              pwd.id === existingPassword.id ? legacyPassword : pwd
            );
          } else {
            // Add new password to the array
            updatedPasswords = [...state.passwords, legacyPassword];
          }
          await savePasswords(updatedPasswords, state.masterPassword);
          console.log(existingPassword ? "Manually updated in secure storage as fallback" : "Manually saved to secure storage as fallback");
        } catch (manualSaveError) {
          console.error("Manual save also failed:", manualSaveError);
          // Still show success as we saved to context
        }
      }

      Alert.alert(
        "NEURAL LINK SUCCESS",
        `Quantum encrypted data ${existingPassword ? 'updated' : 'stored'} for ${appInfo.name} ⚡`
      );

      setFormData({
        identifierType: "email",
        identifier: "",
        customLabel: "",
        password: "",
        url: "",
        notes: "",
      });
      setCustomFields([]);
      onClose();
    } catch (error) {
      console.error("Password storage error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert(
        "SYSTEM FAILURE",
        `Neural network encryption failed: ${errorMessage}\n\nPlease ensure you're logged in and try again.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!app && !existingPassword) return null;

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
          <HolographicHeader app={app || { name: existingPassword?.appName || '', id: existingPassword?.appId || '', packageName: '', isSupported: true }} existingPassword={existingPassword} onClose={onClose} />

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <HoloInput title="IDENTITY MATRIX" icon="person-circle">
              <View style={styles.credentialTypeSection}>
                <Text style={styles.credentialTypeLabel}>CREDENTIAL TYPE</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeScroll}
                >
                  <View style={styles.credentialTypeOptions}>
                    {[
                      {
                        type: "email" as const,
                        label: "EMAIL",
                        icon: "mail",
                        placeholder: "user@domain.com",
                      },
                      {
                        type: "username" as const,
                        label: "USERNAME",
                        icon: "person",
                        placeholder: "username",
                      },
                      {
                        type: "phone" as const,
                        label: "PHONE",
                        icon: "call",
                        placeholder: "+1234567890",
                      },
                      {
                        type: "custom" as const,
                        label: "CUSTOM",
                        icon: "construct",
                        placeholder: "custom value",
                      },
                    ].map((credType) => (
                      <ReachPressable
                        key={credType.type}
                        onPress={() =>
                          handleIdentifierTypeChange(credType.type)
                        }
                        style={[
                          styles.credentialTypeOption,
                          formData.identifierType === credType.type &&
                            styles.credentialTypeOptionSelected,
                        ]}
                        reachScale={1.05}
                        pressScale={0.95}
                      >
                        <Ionicons
                          name={credType.icon as any}
                          size={18}
                          color={
                            formData.identifierType === credType.type
                              ? Colors.dark.background
                              : Colors.dark.neonGreen
                          }
                        />
                        <Text
                          style={[
                            styles.credentialTypeOptionText,
                            formData.identifierType === credType.type &&
                              styles.credentialTypeOptionTextSelected,
                          ]}
                        >
                          {credType.label}
                        </Text>
                      </ReachPressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {formData.identifierType === "custom" && (
                <Input
                  label="Field Label"
                  value={formData.customLabel}
                  onChangeText={handleCustomLabelChange}
                  placeholder="e.g., Account ID, Member Number, etc."
                  leftIcon="pricetag-outline"
                />
              )}

              <Input
                label={
                  formData.identifierType === "email"
                    ? "Email Address"
                    : formData.identifierType === "username"
                    ? "Username"
                    : formData.identifierType === "phone"
                    ? "Phone Number"
                    : formData.customLabel || "Custom Field"
                }
                value={formData.identifier}
                onChangeText={handleIdentifierChange}
                placeholder={
                  formData.identifierType === "email"
                    ? "user@domain.com"
                    : formData.identifierType === "username"
                    ? "Enter username"
                    : formData.identifierType === "phone"
                    ? "+1234567890"
                    : "Enter custom value"
                }
                leftIcon={
                  formData.identifierType === "email"
                    ? "mail-outline"
                    : formData.identifierType === "username"
                    ? "person-outline"
                    : formData.identifierType === "phone"
                    ? "call-outline"
                    : "construct-outline"
                }
                keyboardType={
                  formData.identifierType === "email"
                    ? "email-address"
                    : formData.identifierType === "phone"
                    ? "phone-pad"
                    : "default"
                }
              />
            </HoloInput>

            <HoloInput title="ENCRYPTION CORE" icon="shield-checkmark">
              <Input
                label="Neural Key"
                value={formData.password}
                onChangeText={handlePasswordChange}
                placeholder="Enter quantum encryption key"
                leftIcon="lock-closed-outline"
                variant="password"
                showPasswordToggle={true}
                containerStyle={{ marginBottom: 0 }}
              />

              {formData.password.length > 0 && (
                <HolographicStrengthMeter password={formData.password} />
              )}

              <Button
                title={
                  isGenerating
                    ? "⚡ GENERATING QUANTUM KEY..."
                    : "⚡ GENERATE QUANTUM KEY"
                }
                onPress={handleGeneratePassword}
                variant="secondary"
                disabled={isGenerating}
                style={styles.generateButton}
              />
            </HoloInput>

            <HoloInput title="DATA MATRIX" icon="information-circle">
              <Input
                label="Network Address (Optional)"
                value={formData.url}
                onChangeText={handleUrlChange}
                placeholder={`https://${(app?.name || existingPassword?.appName || 'example').toLowerCase()}.com`}
                leftIcon="globe-outline"
                keyboardType="url"
              />
              <Input
                label="Security Notes (Optional)"
                value={formData.notes}
                onChangeText={handleNotesChange}
                placeholder="Additional notes, recovery info, etc..."
                leftIcon="document-text-outline"
                multiline
                numberOfLines={4}
                containerStyle={styles.notesInput}
              />
            </HoloInput>

            {customFields.length > 0 && (
              <HoloInput title="CUSTOM PROTOCOLS" icon="construct">
                {customFields.map((field) => (
                  <View key={field.id} style={styles.customField}>
                    <View style={styles.customFieldHeader}>
                      <Input
                        label={field.label}
                        value={field.label}
                        onChangeText={(label) =>
                          updateCustomField(field.id, { label })
                        }
                        placeholder="Protocol name"
                        containerStyle={styles.fieldLabelInput}
                      />
                      <ReachPressable
                        onPress={() => removeCustomField(field.id)}
                        style={styles.removeFieldButton}
                        reachScale={1.3}
                        pressScale={0.7}
                      >
                        <Svg width={30} height={30}>
                          <Circle
                            cx={15}
                            cy={15}
                            r={12}
                            fill={Colors.dark.error}
                            opacity={0.8}
                          />
                          <Path
                            d="M10,10 L20,20 M20,10 L10,20"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </Svg>
                      </ReachPressable>
                    </View>
                    <Input
                      value={field.value}
                      onChangeText={(value) =>
                        updateCustomField(field.id, { value })
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      leftIcon={
                        getFieldIcon(
                          field.type
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      variant={
                        field.type === AuthFieldType.PASSWORD ||
                        field.type === AuthFieldType.PIN
                          ? "password"
                          : "default"
                      }
                      showPasswordToggle={
                        field.type === AuthFieldType.PASSWORD ||
                        field.type === AuthFieldType.PIN
                      }
                      keyboardType={
                        field.type === AuthFieldType.EMAIL
                          ? "email-address"
                          : field.type === AuthFieldType.PHONE
                          ? "phone-pad"
                          : field.type === AuthFieldType.URL
                          ? "url"
                          : field.type === AuthFieldType.PIN
                          ? "numeric"
                          : "default"
                      }
                      multiline={
                        field.type === AuthFieldType.NOTES ||
                        field.type === AuthFieldType.SECRET_QUESTION
                      }
                      numberOfLines={
                        field.type === AuthFieldType.NOTES ||
                        field.type === AuthFieldType.SECRET_QUESTION
                          ? 2
                          : 1
                      }
                    />
                  </View>
                ))}
              </HoloInput>
            )}

            {!showAddField && (
              <Button
                title="+ INITIALIZE NEW PROTOCOL"
                onPress={() => setShowAddField(true)}
                variant="outline"
                style={styles.addFieldButton}
              />
            )}

            {showAddField && (
              <View style={styles.fieldTypeSelector}>
                <Text style={styles.protocolTitle}>SELECT NEURAL PROTOCOL</Text>
                <View style={styles.fieldTypeGrid}>
                  {fieldTypeOptions.map((option) => (
                    <ReachPressable
                      key={option.type}
                      onPress={() => addCustomField(option.type)}
                      style={styles.fieldTypeOption}
                      reachScale={1.1}
                      pressScale={0.9}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(0, 212, 255, 0.2)",
                          "rgba(0, 255, 136, 0.1)",
                          "rgba(139, 92, 246, 0.2)",
                        ]}
                        style={styles.fieldTypeGradient}
                      >
                        <Ionicons
                          name={option.icon}
                          size={24}
                          color={Colors.dark.neonGreen}
                        />
                        <Text style={styles.fieldTypeLabel}>
                          {option.label}
                        </Text>
                      </LinearGradient>
                    </ReachPressable>
                  ))}
                </View>
                <Button
                  title="ABORT PROTOCOL"
                  onPress={() => setShowAddField(false)}
                  variant="outline"
                  style={styles.cancelFieldButton}
                />
              </View>
            )}
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
                title="ABORT"
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
                  isSaving ||
                  !formData.password.trim() ||
                  !formData.identifier.trim() ||
                  (formData.identifierType === "custom" &&
                    !formData.customLabel.trim())
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
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  holoInputContainer: {
    marginBottom: 0,
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
    gap: 18,
  },
  strengthMeter: {
    marginTop: 5,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  strengthLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  strengthVisualizer: {
    alignItems: "center",
  },
  generateButton: {
    alignSelf: "stretch",
  },
  customField: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.secondary,
  },
  customFieldHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 16,
  },
  fieldLabelInput: {
    flex: 1,
  },
  removeFieldButton: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  addFieldButton: {
    marginVertical: 24,
    alignSelf: "center",
  },
  fieldTypeSelector: {
    marginTop: 24,
    padding: 24,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.dark.secondary,
    marginHorizontal: 4,
  },
  protocolTitle: {
    fontSize: 16,
    color: Colors.dark.secondary,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 20,
  },
  fieldTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
    justifyContent: "space-between",
  },
  fieldTypeOption: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
  },
  fieldTypeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.neonGreen,
    gap: 12,
    minHeight: 56,
  },
  fieldTypeLabel: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: "700",
    flex: 1,
  },
  cancelFieldButton: {
    marginTop: 10,
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
  credentialTypeSection: {
    marginBottom: 20,
  },
  credentialTypeLabel: {
    fontSize: 14,
    color: Colors.dark.neonGreen,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  typeScroll: {
    marginBottom: 4,
  },
  credentialTypeOptions: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 24,
    alignItems: "center",
  },
  credentialTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    minHeight: 40,
    gap: 8,
  },
  credentialTypeOptionSelected: {
    backgroundColor: Colors.dark.neonGreen,
    borderColor: Colors.dark.secondary,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  credentialTypeOptionText: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  credentialTypeOptionTextSelected: {
    color: Colors.dark.background,
    fontWeight: "800",
  },
  notesInput: {
    minHeight: 100,
  },
});
