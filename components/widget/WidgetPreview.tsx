import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { SecureNote } from '@/types';

interface WidgetPreviewProps {
  notes: SecureNote[];
  widgetTheme?: 'cyber' | 'holographic' | 'neon' | 'minimal';
  maxNotesCount?: number;
  isSmall?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function WidgetPreview({ 
  notes = [], 
  widgetTheme = 'holographic',
  maxNotesCount = 5,
  isSmall = false 
}: WidgetPreviewProps) {
  const displayNotes = notes.slice(0, maxNotesCount);
  
  // Theme configurations matching the actual widget
  const themes = {
    holographic: {
      background: ['#0d1117', '#1a1f36', '#0d1117'],
      primaryColor: '#00d4ff',
      secondaryColor: '#00ff88',
      textColor: '#ffffff',
      accentColor: '#8b5cf6',
      borderColor: '#00d4ff',
    },
    cyber: {
      background: ['#0a0a0a', '#1a1a2e', '#0a0a0a'],
      primaryColor: '#00ff41',
      secondaryColor: '#ff0080',
      textColor: '#ffffff',
      accentColor: '#00ff41',
      borderColor: '#00ff41',
    },
    neon: {
      background: ['#0f0f0f', '#2d1b69', '#0f0f0f'],
      primaryColor: '#ff006e',
      secondaryColor: '#8338ec',
      textColor: '#ffffff',
      accentColor: '#3a86ff',
      borderColor: '#ff006e',
    },
    minimal: {
      background: ['#1e1e1e', '#2a2a2a', '#1e1e1e'],
      primaryColor: '#ffffff',
      secondaryColor: '#888888',
      textColor: '#ffffff',
      accentColor: '#0066cc',
      borderColor: '#333333',
    },
  };

  const currentTheme = themes[widgetTheme];

  if (isSmall) {
    return (
      <View style={styles.smallContainer}>
        <LinearGradient
          colors={currentTheme.background as any}
          style={[styles.smallWidget, { borderColor: currentTheme.borderColor }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.smallIcon}>🔒</Text>
          <Text style={[styles.smallCount, { color: currentTheme.primaryColor }]}>
            {notes.length}
          </Text>
          <Text style={[styles.smallLabel, { color: currentTheme.secondaryColor }]}>
            NOTES
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <LinearGradient
        colors={currentTheme.background as any}
        style={[styles.widgetPreview, { borderColor: currentTheme.borderColor }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentTheme.primaryColor }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🔒</Text>
            <Text style={[styles.headerTitle, { color: currentTheme.primaryColor }]}>
              SECURE NOTES
            </Text>
          </View>
          <View style={[styles.notesCount, { backgroundColor: currentTheme.accentColor }]}>
            <Text style={[styles.notesCountText, { color: currentTheme.textColor }]}>
              {notes.length}
            </Text>
          </View>
        </View>

        {/* Notes List */}
        <View style={styles.notesList}>
          {displayNotes.length > 0 ? (
            displayNotes.map((note, index) => (
              <View 
                key={note.id}
                style={[
                  styles.noteItem,
                  { 
                    marginBottom: index < displayNotes.length - 1 ? 6 : 0,
                    borderLeftColor: currentTheme.accentColor 
                  }
                ]}
              >
                <Text 
                  style={[styles.noteTitle, { color: currentTheme.textColor }]}
                  numberOfLines={1}
                >
                  {note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title}
                </Text>
                <Text 
                  style={[styles.noteContent, { color: currentTheme.secondaryColor }]}
                  numberOfLines={1}
                >
                  {note.content.length > 30 ? `${note.content.slice(0, 30)}...` : note.content}
                </Text>
                <View style={styles.noteFooter}>
                  <Text style={[styles.noteCategory, { color: currentTheme.primaryColor }]}>
                    {note.category.toUpperCase()}
                  </Text>
                  <Text style={[styles.noteDate, { color: currentTheme.secondaryColor }]}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔐</Text>
              <Text style={[styles.emptyText, { color: currentTheme.secondaryColor }]}>
                NO SECURE NOTES
              </Text>
              <Text style={[styles.emptySubtext, { color: currentTheme.secondaryColor }]}>
                Create your first note
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: currentTheme.primaryColor }]}>
          <Text style={[styles.footerText, { color: currentTheme.secondaryColor }]}>
            TAP TO OPEN PASSPORT
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    width: screenWidth * 0.8,
    height: 200,
    alignSelf: 'center',
    marginVertical: 16,
  },
  widgetPreview: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  notesCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  notesCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 2,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 9,
    marginBottom: 4,
    lineHeight: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteCategory: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noteDate: {
    fontSize: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 10,
    opacity: 0.7,
  },
  // Small widget styles
  smallContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginVertical: 16,
  },
  smallWidget: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  smallIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  smallCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  smallLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
});