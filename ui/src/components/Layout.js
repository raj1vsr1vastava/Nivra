import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useMediaQuery,
  Toolbar,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import ApartmentIcon from '@mui/icons-material/Apartment';

// Drawer width
const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const menuItems = [
    { text: 'Societies', icon: <HomeIcon />, path: '/societies' },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents' },
    { text: 'Finances', icon: <ReceiptIcon />, path: '/finances' },
    { text: 'Society Finances', icon: <ReceiptIcon />, path: '/society-finances' },
    { divider: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Users', icon: <PersonIcon />, path: '/settings/users', indent: true },
    { text: 'Roles', icon: <AdminPanelSettingsIcon />, path: '/settings/roles', indent: true },
    { text: 'Permissions', icon: <SecurityIcon />, path: '/settings/permissions', indent: true },
    { text: 'Society Admins', icon: <ApartmentIcon />, path: '/settings/society-admins', indent: true },
  ];
  
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  pl: item.indent ? 4 : 2
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <Header drawerWidth={drawerWidth} onMenuClick={handleDrawerToggle} isMobile={isMobile} />
      
      <Box sx={{ display: 'flex', width: '100%' }}>
        {/* Drawer navigation */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                top: '64px', // Place drawer below header
                height: 'calc(100% - 64px)', // Adjust height to account for header
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: '24px 0 24px 0', md: '24px 0 24px 0' }, // Remove horizontal padding completely
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            ml: { xs: 0, md: `${drawerWidth}px` },
            mt: '64px', // Space for header
            boxSizing: 'border-box',
            overflowX: 'hidden', // Prevent horizontal scrolling
          }}
        >
          {children}
        </Box>
      </Box>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center',
            ml: { xs: 0, md: `${drawerWidth/2}px` }, // Center properly with drawer
          }}>
            © {new Date().getFullYear()} Nivra - Society Management System
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
