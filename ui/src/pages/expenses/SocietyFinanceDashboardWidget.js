import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemIcon,
  Chip
} from '@mui/material';
import { Receipt, Warning } from '@mui/icons-material';
import { societyFinanceService } from '../../services';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './SocietyFinanceDashboardWidget.css';

const SocietyFinanceDashboardWidget = ({ societyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  
  // Fetch finance summary data
  const fetchSummaryData = useCallback(async () => {
    if (!societyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get current month range
      const currentDate = new Date();
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Get summary data for current month
      const summaryData = await societyFinanceService.getFinanceSummary(societyId, {
        start_date: format(monthStart, 'yyyy-MM-dd'),
        end_date: format(monthEnd, 'yyyy-MM-dd')
      });
      
      setSummary(summaryData);
      
      // Get pending payments
      const pendingData = await societyFinanceService.getSocietyFinancesBySocietyId(societyId, {
        payment_status: 'pending',
        limit: 5
      });
      
      setPendingPayments(pendingData);
      
      // Get recent paid payments
      const recentPaid = await societyFinanceService.getSocietyFinancesBySocietyId(societyId, {
        payment_status: 'paid',
        limit: 5
      });
      
      setRecentPayments(recentPaid);
      
    } catch (err) {
      console.error('Failed to fetch finance data for dashboard:', err);
      setError('Failed to load finance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [societyId]);
  
  // Load data on mount and when societyId changes
  useEffect(() => {
    fetchSummaryData();
  }, [societyId, fetchSummaryData]);
  
  // Format currency amount
  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  };
  
  if (loading) {
    return (
      <Paper className="finance-widget widget-loading">
        <CircularProgress size={30} />
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Paper className="finance-widget widget-error">
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }
  
  return (
    <Paper className="finance-widget">
      <Box className="widget-header">
        <Typography className="widget-title">
          Society Finances
        </Typography>
      </Box>
      
      <Box className="widget-content">
        {/* Monthly Summary */}
        <Typography className="list-section-header">
          Current Month Summary
        </Typography>
        
        {summary && (
          <Box className="summary-stats">
            <Box className="stat-item">
              <Typography className="stat-label">Total Amount</Typography>
              <Typography className="stat-value">
                {formatAmount(summary.total.amount)}
              </Typography>
            </Box>
            
            <Box className="stat-item">
              <Typography className="stat-label">Transactions</Typography>
              <Typography className="stat-value">
                {summary.total.count}
              </Typography>
            </Box>
          </Box>
        )}
      
        {/* Pending Payments */}
        <Typography className="list-section-header">
          Pending Payments
        </Typography>
        
        {pendingPayments.length > 0 ? (
          <List className="finance-list" disablePadding>
            {pendingPayments.map(finance => (
              <ListItem key={finance.id} className="list-item" divider>
                <ListItemIcon className="list-icon">
                  <Warning fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={finance.category} 
                  secondary={format(new Date(finance.expense_date), 'MMM dd, yyyy')}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip 
                  label={formatAmount(finance.amount)} 
                  size="small" 
                  className="status-chip pending"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography className="no-data">
            No pending payments
          </Typography>
        )}
        
        {/* Recent Paid */}
        <Typography className="list-section-header">
          Recent Payments
        </Typography>
        
        {recentPayments.length > 0 ? (
          <List className="finance-list" disablePadding>
            {recentPayments.map(finance => (
              <ListItem key={finance.id} className="list-item" divider>
                <ListItemIcon className="list-icon">
                  <Receipt fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={finance.category} 
                  secondary={format(new Date(finance.payment_date || finance.expense_date), 'MMM dd, yyyy')}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip 
                  label={formatAmount(finance.amount)} 
                  size="small" 
                  className="status-chip paid"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography className="no-data">
            No recent payments
          </Typography>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip 
            size="small" 
            label="View All Finances" 
            component="a" 
            href="/society-finances" 
            clickable 
            className="status-chip"
            sx={{ bgcolor: 'var(--primary-color)', color: 'white' }}
          />
        </Box>
      </Box>
      
      {recentPayments.length > 0 ? (
        <List dense disablePadding>
          {recentPayments.map(finance => (
            <ListItem key={finance.id} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Receipt fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={finance.category} 
                secondary={finance.payment_date ? format(new Date(finance.payment_date), 'MMM dd, yyyy') : 'N/A'}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Typography variant="body2" color="success.main">
                {formatAmount(finance.amount)}
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 1 }}>
          No recent payments
        </Typography>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip 
          size="small" 
          label="View All Finances" 
          component="a" 
          href="/society-finances" 
          clickable 
          color="primary"
        />
      </Box>
    </Paper>
  );
};

export default SocietyFinanceDashboardWidget;
