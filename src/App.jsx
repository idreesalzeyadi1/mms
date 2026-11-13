import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Expenses from "./pages/Expenses";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import FeeCollection from "./pages/FeeCollection";
import ExamMarksEntry from "./pages/ExamMarksEntry";
import ExamResults from "./pages/ExamResults";
import ManageTeachers from "./pages/ManageTeachers";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<FeeCollection />} />
            <Route path="/marks" element={<ExamMarksEntry />} />
            <Route path="/results" element={<ExamResults />} />
            <Route path="/teachers" element={<ManageTeachers />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
