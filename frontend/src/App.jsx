import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import Register from './Pages/Register';
import StudentDashboard from './student/StudentDashboard';
import EmailVerificationPage from './Pages/EmailVerification';
import StudentForm from './student/StudentForm';
import AdminStudentReview from "./admin/Adminstudentreview";
                

function App() {
  const location = useLocation();
  
  // Pages where navbar should NOT be shown
  const noNavbarPages = ['/Login', '/Register', '/'];
  const showNavbar = !noNavbarPages.includes(location.pathname);

  return (
    <div className="App">
      {/* Show Navbar only on authenticated pages */}
      {showNavbar && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Navigate to="/Login" />} />
        <Route path='/login' element={<Login />} /> 
        <Route path='/register' element={<Register />} />

        <Route path='/homepage' element={<StudentDashboard />} />
        <Route path='/verify-email' element={<EmailVerificationPage />} />

        <Route path='/form-page' element={<StudentForm />} />

        

       <Route path="/admin/students" element={<AdminStudentReview />} />
        
      </Routes>
    </div>
  );
}

export default App;