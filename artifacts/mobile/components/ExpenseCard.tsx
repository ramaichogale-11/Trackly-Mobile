import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CATEGORY_BG, CATEGORY_COLORS } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";
import type { Expense } from "@/context/ExpenseContext";

interface Props {
  expense: Expense;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onDelete }: Props) {
  const colors = useColors();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(expense.id);
  };

  const catColor = CATEGORY_COLORS[expense.category] ?? colors.mutedForeground;
  const catBg = CATEGORY_BG[expense.category] ?? colors.muted;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.catDot, { backgroundColor: catBg, borderRadius: 10 }]}>
        <View style={[styles.dot, { backgroundColor: catColor }]} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{expense.name}</Text>
        <View style={styles.meta}>
          <Text style={[styles.category, { color: catColor }]}>{expense.category}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>  ·  {expense.date}</Text>
        </View>
      </View>
      <Text style={[styles.amount, { color: colors.foreground }]}>
        ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={12}>
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  catDot: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginRight: 12,
  },
  deleteBtn: {
    padding: 4,
  },
});
