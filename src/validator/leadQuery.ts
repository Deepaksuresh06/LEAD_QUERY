import { z } from "zod";

export const leadQuerySchema = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["id", "name", "email", "status", "createdAt", "updatedAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),

    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

export type LeadQuery = z.infer<typeof leadQuerySchema>;