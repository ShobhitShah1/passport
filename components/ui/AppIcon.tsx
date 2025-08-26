import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface AppIconProps {
  appName: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showGlow?: boolean;
}

export default function AppIcon({
  appName,
  icon,
  size = 'medium',
  style,
  showGlow = false,
}: AppIconProps) {
  const iconSize = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const fontSize = {
    small: 12,
    medium: 16,
    large: 20,
  };

  // Generate a consistent color based on app name
  const generateAppColor = (name: string) => {
    const colors = [
      Colors.dark.electricBlue,
      Colors.dark.neonGreen,
      Colors.dark.purpleGlow,
      Colors.dark.pinkFlash,
      '#ff4757',
      '#ffab00',
      '#3c40c6',
      '#00d2d3',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const appColor = generateAppColor(appName);
  const gradientColors = [appColor, `${appColor}80`];

  const containerStyle = [
    styles.container,
    {
      width: iconSize[size],
      height: iconSize[size],
    },
    showGlow && {
      shadowColor: appColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    },
    style,
  ];

  // Get the first letter of the app name for fallback
  const fallbackLetter = appName.charAt(0).toUpperCase();

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={gradientColors as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon ? (
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={fontSize[size]}
            color={Colors.dark.text}
          />
        ) : (
          <Text style={[styles.fallbackText, { fontSize: fontSize[size] }]}>
            {fallbackLetter}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fallbackText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});