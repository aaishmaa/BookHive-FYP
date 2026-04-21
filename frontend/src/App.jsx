import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Layout
import Navbar  from './Components/Navbar';
import Sidebar from './Components/Sidebar';

// Auth pages
import Login                 from './Pages/Login';
import Register              from './Pages/Register';
import EmailVerificationPage from './Pages/EmailVerification';
import StudentForm           from './student/StudentForm';
import AdminLogin            from './admin/AdminLogin';

// App pages
import Home              from './Pages/Home';
import StudentDashboard  from './student/StudentDashboard';
import UploadPage        from './Pages/Upload';
import ChatPage          from './Pages/Chat';
import NotificationsPage from './Pages/Notification';
import DigitalNotes      from './Pages/Digitalnotes';
import SettingsPage      from './Pages/Setting';
import TransactionsPage  from './Pages/Transactions';
import SavedPosts        from './Pages/SavedPosts';
import BuyPage           from './Pages/Buy';
import RentPage          from './Pages/rent';
import ExchangePage      from './Pages/Exchange';
import ProfilePage       from './Pages/Profile';
import BookDetailPage    from './Pages/BookDetailPage';
import PublicProfile     from './Pages/PublicProfile';
import BrowsePage        from './Pages/Browse';
import MyListings        from './Pages/MyListings';
import Requests          from './Pages/Requests';
import Wishlist          from './Pages/Wishlist';
import Checkout          from './Pages/Checkout';
import OrderSuccess      from './Pages/PaymentSuccess';   // your PaymentSuccess.jsx

// Admin pages
import AdminStudentReview from './admin/Adminstudentreview';
import AdminDashboard     from './admin/AdminDashboard';

// Auth store
import { useAuthStore } from './store/authStore';

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

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F4FAFA]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#1C7C84] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  if (isCheckingAuth) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  if (isCheckingAuth) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}

const P = ({ children }) => (
  <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>
);

const A = ({ children }) => (
  <AdminRoute>{children}</AdminRoute>
);

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <div className="App">
      <Routes>

        {/* ── Public ── */}
        <Route path="/"              element={<Navigate to="/login" replace />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/Login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/Register"      element={<Register />} />
        <Route path="/verify-email"  element={<EmailVerificationPage />} />
        <Route path="/form-page"     element={<StudentForm />} />
        <Route path="/admin/login"   element={<AdminLogin />} />

        {/* ── Khalti redirect — PUBLIC (no login needed, Khalti redirects here) ── */}
        <Route path="/payment/success" element={<OrderSuccess />} />

        {/* ── Student protected routes ── */}
        <Route path="/home"          element={<P><Home /></P>} />
        <Route path="/browse"        element={<P><BrowsePage /></P>} />
        <Route path="/my-listings"   element={<P><MyListings /></P>} />
        <Route path="/requests"      element={<P><Requests /></P>} />
        <Route path="/wishlist"      element={<P><Wishlist /></P>} />
        <Route path="/upload"        element={<P><UploadPage /></P>} />
        <Route path="/chat"          element={<P><ChatPage /></P>} />
        <Route path="/notifications" element={<P><NotificationsPage /></P>} />
        <Route path="/digital-notes" element={<P><DigitalNotes /></P>} />
        <Route path="/transactions"  element={<P><TransactionsPage /></P>} />
        <Route path="/settings"      element={<P><SettingsPage /></P>} />
        <Route path="/saved"         element={<P><SavedPosts /></P>} />
        <Route path="/buy"           element={<P><BuyPage /></P>} />
        <Route path="/rent"          element={<P><RentPage /></P>} />
        <Route path="/exchange"      element={<P><ExchangePage /></P>} />
        <Route path="/profile"       element={<P><ProfilePage /></P>} />
        <Route path="/book/:id"      element={<P><BookDetailPage /></P>} />
        <Route path="/user/:userId"  element={<P><PublicProfile /></P>} />
        <Route path="/checkout"      element={<P><Checkout /></P>} />
        <Route path="/order-success" element={<P><OrderSuccess /></P>} />

        {/* ── Admin protected routes ── */}
        <Route path="/admin"          element={<A><AdminDashboard /></A>} />
        <Route path="/admin/students" element={<A><AdminStudentReview /></A>} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;