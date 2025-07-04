import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Layout from './components/Layout';
import SocietiesList from './pages/societies/SocietiesList';
import SocietyDetails from './pages/societies/SocietyDetails';
import SocietyEdit from './pages/societies/SocietyEdit';
import ResidentsList from './pages/residents/ResidentsList';
import ResidentDetails from './pages/residents/ResidentDetails';
import ResidentEdit from './pages/residents/ResidentEdit';
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
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Main routes */}
            <Route path="/societies" element={<SocietiesList />} />
            <Route path="/societies/new" element={<SocietyEdit />} />
            <Route path="/societies/:societyId" element={<SocietyDetails />} />
            <Route path="/societies/:societyId/edit" element={<SocietyEdit />} />
            <Route path="/societies/:societyId/residents" element={<ResidentsList />} />
            <Route path="/residents" element={<ResidentsList />} />
            <Route path="/residents/:residentId" element={<ResidentDetails />} />
            <Route path="/residents/:residentId/edit" element={<ResidentEdit />} />
            <Route path="/finances" element={<ResidentFinancesList />} />
            <Route path="/society-finances" element={<SocietyFinancesList />} />
            
            {/* Settings routes */}
            <Route path="/settings" element={<SettingsIndex />} />
            <Route path="/settings/users" element={<UsersManagement />} />
            <Route path="/settings/roles" element={<RolesManagement />} />
            <Route path="/settings/permissions" element={<PermissionsManagement />} />
            <Route path="/settings/society-admins" element={<SocietyAdminsManagement />} />
            
            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/societies" />} />
            <Route path="*" element={<Navigate to="/societies" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
