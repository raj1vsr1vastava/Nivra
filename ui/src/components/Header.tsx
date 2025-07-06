import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth: _drawerWidth, onMenuClick, isMobile }) => {
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isMenuOpen = Boolean(anchorEl);
  
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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // Navigate to profile page when it's created
    // navigate('/profile');
  };

  return (
    <AppBar
      className={`header-appbar ${hasScrolled ? 'header-appbar-scrolled' : ''}`}
    >
      <Toolbar className="header-toolbar">
        {isMobile && (
          <IconButton
            aria-label="open drawer"
            onClick={onMenuClick}
            className="header-mobile-menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <div className="header-logo-container">
          <img 
            src="/nivra-logo.png" 
            alt="Nivra Logo" 
            className="nivra-logo"
          />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="header-title"
          >
            Nivra
          </Typography>
        </div>
        
        <div className="header-spacer" />
        
        {/* User profile */}
        <div className="header-user-profile">
          <div 
            className="header-user-profile-link header-user-profile-clickable"
            onClick={handleProfileMenuOpen}
          >
            <Avatar className="header-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="header-user-avatar-img" />
              ) : (
                <PersonIcon />
              )}
            </Avatar>
            
            <div className="header-user-info">
              <Typography variant="subtitle2" className="header-user-name">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </Typography>
              <Typography variant="caption" className="header-user-role">
                {user?.role || 'Guest'}
              </Typography>
            </div>
          </div>
        </div>
        
        {/* User menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
