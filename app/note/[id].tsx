import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { SecureNote } from "@/types";
import { usePasswordManager } from "@/hooks/use-password-manager";

export default function NoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { secureNotes, loading } = usePasswordManager();
  const [note, setNote] = useState<SecureNote | null>(null);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      if (!id) {
        Alert.alert("Error", "Note ID not provided");
        router.back();
        return;
      }

      if (secureNotes && id) {
        const foundNote = secureNotes.find((n) => n.id === id);

        if (foundNote) {
          setNote(foundNote);
        } else {
          Alert.alert("Error", "Note not found");
          router.back();
        }
      } else {
        Alert.alert("Error", "No notes found");
        router.back();
      }
    } catch (error) {
      console.error("Error loading note:", error);
      Alert.alert("Error", "Failed to load note");
      router.back();
    } finally {
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={Colors.dark.textSecondary}
          />
          <Text style={styles.errorText}>Note not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{note.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {note.category.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          Updated{" "}
          {new Date(note.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>{note.content}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={Colors.dark.neonGreen}
          />
          <Text style={styles.footerText}>End-to-End Encrypted</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    color: Colors.dark.textSecondary,
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    flex: 1,
    marginRight: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.dark.background,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  date: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  noteContent: {
    padding: 20,
  },
  noteText: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
});
