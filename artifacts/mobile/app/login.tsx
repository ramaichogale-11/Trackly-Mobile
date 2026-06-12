import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, "#7C3AED"]}
        style={[styles.hero, { paddingTop: insets.top + 48 }]}
      >
        <View style={styles.iconCircle}>
          <Feather name="trending-up" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>Finance Tracker</Text>
        <Text style={styles.tagline}>Track smarter, spend better</Text>
      </LinearGradient>

      <View style={[styles.card, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Your personal finance,{"\n"}all in one place
        </Text>

        <View style={styles.features}>
          {[
            { icon: "plus-circle" as const, label: "Log expenses by category" },
            { icon: "target" as const, label: "Set monthly budgets & get alerts" },
            { icon: "pie-chart" as const, label: "See spending breakdowns" },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.foreground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={login}
          disabled={isLoading}
          style={[styles.signInBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.signInText}>Sign In to Get Started</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.privacy, { color: colors.mutedForeground }]}>
          Your data is private and tied to your account only.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  card: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  heading: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 28,
  },
  features: { gap: 14, marginBottom: 36 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  signInBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  privacy: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});
