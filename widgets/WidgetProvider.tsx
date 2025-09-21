import React from 'react';
import {
  WidgetPreview,
  requestWidgetUpdate,
  requestWidgetUpdateById,
} from 'react-native-android-widget';
import { NotesWidget } from './NotesWidget';
import { SecureNote } from '@/types';

// Widget configurations
export const WIDGET_CONFIGS = {
  NOTES: 'NotesWidget',
} as const;

export interface WidgetData {
  notes: SecureNote[];
  widgetTheme: 'cyber' | 'holographic' | 'neon' | 'minimal';
  maxNotesCount: number;
  lastUpdated: string;
}

// Configure the large notes widget
export function configureNotesWidget() {
  // Widget configuration would be handled by the react-native-android-widget library
  // For now, we'll create a placeholder implementation
  console.log('Configuring notes widget...');
}

// Configure the small notes widget
export function configureSmallNotesWidget() {
  // Widget configuration would be handled by the react-native-android-widget library
  console.log('Configuring small notes widget...');
}

// Widget preview components for settings
export function NotesWidgetPreview({ 
  notes, 
  widgetTheme = 'holographic',
  maxNotesCount = 5
}: {
  notes: SecureNote[];
  widgetTheme?: 'cyber' | 'holographic' | 'neon' | 'minimal';
  maxNotesCount?: number;
}) {
  return (
    <WidgetPreview
      renderWidget={() => (
        <NotesWidget
          notes={notes}
          widgetTheme={widgetTheme}
          maxNotesCount={maxNotesCount}
        />
      )}
      width={320}
      height={240}
    />
  );
}


// Widget data management
let widgetDataStore: Record<string, WidgetData> = {};

export function getWidgetData(widgetId: string): WidgetData {
  return widgetDataStore[widgetId] || {
    notes: [],
    widgetTheme: 'holographic',
    maxNotesCount: 5,
    lastUpdated: new Date().toISOString(),
  };
}

export function setWidgetData(widgetId: string, data: Partial<WidgetData>) {
  widgetDataStore[widgetId] = {
    ...getWidgetData(widgetId),
    ...data,
    lastUpdated: new Date().toISOString(),
  };
}

export function updateWidgetData(notes: SecureNote[]) {
  console.log(`Updating widgets with ${notes.length} notes`);

  // If no widgets exist in store yet, create a default one
  if (Object.keys(widgetDataStore).length === 0) {
    setWidgetData('default', {
      notes,
      widgetTheme: 'holographic',
      maxNotesCount: 5
    });
  } else {
    // Update all existing widgets with new notes data
    Object.keys(widgetDataStore).forEach(widgetId => {
      setWidgetData(widgetId, { notes });
    });
  }

  // Request widget updates with proper API
  requestWidgetUpdate({
    widgetName: 'NotesWidget',
    renderWidget: (widgetInfo) => {
      const widgetData = getWidgetData(widgetInfo.widgetId.toString());
      console.log(`Rendering widget with ${widgetData.notes.length} notes`);
      return (
        <NotesWidget
          notes={notes}
          widgetTheme={widgetData.widgetTheme}
          maxNotesCount={widgetData.maxNotesCount}
        />
      );
    },
  });
}

export function updateWidgetTheme(widgetId: string, theme: WidgetData['widgetTheme']) {
  setWidgetData(widgetId, { widgetTheme: theme });
  console.log('Widget theme updated to', theme);
}

export function updateWidgetMaxNotes(widgetId: string, maxNotesCount: number) {
  setWidgetData(widgetId, { maxNotesCount });
  console.log('Widget max notes updated to', maxNotesCount);
}

// Initialize widgets with proper handlers
export function initializeWidgets(initialNotes: SecureNote[] = []) {
  console.log(`Initializing widgets with ${initialNotes.length} notes`);

  // Initialize default widget data with current notes
  if (Object.keys(widgetDataStore).length === 0) {
    setWidgetData('default', {
      notes: initialNotes,
      widgetTheme: 'holographic',
      maxNotesCount: 5
    });
  }

  // Set up widget update handlers
  requestWidgetUpdate({
    widgetName: 'NotesWidget',
    renderWidget: (widgetInfo) => {
      const widgetData = getWidgetData(widgetInfo.widgetId.toString());
      console.log(`Initial widget render with ${widgetData.notes.length} notes`);
      return (
        <NotesWidget
          notes={widgetData.notes}
          widgetTheme={widgetData.widgetTheme}
          maxNotesCount={widgetData.maxNotesCount}
        />
      );
    },
    widgetNotFound: () => {
      console.log('NotesWidget not found on home screen');
    },
  });

  console.log('Widgets initialized successfully');
}