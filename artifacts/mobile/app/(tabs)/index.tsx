import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_COLORS, CATEGORY_BG } from "@/constants/colors";
import { CATEGORIES, useExpenses, type Category } from "@/context/ExpenseContext";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useColors } from "@/hooks/useColors";

function CategoryBar({ category, amount, total }: { category: Category; amount: number; total: number }) {
  const colors = useColors();
  const pct = total > 0 ? amount / total : 0;
  const catColor = CATEGORY_COLORS[category];
  const catBg = CATEGORY_BG[category];

  return (
    <View style={styles.catRow}>
      <View style={[styles.catIconBox, { backgroundColor: catBg, borderRadius: 8 }]}>
        <View style={[styles.catDot, { backgroundColor: catColor }]} />
      </View>
      <View style={styles.catInfo}>
        <View style={styles.catTopRow}>
          <Text style={[styles.catName, { color: colors.foreground }]}>{category}</Text>
          <Text style={[styles.catAmount, { color: colors.foreground }]}>
            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.muted, borderRadius: 4 }]}>
          <View
            style={[
              styles.barFill,
              { backgroundColor: catColor, width: `${Math.round(pct * 100)}%`, borderRadius: 4 },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense, totalSpending, categoryTotals, isLoading } = useExpenses();

  const topWebPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;
  const recentExpenses = expenses.slice(0, 5);

  const activeCats = CATEGORIES.filter((c) => (categoryTotals[c] ?? 0) > 0);

  const openAdd = () => router.push("/add-expense");

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topWebPad + 16, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.primary, borderRadius: colors.radius + 4 },
          ]}
        >
          <Text style={styles.heroLabel}>Total Spending</Text>
          <Text style={styles.heroAmount}>
            ₹{totalSpending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.heroSub}>{expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded</Text>
          <TouchableOpacity
            onPress={openAdd}
            style={styles.heroCta}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color={colors.primary} />
            <Text style={[styles.heroCtaText, { color: colors.primary }]}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Category Breakdown */}
        {activeCats.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Spending by Category</Text>
            {activeCats.map((cat) => (
              <CategoryBar
                key={cat}
                category={cat}
                amount={categoryTotals[cat] ?? 0}
                total={totalSpending}
              />
            ))}
          </View>
        )}

        {/* Recent Expenses */}
        {recentExpenses.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.recentHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Recent Expenses</Text>
              {expenses.length > 5 && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                  <Text style={[styles.viewAll, { color: colors.primary }]}>View all</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ marginTop: 10 }}>
              {recentExpenses.map((e) => (
                <ExpenseCard key={e.id} expense={e} onDelete={deleteExpense} />
              ))}
            </View>
          </View>
        )}

        {expenses.length === 0 && (
          <View style={[styles.emptyBox, { borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No expenses yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Tap "Add Expense" to log your first one
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16 },
  heroCard: {
    padding: 24,
    marginBottom: 20,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  heroAmount: {
    color: "#fff",
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  heroSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 20,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
  },
  heroCtaText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 14,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  catIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catInfo: { flex: 1 },
  catTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  catName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  catAmount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 5,
    width: "100%",
  },
  barFill: {
    height: 5,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
