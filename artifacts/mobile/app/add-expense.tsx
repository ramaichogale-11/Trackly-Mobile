import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_BG, CATEGORY_COLORS } from "@/constants/colors";
import { CATEGORIES, type Category, useExpenses } from "@/context/ExpenseContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICONS: Record<Category, keyof typeof Feather.glyphMap> = {
  Food: "coffee",
  Transport: "navigation",
  Shopping: "shopping-bag",
  Entertainment: "film",
  Other: "more-horizontal",
};

export default function AddExpenseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addExpense } = useExpenses();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert("Select a category", "Please choose a category for this expense.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Enter a name", "Please enter a name for this expense.");
      return;
    }
    const parsed = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount greater than 0.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addExpense({ category: selectedCategory, name: name.trim(), amount: parsed });
    setSaving(false);
    router.back();
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const catColor = CATEGORY_COLORS[cat];
            const catBg = CATEGORY_BG[cat];
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: active ? catColor : catBg,
                    borderRadius: colors.radius - 2,
                    borderWidth: active ? 0 : 1.5,
                    borderColor: active ? "transparent" : catColor + "40",
                  },
                ]}
              >
                <Feather
                  name={CATEGORY_ICONS[cat]}
                  size={22}
                  color={active ? "#fff" : catColor}
                />
                <Text
                  style={[
                    styles.catLabel,
                    { color: active ? "#fff" : catColor },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>EXPENSE NAME</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              color: colors.foreground,
            },
          ]}
          placeholder="e.g. Lunch, Uber, Groceries"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          maxLength={60}
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>AMOUNT (₹)</Text>
        <View
          style={[
            styles.amountRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.rupeeSign, { color: colors.mutedForeground }]}>₹</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.foreground }]}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: saving ? 0.7 : 1 },
          ]}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {saving ? "Saving..." : "Save Expense"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catBtn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: "18%",
    minWidth: 60,
    gap: 6,
    flex: 1,
  },
  catLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  rupeeSign: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
