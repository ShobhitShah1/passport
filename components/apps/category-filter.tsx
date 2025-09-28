import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        renderItem={({ item, index }) => {
          const isSelected = selectedCategory === item;
          return (
            <ReachPressable
              onPress={() => onCategoryChange(item)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              reachScale={1.05}
              pressScale={0.95}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.secondary]}
                  style={styles.categoryChipGradient}
                >
                  <Text style={styles.categoryTextActive}>{item}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryChipContent}>
                  <Text style={styles.categoryText}>{item}</Text>
                </View>
              )}
            </ReachPressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 15,
  },
  categoryChip: {
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 80,
  },
  categoryChipActive: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  categoryChipContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "capitalize",
  },
  categoryTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.background,
    textTransform: "capitalize",
  },
});

export default CategoryFilter;
