import { z } from "zod";

export const leadQuerySchema = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["createdAt", "followUpDate"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type LeadQuery = z.infer<typeof leadQuerySchema>;