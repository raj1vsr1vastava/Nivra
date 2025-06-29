import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import './SettingsIndex.css';

const SettingsItem = ({ title, description, icon, path }) => {
  const navigate = useNavigate();
  
  return (
    <Grid item xs={12} md={6} lg={4}>
      <div 
        className="settings-card"
        onClick={() => navigate(path)}
      >
        <div className="card-icon">
          {icon}
        </div>
        <Typography className="card-title">
          {title}
        </Typography>
        <Typography className="card-description">
          {description}
        </Typography>
      </div>
    </Grid>
  );
};

const SettingsIndex = () => {
  const settingsItems = [
    {
      title: 'Users',
      description: 'Manage user accounts and credentials',
      icon: <PeopleIcon fontSize="inherit" />,
      path: '/settings/users'
    },
    {
      title: 'Roles',
      description: 'Manage roles and associated permissions',
      icon: <AdminPanelSettingsIcon fontSize="inherit" />,
      path: '/settings/roles'
    },
    {
      title: 'Permissions',
      description: 'Manage permissions for different resources',
      icon: <SecurityIcon fontSize="inherit" />,
      path: '/settings/permissions'
    },
    {
      title: 'Society Admins',
      description: 'Manage administrators for societies',
      icon: <BusinessIcon fontSize="inherit" />,
      path: '/settings/society-admins'
    },
  ];

  return (
    <div className="settings-container">
      <Container maxWidth="lg">
        <div className="settings-header">
          <h1>System Settings</h1>
          <p>Configure your system settings, manage users, roles, and permissions</p>
        </div>
        <Grid container spacing={4}>
          {settingsItems.map((item, index) => (
            <SettingsItem 
              key={index}
              title={item.title}
            description={item.description}
            icon={item.icon}
            path={item.path}
          />
        ))}
      </Grid>
    </Container>
    </div>
  );
};

export default SettingsIndex;
