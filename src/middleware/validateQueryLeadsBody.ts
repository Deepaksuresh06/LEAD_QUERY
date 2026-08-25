import { Request, Response, NextFunction } from "express";
import { queryLeadsBodySchema } from "../validator/queryLeadsBody";

export const validateQueryLeadsBody = (req: Request, res: Response, next: NextFunction) => {
  const result = queryLeadsBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.message,
    });
  }

  res.locals.queryBody = result.data;
  next();
};