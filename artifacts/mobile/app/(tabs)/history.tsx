import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExpenseCard } from "@/components/ExpenseCard";
import { useExpenses } from "@/context/ExpenseContext";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense, isLoading } = useExpenses();

  const sections = useMemo(() => {
    const map = new Map<string, typeof expenses>();
    for (const e of expenses) {
      const group = map.get(e.date) ?? [];
      group.push(e);
      map.set(e.date, group);
    }
    return Array.from(map.entries()).map(([date, data]) => ({ title: date, data }));
  }, [expenses]);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyIcon, { color: colors.mutedForeground }]}>📋</Text>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No expenses yet</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Tap + to log your first expense
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 12 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <ExpenseCard expense={item} onDelete={deleteExpense} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 12,
  },
});
