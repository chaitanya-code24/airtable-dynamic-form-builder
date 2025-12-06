export type Operator = "equals" | "notEquals" | "contains";

export interface Condition {
  questionKey: string;
  operator: Operator;
  value: any;
}

export interface ConditionalRules {
  logic: "AND" | "OR";
  conditions: Condition[];
}

export type AirtableFieldType =
  | "singleLineText"
  | "multilineText"
  | "singleSelect"
  | "multipleSelects"
  | "multilineText"
  | "multipleAttachments";

export interface BaseItem {
  baseId: string;
  name: string;
}

export interface TableItem {
  tableId: string;
  name: string;
}

export interface FieldItem {
  fieldId: string;
  name: string;
  type: AirtableFieldType;
  options?: {
    choices?: { name: string }[];
  } | null;
}

export interface Question {
  questionKey: string;
  airtableFieldId: string;
  label: string;
  type: AirtableFieldType;
  required: boolean;
  conditionalRules: ConditionalRules | null;
}

export interface FormSchema {
  _id: string;
  title: string;
  airtableBaseId: string;
  airtableTableId: string;
  questions: Question[];
}
