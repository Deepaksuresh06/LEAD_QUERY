import express from "express";
import { authMiddleware } from "./middleware/auth.middleware";
import leadRoute from "./route/leadRoute";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.use(authMiddleware);

app.use("/api/leads", leadRoute);

export default app;