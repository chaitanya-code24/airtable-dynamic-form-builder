import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  BaseItem,
  TableItem,
  FieldItem,
  Question,
  ConditionalRules,
  Condition,
} from "../types";


const API_URL = import.meta.env.VITE_API_URL as string;

const FormBuilder = () => {
  const [title, setTitle] = useState("");
  const [bases, setBases] = useState<BaseItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [fields, setFields] = useState<FieldItem[]>([]);

  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingBases, setLoadingBases] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  // Load bases on mount
  useEffect(() => {
    setLoadingBases(true);
    fetch(`${API_URL}/api/airtable/bases`)
      .then((res) => res.json())
      .then((data) => {
        setBases(data || []);
        setLoadingBases(false);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load bases");
        setLoadingBases(false);
      });
  }, []);

  const handleBaseChange = async (baseId: string) => {
    setSelectedBaseId(baseId);
    setSelectedTableId("");
    setTables([]);
    setFields([]);
    setQuestions([]);

    if (!baseId) return;

    setLoadingTables(true);
    try {
      const res = await fetch(`${API_URL}/api/airtable/bases/${baseId}/tables`);
      const data = await res.json();
      setTables(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tables");
    } finally {
      setLoadingTables(false);
    }
  };

  const handleTableChange = async (tableId: string) => {
    setSelectedTableId(tableId);
    setFields([]);
    setQuestions([]);

    if (!tableId || !selectedBaseId) return;

    setLoadingFields(true);
    try {
      const res = await fetch(
        `${API_URL}/api/airtable/bases/${selectedBaseId}/tables/${tableId}/fields`
      );
      const data = await res.json();
      setFields(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load fields");
    } finally {
      setLoadingFields(false);
    }
  };

  const toggleFieldSelection = (field: FieldItem) => {
    const exists = questions.find((q) => q.airtableFieldId === field.fieldId);

    if (exists) {
      setQuestions((prev) =>
        prev.filter((q) => q.airtableFieldId !== field.fieldId)
      );
    } else {
      const key =
        field.name
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") || field.fieldId;

      const newQuestion: Question = {
        questionKey: key,
        airtableFieldId: field.fieldId,
        label: field.name,
        type: field.type,
        required: false,
        conditionalRules: null,
      };

      setQuestions((prev) => [...prev, newQuestion]);
    }
  };

  const updateQuestion = (key: string, partial: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.questionKey === key
          ? {
              ...q,
              ...partial,
            }
          : q
      )
    );
  };

  const updateConditionalRules = (
    questionKey: string,
    rules: ConditionalRules | null
  ) => {
    updateQuestion(questionKey, { conditionalRules: rules });
  };

  const addCondition = (questionKey: string) => {
    const q = questions.find((x) => x.questionKey === questionKey);
    if (!q) return;

    const otherQuestions = questions.filter(
      (x) => x.questionKey !== questionKey
    );
    if (otherQuestions.length === 0) return;

    const defaultTarget = otherQuestions[0].questionKey;

    const newCondition: Condition = {
      questionKey: defaultTarget,
      operator: "equals",
      value: "",
    };

    const currentRules = q.conditionalRules || {
      logic: "AND",
      conditions: [],
    };

    const nextRules: ConditionalRules = {
      ...currentRules,
      conditions: [...currentRules.conditions, newCondition],
    };

    updateConditionalRules(questionKey, nextRules);
  };

  const updateConditionField = (
    questionKey: string,
    index: number,
    field: keyof Condition,
    value: any
  ) => {
    const q = questions.find((x) => x.questionKey === questionKey);
    if (!q || !q.conditionalRules) return;

    const conditions = [...q.conditionalRules.conditions];
    conditions[index] = {
      ...conditions[index],
      [field]: value,
    };

    updateConditionalRules(questionKey, {
      ...q.conditionalRules,
      conditions,
    });
  };

  const removeCondition = (questionKey: string, index: number) => {
    const q = questions.find((x) => x.questionKey === questionKey);
    if (!q || !q.conditionalRules) return;

    const conditions = [...q.conditionalRules.conditions];
    conditions.splice(index, 1);

    const nextRules: ConditionalRules | null =
      conditions.length === 0
        ? null
        : {
            ...q.conditionalRules,
            conditions,
          };

    updateConditionalRules(questionKey, nextRules);
  };

  const handleSave = async () => {
    setError("");

    if (!title || !selectedBaseId || !selectedTableId || questions.length === 0) {
      setError("Title, base, table, and at least one question are required.");
      return;
    }

    const body = {
      title,
      airtableBaseId: selectedBaseId,
      airtableTableId: selectedTableId,
      questions,
    };

    try {
      const res = await fetch(`${API_URL}/api/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create form");
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create form");
    }
  };

  const isFieldSelected = (field: FieldItem) =>
    questions.some((q) => q.airtableFieldId === field.fieldId);

  return (
    <div style={{ padding: 40 }}>
      <h2>Create Form</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        <label>
          Form Title:{" "}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: 300 }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {/* LEFT: Base & Table & Fields */}
        <div style={{ flex: 1 }}>
          <h3>1. Select Base & Table</h3>

          <div style={{ marginBottom: 12 }}>
            <label>Base: </label>
            {loadingBases ? (
              <span>Loading bases...</span>
            ) : (
              <select
                value={selectedBaseId}
                onChange={(e) => handleBaseChange(e.target.value)}
              >
                <option value="">Select base</option>
                {bases.map((b) => (
                  <option key={b.baseId} value={b.baseId}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Table: </label>
            {loadingTables ? (
              <span>Loading tables...</span>
            ) : (
              <select
                value={selectedTableId}
                onChange={(e) => handleTableChange(e.target.value)}
                disabled={!selectedBaseId}
              >
                <option value="">Select table</option>
                {tables.map((t) => (
                  <option key={t.tableId} value={t.tableId}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <h3>2. Choose Fields</h3>
          {loadingFields && <p>Loading fields...</p>}
          {!loadingFields &&
            selectedTableId &&
            (fields.length === 0 ? (
              <p>No supported fields in this table.</p>
            ) : (
              <ul>
                {fields.map((f) => (
                  <li key={f.fieldId}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isFieldSelected(f)}
                        onChange={() => toggleFieldSelection(f)}
                      />{" "}
                      {f.name} <small>({f.type})</small>
                    </label>
                  </li>
                ))}
              </ul>
            ))}
        </div>

        {/* RIGHT: Questions */}
        <div style={{ flex: 1 }}>
          <h3>3. Configure Questions</h3>

          {questions.length === 0 ? (
            <p>Select fields to include them as questions.</p>
          ) : (
            questions.map((q) => {
              const otherQuestions = questions.filter(
                (x) => x.questionKey !== q.questionKey
              );

              const rules = q.conditionalRules;

              return (
                <div
                  key={q.questionKey}
                  style={{
                    border: "1px solid #ccc",
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <strong>{q.questionKey}</strong> ({q.type})
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label>
                      Label:{" "}
                      <input
                        value={q.label}
                        onChange={(e) =>
                          updateQuestion(q.questionKey, {
                            label: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(q.questionKey, {
                            required: e.target.checked,
                          })
                        }
                      />{" "}
                      Required
                    </label>
                  </div>

                  {/* Conditional Logic */}
                  <div style={{ marginTop: 10 }}>
                    <strong>Conditional Logic</strong>
                    <div>
                      <label>
                        Logic:{" "}
                        <select
                          value={rules?.logic || "AND"}
                          onChange={(e) =>
                            updateConditionalRules(q.questionKey, {
                              logic: e.target.value as "AND" | "OR",
                              conditions: rules?.conditions || [],
                            })
                          }
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      </label>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => addCondition(q.questionKey)}
                        disabled={otherQuestions.length === 0}
                      >
                        Add Condition
                      </button>
                      {otherQuestions.length === 0 && (
                        <div>
                          <small>
                            Need at least one other question to add conditions.
                          </small>
                        </div>
                      )}
                    </div>

                    {rules?.conditions?.length ? (
                      <ul>
                        {rules.conditions.map((c, idx) => (
                          <li key={idx}>
                            <select
                              value={c.questionKey}
                              onChange={(e) =>
                                updateConditionField(
                                  q.questionKey,
                                  idx,
                                  "questionKey",
                                  e.target.value
                                )
                              }
                            >
                              {otherQuestions.map((oq) => (
                                <option
                                  key={oq.questionKey}
                                  value={oq.questionKey}
                                >
                                  {oq.questionKey}
                                </option>
                              ))}
                            </select>

                            <select
                              value={c.operator}
                              onChange={(e) =>
                                updateConditionField(
                                  q.questionKey,
                                  idx,
                                  "operator",
                                  e.target.value
                                )
                              }
                            >
                              <option value="equals">equals</option>
                              <option value="notEquals">notEquals</option>
                              <option value="contains">contains</option>
                            </select>

                            <input
                              placeholder="Value"
                              value={c.value}
                              onChange={(e) =>
                                updateConditionField(
                                  q.questionKey,
                                  idx,
                                  "value",
                                  e.target.value
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeCondition(q.questionKey, idx)
                              }
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave}>Save Form</button>
      </div>
    </div>
  );
};

export default FormBuilder;
