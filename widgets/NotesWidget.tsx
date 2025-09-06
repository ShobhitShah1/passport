import React from 'react';
import {
  FlexWidget,
  TextWidget,
  ListWidget,
} from 'react-native-android-widget';
import { SecureNote } from '@/types';

interface NotesWidgetProps {
  notes: SecureNote[];
  widgetTheme: 'cyber' | 'holographic' | 'neon' | 'minimal';
  maxNotesCount: number;
}

export function NotesWidget({ 
  notes = [], 
  widgetTheme = 'holographic',
  maxNotesCount = 5 
}: NotesWidgetProps) {
  const displayNotes = notes.slice(0, maxNotesCount);
  
  // Theme configurations
  const themes = {
    holographic: {
      backgroundColor: '#0d1117',
      primaryColor: '#00d4ff',
      secondaryColor: '#00ff88',
      textColor: '#ffffff',
      borderColor: '#00d4ff',
    },
    cyber: {
      backgroundColor: '#0a0a0a',
      primaryColor: '#00ff41',
      secondaryColor: '#ff0080',
      textColor: '#ffffff',
      borderColor: '#00ff41',
    },
    neon: {
      backgroundColor: '#0f0f0f',
      primaryColor: '#ff006e',
      secondaryColor: '#8338ec',
      textColor: '#ffffff',
      borderColor: '#ff006e',
    },
    minimal: {
      backgroundColor: '#1e1e1e',
      primaryColor: '#ffffff',
      secondaryColor: '#888888',
      textColor: '#ffffff',
      borderColor: '#333333',
    },
  };

  const currentTheme = themes[widgetTheme];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: currentTheme.backgroundColor,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: currentTheme.borderColor,
        padding: 16,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: currentTheme.primaryColor,
        }}
      >
        <TextWidget
          text="🔒 SECURE NOTES"
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: currentTheme.primaryColor,
            letterSpacing: 2,
          }}
        />
        <FlexWidget style={{ flex: 1 }} />
        <TextWidget
          text={`${notes.length}`}
          style={{
            fontSize: 14,
            color: currentTheme.textColor,
            fontWeight: 'bold',
            backgroundColor: currentTheme.secondaryColor,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        />
      </FlexWidget>

      {/* Notes List or Empty State */}
      {displayNotes.length > 0 ? (
        <FlexWidget style={{ flex: 1 }}>
          {displayNotes.map((note, index) => (
            <FlexWidget
              key={note.id}
              style={{
                marginBottom: index < displayNotes.length - 1 ? 8 : 0,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: currentTheme.secondaryColor,
              }}
            >
              <TextWidget
                text={note.title.length > 25 ? `${note.title.slice(0, 25)}...` : note.title}
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: currentTheme.textColor,
                  marginBottom: 4,
                }}
              />
              
              <TextWidget
                text={note.content.length > 40 ? `${note.content.slice(0, 40)}...` : note.content}
                style={{
                  fontSize: 12,
                  color: currentTheme.secondaryColor,
                  marginBottom: 4,
                }}
              />

              <FlexWidget
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <TextWidget
                  text={note.category.toUpperCase()}
                  style={{
                    fontSize: 10,
                    color: currentTheme.primaryColor,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                  }}
                />
                <TextWidget
                  text={new Date(note.updatedAt).toLocaleDateString()}
                  style={{
                    fontSize: 10,
                    color: currentTheme.secondaryColor,
                  }}
                />
              </FlexWidget>
            </FlexWidget>
          ))}
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="🔐"
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          />
          <TextWidget
            text="NO SECURE NOTES"
            style={{
              fontSize: 16,
              color: currentTheme.secondaryColor,
              fontWeight: 'bold',
              letterSpacing: 2,
              textAlign: 'center',
            }}
          />
          <TextWidget
            text="Open Passport to create notes"
            style={{
              fontSize: 12,
              color: currentTheme.secondaryColor,
              textAlign: 'center',
              marginTop: 8,
            }}
          />
        </FlexWidget>
      )}

      {/* Footer */}
      <FlexWidget
        style={{
          marginTop: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: currentTheme.primaryColor,
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="TAP TO OPEN PASSPORT"
          style={{
            fontSize: 10,
            color: currentTheme.secondaryColor,
            letterSpacing: 1,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

// Small widget variant
export function NotesWidgetSmall({ 
  notes = [], 
  widgetTheme = 'holographic' 
}: Omit<NotesWidgetProps, 'maxNotesCount'>) {
  const themes = {
    holographic: {
      backgroundColor: '#0d1117',
      primaryColor: '#00d4ff',
      secondaryColor: '#00ff88',
      textColor: '#ffffff',
      borderColor: '#00d4ff',
    },
    cyber: {
      backgroundColor: '#0a0a0a',
      primaryColor: '#00ff41',
      secondaryColor: '#ff0080',
      textColor: '#ffffff',
      borderColor: '#00ff41',
    },
    neon: {
      backgroundColor: '#0f0f0f',
      primaryColor: '#ff006e',
      secondaryColor: '#8338ec',
      textColor: '#ffffff',
      borderColor: '#ff006e',
    },
    minimal: {
      backgroundColor: '#1e1e1e',
      primaryColor: '#ffffff',
      secondaryColor: '#888888',
      textColor: '#ffffff',
      borderColor: '#333333',
    },
  };

  const currentTheme = themes[widgetTheme];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: currentTheme.backgroundColor,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: currentTheme.borderColor,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <TextWidget
        text="🔒"
        style={{
          fontSize: 24,
          marginBottom: 8,
        }}
      />
      <TextWidget
        text={notes.length.toString()}
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: currentTheme.primaryColor,
          marginBottom: 4,
        }}
      />
      <TextWidget
        text="NOTES"
        style={{
          fontSize: 12,
          color: currentTheme.secondaryColor,
          letterSpacing: 1,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}