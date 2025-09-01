import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Polygon,
  Path,
  Rect,
  Line,
  G,
} from "react-native-svg";

import { useAppContext } from "@/hooks/useAppContext";
import {
  Password,
  PasswordStrength,
  AuthField,
  AuthFieldType,
  InstalledApp,
} from "@/types";
import { generatePassword } from "@/services/password/generator";
import { savePasswords } from "@/services/storage/secureStorage";
import AppIcon from "@/components/ui/AppIcon";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface AddPasswordModalProps {
  visible: boolean;
  app: InstalledApp | null;
  onClose: () => void;
}

// Futuristic Holographic Grid Background
const HolographicGrid = () => {
  const gridSize = 40;
  const rows = Math.ceil(screenHeight / gridSize);
  const cols = Math.ceil(screenWidth / gridSize);

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <SvgLinearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.3" />
          <Stop
            offset="50%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.1"
          />
          <Stop
            offset="100%"
            stopColor={Colors.dark.secondary}
            stopOpacity="0.2"
          />
        </SvgLinearGradient>
      </Defs>

      {/* Vertical Lines */}
      {Array.from({ length: cols }).map((_, i) => (
        <Line
          key={`v-${i}`}
          x1={i * gridSize}
          y1={0}
          x2={i * gridSize}
          y2={screenHeight}
          stroke="url(#gridGradient)"
          strokeWidth="0.8"
          opacity={0.4}
        />
      ))}

      {/* Horizontal Lines */}
      {Array.from({ length: rows }).map((_, i) => (
        <Line
          key={`h-${i}`}
          x1={0}
          y1={i * gridSize}
          x2={screenWidth}
          y2={i * gridSize}
          stroke="url(#gridGradient)"
          strokeWidth="0.8"
          opacity={0.4}
        />
      ))}
    </Svg>
  );
};

// Animated Particles System
const ParticleSystem = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      })),
    []
  );

  const animatedValues = useRef(
    particles.map(() => ({
      translateX: new Animated.Value(Math.random() * screenWidth),
      translateY: new Animated.Value(Math.random() * screenHeight),
      opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, i) => {
      const particle = particles[i];
      return Animated.loop(
        Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue: Math.random() * screenWidth,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: Math.random() * screenHeight,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0.2,
              duration: 2000,
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
        <Animated.View
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
};

// Simplified Header with Hexagon
const HolographicHeader = ({
  app,
  onClose,
}: {
  app: InstalledApp;
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
            <Text style={styles.holoSubtitle}>Add Secure Password</Text>
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
  onClose,
}: AddPasswordModalProps) {
  const { state, dispatch } = useAppContext();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    url: "",
    notes: "",
  });
  const [customFields, setCustomFields] = useState<AuthField[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        length: state.settings.defaultPasswordLength,
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

  const handleUsernameChange = useCallback((username: string) => {
    setFormData((prev) => ({ ...prev, username }));
  }, []);

  const handleEmailChange = useCallback((email: string) => {
    setFormData((prev) => ({ ...prev, email }));
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
    if (!app) return;

    if (!formData.password.trim()) {
      Alert.alert("SECURITY BREACH", "Neural key required for data encryption");
      return;
    }

    if (!formData.username.trim() && !formData.email.trim()) {
      Alert.alert("ACCESS DENIED", "Identity matrix incomplete");
      return;
    }

    setIsSaving(true);
    try {
      const newPassword: Password = {
        id: Date.now().toString(),
        appName: app.name,
        appId: app.id,
        username: formData.username || formData.email,
        password: formData.password,
        url: formData.url || `https://${app.name.toLowerCase()}.com`,
        notes: formData.notes,
        customFields: customFields,
        createdAt: new Date(),
        updatedAt: new Date(),
        strength: calculatePasswordStrength(formData.password),
        isFavorite: false,
        tags: [],
      };

      dispatch({ type: "ADD_PASSWORD", payload: newPassword });

      if (state.masterPassword) {
        const updatedPasswords = [...state.passwords, newPassword];
        await savePasswords(updatedPasswords, state.masterPassword);
      }

      Alert.alert(
        "NEURAL LINK SUCCESS",
        `Quantum encrypted data stored for ${app.name} ⚡`
      );

      setFormData({
        username: "",
        email: "",
        password: "",
        url: "",
        notes: "",
      });
      setCustomFields([]);
      onClose();
    } catch (error) {
      Alert.alert("SYSTEM FAILURE", "Neural network encryption failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!app) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <BlurView intensity={120} tint="dark" style={StyleSheet.absoluteFill}>
          <HolographicGrid />
          <ParticleSystem />
        </BlurView>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <HolographicHeader app={app} onClose={onClose} />

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <HoloInput title="IDENTITY MATRIX" icon="person-circle">
              <Input
                label="Neural ID"
                value={formData.username}
                onChangeText={handleUsernameChange}
                placeholder="Enter neural identity"
                leftIcon="person-outline"
              />
              <Input
                label="Quantum Email"
                value={formData.email}
                onChangeText={handleEmailChange}
                placeholder="Enter quantum address"
                leftIcon="mail-outline"
                keyboardType="email-address"
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
                label="Network Address"
                value={formData.url}
                onChangeText={handleUrlChange}
                placeholder={`https://${app.name.toLowerCase()}.quantum`}
                leftIcon="globe-outline"
                keyboardType="url"
              />
              <Input
                label="Neural Notes"
                value={formData.notes}
                onChangeText={handleNotesChange}
                placeholder="Enter classified notes..."
                leftIcon="document-text-outline"
                multiline
                numberOfLines={3}
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
                disabled={isSaving || !formData.password.trim()}
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
