import React, { useState, ReactNode } from 'react';
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
import './Layout.css';

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

interface MenuItem {
  text?: string;
  icon?: React.ReactNode;
  path?: string;
  indent?: boolean;
  divider?: boolean;
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };
  
  const menuItems: MenuItem[] = [
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
    <>
      <Toolbar /> {/* Always include Toolbar for both mobile and desktop to reserve space for the header */}
      <Divider />
      <List className="layout-drawer-list">
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} className="layout-menu-divider" />
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }
                }}
                className={`layout-menu-item-button ${item.indent ? 'indent' : ''}`}
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
    </>
  );

  return (
    <Box className="layout-root">
      <CssBaseline />
      
      {/* App bar */}
      <Header 
        drawerWidth={drawerWidth} 
        onMenuClick={handleDrawerToggle} 
        isMobile={isMobile} 
      />
      
      {/* Navigation drawer */}
      <Box component="nav" className="layout-nav-container">
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          className="layout-mobile-drawer"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          className="layout-desktop-drawer"
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box component="main" className="layout-main-content">
        <Container maxWidth="lg" className="layout-container">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
