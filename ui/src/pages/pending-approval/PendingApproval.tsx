import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  HourglassEmpty,
  Refresh,
  ContactMail
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PendingApproval.css';

const PendingApproval: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToSelection = () => {
    navigate('/society-selection');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pending-approval-container">
      <Container maxWidth="md">
        <Paper className="pending-approval-paper">
          <div className="pending-approval-header">
            <HourglassEmpty className="pending-approval-icon" />
            <Typography variant="h4" className="pending-approval-title">
              Request Pending
            </Typography>
            <Typography variant="subtitle1" className="pending-approval-subtitle">
              Your society join request is under review
            </Typography>
          </div>

          <Card className="pending-approval-card">
            <CardContent>
              <Box className="pending-approval-status">
                <Typography variant="h6" className="status-title">
                  Current Status
                </Typography>
                <Chip
                  label="Pending Review"
                  className="status-chip pending"
                  icon={<HourglassEmpty />}
                />
              </Box>

              <LinearProgress 
                variant="indeterminate" 
                className="pending-approval-progress"
              />

              <Typography variant="body1" className="pending-approval-message">
                Hi <strong>{user?.firstName}</strong>, your request to join a society has been sent to the society administrator. 
                You will receive an email notification once your request has been reviewed.
              </Typography>

              <Box className="pending-approval-info">
                <Typography variant="h6" className="info-title">
                  What happens next?
                </Typography>
                <ul className="pending-approval-steps">
                  <li>Society admin reviews your request</li>
                  <li>Admin may contact you for verification</li>
                  <li>You'll receive email notification of approval/rejection</li>
                  <li>Once approved, you can access society features</li>
                </ul>
              </Box>

              <Box className="pending-approval-actions">
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleBackToSelection}
                  className="back-button"
                >
                  Request Another Society
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ContactMail />}
                  className="contact-button"
                >
                  Contact Support
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box className="pending-approval-footer">
            <Typography variant="body2" className="footer-text">
              Need to switch accounts?
            </Typography>
            <Button
              variant="text"
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default PendingApproval;
