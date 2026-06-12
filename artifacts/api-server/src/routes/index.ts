import { Router, type IRouter } from "express";
import authRouter from "./auth";
import budgetsRouter from "./budgets";
import expensesRouter from "./expenses";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(expensesRouter);
router.use(budgetsRouter);

export default router;
