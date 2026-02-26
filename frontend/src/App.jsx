import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import StudentDashboard from './student/StudentDashboard';
import EmailVerificationPage from './Pages/EmailVerification';
import StudentForm from './student/StudentForm';
import AdminStudentReview from './admin/Adminstudentreview';
import { useAuthStore } from './store/authStore';
import UploadPage from './Pages/Upload';
import ChatPage from './Pages/Chat';
import NotificationsPage from './Pages/Notification';
import DigitalNotes from './Pages/Digitalnotes';
import SettingsPage from './Pages/Setting';
import TransactionsPage from './Pages/Transactions';


// ── Full desktop layout ───────────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Protected route — redirects to /login if not authenticated ────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // Still checking auth (page just loaded) — show nothing yet
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F4FAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the page
  return children;
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const { checkAuth } = useAuthStore();

  // Check if user is still logged in when app loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App">
      <Routes>

        {/* ── Public pages (no layout, no auth needed) ── */}
        <Route path="/"             element={<Navigate to="/login" replace />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/Login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/Register"     element={<Register />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/form-page"    element={<StudentForm />} />
       
        {/* ── Protected pages (must be logged in) ── */}
        {/* homepage */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout><Home /></AppLayout>
            </ProtectedRoute>
          }
        />
        {/* student homepage */}
        <Route
          path="/Homepage" element={
            <ProtectedRoute>
              <AppLayout><StudentDashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        {/* //Upload page// */}
        <Route path="/upload" element={
  <ProtectedRoute><AppLayout><UploadPage /></AppLayout></ProtectedRoute>
} />

      {/* Chat page */}
      <Route path="/chat" element={
  <ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>
} /> 
{/* Notification page */}
<Route path="/notifications" element={
  <ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>
} />
{/* Digital NOtes */}
<Route path="/digital-notes" element={
          <ProtectedRoute><AppLayout><DigitalNotes /></AppLayout></ProtectedRoute>
        } />
       {/* admin page        */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <AppLayout><AdminStudentReview /></AppLayout>
            </ProtectedRoute>
          }
        />
        {/* Transactions */}
        <Route path="/transactions" element={
  <ProtectedRoute><AppLayout><TransactionsPage /></AppLayout></ProtectedRoute>
} />
        {/* Setting Page */}
        <Route path="/settings" element={
  <ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>
} />


        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;