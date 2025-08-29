import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { getAppById, POPULAR_APPS } from '../../data/apps';

interface AppIconProps {
  appName: string;
  appId?: string;
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showGlow?: boolean;
}

export default function AppIcon({
  appName,
  appId,
  icon,
  color,
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

  // Try to get app data from our database
  const appData = appId ? getAppById(appId) : POPULAR_APPS.find(app => 
    app.name.toLowerCase() === appName.toLowerCase()
  );

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

  // Use app data if available, otherwise fall back to props or generated values
  const finalIcon = icon || appData?.icon || 'apps';
  const finalColor = color || appData?.color || generateAppColor(appName);
  const gradientColors = [finalColor, `${finalColor}80`];

  const containerStyle = [
    styles.container,
    {
      width: iconSize[size],
      height: iconSize[size],
    },
    showGlow && {
      shadowColor: finalColor,
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
        {finalIcon !== 'apps' ? (
          <Ionicons
            name={finalIcon as keyof typeof Ionicons.glyphMap}
            size={fontSize[size] * 1.5}
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  fallbackText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});