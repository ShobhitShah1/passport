import React from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

export default function GeneratorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a1b', '#0a0a0b']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Generator</Text>
          <Text style={styles.subtitle}>Coming Soon...</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});