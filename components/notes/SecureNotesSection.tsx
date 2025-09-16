import Colors from "@/constants/Colors";
import { SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ReachPressable } from "../ui/ReachPressable";
import { SpaceNoteCard } from "./SpaceNoteCard";

interface SecureNotesSectionProps {
  notes: SecureNote[];
  onAddNote?: () => void;
  onEditNote?: (note: SecureNote) => void;
}

export const SecureNotesSection: React.FC<SecureNotesSectionProps> = ({
  notes,
  onAddNote,
  onEditNote,
}) => {
  return (
    <View style={styles.notesSection}>
      <View style={styles.notesSectionHeader}>
        <Text style={styles.notesSectionTitle}>Secure Notes</Text>
        {onAddNote && (
          <ReachPressable
            style={styles.addNoteButton}
            onPress={onAddNote}
            reachScale={1.05}
            pressScale={0.95}
          >
            <Ionicons name="add" size={20} color={Colors.dark.neonGreen} />
          </ReachPressable>
        )}
      </View>

      <View style={styles.notesGrid}>
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteCardWrapper}>
            <SpaceNoteCard note={note} index={index} onEdit={onEditNote} />
          </View>
        ))}
      </View>

      {notes.length === 0 && (
        <View style={styles.emptyNotes}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={Colors.dark.textMuted}
          />
          <Text style={styles.emptyNotesText}>No secure notes yet</Text>
          <Text style={styles.emptyNotesSubtext}>
            Create your first encrypted note
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  notesSection: {
    marginBottom: 0,
  },
  notesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notesSectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.4,
    textShadowColor: "rgba(0, 255, 136, 0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  addNoteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notesGrid: {
    flexDirection: "column",
    gap: 0,
  },
  noteCardWrapper: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  emptyNotes: {
    alignItems: "center",
    padding: 60,
    gap: 12,
  },
  emptyNotesText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
});