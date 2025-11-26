import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shouldShowQuestion } from "../utils/conditionalLogic";

interface Question {
  questionKey: string;
  label: string;
  type: string;
  required: boolean;
  conditionalRules: any;
}

interface Form {
  _id: string;
  title: string;
  questions: Question[];
}

const FormViewer = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch(() => setError("Failed to load form"));
  }, [formId]);

  const handleChange = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form) return;

    for (const q of form.questions) {
      const visible = shouldShowQuestion(q.conditionalRules, answers);

      if (visible && q.required && !answers[q.questionKey]) {
        alert(`Required field missing: ${q.label}`);
        return;
      }
    }

    console.log("✅ Final Form Submission:", answers);
    alert("Form validated successfully ✅");
  };

  if (!form) return <div>Loading form...</div>;

  return (
    <div>
      <h2>{form.title}</h2>

      {form.questions.map((q) => {
        const visible = shouldShowQuestion(q.conditionalRules, answers);
        if (!visible) return null;

        return (
          <div key={q.questionKey} style={{ marginBottom: "12px" }}>
            <label>{q.label}</label>
            <br />

            {q.type === "singleLineText" && (
              <input
                type="text"
                onChange={(e) =>
                  handleChange(q.questionKey, e.target.value)
                }
              />
            )}

            {q.type === "multilineText" && (
              <textarea
                onChange={(e) =>
                  handleChange(q.questionKey, e.target.value)
                }
              />
            )}

            {q.type === "singleSelect" && (
              <input
                type="text"
                onChange={(e) =>
                  handleChange(q.questionKey, e.target.value)
                }
              />
            )}

            {q.type === "multipleSelects" && (
              <input
                type="text"
                placeholder="Comma separated"
                onChange={(e) =>
                  handleChange(
                    q.questionKey,
                    e.target.value.split(",")
                  )
                }
              />
            )}
          </div>
        );
      })}

      <button onClick={handleSubmit}>Submit</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FormViewer;
