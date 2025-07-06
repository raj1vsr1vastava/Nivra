import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login/Login';
import SocietySelection from './pages/society-selection/SocietySelection';
import PendingApproval from './pages/pending-approval/PendingApproval';
import SocietiesList from './pages/societies/SocietiesList';
import SocietyDetails from './pages/societies/SocietyDetails';
import ManageSociety from './pages/societies/ManageSociety';
import ResidentsList from './pages/residents/ResidentsList';
import ResidentDetails from './pages/residents/ResidentDetails';
import ManageResident from './pages/residents/ManageResident';
import ResidentFinancesList from './pages/finances/ResidentFinancesList';
import SocietyFinancesList from './pages/expenses/SocietyFinancesList';
import SettingsIndex from './pages/settings/SettingsIndex';
import UsersManagement from './pages/settings/UsersManagement';
import RolesManagement from './pages/settings/RolesManagement';
import PermissionsManagement from './pages/settings/PermissionsManagement';
import SocietyAdminsManagement from './pages/settings/SocietyAdminsManagement';
import theme from './styles/theme';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            
            {/* User onboarding routes */}
            <Route path="/society-selection" element={
              <ProtectedRoute>
                <SocietySelection />
              </ProtectedRoute>
            } />
            <Route path="/pending-approval" element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/societies" element={
              <ProtectedRoute>
                <Layout>
                  <SocietiesList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/societies/new" element={
              <ProtectedRoute>
                <Layout>
                  <ManageSociety />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/societies/:societyId" element={
              <ProtectedRoute>
                <Layout>
                  <SocietyDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/societies/:societyId/edit" element={
              <ProtectedRoute>
                <Layout>
                  <ManageSociety />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/societies/:societyId/residents" element={
              <ProtectedRoute>
                <Layout>
                  <ResidentsList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/residents" element={
              <ProtectedRoute>
                <Layout>
                  <ResidentsList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/residents/add" element={
              <ProtectedRoute>
                <Layout>
                  <ManageResident />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/residents/:residentId" element={
              <ProtectedRoute>
                <Layout>
                  <ResidentDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/residents/:residentId/edit" element={
              <ProtectedRoute>
                <Layout>
                  <ManageResident />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/finances" element={
              <ProtectedRoute>
                <Layout>
                  <ResidentFinancesList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/society-finances" element={
              <ProtectedRoute>
                <Layout>
                  <SocietyFinancesList />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Settings routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <SettingsIndex />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/users" element={
              <ProtectedRoute>
                <Layout>
                  <UsersManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/roles" element={
              <ProtectedRoute>
                <Layout>
                  <RolesManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/permissions" element={
              <ProtectedRoute>
                <Layout>
                  <PermissionsManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/society-admins" element={
              <ProtectedRoute>
                <Layout>
                  <SocietyAdminsManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/societies" />} />
            <Route path="*" element={<Navigate to="/societies" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
