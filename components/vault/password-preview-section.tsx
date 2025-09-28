import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";
import { Password } from "@/types";
import PasswordPreviewCard from "./password-preview-card";
import AddPasswordModal from "@/components/add-password-modal";

interface PasswordPreviewSectionProps {
  passwords: Password[];
  copyToClipboard: (text: string, label?: string) => Promise<void>;
}

const PasswordPreviewSection: React.FC<PasswordPreviewSectionProps> = ({
  passwords,
  copyToClipboard,
}) => {
  const [revealedPasswords, setRevealedPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(
    null
  );

  const handleToggleVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (password: Password) => {
    setSelectedPassword(password);
    setEditModalVisible(true);
  };

  if (passwords.length === 0) return null;

  return (
    <View style={styles.passwordPreviewSection}>
      <View style={styles.passwordPreviewHeader}>
        <Text style={styles.passwordPreviewTitle}>🔐 Saved Passwords</Text>
      </View>

      <View style={styles.passwordPreviewGrid}>
        {passwords.slice(0, 4).map((item, index) => (
          <PasswordPreviewCard
            key={item.id}
            item={item}
            index={index}
            copyToClipboard={copyToClipboard}
            isRevealed={revealedPasswords[item.id] || false}
            onToggleVisibility={handleToggleVisibility}
            onEdit={handleEdit}
          />
        ))}
      </View>

      {passwords.length > 4 && (
        <ReachPressable
          style={styles.viewAllPasswordsLink}
          onPress={() => router.push("/(tabs)/apps")}
          reachScale={1.02}
          pressScale={0.98}
        >
          <Text style={styles.viewAllPasswordsLinkText}>
            View all {passwords.length} passwords →
          </Text>
        </ReachPressable>
      )}

      <AddPasswordModal
        visible={editModalVisible}
        app={null}
        existingPassword={selectedPassword}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedPassword(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  passwordPreviewSection: {
    gap: 16,
  },
  passwordPreviewHeader: {
    marginBottom: 0,
  },
  passwordPreviewTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  passwordPreviewGrid: {
    gap: 16,
  },
  viewAllPasswordsLink: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  viewAllPasswordsLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
});

export default PasswordPreviewSection;
