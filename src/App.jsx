import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 👇 Notice the updated path here:
import ProtectedRoute from './router/ProtectedRoute'; 

const LoginPlaceholder = () => <div className="p-10 text-2xl text-blue-500">Login Page (Public)</div>;
const DashboardPlaceholder = () => <div className="p-10 text-2xl text-green-500">Dashboard (Protected!)</div>;

function App() {
  const mockSession = null; 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute session={mockSession}>
              <DashboardPlaceholder />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;