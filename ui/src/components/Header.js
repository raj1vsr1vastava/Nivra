import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import './Header.css';

const Header = ({ drawerWidth, onMenuClick, isMobile }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  
  // Mock user data - in a real app, this would come from authentication context or props
  const currentUser = {
    name: "John Doe",
    role: "Admin",
    avatar: null // Placeholder for user avatar
  };
  
  // Only show nav menu in mobile view since desktop has drawer

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
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

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Also pass to parent's menu handler if it exists
    if (onMenuClick) {
      onMenuClick();
    }
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`header ${hasScrolled ? 'scrolled' : ''}`}
      ref={headerRef}
      style={{
        width: '100%',
        zIndex: 1300 // Ensure header stays above drawer
      }}
    >
      <div className="nav-container">
        {isMobile && (
          <div className={`hamburger-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div className="logo">
          <ApartmentIcon style={{ marginRight: '8px' }} />
          <h2>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Nivra
            </Link>
          </h2>
        </div>
        
        {/* Only show navigation in header when mobile */}
        {isMobile && (
          <nav>
            <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
              <li>
                <Link 
                  to="/societies" 
                  className={isActive('/societies') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Societies
                </Link>
              </li>
              <li>
                <Link 
                  to="/residents" 
                  className={isActive('/residents') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Residents
                </Link>
              </li>
              <li>
                <Link 
                  to="/finances" 
                  className={isActive('/finances') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Finances
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={isActive('/settings') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        )}
        
        <div className="nav-actions">
          {/* User profile indicator */}
          <Link to="/profile" className="user-profile">
            <PersonIcon />
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
