import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Public
import Landing from "./pages/Landing";
import Tutors from "./pages/Tutors";
import TutorDetail from "./pages/TutorDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterStudent from "./pages/auth/RegisterStudent";
import RegisterTutor from "./pages/auth/RegisterTutor";
import { ForgotPassword, ResetPassword } from "./pages/auth/ForgotPassword";
import { About, Contact, FAQ } from "./pages/StaticPages";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentClasses from "./pages/student/StudentClasses";


// Tutor
import TutorDashboard from "./pages/tutor/TutorDashboard";
import CreateClass from "./pages/tutor/CreateClass";
import TutorClasses from "./pages/tutor/TutorClasses";

// Messages
import Messages from "./pages/messages/Messages";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import { AdminClasses, AdminPayments, AdminReports, AdminSettings } from "./pages/AdminPages";

// Shared dashboard subpages
import { Notifications, Favourites, Payments, Reviews, Students, Profile, Settings, Availability } from "./pages/SimplePages";

const queryClient = new QueryClient();

const RedirectHome: React.FC = () => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Landing />;
  const dest = profile.role === 'tutor' ? '/tutor/dashboard' : profile.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  return <Navigate to={dest} replace />;
};

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/tutors" element={<Tutors />} />
              <Route path="/tutors/:id" element={<TutorDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/student" element={<RegisterStudent />} />
              <Route path="/register/tutor" element={<RegisterTutor />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />


              {/* Student */}
              <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
              <Route path="/student/settings" element={<ProtectedRoute role="student"><Settings /></ProtectedRoute>} />
              <Route path="/student/classes" element={<ProtectedRoute role="student"><StudentClasses /></ProtectedRoute>} />
              <Route path="/student/classes/:classId" element={<ProtectedRoute role="student"><StudentClasses /></ProtectedRoute>} />
              <Route path="/student/messages" element={<ProtectedRoute role="student"><Messages /></ProtectedRoute>} />
              <Route path="/student/messages/:conversationId" element={<ProtectedRoute role="student"><Messages /></ProtectedRoute>} />
              <Route path="/student/payments" element={<ProtectedRoute role="student"><Payments /></ProtectedRoute>} />
              <Route path="/student/reviews" element={<ProtectedRoute role="student"><Reviews /></ProtectedRoute>} />
              <Route path="/student/favourites" element={<ProtectedRoute role="student"><Favourites /></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />

              {/* Tutor */}
              <Route path="/tutor/dashboard" element={<ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>} />
              <Route path="/tutor/profile" element={<ProtectedRoute role="tutor"><Profile /></ProtectedRoute>} />
              <Route path="/tutor/settings" element={<ProtectedRoute role="tutor"><Settings /></ProtectedRoute>} />
              <Route path="/tutor/messages" element={<ProtectedRoute role="tutor"><Messages /></ProtectedRoute>} />
              <Route path="/tutor/messages/:conversationId" element={<ProtectedRoute role="tutor"><Messages /></ProtectedRoute>} />
              <Route path="/tutor/classes" element={<ProtectedRoute role="tutor"><TutorClasses /></ProtectedRoute>} />
              <Route path="/tutor/classes/create" element={<ProtectedRoute role="tutor"><CreateClass /></ProtectedRoute>} />
              <Route path="/tutor/classes/edit/:classId" element={<ProtectedRoute role="tutor"><CreateClass editMode /></ProtectedRoute>} />
              <Route path="/tutor/classes/:classId" element={<ProtectedRoute role="tutor"><TutorClasses /></ProtectedRoute>} />
              <Route path="/tutor/availability" element={<ProtectedRoute role="tutor"><Availability /></ProtectedRoute>} />
              <Route path="/tutor/reviews" element={<ProtectedRoute role="tutor"><Reviews /></ProtectedRoute>} />
              <Route path="/tutor/earnings" element={<ProtectedRoute role="tutor"><Payments /></ProtectedRoute>} />
              <Route path="/tutor/students" element={<ProtectedRoute role="tutor"><Students /></ProtectedRoute>} />
              <Route path="/tutor/notifications" element={<ProtectedRoute role="tutor"><Notifications /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/tutors" element={<ProtectedRoute role="admin"><AdminUsers filter="tutor" /></ProtectedRoute>} />
              <Route path="/admin/classes" element={<ProtectedRoute role="admin"><AdminClasses /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
