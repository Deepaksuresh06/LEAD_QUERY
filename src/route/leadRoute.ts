import { Router } from "express";
import { getLeadsController } from "../controller/leadController";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateLeadQuery } from "../middleware/validateLeadQuery";

const router = Router();

router.get("/", authMiddleware, validateLeadQuery, getLeadsController);

export default router;