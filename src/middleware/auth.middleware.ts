import { Request, Response, NextFunction } from "express";
import { CurrentUser } from "../types/auth";
import { UserRole } from "../generated/prisma/client";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.header("x-tenant-id");
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role");

    if(!tenantId || !userId || !role) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if(!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser: CurrentUser = {
        tenantId,
        userId,
        role: role as UserRole,
    }

    req.currentUser = currentUser;
    next();
}