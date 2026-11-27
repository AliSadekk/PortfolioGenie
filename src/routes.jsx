import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';

/**
 * App Routes — Person B
 * /           → Dashboard
 * /dashboard  → Dashboard
 * /builder/:id → Builder (multi-step form)
 * *           → redirect to /
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/builder/:id" element={<Builder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
