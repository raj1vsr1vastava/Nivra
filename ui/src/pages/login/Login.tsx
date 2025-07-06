import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  Phone
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  [key: string]: string;
}

const Login: React.FC = () => {
  const { login, signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/societies';
      
      // Handle user status-based redirects
      if (user.userStatus === 'pending_society') {
        navigate('/society-selection', { replace: true });
      } else if (user.userStatus === 'active') {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Login form state
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Error states
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});
  const [signupErrors, setSignupErrors] = useState<FieldErrors>({});

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setLoginErrors({});
    setSignupErrors({});
  };

  // Handle login form change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (loginErrors[name]) {
      setLoginErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle signup form change
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (signupErrors[name]) {
      setSignupErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone format
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Validate login form
  const validateLoginForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!loginData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginData.password.trim()) {
      errors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate signup form
  const validateSignupForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!signupData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!signupData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!signupData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signupData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(signupData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!signupData.password.trim()) {
      errors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!signupData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password);
      // Navigation will be handled by the useEffect hook after auth state updates
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
      });
      
      // After signup, user will be redirected to society selection
      // This is handled by ProtectedRoute based on user status
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container maxWidth="sm" className="login-content">
        <Paper className="login-paper" elevation={3}>
          {/* Logo and Title */}
          <div className="login-header">
            <img 
              src="/nivra-logo.png" 
              alt="Nivra Logo" 
              className="login-logo"
            />
            <Typography variant="h4" className="login-title">
              Welcome to Nivra
            </Typography>
            <Typography variant="subtitle1" className="login-subtitle">
              Society Management Made Simple
            </Typography>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="login-error-alert">
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Box className="login-tabs-container">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              className="login-tabs"
              variant="fullWidth"
            >
              <Tab label="Sign In" className="login-tab" />
              <Tab label="Sign Up" className="login-tab" />
            </Tabs>
          </Box>

          {/* Login Form */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleLoginSubmit} className="login-form">
              <TextField
                fullWidth
                required
                id="login-email"
                name="email"
                label="Email Address"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                error={!!loginErrors.email}
                helperText={loginErrors.email}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="login-input-icon" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                id="login-password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={handleLoginChange}
                error={!!loginErrors.password}
                helperText={loginErrors.password}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="login-input-icon" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        className="login-password-toggle"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                className="login-submit-button"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Divider className="login-divider">or</Divider>

              <Button
                type="button"
                fullWidth
                variant="text"
                className="login-forgot-password"
              >
                Forgot Password?
              </Button>
            </Box>
          )}

          {/* Signup Form */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleSignupSubmit} className="login-form">
              <div className="signup-name-row">
                <TextField
                  required
                  id="signup-firstName"
                  name="firstName"
                  label="First Name"
                  value={signupData.firstName}
                  onChange={handleSignupChange}
                  error={!!signupErrors.firstName}
                  helperText={signupErrors.firstName}
                  className="signup-name-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="login-input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  id="signup-lastName"
                  name="lastName"
                  label="Last Name"
                  value={signupData.lastName}
                  onChange={handleSignupChange}
                  error={!!signupErrors.lastName}
                  helperText={signupErrors.lastName}
                  className="signup-name-field"
                />
              </div>

              <TextField
                fullWidth
                required
                id="signup-email"
                name="email"
                label="Email Address"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange}
                error={!!signupErrors.email}
                helperText={signupErrors.email}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="login-input-icon" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                id="signup-phone"
                name="phone"
                label="Phone Number"
                type="tel"
                value={signupData.phone}
                onChange={handleSignupChange}
                error={!!signupErrors.phone}
                helperText={signupErrors.phone}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone className="login-input-icon" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                id="signup-password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={signupData.password}
                onChange={handleSignupChange}
                error={!!signupErrors.password}
                helperText={signupErrors.password}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="login-input-icon" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        className="login-password-toggle"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                id="signup-confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                error={!!signupErrors.confirmPassword}
                helperText={signupErrors.confirmPassword}
                className="login-text-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="login-input-icon" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="login-password-toggle"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                className="login-submit-button"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
