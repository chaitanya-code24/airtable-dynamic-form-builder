import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL as string;

interface FormSummary {
  formId: string;
  title: string;
  baseId: string;
  tableId: string;
  createdAt: string;
}

const Dashboard = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/forms`)
      .then((res) => res.json())
      .then((data) => {
        setForms(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h2>My Forms</h2>

      <div style={{ marginBottom: 20 }}>
        <Link to="/builder">
          <button>Create New Form</button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <p>No forms yet. Click "Create New Form" to get started.</p>
      ) : (
        <ul>
          {forms.map((f) => (
            <li key={f.formId} style={{ marginBottom: 12 }}>
              <strong>{f.title}</strong> <br />
              <small>
                Base: {f.baseId} | Table: {f.tableId} | Created:{" "}
                {new Date(f.createdAt).toLocaleString()}
              </small>
              <br />
              <Link to={`/form/${f.formId}`}>Open Form</Link> {" | "}
              <Link to={`/forms/${f.formId}/responses`}>View Responses</Link>{" "}
              {" | "}
              <a
                href={`${API_URL}/api/forms/${f.formId}/responses/export?format=csv`}
                target="_blank"
              >
                Export CSV
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
