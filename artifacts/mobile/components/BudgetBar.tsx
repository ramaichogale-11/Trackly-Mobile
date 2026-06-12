import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CATEGORY_BG, CATEGORY_COLORS } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";
import type { Category } from "@/context/ExpenseContext";

interface Props {
  category: Category;
  spent: number;
  limit: number;
}

function getBarColor(pct: number): string {
  if (pct >= 1) return "#EF4444";
  if (pct >= 0.8) return "#F59E0B";
  return "#10B981";
}

function getStatusLabel(pct: number): { text: string; color: string } | null {
  if (pct >= 1) return { text: "Over budget!", color: "#EF4444" };
  if (pct >= 0.8) return { text: `${Math.round(pct * 100)}% used`, color: "#F59E0B" };
  return null;
}

export function BudgetBar({ category, spent, limit }: Props) {
  const colors = useColors();
  const pct = Math.min(spent / limit, 1);
  const barColor = getBarColor(pct);
  const status = getStatusLabel(pct);
  const catColor = CATEGORY_COLORS[category];
  const catBg = CATEGORY_BG[category];
  const overBudget = spent > limit;

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: catBg, borderRadius: 8 }]}>
        <View style={[styles.dot, { backgroundColor: catColor }]} />
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.catName, { color: colors.foreground }]}>{category}</Text>
          <View style={styles.amountRow}>
            {status && (
              <Feather
                name={overBudget ? "alert-circle" : "alert-triangle"}
                size={12}
                color={status.color}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.spent, { color: overBudget ? "#EF4444" : colors.foreground }]}>
              ₹{spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.limit, { color: colors.mutedForeground }]}>
              {" "}/ ₹{limit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(pct * 100)}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        {status && (
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  catName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  spent: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  limit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
});
