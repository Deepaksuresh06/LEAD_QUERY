import { z } from "zod";

export const queryLeadsBodySchema = z.object({
  q: z.string().optional(),
  logic: z.enum(["AND", "OR"]).default("AND"),
  filters: z.array(z.any()).default([]),
  
});

export type QueryLeadsBody = z.infer<typeof queryLeadsBodySchema>;