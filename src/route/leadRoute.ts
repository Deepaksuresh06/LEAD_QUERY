import { Router } from "express";
import { getLeads } from "../controller/leadController";

const router = Router();

router.get("/leads", getLeads);

export default router;