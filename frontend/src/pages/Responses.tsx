import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL as string;

interface ResponseItem {
  submissionId: string;
  createdAt: string;
  status: string;
  answersPreview: [string, any][];
}

const Responses = () => {
  const { formId } = useParams();
  const [responses, setResponses] = useState<ResponseItem[]>([]);

  useEffect(() => {
    if (!formId) return;
    fetch(`${API_URL}/api/forms/${formId}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data || []));
  }, [formId]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Responses</h2>

      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <ul>
          {responses.map((r) => (
            <li key={r.submissionId} style={{ marginBottom: 10 }}>
              <strong>{new Date(r.createdAt).toLocaleString()}</strong> | Status:{" "}
              {r.status}
              <br />
              Preview:{" "}
              {r.answersPreview &&
                r.answersPreview
                  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                  .join(" | ")}
            </li>
          ))}
        </ul>
      )}

      {formId && (
        <div style={{ marginTop: 10 }}>
          <a
            href={`${API_URL}/api/forms/${formId}/responses/export?format=csv`}
            target="_blank"
          >
            Export CSV
          </a>
        </div>
      )}
    </div>
  );
};

export default Responses;
