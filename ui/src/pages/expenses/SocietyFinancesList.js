import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl,
  Card, CardContent, CardActions, IconButton, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, FormHelperText
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Search, Event, Payment } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { societyFinanceService } from '../../services';
import { societyService } from '../../services/societies';
import './SocietyFinancesList.css';

const SocietyFinancesList = ({ societyId: propSocietyId }) => {
  const [societies, setSocieties] = useState([]);
  
  // State
  const [finances, setFinances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ categories: {}, total: { amount: 0, count: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState({});
  const [selectedFinance, setSelectedFinance] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [selectedSocietyId, setSelectedSocietyId] = useState(propSocietyId || '');
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    expense_type: '',
    payment_status: '',
    start_date: null,
    end_date: null,
    search: '',
  });
  
  // Form state for new/edit finance
  const [financeForm, setFinanceForm] = useState({
    society_id: selectedSocietyId,
    expense_type: 'regular',
    category: '',
    vendor_name: '',
    expense_date: new Date(),
    amount: '',
    currency: 'INR',
    payment_status: 'pending',
    payment_date: null,
    payment_method: '',
    invoice_number: '',
    receipt_number: '',
    description: '',
    recurring: false,
    recurring_frequency: '',
    next_due_date: null,
  });

  // Fetch all societies - using useCallback to avoid the dependency warning
  const fetchSocieties = React.useCallback(async () => {
    try {
      const data = await societyService.getAllSocieties();
      setSocieties(data);
      
      // If societies are loaded and no society is selected yet, select the first one
      if (data.length > 0 && !selectedSocietyId) {
        setSelectedSocietyId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch societies:', err);
      setError('Failed to load societies. Please try again.');
    }
  }, [selectedSocietyId]);

  // Load societies on component mount
  useEffect(() => {
    if (!propSocietyId) {
      fetchSocieties();
    }
  }, [propSocietyId, fetchSocieties]);

  // Load finances when selected society changes or filters change
  useEffect(() => {
    if (selectedSocietyId) {
      fetchSocietyFinances();
      fetchCategories();
      fetchSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSocietyId, filters.category, filters.expense_type, filters.payment_status, filters.start_date, filters.end_date]);

  // Update finance form society_id when selectedSocietyId changes
  useEffect(() => {
    if (selectedSocietyId) {
      setFinanceForm(prev => ({
        ...prev,
        society_id: selectedSocietyId
      }));
    }
  }, [selectedSocietyId]);

  // Fetch finances from the API
  const fetchSocietyFinances = async () => {
    if (!selectedSocietyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiFilters = {
        category: filters.category || undefined,
        expense_type: filters.expense_type || undefined,
        payment_status: filters.payment_status || undefined,
        start_date: filters.start_date ? format(new Date(filters.start_date), 'yyyy-MM-dd') : undefined,
        end_date: filters.end_date ? format(new Date(filters.end_date), 'yyyy-MM-dd') : undefined,
      };
      
      const data = await societyFinanceService.getSocietyFinancesBySocietyId(selectedSocietyId, apiFilters);
      
      // Apply search filter locally (since it's not supported by API)
      let filteredData = data;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = data.filter(finance => 
          finance.category.toLowerCase().includes(searchTerm) ||
          (finance.vendor_name && finance.vendor_name.toLowerCase().includes(searchTerm)) ||
          (finance.description && finance.description.toLowerCase().includes(searchTerm))
        );
      }
      
      setFinances(filteredData);
    } catch (err) {
      console.error('Failed to fetch society finances:', err);
      setError('Failed to load finances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique categories
  const fetchCategories = async () => {
    if (!selectedSocietyId) return;
    
    try {
      const data = await societyFinanceService.getFinanceCategories(selectedSocietyId);
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch finance summary
  const fetchSummary = async () => {
    if (!selectedSocietyId) return;
    
    try {
      const summaryFilters = {
        start_date: filters.start_date ? format(new Date(filters.start_date), 'yyyy-MM-dd') : undefined,
        end_date: filters.end_date ? format(new Date(filters.end_date), 'yyyy-MM-dd') : undefined,
        expense_type: filters.expense_type || undefined,
      };
      
      const data = await societyFinanceService.getFinanceSummary(selectedSocietyId, summaryFilters);
      setSummary(data || { categories: {}, total: { amount: 0, count: 0 } });
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      [field]: value
    });
  };

  // Handle date filter changes
  const handleDateFilterChange = (field) => (date) => {
    setFilters({
      ...filters,
      [field]: date
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      expense_type: '',
      payment_status: '',
      start_date: null,
      end_date: null,
      search: '',
    });
  };

  // Open dialog to add new finance
  const handleAddFinance = () => {
    setSelectedFinance(null);
    setFinanceForm({
      society_id: selectedSocietyId,
      expense_type: 'regular',
      category: '',
      vendor_name: '',
      expense_date: new Date(),
      amount: '',
      currency: 'INR',
      payment_status: 'pending',
      payment_date: null,
      payment_method: '',
      invoice_number: '',
      receipt_number: '',
      description: '',
      recurring: false,
      recurring_frequency: '',
      next_due_date: null,
    });
    setFormError({});
    setOpenDialog(true);
  };

  // Open dialog to edit finance
  const handleEditFinance = (finance) => {
    setSelectedFinance(finance);
    setFinanceForm({
      society_id: finance.society_id,
      expense_type: finance.expense_type,
      category: finance.category,
      vendor_name: finance.vendor_name || '',
      expense_date: new Date(finance.expense_date),
      amount: finance.amount.toString(),
      currency: finance.currency,
      payment_status: finance.payment_status,
      payment_date: finance.payment_date ? new Date(finance.payment_date) : null,
      payment_method: finance.payment_method || '',
      invoice_number: finance.invoice_number || '',
      receipt_number: finance.receipt_number || '',
      description: finance.description || '',
      recurring: finance.recurring,
      recurring_frequency: finance.recurring_frequency || '',
      next_due_date: finance.next_due_date ? new Date(finance.next_due_date) : null,
    });
    setFormError({});
    setOpenDialog(true);
  };

  // Handle form field changes
  const handleFormChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFinanceForm({
      ...financeForm,
      [field]: value
    });
    
    // Clear error for this field if any
    if (formError[field]) {
      setFormError({
        ...formError,
        [field]: null
      });
    }
  };

  // Handle date changes in form
  const handleDateChange = (field) => (date) => {
    setFinanceForm({
      ...financeForm,
      [field]: date
    });
    
    // Clear error for this field if any
    if (formError[field]) {
      setFormError({
        ...formError,
        [field]: null
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!financeForm.category) errors.category = 'Category is required';
    if (!financeForm.expense_date) errors.expense_date = 'Expense date is required';
    if (!financeForm.amount) errors.amount = 'Amount is required';
    else if (isNaN(financeForm.amount) || parseFloat(financeForm.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (financeForm.recurring) {
      if (!financeForm.recurring_frequency) {
        errors.recurring_frequency = 'Frequency is required for recurring expenses';
      }
      if (!financeForm.next_due_date) {
        errors.next_due_date = 'Next due date is required for recurring expenses';
      }
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit finance form (create or update)
  const handleSubmitFinance = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const financeData = {
        ...financeForm,
        amount: parseFloat(financeForm.amount),
        expense_date: format(new Date(financeForm.expense_date), 'yyyy-MM-dd'),
        payment_date: financeForm.payment_date ? format(new Date(financeForm.payment_date), 'yyyy-MM-dd') : null,
        next_due_date: financeForm.next_due_date ? format(new Date(financeForm.next_due_date), 'yyyy-MM-dd') : null,
      };
      
      if (selectedFinance) {
        // Update existing finance
        await societyFinanceService.updateSocietyFinance(selectedFinance.id, financeData);
      } else {
        // Create new finance
        await societyFinanceService.createSocietyFinance(financeData);
      }
      
      setOpenDialog(false);
      fetchSocietyFinances();
      fetchCategories();
      fetchSummary();
    } catch (err) {
      console.error('Failed to save finance:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        if (err.response.data.detail.field) {
          setFormError({
            ...formError,
            [err.response.data.detail.field]: err.response.data.detail.message
          });
        } else {
          setError(err.response.data.detail.message || 'Failed to save. Please check your inputs.');
        }
      } else {
        setError('Failed to save finance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete finance
  const handleDeleteFinance = async (finance) => {
    if (!window.confirm(`Are you sure you want to delete this ${finance.category} expense?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await societyFinanceService.deleteSocietyFinance(finance.id);
      fetchSocietyFinances();
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete finance:', err);
      setError('Failed to delete finance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate chip color for payment status
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'partially_paid': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box className="society-finances-container">
      {/* Header with statistics */}
      <Box className="finances-header animate-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" className="section-title">Society Finances</Typography>
          
          {/* Society selector if no societyId prop is provided */}
          {!propSocietyId && (
            <FormControl sx={{ minWidth: 240 }}>
              <TextField
                select
                label="Select Society"
                value={selectedSocietyId}
                onChange={(e) => setSelectedSocietyId(e.target.value)}
                variant="outlined"
                size="small"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--border-radius)',
                    transition: 'var(--transition)'
                  }
                }}
              >
                {societies.map((society) => (
                  <MenuItem key={society.id} value={society.id}>{society.name}</MenuItem>
                ))}
              </TextField>
              {!selectedSocietyId && (
                <FormHelperText error>Please select a society</FormHelperText>
              )}
            </FormControl>
          )}
        </Box>
        
        {selectedSocietyId && (
          <Box className="finances-summary animate-in">
            <Paper elevation={0} className="summary-paper">
              <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '2.2rem', fontWeight: 700, my: 1, color: 'var(--text-primary)' }}>
                {summary.total.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                {summary.total.count} entries
              </Typography>
            </Paper>
            
            <Box className="summary-categories">
              {Object.entries(summary.categories).slice(0, 4).map(([category, data], index) => (
                <Paper key={category} elevation={0} className="category-summary" sx={{ 
                  borderTopColor: index === 0 ? 'var(--primary-color)' : 
                                 index === 1 ? 'var(--secondary-color)' : 
                                 index === 2 ? 'var(--accent-color)' : 
                                 'var(--info)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{category}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, my: 1 }}>{data.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{data.count} entries</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {!selectedSocietyId && !propSocietyId ? (
        <Paper elevation={0} className="empty-state animate-in">
          <Box sx={{ mb: 3, opacity: 0.7 }}>
            <Search sx={{ fontSize: '4rem' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Please select a society to view finances</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Use the dropdown above to select a society to get started
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Filters and controls */}
          <Paper elevation={0} className="filters-container animate-in">
            <Box className="filters-header">
              <Typography variant="h6" component="h2">
                <FilterList sx={{ mr: 1, verticalAlign: 'middle', color: 'var(--primary-color)' }} /> 
                Filters
              </Typography>
              <Button 
                size="small" 
                onClick={clearFilters}
                variant="outlined"
                sx={{ 
                  borderRadius: 'var(--border-radius)', 
                  textTransform: 'none',
                  px: 2
                }}
              >
                Clear All
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Category"
                  value={filters.category}
                  onChange={handleFilterChange('category')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Type"
                  value={filters.expense_type}
                  onChange={handleFilterChange('expense_type')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="adhoc">Ad Hoc</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Payment Status"
                  value={filters.payment_status}
                  onChange={handleFilterChange('payment_status')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="partially_paid">Partially Paid</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={filters.start_date}
                    onChange={handleDateFilterChange('start_date')}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={filters.end_date}
                    onChange={handleDateFilterChange('end_date')}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  />
                </LocalizationProvider>
              </Grid>
            
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Search"
                  value={filters.search}
                  onChange={handleFilterChange('search')}
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: <Search color="action" />
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Actions */}
          <Box className="finances-actions animate-in">
            <Box>
              <Button
                variant="contained" 
                startIcon={<Add />}
                onClick={handleAddFinance}
                disabled={loading}
                sx={{ 
                  borderRadius: 'var(--border-radius)',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  boxShadow: 'var(--card-shadow)',
                  background: 'var(--primary-color)',
                  '&:hover': {
                    background: 'var(--secondary-color)',
                  }
                }}
              >
                Add New Finance
              </Button>
            </Box>
            
            <Box className="view-toggle">
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
                sx={{ 
                  borderRadius: 'var(--border-radius)',
                  textTransform: 'none',
                  px: 3,
                  fontWeight: 500,
                  ...(viewMode === 'list' ? {
                    boxShadow: 'none',
                    background: 'var(--primary-color)'
                  } : {})
                }}
              >
                List View
              </Button>
              <Button
                variant={viewMode === 'card' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('card')}
                sx={{ 
                  borderRadius: 'var(--border-radius)',
                  textTransform: 'none',
                  px: 3,
                  fontWeight: 500,
                  ...(viewMode === 'card' ? {
                    boxShadow: 'none',
                    background: 'var(--primary-color)'
                  } : {})
                }}
              >
                Card View
              </Button>
            </Box>
          </Box>

          {/* Error display */}
          {error && (
            <Alert 
              severity="error" 
              className="finances-error animate-in" 
              onClose={() => setError(null)}
              sx={{
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <Box className="finances-loading animate-in">
              <CircularProgress size={50} thickness={4} sx={{ color: 'var(--primary-color)' }} />
            </Box>
          )}
          
          {/* Finances list view */}
          {viewMode === 'list' && (
            <TableContainer component={Paper} className="finances-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {loading ? 'Loading...' : 'No finance records found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    finances.map((finance) => (
                      <TableRow key={finance.id}>
                        <TableCell>{finance.category}</TableCell>
                        <TableCell>{finance.vendor_name || '-'}</TableCell>
                        <TableCell>{format(new Date(finance.expense_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          {parseFloat(finance.amount).toLocaleString('en-IN', { style: 'currency', currency: finance.currency })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={finance.expense_type === 'regular' ? 'Regular' : 'Ad Hoc'}
                            color={finance.expense_type === 'regular' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={finance.payment_status.replace('_', ' ')}
                            color={getPaymentStatusColor(finance.payment_status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditFinance(finance)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteFinance(finance)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Finances card view */}
          {viewMode === 'card' && (
            <Box className="finances-cards">
              {finances.length === 0 ? (
                <Paper className="empty-state">
                  <Typography align="center">
                    {loading ? 'Loading...' : 'No finance records found'}
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {finances.map((finance) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={finance.id}>
                      <Card>
                        <CardContent>
                          <Box className="card-header">
                            <Typography variant="h6" component="div">
                              {finance.category}
                            </Typography>
                            <Chip
                              label={finance.expense_type === 'regular' ? 'Regular' : 'Ad Hoc'}
                              color={finance.expense_type === 'regular' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </Box>
                          
                          <Box className="card-amount">
                            <Typography variant="h5">
                              {parseFloat(finance.amount).toLocaleString('en-IN', { style: 'currency', currency: finance.currency })}
                            </Typography>
                            <Chip
                              label={finance.payment_status.replace('_', ' ')}
                              color={getPaymentStatusColor(finance.payment_status)}
                              size="small"
                            />
                          </Box>
                          
                          {finance.vendor_name && (
                            <Typography variant="body2" color="text.secondary">
                              {finance.vendor_name}
                            </Typography>
                          )}
                          
                          <Box className="card-dates">
                            <Box className="date-item">
                              <Event fontSize="small" />
                              <Typography variant="body2">
                                {format(new Date(finance.expense_date), 'dd MMM yyyy')}
                              </Typography>
                            </Box>
                            
                            {finance.payment_date && (
                              <Box className="date-item">
                                <Payment fontSize="small" />
                                <Typography variant="body2">
                                  Paid: {format(new Date(finance.payment_date), 'dd MMM yyyy')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          
                          {finance.description && (
                            <Typography variant="body2" className="card-description">
                              {finance.description}
                            </Typography>
                          )}
                          
                          {finance.recurring && (
                            <Box className="recurring-info">
                              <Typography variant="caption">
                                Recurring: {finance.recurring_frequency} 
                                {finance.next_due_date && ` (Next: ${format(new Date(finance.next_due_date), 'dd MMM yyyy')})`}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                        <Divider />
                        <CardActions>
                          <Button size="small" onClick={() => handleEditFinance(finance)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteFinance(finance)}>
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Finance form dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              {selectedFinance ? 'Edit Finance Record' : 'Add New Finance Record'}
            </DialogTitle>
            
            <DialogContent>
              <Box className="finance-form">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" error={!!formError.category}>
                      <TextField
                        label="Category"
                        value={financeForm.category}
                        onChange={handleFormChange('category')}
                        required
                        select={categories.length > 0}
                        error={!!formError.category}
                        helperText={formError.category}
                      >
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                          ))
                        ) : (
                          <MenuItem value=""><em>No categories found</em></MenuItem>
                        )}
                      </TextField>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Vendor Name"
                        value={financeForm.vendor_name}
                        onChange={handleFormChange('vendor_name')}
                      />
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" error={!!formError.expense_type}>
                      <TextField
                        label="Expense Type"
                        value={financeForm.expense_type}
                        onChange={handleFormChange('expense_type')}
                        required
                        select
                        error={!!formError.expense_type}
                        helperText={formError.expense_type}
                      >
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="adhoc">Ad Hoc</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" error={!!formError.expense_date}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Expense Date"
                          value={financeForm.expense_date}
                          onChange={handleDateChange('expense_date')}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              required
                              error={!!formError.expense_date}
                              helperText={formError.expense_date}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" error={!!formError.amount}>
                      <TextField
                        label="Amount"
                        value={financeForm.amount}
                        onChange={handleFormChange('amount')}
                        required
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        error={!!formError.amount}
                        helperText={formError.amount}
                      />
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Currency"
                        value={financeForm.currency}
                        onChange={handleFormChange('currency')}
                        select
                      >
                        <MenuItem value="INR">INR (₹)</MenuItem>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label="Payment Status"
                        value={financeForm.payment_status}
                        onChange={handleFormChange('payment_status')}
                        select
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                        <MenuItem value="partially_paid">Partially Paid</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Payment Date"
                          value={financeForm.payment_date}
                          onChange={handleDateChange('payment_date')}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitFinance} variant="contained" color="primary" disabled={loading}>
                {selectedFinance ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default SocietyFinancesList;
