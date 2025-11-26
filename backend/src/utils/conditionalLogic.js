/**
 * @param {Object|null} rules - ConditionalRules or null
 * @param {Object} answersSoFar - Record<string, any>
 * @returns {boolean}
 */
export function shouldShowQuestion(rules, answersSoFar) {
  // ✅ Rule 1: If no rules, always show
  if (!rules) return true;

  const { logic, conditions } = rules;

  // ✅ Guard: If no conditions, show
  if (!conditions || conditions.length === 0) return true;

  const results = conditions.map((condition) => {
    const { questionKey, operator, value } = condition;

    const userAnswer = answersSoFar?.[questionKey];

    // ✅ Missing value should not crash evaluation
    if (userAnswer === undefined || userAnswer === null) {
      return false;
    }

    switch (operator) {
      case "equals":
        return userAnswer === value;

      case "notEquals":
        return userAnswer !== value;

      case "contains":
        if (Array.isArray(userAnswer)) {
          return userAnswer.includes(value);
        }
        if (typeof userAnswer === "string") {
          return userAnswer.includes(value);
        }
        return false;

      default:
        return false;
    }
  });

  // ✅ Combine using AND / OR
  if (logic === "AND") {
    return results.every(Boolean);
  }

  if (logic === "OR") {
    return results.some(Boolean);
  }

  return true;
}
