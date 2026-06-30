import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AIAssistant from "./components/AIAssistant";
import MyMaintenance from "./pages/MyMaintenance";

import MaintenanceTasks from "./pages/MaintenanceTasks";


import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import IssueDetail from "./pages/IssueDetail";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import WardScores from "./pages/WardScores";
import Contractors from "./pages/Contractors";
import Predictions from "./pages/Predictions";
import FixItSquads from "./pages/FixItSquads";
import Leaderboard from "./pages/Leaderboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Budget from "./pages/Budget";

import TaskSubmission from "./pages/TaskSubmission";
import TaskApproval from "./pages/TaskApproval";


export default function App() {
  const { loading, user } = useAuth();
  if (loading) return <div className="container">Loading…</div>;
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/wards" element={<WardScores />} />
        <Route path="/contractors" element={<Contractors />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/squads" element={<FixItSquads />} />
        <Route path="/issues/:id" element={<IssueDetail />} />

        <Route element={<ProtectedRoute />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/budget" element={<Budget />} />

          <Route
            path="/maintenance/my"
            element={<MyMaintenance />}
          />

          <Route
            path="/maintenance"
            element={<MaintenanceTasks />}
          />

          <Route
            path="/maintenance/submit/:id"
            element={<TaskSubmission />}
          />

          <Route
            path="/maintenance/approval"
            element={<TaskApproval />}
          />

        </Route>



        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && <AIAssistant />}
      <div className="footer">© Community Hero AI · Powered by Google Gemini</div>
    </>
  );
}
