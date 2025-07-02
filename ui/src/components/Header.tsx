import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ApartmentIcon from '@mui/icons-material/Apartment';
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
  const theme = useTheme();
  
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

  // User menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        boxShadow: hasScrolled ? 3 : 1,
        transition: 'box-shadow 0.3s ease',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary'
      }}
      className={hasScrolled ? 'scrolled' : ''}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ApartmentIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Nivra
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* User profile */}
        <Box 
          component={Link} 
          to="/profile"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32,
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <PersonIcon />
            )}
          </Avatar>
          
          <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {currentUser.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
              {currentUser.role}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
