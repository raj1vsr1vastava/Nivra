import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import './Header.css';

interface HeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
  isMobile: boolean;
}

interface User {
  name: string;
  role: string;
  avatar: string | null;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth, onMenuClick, isMobile }) => {
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  
  // Mock user data - in a real app, this would come from authentication context or props
  const currentUser: User = {
    name: "John Doe",
    role: "Admin",
    avatar: null // Placeholder for user avatar
  };
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AppBar
      position="fixed"
      className={hasScrolled ? 'scrolled' : ''}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            className="header-mobile-menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box className="header-logo-container">
          <img 
            src="/nivra-logo.png" 
            alt="Nivra Logo" 
            className="nivra-logo"
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            className="header-title"
          >
            Nivra
          </Typography>
        </Box>
        
        <Box className="header-spacer" />
        
        {/* User profile */}
        <Box 
          component={Link} 
          to="/profile"
          className="header-user-profile"
        >
          <Avatar className="header-user-avatar">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <PersonIcon />
            )}
          </Avatar>
          
          <Box className="header-user-info">
            <Typography variant="subtitle2" className="header-user-name">
              {currentUser.name}
            </Typography>
            <Typography variant="caption" className="header-user-role">
              {currentUser.role}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
