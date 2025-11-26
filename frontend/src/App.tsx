import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FormViewer from "./pages/FormViewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/form/:formId" element={<FormViewer />} />
    </Routes>
  );
}

export default App;
