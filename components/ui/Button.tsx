import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradient?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  gradient = false,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.dark.primary : Colors.dark.text}
          style={styles.loader}
        />
      )}
      <Text style={textStyles}>{title}</Text>
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.button, styles[size], fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.dark.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradientButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    minHeight: 56,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.dark.primary,
  },
  secondary: {
    backgroundColor: Colors.dark.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  danger: {
    backgroundColor: Colors.dark.error,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: Colors.dark.surfaceVariant,
    borderColor: Colors.dark.border,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Text variants
  primaryText: {
    color: Colors.dark.text,
  },
  secondaryText: {
    color: Colors.dark.text,
  },
  outlineText: {
    color: Colors.dark.primary,
  },
  dangerText: {
    color: Colors.dark.text,
  },
  disabledText: {
    color: Colors.dark.textMuted,
  },
  
  loader: {
    marginRight: 8,
  },
});