import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '@/hooks/useAppContext';
import Colors from '@/constants/Colors';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { isSetupComplete, state } = useAppContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      const setupComplete = await isSetupComplete();
      
      if (!setupComplete) {
        // First time user - show onboarding
        router.replace('/onboarding');
      } else if (!state.isAuthenticated) {
        // User needs to authenticate
        router.replace('/auth');
      } else {
        // User is authenticated - go to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking app state:', error);
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.appName}>Passport</Text>
          </View>
          <ActivityIndicator
            size="large"
            color={Colors.dark.primary}
            style={styles.loader}
          />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.background,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  loader: {
    marginTop: 24,
  },
});