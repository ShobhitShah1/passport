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
  maxNotesCount = 4
}: NotesWidgetProps) {
  const displayNotes = notes.slice(0, maxNotesCount);

  // Enhanced theme configurations
  const themes = {
    holographic: {
      backgroundColor: '#0a0a0b',
      gradientStart: '#0d1117',
      gradientEnd: '#161b22',
      primaryColor: '#00d4ff',
      secondaryColor: '#8b5cf6',
      accentColor: '#00ff7f',
      textColor: '#f0f6fc',
      textSecondary: '#8b949e',
      borderColor: '#30363d',
      cardBackground: 'rgba(0, 212, 255, 0.1)',
      shadowColor: '#00d4ff',
    },
    cyber: {
      backgroundColor: '#0a0a0a',
      gradientStart: '#000000',
      gradientEnd: '#1a1a1a',
      primaryColor: '#00ff41',
      secondaryColor: '#ff0080',
      accentColor: '#ffff00',
      textColor: '#ffffff',
      textSecondary: '#888888',
      borderColor: '#00ff41',
      cardBackground: 'rgba(0, 255, 65, 0.1)',
      shadowColor: '#00ff41',
    },
    neon: {
      backgroundColor: '#0f0f0f',
      gradientStart: '#1a0a1a',
      gradientEnd: '#0a0a1a',
      primaryColor: '#ff006e',
      secondaryColor: '#8338ec',
      accentColor: '#fb5607',
      textColor: '#ffffff',
      textSecondary: '#cccccc',
      borderColor: '#ff006e',
      cardBackground: 'rgba(255, 0, 110, 0.1)',
      shadowColor: '#ff006e',
    },
    minimal: {
      backgroundColor: '#1e1e1e',
      gradientStart: '#2d2d2d',
      gradientEnd: '#1a1a1a',
      primaryColor: '#ffffff',
      secondaryColor: '#888888',
      accentColor: '#0066cc',
      textColor: '#ffffff',
      textSecondary: '#aaaaaa',
      borderColor: '#444444',
      cardBackground: 'rgba(255, 255, 255, 0.05)',
      shadowColor: '#ffffff',
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
        borderWidth: 1,
        borderColor: currentTheme.borderColor,
        padding: 0,
        margin: 0,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flex: 1,
      }}
      clickAction="OPEN_APP"
    >
      {/* Header with enhanced styling */}
      <FlexWidget
        style={{
          backgroundColor: currentTheme.gradientStart,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          borderBottomWidth: 1,
          borderBottomColor: currentTheme.primaryColor,
          paddingHorizontal: 12,
          paddingVertical: 12,
          width: '100%',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextWidget
              text="🔐"
              style={{
                fontSize: 18,
                marginRight: 8,
              }}
            />
            <TextWidget
              text="PASSPORT"
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: currentTheme.primaryColor,
                letterSpacing: 1,
              }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              backgroundColor: currentTheme.primaryColor,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <TextWidget
              text={`${notes.length} NOTES`}
              style={{
                fontSize: 11,
                color: currentTheme.backgroundColor,
                fontWeight: 'bold',
                letterSpacing: 0.5,
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Content area */}
      <FlexWidget
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: currentTheme.backgroundColor,
          width: '100%',
        }}
      >
        {displayNotes.length > 0 ? (
          <FlexWidget style={{ flex: 1, gap: 8, width: '100%' }}>
            {displayNotes.map((note, index) => (
              <FlexWidget
                key={note.id}
                style={{
                  backgroundColor: currentTheme.cardBackground,
                  borderRadius: 10,
                  padding: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: currentTheme.accentColor,
                  borderWidth: 1,
                  borderColor: currentTheme.borderColor,
                  width: '100%',
                  alignSelf: 'stretch',
                }}
                clickAction={{
                  type: 'OPEN_URI',
                  uri: `passport://note/${note.id}`,
                }}
              >
                <FlexWidget
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    width: '100%',
                  }}
                >
                  <TextWidget
                    text={note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title}
                    style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: currentTheme.textColor,
                      flex: 1,
                    }}
                  />
                  <FlexWidget
                    style={{
                      backgroundColor: currentTheme.secondaryColor,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                  >
                    <TextWidget
                      text={note.category.toUpperCase()}
                      style={{
                        fontSize: 8,
                        color: currentTheme.backgroundColor,
                        fontWeight: 'bold',
                        letterSpacing: 0.5,
                      }}
                    />
                  </FlexWidget>
                </FlexWidget>

                <TextWidget
                  text={note.content.length > 35 ? `${note.content.slice(0, 35)}...` : note.content}
                  style={{
                    fontSize: 11,
                    color: currentTheme.textSecondary,
                    marginBottom: 6,
                    lineHeight: 14,
                  }}
                />

                <FlexWidget
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <TextWidget
                    text="•••"
                    style={{
                      fontSize: 12,
                      color: currentTheme.accentColor,
                      letterSpacing: 2,
                    }}
                  />
                  <TextWidget
                    text={new Date(note.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                    style={{
                      fontSize: 9,
                      color: currentTheme.textSecondary,
                      fontWeight: 'bold',
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
              width: '100%',
            }}
          >
            <TextWidget
              text="🔒"
              style={{
                fontSize: 40,
                marginBottom: 12,
              }}
            />
            <TextWidget
              text="NO NOTES YET"
              style={{
                fontSize: 14,
                color: currentTheme.textSecondary,
                fontWeight: 'bold',
                letterSpacing: 1,
                textAlign: 'center',
                marginBottom: 6,
              }}
            />
            <TextWidget
              text="Tap to create secure notes"
              style={{
                fontSize: 11,
                color: currentTheme.textSecondary,
                textAlign: 'center',
              }}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      {/* Footer */}
      <FlexWidget
        style={{
          backgroundColor: currentTheme.gradientEnd,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          borderTopWidth: 1,
          borderTopColor: currentTheme.borderColor,
          paddingVertical: 8,
          paddingHorizontal: 12,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <TextWidget
            text="⚡"
            style={{
              fontSize: 12,
              marginRight: 6,
            }}
          />
          <TextWidget
            text="TAP TO OPEN"
            style={{
              fontSize: 10,
              color: currentTheme.primaryColor,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

