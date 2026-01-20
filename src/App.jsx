import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './utils/LanguageContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserAssessment from './pages/UserAssessment';
import ThankYouPage from './pages/ThankYouPage';
import AdminReportView from './pages/AdminReportView';

// Custom Assessment Pages
import AdminCustomAssessments from './pages/AdminCustomAssessments';
import CustomAssessment from './pages/CustomAssessment';
import CustomThankYouPage from './pages/CustomThankYouPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Default route - redirect to user login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* USER Authentication - Candidates Only */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* ADMIN Authentication - Admins Only */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          
          {/* User Routes (Candidates) */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/assessment/:type" element={<UserAssessment />} />
          <Route path="/thank-you/:type" element={<ThankYouPage />} />
          
          {/* Custom Assessment Routes (User) */}
          <Route path="/custom-assessment/:courseId/:testType" element={<CustomAssessment />} />
          <Route path="/custom-thank-you/:courseId/:testType" element={<CustomThankYouPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/report/:userId/:reportId" element={<AdminReportView />} />
          <Route path="/admin/user-reports/:userId" element={<AdminReportView />} />
          
          {/* Admin Custom Assessments */}
          <Route path="/admin/custom-assessments" element={<AdminCustomAssessments />} />
          
          {/* Catch all - redirect to user login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
