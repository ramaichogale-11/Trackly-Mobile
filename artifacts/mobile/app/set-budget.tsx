import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_BG, CATEGORY_COLORS } from "@/constants/colors";
import { CATEGORIES, type Category } from "@/context/ExpenseContext";
import { useBudgets } from "@/context/BudgetContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICONS: Record<Category, keyof typeof Feather.glyphMap> = {
  Food: "coffee",
  Transport: "navigation",
  Shopping: "shopping-bag",
  Entertainment: "film",
  Other: "more-horizontal",
};

export default function SetBudgetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { budgets, setBudget } = useBudgets();

  const [values, setValues] = useState<Partial<Record<Category, string>>>(() =>
    Object.fromEntries(
      CATEGORIES.map((c) => [c, budgets[c] !== undefined ? String(budgets[c]) : ""])
    ) as Partial<Record<Category, string>>
  );

  useEffect(() => {
    setValues(
      Object.fromEntries(
        CATEGORIES.map((c) => [c, budgets[c] !== undefined ? String(budgets[c]) : ""])
      ) as Partial<Record<Category, string>>
    );
  }, [budgets]);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    for (const cat of CATEGORIES) {
      const raw = values[cat] ?? "";
      const parsed = parseFloat(raw.replace(/,/g, ""));
      if (raw.trim() === "") {
        await setBudget(cat, null);
      } else if (!isNaN(parsed) && parsed > 0) {
        await setBudget(cat, parsed);
      }
    }
    router.back();
  };

  const handleClear = async (cat: Category) => {
    Haptics.selectionAsync();
    setValues((prev) => ({ ...prev, [cat]: "" }));
    await setBudget(cat, null);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
      >
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Set a monthly spending limit for each category. Leave blank for no limit.
        </Text>

        {CATEGORIES.map((cat) => {
          const catColor = CATEGORY_COLORS[cat];
          const catBg = CATEGORY_BG[cat];
          const hasValue = (values[cat] ?? "").trim() !== "";

          return (
            <View
              key={cat}
              style={[
                styles.categoryRow,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <View style={[styles.catIcon, { backgroundColor: catBg, borderRadius: 10 }]}>
                <Feather name={CATEGORY_ICONS[cat]} size={18} color={catColor} />
              </View>
              <Text style={[styles.catName, { color: colors.foreground }]}>{cat}</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: colors.border, borderRadius: colors.radius - 4 },
                ]}
              >
                <Text style={[styles.rupee, { color: colors.mutedForeground }]}>₹</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="No limit"
                  placeholderTextColor={colors.mutedForeground}
                  value={values[cat] ?? ""}
                  onChangeText={(val) => setValues((prev) => ({ ...prev, [cat]: val }))}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                {hasValue && (
                  <Pressable onPress={() => handleClear(cat)} hitSlop={10}>
                    <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: bottomPad + 16, borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Budgets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    lineHeight: 20,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  catIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    minWidth: 120,
  },
  rupee: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    minWidth: 70,
    textAlign: "right",
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
