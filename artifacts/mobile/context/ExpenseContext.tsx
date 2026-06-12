import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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
  refresh: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiGet("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(
          (data.expenses ?? []).map((e: { id: string; date: string; category: Category; name: string; amount: string }) => ({
            ...e,
            amount: parseFloat(e.amount),
          }))
        );
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
    setExpenses((prev) => [expense, ...prev]);
    try {
      await apiPost("/api/expenses", { ...expense, amount: expense.amount });
    } catch {
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await apiDelete(`/api/expenses/${id}`);
    } catch {
      await fetchExpenses();
    }
  }, [fetchExpenses]);

  const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = expenses.reduce<Partial<Record<Category, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, totalSpending, categoryTotals, isLoading, refresh: fetchExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpenseProvider");
  return ctx;
}
