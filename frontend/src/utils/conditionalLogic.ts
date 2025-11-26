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

export function shouldShowQuestion(
  rules: ConditionalRules | null,
  answersSoFar: Record<string, any>
): boolean {
  if (!rules) return true;

  const { logic, conditions } = rules;
  if (!conditions || conditions.length === 0) return true;

  const results = conditions.map((condition) => {
    const { questionKey, operator, value } = condition;
    const userAnswer = answersSoFar?.[questionKey];

    if (userAnswer === undefined || userAnswer === null) return false;

    switch (operator) {
      case "equals":
        return userAnswer === value;
      case "notEquals":
        return userAnswer !== value;
      case "contains":
        if (Array.isArray(userAnswer)) return userAnswer.includes(value);
        if (typeof userAnswer === "string") return userAnswer.includes(value);
        return false;
      default:
        return false;
    }
  });

  if (logic === "AND") return results.every(Boolean);
  if (logic === "OR") return results.some(Boolean);
  return true;
}
