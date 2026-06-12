import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Category = "Food" | "Transport" | "Shopping" | "Entertainment" | "Savings" | "Other";

export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Entertainment", "Savings", "Other"];

export interface Expense {
  id: string;
  date: string;
  category: Category;
  name: string;
  amount: number;
}

interface ExpenseContextValue {
  expenses: Expense[];
  addExpense: (input: Omit<Expense, "id" | "date">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalSpending: number;
  categoryTotals: Partial<Record<Category, number>>;
  isLoading: boolean;
}

const STORAGE_KEY = "@pft_expenses_v1";

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setExpenses(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persist = (updated: Expense[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const addExpense = useCallback(async (input: Omit<Expense, "id" | "date">) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const expense: Expense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: `${dd}-${mm}-${yyyy}`,
      ...input,
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      persist(updated);
      return updated;
    });
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = expenses.reduce<Partial<Record<Category, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, totalSpending, categoryTotals, isLoading }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpenseProvider");
  return ctx;
}
