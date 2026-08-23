import { Router } from "express";
import { getLeads } from "../controller/leadController";

const router = Router();

router.get("/", getLeads);

export default router;