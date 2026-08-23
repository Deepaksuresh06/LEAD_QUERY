import { NextFunction, Request, Response } from "express";
import { leadQuerySchema } from "../validator/leadQuery";

export const validateLeadQuery = (req: Request, res: Response, next: NextFunction) => {
    const result = leadQuerySchema.safeParse(req.query);

    if(!result.success) {
        return res.status(400).json({ 
            message: "Invalid query parameters", 
            errors: result.error.message, 
        });
    }
    res.locals.leadQuery = result.data;

    next();
}