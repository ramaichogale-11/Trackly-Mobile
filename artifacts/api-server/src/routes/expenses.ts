import { Router, type Request, type Response } from "express";
import { db, expensesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";

const router = Router();

const VALID_CATEGORIES = new Set(["Food", "Transport", "Shopping", "Entertainment", "Savings", "Other"]);

router.get("/expenses", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.userId, req.user.id))
    .orderBy(desc(expensesTable.createdAt));
  res.json({ expenses: rows.map((e) => ({ ...e, amount: String(e.amount) })) });
});

router.post("/expenses", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id, category, name, amount, date } = req.body ?? {};
  if (
    typeof id !== "string" || !id ||
    typeof category !== "string" || !VALID_CATEGORIES.has(category) ||
    typeof name !== "string" || !name.trim() ||
    typeof amount !== "number" || amount <= 0 ||
    typeof date !== "string"
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [expense] = await db
    .insert(expensesTable)
    .values({ id, userId: req.user.id, category: category as "Food", name: name.trim(), amount: String(amount), date })
    .returning();
  res.status(201).json({ ...expense, amount: String(expense.amount) });
});

router.delete("/expenses/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const deleted = await db
    .delete(expensesTable)
    .where(and(eq(expensesTable.id, req.params.id), eq(expensesTable.userId, req.user.id)))
    .returning();
  if (deleted.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ success: true });
});

export default router;
