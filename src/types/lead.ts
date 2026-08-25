export type FilterFieldType = | "string" | "number" | "date" | "boolean";

export type FilterCondition = | "is" | "is not" | "contain" | "does not contain"
  | "starts with" | "ends with" | "before" | "after" | "greater than" | "less than"
  | "is empty" | "is not empty";

export type LeadFilter = {
  fieldId: string;
  fieldType: FilterFieldType;
  condition: FilterCondition;
  value?: string;
  inputType?: "text" | "select" | "multiselect" | string;
};