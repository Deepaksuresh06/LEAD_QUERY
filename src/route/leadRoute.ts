import { Router } from "express";
import { getLeadsController } from "../controller/leadController";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateLeadQuery } from "../middleware/validateLeadQuery";
import { validateQueryLeadsBody } from "../middleware/validateQueryLeadsBody";

const router = Router();

router.post("/query", authMiddleware, validateQueryLeadsBody, validateLeadQuery, getLeadsController);

export default router;