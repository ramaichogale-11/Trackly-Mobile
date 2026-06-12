import { pgTable, text, timestamp, varchar, numeric, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const categoryEnum = pgEnum("category", [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Savings",
  "Other",
]);

export const expensesTable = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  category: categoryEnum("category").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const budgetsTable = pgTable(
  "budgets",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    category: categoryEnum("category").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("budgets_user_category_unique").on(t.userId, t.category)],
);

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({
  userId: true,
  createdAt: true,
});
export const selectExpenseSchema = createSelectSchema(expensesTable);
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
export type Budget = typeof budgetsTable.$inferSelect;
