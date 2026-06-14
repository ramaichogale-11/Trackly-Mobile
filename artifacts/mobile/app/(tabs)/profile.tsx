import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useExpenses } from "@/context/ExpenseContext";
import { useBudgets } from "@/context/BudgetContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES } from "@/context/ExpenseContext";

function Avatar({ user, size = 80 }: { user: { firstName: string | null; lastName: string | null; profileImageUrl: string | null }; size?: number }) {
  const colors = useColors();
  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((n) => n![0].toUpperCase())
      .join("") || "?";

  if (user.profileImageUrl) {
    return (
      <Image
        source={{ uri: user.profileImageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.initialsCircle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { expenses, totalSpending } = useExpenses();
  const { budgets } = useBudgets();
  const [loggingOut, setLoggingOut] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const budgetCount = CATEGORIES.filter((c) => budgets[c] !== undefined).length;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          setLoggingOut(false);
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header gradient */}
      <LinearGradient
        colors={[colors.primary, "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Avatar user={user} size={84} />
        <Text style={styles.name}>{displayName}</Text>
        {user.email ? (
          <Text style={styles.email}>{user.email}</Text>
        ) : null}
      </LinearGradient>

      {/* Stats */}
      <View style={[styles.statsRow, { paddingHorizontal: 20 }]}>
        <StatCard label="Expenses" value={String(expenses.length)} />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        />
        <StatCard label="Budgets Set" value={String(budgetCount)} />
      </View>

      {/* Account section */}
      <View style={[styles.section, { paddingHorizontal: 20, marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Name</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{displayName}</Text>
            </View>
          </View>

          {user.email ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.infoRow}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>{user.email}</Text>
                </View>
              </View>
            </>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Feather name="shield" size={16} color={colors.mutedForeground} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Data privacy</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>Your data is private & encrypted</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sign out */}
      <View style={[styles.section, { paddingHorizontal: 20, marginTop: 16, paddingBottom: bottomPad }]}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          style={[
            styles.signOutBtn,
            { borderColor: "#EF4444", borderRadius: colors.radius, opacity: loggingOut ? 0.6 : 1 },
          ]}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color="#EF4444" size="small" />
          ) : (
            <>
              <Feather name="log-out" size={18} color="#EF4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  initialsCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  initialsText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 12,
    letterSpacing: -0.3,
  },
  email: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  section: {},
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  infoCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginLeft: 46,
  },
  signOutBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
  },
  signOutText: {
    color: "#EF4444",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
