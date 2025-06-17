import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout"
import LoginForm from "./pages/LoginForm";
import RegisterWizard from "./pages/register/RegisterWizard";
import HomePage from "./pages/HomePage";
import ScenarioEditor from "./pages/ScenarioEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import AssignedScenarios from "./pages/AssignedScenarios";
import { useUser } from "./context/UserContext";
import HotspotRunner from "./components/HotspotRunner";
import AbTestEditor from "./pages/AbTestEditor";
import AbAssign from "./pages/AbAssign";
import ABTestRunner from "./pages/ABTestRunner";
import ScenarioResultsPage from "./pages/ScenarioResultsPage";
import ABResultsPage from "./pages/ABResultsPage";
import TestResultsOverview from "./pages/TestResultsOverview";
import './App.css'
import CreateChoicePage from "./pages/CreateChoicePage";
import UserListPage from "./pages/UserListPage";
import GroupListPage from "./pages/GroupListPage";
import AssignUsersToTest from "./pages/AssignUsersToTest";

export default function App() {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterWizard />} />
        <Route path="/unauthorized" element={<p>❌ У вас нет доступа к этой странице.</p>} />

        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ScenarioEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assign/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignUsersToTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assigned"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <AssignedScenarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotspot/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <HotspotRunner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ab/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AbTestEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ab/assign/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AbAssign />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ab-runner/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ABTestRunner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scenario-results/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ScenarioResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ab-results/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ABResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TestResultsOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/choice"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateChoicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GroupListPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
