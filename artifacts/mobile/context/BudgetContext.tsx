import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { Category } from "@/context/ExpenseContext";

export type BudgetLimits = Partial<Record<Category, number>>;

interface BudgetContextValue {
  budgets: BudgetLimits;
  setBudget: (category: Category, amount: number | null) => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = "@pft_budgets_v1";

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetLimits>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setBudgets(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persist = (updated: BudgetLimits) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const setBudget = useCallback(async (category: Category, amount: number | null) => {
    setBudgets((prev) => {
      const updated = { ...prev };
      if (amount === null || amount <= 0) {
        delete updated[category];
      } else {
        updated[category] = amount;
      }
      persist(updated);
      return updated;
    });
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, setBudget, isLoading }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudgets must be used within BudgetProvider");
  return ctx;
}
