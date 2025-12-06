import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import FormViewer from "./pages/FormViewer";
import Responses from "./pages/Responses";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/builder" element={<FormBuilder />} />
      <Route path="/form/:formId" element={<FormViewer />} />
      <Route path="/forms/:formId/responses" element={<Responses />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
