import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FormSchema, Question } from "../types";
import { shouldShowQuestion } from "../utils/conditionalLogic";

const API_URL = import.meta.env.VITE_API_URL as string;

const FormViewer = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!formId) return;
    fetch(`${API_URL}/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch(() => setError("Failed to load form"));
  }, [formId]);

  const handleChange = (q: Question, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [q.questionKey]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form || !formId) return;

    // Required validation considering conditional visibility
    for (const q of form.questions) {
      const visible = shouldShowQuestion(q.conditionalRules, answers);
      if (visible && q.required) {
        const v = answers[q.questionKey];
        if (v === undefined || v === null || v === "") {
          alert(`Missing required field: ${q.label}`);
          return;
        }
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit response");
      }

      alert("Submitted successfully ✅");
      setAnswers({});
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Submission failed");
    }
  };

  if (!form) return <div style={{ padding: 40 }}>Loading form...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 40 }}>
      <h2>{form.title}</h2>

      {form.questions.map((q) => {
        const visible = shouldShowQuestion(q.conditionalRules, answers);
        if (!visible) return null;

        const value = answers[q.questionKey] ?? "";

        return (
          <div key={q.questionKey} style={{ marginBottom: 12 }}>
            <label>
              {q.label} {q.required && "*"}
            </label>
            <br />

            {q.type === "singleLineText" && (
              <input
                value={value}
                onChange={(e) => handleChange(q, e.target.value)}
              />
            )}

            {q.type === "multilineText" && (
              <textarea
                value={value}
                onChange={(e) => handleChange(q, e.target.value)}
              />
            )}

            {q.type === "singleSelect" && (
              <input
                placeholder="enter one option"
                value={value}
                onChange={(e) => handleChange(q, e.target.value)}
              />
            )}

            {q.type === "multipleSelects" && (
              <input
                placeholder="comma separated options"
                value={value}
                onChange={(e) =>
                  handleChange(q, e.target.value.split(",").map((x) => x.trim()))
                }
              />
            )}

            {q.type === "multipleAttachments" && (
              <input
                placeholder="Attachment URLs (comma separated)"
                value={value}
                onChange={(e) =>
                  handleChange(q, e.target.value.split(",").map((x) => x.trim()))
                }
              />
            )}
          </div>
        );
      })}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FormViewer;
