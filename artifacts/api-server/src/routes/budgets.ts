import { Router, type Request, type Response } from "express";
import { db, budgetsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

const router = Router();

const VALID_CATEGORIES = new Set(["Food", "Transport", "Shopping", "Entertainment", "Savings", "Other"]);
type Category = "Food" | "Transport" | "Shopping" | "Entertainment" | "Savings" | "Other";

router.get("/budgets", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db.select().from(budgetsTable).where(eq(budgetsTable.userId, req.user.id));
  res.json({ budgets: rows.map((b) => ({ category: b.category, amount: String(b.amount) })) });
});

router.put("/budgets", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { category, amount } = req.body ?? {};
  if (typeof category !== "string" || !VALID_CATEGORIES.has(category) || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [budget] = await db
    .insert(budgetsTable)
    .values({ userId: req.user.id, category: category as Category, amount: String(amount) })
    .onConflictDoUpdate({
      target: [budgetsTable.userId, budgetsTable.category],
      set: { amount: String(amount), updatedAt: new Date() },
    })
    .returning();
  res.json({ category: budget.category, amount: String(budget.amount) });
});

router.delete("/budgets/:category", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { category } = req.params;
  if (!VALID_CATEGORIES.has(category)) { res.status(400).json({ error: "Invalid category" }); return; }
  await db.delete(budgetsTable).where(
    and(eq(budgetsTable.userId, req.user.id), eq(budgetsTable.category, category as Category))
  );
  res.json({ success: true });
});

export default router;
