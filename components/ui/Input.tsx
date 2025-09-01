import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: "default" | "password";
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
  variant = "default",
  containerStyle,
  inputStyle,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const isPasswordField = variant === "password" || showPasswordToggle;
  const shouldShowPassword = isPasswordField && !isPasswordVisible;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      )}

      <View style={[styles.inputContainer, error && styles.error]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={Colors.dark.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          {...props}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPasswordField) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          secureTextEntry={shouldShowPassword || secureTextEntry}
          placeholderTextColor={Colors.dark.textMuted}
          selectionColor={Colors.dark.primary}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
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
              color={Colors.dark.textSecondary}
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
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 6,
  },
  labelError: {
    color: Colors.dark.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  error: {
    borderColor: Colors.dark.error,
    shadowColor: Colors.dark.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    marginLeft: 10,
  },
  inputWithRightIcon: {
    marginRight: 10,
  },
  leftIcon: {
    marginRight: 0,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 0,
  },
  helperText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: Colors.dark.error,
  },
});
