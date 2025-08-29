import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}: CardProps) {
  const cardStyles = [
    styles.card,
    styles[variant],
    styles[padding],
    style,
  ];

  if (variant === 'gradient') {
    const CardContent = () => (
      <LinearGradient
        colors={['#1a1a1b', '#2a2a2b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientCard, styles[padding]]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.card, style]}
          activeOpacity={0.9}
        >
          <CardContent />
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.card, style]}>
        <CardContent />
      </View>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={cardStyles}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientCard: {
    borderRadius: 20,
  },
  
  // Variants
  default: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  elevated: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    shadowColor: 'rgba(0, 212, 255, 0.3)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    backgroundColor: 'transparent',
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 24,
  },
});