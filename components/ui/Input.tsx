import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'password';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  containerStyle,
  inputStyle,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPasswordField = variant === 'password' || showPasswordToggle;
  const shouldShowPassword = isPasswordField && !isPasswordVisible;

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
  ];

  const textInputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || isPasswordField) && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? Colors.dark.primary : Colors.dark.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          {...props}
          style={textInputStyles}
          secureTextEntry={shouldShowPassword || secureTextEntry}
          placeholderTextColor={Colors.dark.textMuted}
          selectionColor={Colors.dark.primary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPasswordField && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? Colors.dark.primary : Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  labelError: {
    color: Colors.dark.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  focused: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surfaceVariant,
  },
  error: {
    borderColor: Colors.dark.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 14,
  },
  inputWithLeftIcon: {
    marginLeft: 12,
  },
  inputWithRightIcon: {
    marginRight: 12,
  },
  leftIcon: {
    marginRight: 0,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 0,
  },
  helperText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: Colors.dark.error,
  },
});