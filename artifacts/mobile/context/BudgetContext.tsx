import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category } from "@/context/ExpenseContext";

export type BudgetLimits = Partial<Record<Category, number>>;

interface BudgetContextValue {
  budgets: BudgetLimits;
  setBudget: (category: Category, amount: number | null) => Promise<void>;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState<BudgetLimits>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setBudgets({});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiGet("/api/budgets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.budgets) {
          const map: BudgetLimits = {};
          for (const b of data.budgets as { category: Category; amount: string }[]) {
            map[b.category] = parseFloat(b.amount);
          }
          setBudgets(map);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const setBudget = useCallback(async (category: Category, amount: number | null) => {
    if (amount === null || amount <= 0) {
      setBudgets((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
      await apiDelete(`/api/budgets/${category}`).catch(() => {});
    } else {
      setBudgets((prev) => ({ ...prev, [category]: amount }));
      await apiPut("/api/budgets", { category, amount }).catch(() => {});
    }
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
