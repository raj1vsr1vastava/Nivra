import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box, 
  Alert, 
  TextField,
  Button,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Stack
} from '@mui/material';
import { financeService, residentService, societyService } from '../../services';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import './ResidentFinancesList.css';

// Helper function to format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Status chip color mapping
const statusColorMap = {
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
  partial: 'info'
};

// Payment status options
const paymentStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'partial', label: 'Partial Payment' }
];

// Transaction type options
const transactionTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'maintenance', label: 'Maintenance Fee' },
  { value: 'utility', label: 'Utility Bill' },
  { value: 'parking', label: 'Parking Fee' },
  { value: 'special_charge', label: 'Special Assessment' },
  { value: 'late_fee', label: 'Late Fee' },
  { value: 'security_deposit', label: 'Security Deposit' }
];

const ResidentFinancesList = () => {
  // State variables
  const [finances, setFinances] = useState([]);
  const [filteredFinances, setFilteredFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [residents, setResidents] = useState([]);
  
  // Filter states
  const [societyFilter, setSocietyFilter] = useState('');
  const [residentFilter, setResidentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Summary stats
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch societies
        const societiesData = await societyService.getAllSocieties();
        setSocieties(societiesData);
        
        // Fetch finances
        const financesData = await financeService.getAllFinances();
        setFinances(financesData);
        setFilteredFinances(financesData);
        
        // Fetch residents for filtering
        const residentsData = await residentService.getAllResidents();
        setResidents(residentsData);
        
        // Calculate summary statistics
        calculateSummary(financesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate summary statistics
  const calculateSummary = (financeData) => {
    const summary = {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };
    
    financeData.forEach(item => {
      summary.totalAmount += Number(item.amount);
      
      if (item.payment_status === 'paid') {
        summary.paidAmount += Number(item.amount);
      } else if (item.payment_status === 'pending') {
        summary.pendingAmount += Number(item.amount);
      } else if (item.payment_status === 'overdue') {
        summary.overdueAmount += Number(item.amount);
      }
    });
    
    setSummary(summary);
  };
  
  // Apply filters
  useEffect(() => {
    let result = [...finances];
    
    // Apply society filter
    if (societyFilter) {
      // First find residents belonging to the society
      const societyResidents = residents.filter(r => r.society_id === societyFilter).map(r => r.id);
      // Then filter finances by those residents
      result = result.filter(f => societyResidents.includes(f.resident_id));
    }
    
    // Apply resident filter
    if (residentFilter) {
      result = result.filter(f => f.resident_id === residentFilter);
    }
    
    // Apply payment status filter
    if (paymentStatusFilter) {
      result = result.filter(f => f.payment_status === paymentStatusFilter);
    }
    
    // Apply transaction type filter
    if (transactionTypeFilter) {
      result = result.filter(f => f.transaction_type === transactionTypeFilter);
    }
    
    // Apply search query (search in description, invoice number, and receipt number)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        (f.description && f.description.toLowerCase().includes(query)) ||
        (f.invoice_number && f.invoice_number.toLowerCase().includes(query)) ||
        (f.receipt_number && f.receipt_number.toLowerCase().includes(query))
      );
    }
    
    setFilteredFinances(result);
    calculateSummary(result);
  }, [finances, societyFilter, residentFilter, paymentStatusFilter, transactionTypeFilter, searchQuery, residents]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get resident name by ID
  const getResidentName = (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown';
  };
  
  // Get society name by resident ID
  const getSocietyName = (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    if (!resident) return 'Unknown Society';
    
    const society = societies.find(s => s.id === resident.society_id);
    return society ? society.name : 'Unknown Society';
  };
  
  // Get unit number by resident ID
  const getUnitNumber = (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? resident.unit_number : 'Unknown';
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSocietyFilter('');
    setResidentFilter('');
    setPaymentStatusFilter('');
    setTransactionTypeFilter('');
    setSearchQuery('');
  };
  
  // If loading
  if (loading) {
    return (
      <Container maxWidth="lg" className="finances-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // If error
  if (error) {
    return (
      <Container maxWidth="lg" className="finances-container">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="finances-container">
      <Box className="finances-header">
        <Typography variant="h4" component="h1" className="finances-header-title">
          Resident Finances
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Add New Transaction
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card" sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>Total Amount</Typography>
            <Typography className="summary-amount">{formatCurrency(summary.totalAmount)}</Typography>
            <Typography className="summary-label">{filteredFinances.length} Transactions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card" sx={{ bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>Paid Amount</Typography>
            <Typography className="summary-amount">{formatCurrency(summary.paidAmount)}</Typography>
            <Typography className="summary-label">
              {filteredFinances.filter(f => f.payment_status === 'paid').length} Transactions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card" sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>Pending Amount</Typography>
            <Typography className="summary-amount">{formatCurrency(summary.pendingAmount)}</Typography>
            <Typography className="summary-label">
              {filteredFinances.filter(f => f.payment_status === 'pending').length} Transactions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card" sx={{ bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>Overdue Amount</Typography>
            <Typography className="summary-amount">{formatCurrency(summary.overdueAmount)}</Typography>
            <Typography className="summary-label">
              {filteredFinances.filter(f => f.payment_status === 'overdue').length} Transactions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper className="filters-container">
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="society-filter-label">Society</InputLabel>
                <Select
                  labelId="society-filter-label"
                  id="society-filter"
                  value={societyFilter}
                  label="Society"
                  onChange={(e) => setSocietyFilter(e.target.value)}
                >
                  <MenuItem value="">All Societies</MenuItem>
                  {societies.map((society) => (
                    <MenuItem key={society.id} value={society.id}>
                      {society.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="resident-filter-label">Resident</InputLabel>
                <Select
                  labelId="resident-filter-label"
                  id="resident-filter"
                  value={residentFilter}
                  label="Resident"
                  onChange={(e) => setResidentFilter(e.target.value)}
                  disabled={!societyFilter} // Enable only if society is selected
                >
                  <MenuItem value="">All Residents</MenuItem>
                  {residents
                    .filter(resident => !societyFilter || resident.society_id === societyFilter)
                    .map((resident) => (
                      <MenuItem key={resident.id} value={resident.id}>
                        {resident.first_name} {resident.last_name} - Unit {resident.unit_number}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-status-filter-label">Payment Status</InputLabel>
                <Select
                  labelId="payment-status-filter-label"
                  id="payment-status-filter"
                  value={paymentStatusFilter}
                  label="Payment Status"
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  {paymentStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="transaction-type-filter-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-filter-label"
                  id="transaction-type-filter"
                  value={transactionTypeFilter}
                  label="Transaction Type"
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                >
                  {transactionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                fullWidth
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Data Table */}
      <Paper className="table-container">
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Resident</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Society</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell className="table-date">Due Date</TableCell>
                <TableCell className="table-date">Payment Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center" className="table-actions">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFinances
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((finance) => (
                  <TableRow key={finance.id}>
                    <TableCell>{getResidentName(finance.resident_id)}</TableCell>
                    <TableCell>{getUnitNumber(finance.resident_id)}</TableCell>
                    <TableCell>{getSocietyName(finance.resident_id)}</TableCell>
                    <TableCell>
                      {finance.transaction_type.charAt(0).toUpperCase() +
                        finance.transaction_type.slice(1).replace('_', ' ')}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(finance.amount, finance.currency)}
                    </TableCell>
                    <TableCell className="table-date">{formatDate(finance.due_date)}</TableCell>
                    <TableCell className="table-date">{formatDate(finance.payment_date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={finance.payment_status.toUpperCase()}
                        color={statusColorMap[finance.payment_status] || 'default'}
                        size="small"
                        className={`status-${finance.payment_status}`}
                      />
                    </TableCell>
                    <TableCell>
                      {finance.description?.length > 30
                        ? `${finance.description.substring(0, 30)}...`
                        : finance.description || 'N/A'}
                    </TableCell>
                    <TableCell align="center" className="table-actions">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton size="small" color="primary" title="Edit">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" title="Delete">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredFinances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="no-records">
                    No finance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFinances.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ResidentFinancesList;
