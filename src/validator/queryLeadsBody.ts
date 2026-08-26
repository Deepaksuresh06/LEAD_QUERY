import { z } from "zod";

const filterFieldTypeSchema = z.enum([ 
  "string",
  "number",
  "date",
  "boolean",
]);

const filterConditionSchema = z.enum([
  "is", "is not",
  "contain", "does not contain",
  "starts with", "ends with",
  "before", "after",
  "greater than", "less than",
  "is empty", "is not empty",
]);

const leadFilterSchema = z.object({

  fieldId: z.string().min(1),
  fieldType: filterFieldTypeSchema,
  condition: filterConditionSchema,
  value: z.string().optional(),

  inputType: z
    .string()
    .optional(),
});

export const queryLeadsBodySchema = z.object({
  q: z.string().trim().optional(),

  logic: z
    .enum(["AND", "OR"])
    .default("AND"),

  filters: z
    .array(leadFilterSchema)
    .default([]),
});

export type QueryLeadsBody = z.infer< typeof queryLeadsBodySchema >;