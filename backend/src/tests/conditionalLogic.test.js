import { shouldShowQuestion } from "../utils/conditionalLogic.js";

const rules = {
  logic: "AND",
  conditions: [
    { questionKey: "role", operator: "equals", value: "Engineer" },
  ],
};

console.log(
  shouldShowQuestion(rules, { role: "Engineer" }) // ✅ true
);

console.log(
  shouldShowQuestion(rules, { role: "Designer" }) // ❌ false
);
