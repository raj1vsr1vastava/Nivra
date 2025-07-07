import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import '../../styles/shared-headers.css';
import './ResidentFinancesList.css';
import { 
  Container, 
  Typography, 
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
  Stack,
  SelectChangeEvent
} from '@mui/material';
import { financeService, residentService, societyService } from '../../services';
import { FinanceData as ServiceFinanceData } from '../../services/finances/financeService';
import { ResidentData as ServiceResidentData } from '../../services/residents/residentService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SocietyData, 
  FinanceData, 
  FinanceSummary, 
  SelectOption, 
  StatusColorMap
} from '../../types';

// ResidentData type with required properties for this component
type ResidentData = ServiceResidentData;


// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Status chip color mapping
const statusColorMap: StatusColorMap = {
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
  partial: 'info'
};

// Payment status options
const paymentStatusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'partial', label: 'Partial Payment' }
];

// Transaction type options
const transactionTypeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'maintenance', label: 'Maintenance Fee' },
  { value: 'utility', label: 'Utility Bill' },
  { value: 'parking', label: 'Parking Fee' },
  { value: 'special_charge', label: 'Special Assessment' },
  { value: 'late_fee', label: 'Late Fee' },
  { value: 'security_deposit', label: 'Security Deposit' }
];

const ResidentFinancesList: React.FC = () => {
  const { user } = useAuth();
  // State variables
  const [finances, setFinances] = useState<FinanceData[]>([]);
  const [filteredFinances, setFilteredFinances] = useState<FinanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [societies, setSocieties] = useState<SocietyData[]>([]);
  const [residents, setResidents] = useState<ResidentData[]>([]);
  
  // Filter states
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [residentFilter, setResidentFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Summary stats
  const [summary, setSummary] = useState<FinanceSummary>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Fetch societies
        let societiesData: SocietyData[];
        
        // If user is a society admin, only fetch societies they administer
        if (user?.role === 'society_admin' && user.id) {
          societiesData = await societyService.getAdministeredSocieties(user.id);
        } else {
          // For system admins and other roles, fetch all societies
          societiesData = await societyService.getAllSocieties();
        }
        
        setSocieties(societiesData);
        
        // For society admins, automatically set the society filter to their administered society
        if (user?.role === 'society_admin' && societiesData.length > 0) {
          setSocietyFilter(String(societiesData[0].id));
        }
        
        // Fetch finances
        const financesData = await financeService.getAllFinances();
        // Convert to component's expected FinanceData format
        const typedFinancesData = financesData.map(finance => ({
          ...finance,
          payment_status: finance.payment_status as 'paid' | 'pending' | 'overdue' | 'partial',
          transaction_type: finance.transaction_type as 'maintenance' | 'utility' | 'parking' | 'special_charge' | 'late_fee' | 'security_deposit',
          currency: finance.currency || 'INR'
        })) as FinanceData[];
        
        setFinances(typedFinancesData);
        setFilteredFinances(typedFinancesData);
        
        // Fetch residents for filtering
        const residentsData = await residentService.getAllResidents();
        setResidents(residentsData as ResidentData[]);
        
        // Calculate summary statistics
        calculateSummary(typedFinancesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Calculate summary statistics
  const calculateSummary = (financeData: FinanceData[]): void => {
    const newSummary: FinanceSummary = {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };
    
    financeData.forEach(item => {
      const amount = Number(item.amount) || 0;
      newSummary.totalAmount += amount;
      
      switch(item.payment_status) {
        case 'paid':
          newSummary.paidAmount += amount;
          break;
        case 'pending':
          newSummary.pendingAmount += amount;
          break;
        case 'overdue':
          newSummary.overdueAmount += amount;
          break;
        case 'partial':
          // For partial payments, we could add partial logic here if needed
          // For now, just include them in pending amount
          newSummary.pendingAmount += amount;
          break;
      }
    });
    
    setSummary(newSummary);
  };
  
  // Apply filters
  useEffect(() => {
    let result = [...finances];
    
    // Apply society filter
    if (societyFilter) {
      // First find residents belonging to the society
      const societyResidents = residents.filter(r => String(r.society_id) === String(societyFilter)).map(r => String(r.id));
      // Then filter finances by those residents
      result = result.filter(f => societyResidents.includes(String(f.resident_id)));
    }
    
    // Apply resident filter
    if (residentFilter) {
      result = result.filter(f => String(f.resident_id) === String(residentFilter));
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
  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle select change events
  const handleSocietyFilterChange = (event: SelectChangeEvent<string>): void => {
    setSocietyFilter(event.target.value);
    setResidentFilter(''); // Reset resident filter when society changes
  };
  
  const handleResidentFilterChange = (event: SelectChangeEvent<string>): void => {
    setResidentFilter(event.target.value);
  };
  
  const handlePaymentStatusFilterChange = (event: SelectChangeEvent<string>): void => {
    setPaymentStatusFilter(event.target.value);
  };
  
  const handleTransactionTypeFilterChange = (event: SelectChangeEvent<string>): void => {
    setTransactionTypeFilter(event.target.value);
  };
  
  // Get resident name by ID
  const getResidentName = (residentId: string | number): string => {
    const resident = residents.find(r => String(r.id) === String(residentId));
    return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown';
  };
  
  // Get society name by resident ID
  const getSocietyName = (residentId: string | number): string => {
    const resident = residents.find(r => String(r.id) === String(residentId));
    if (!resident) return 'Unknown Society';
    
    const society = societies.find(s => String(s.id) === String(resident.society_id));
    return society ? society.name : 'Unknown Society';
  };
  
  // Get unit number by resident ID
  const getUnitNumber = (residentId: string | number): string => {
    const resident = residents.find(r => String(r.id) === String(residentId));
    return resident ? (resident.unit_number || resident.unit?.toString() || 'Unknown') : 'Unknown';
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Reset filters
  const handleResetFilters = (): void => {
    setSocietyFilter('');
    setResidentFilter('');
    setPaymentStatusFilter('');
    setTransactionTypeFilter('');
    setSearchQuery('');
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
  };
  
  // If loading
  if (loading) {
    return (
      <div className="finances-container">
        <Container maxWidth="xl" className="finances-container-max-width">
          <Box className="finances-loading-container">
            <CircularProgress size={40} className="finances-loading-spinner" />
          </Box>
        </Container>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="finances-container">
        <Container maxWidth="xl" className="finances-container-max-width">
          <Alert severity="error" className="finances-error-alert">
            {error}
          </Alert>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="finances-container">
      <Container maxWidth="xl" className="finances-container-max-width">
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-header-title">
              Resident Finances
            </h1>
          </div>
          <Box className="page-header-controls">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              className="page-add-button"
            >
              Add New Transaction
            </Button>
          </Box>
        </div>
        
        {/* Summary Cards */}
        <div className="summary-cards-container">
          <div className="summary-card-wrapper">
            <Paper className="summary-card summary-card-total">
              <Typography variant="h6" gutterBottom>Total Amount</Typography>
              <Typography className="summary-amount">{formatCurrency(summary.totalAmount)}</Typography>
              <Typography className="summary-label">{filteredFinances.length} Transactions</Typography>
            </Paper>
          </div>
          <div className="summary-card-wrapper">
            <Paper className="summary-card summary-card-paid">
              <Typography variant="h6" gutterBottom>Paid Amount</Typography>
              <Typography className="summary-amount">{formatCurrency(summary.paidAmount)}</Typography>
              <Typography className="summary-label">
                {filteredFinances.filter(f => f.payment_status === 'paid').length} Transactions
              </Typography>
            </Paper>
          </div>
          <div className="summary-card-wrapper">
            <Paper className="summary-card summary-card-pending">
              <Typography variant="h6" gutterBottom>Pending Amount</Typography>
              <Typography className="summary-amount">{formatCurrency(summary.pendingAmount)}</Typography>
              <Typography className="summary-label">
                {filteredFinances.filter(f => f.payment_status === 'pending').length} Transactions
              </Typography>
            </Paper>
          </div>
          <div className="summary-card-wrapper">
            <Paper className="summary-card summary-card-overdue">
              <Typography variant="h6" gutterBottom>Overdue Amount</Typography>
              <Typography className="summary-amount">{formatCurrency(summary.overdueAmount)}</Typography>
              <Typography className="summary-label">
                {filteredFinances.filter(f => f.payment_status === 'overdue').length} Transactions
              </Typography>
            </Paper>
          </div>
        </div>
        
        {/* Filters */}
        <Paper className="filters-container">
          <Box className="filters-header">
            <Typography variant="h6" className="filters-title">
              <FilterListIcon className="filters-icon" />
              Filters
            </Typography>
          </Box>
          <div className="filters-grid">
            {user?.role !== 'society_admin' && (
              <div className="filter-item">
                <FormControl fullWidth size="small">
                  <InputLabel id="society-filter-label">Society</InputLabel>
                  <Select
                    labelId="society-filter-label"
                    id="society-filter"
                    value={societyFilter}
                    label="Society"
                    onChange={handleSocietyFilterChange}
                  >
                    <MenuItem value="">All Societies</MenuItem>
                    {societies.map((society) => (
                      <MenuItem key={society.id} value={society.id}>
                        {society.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
            
            <div className="filter-item">
              <FormControl fullWidth size="small">
                <InputLabel id="resident-filter-label">Resident</InputLabel>
                <Select
                  labelId="resident-filter-label"
                  id="resident-filter"
                  value={residentFilter}
                  label="Resident"
                  onChange={handleResidentFilterChange}
                  disabled={!societyFilter && user?.role !== 'society_admin'}
                >
                  <MenuItem value="">All Residents</MenuItem>
                  {residents
                    .filter(resident => !societyFilter || String(resident.society_id) === String(societyFilter))
                    .map((resident) => (
                      <MenuItem key={resident.id} value={String(resident.id)}>
                        {resident.first_name} {resident.last_name} - Unit {resident.unit_number || resident.unit}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            
            <div className="filter-item">
              <FormControl fullWidth size="small">
                <InputLabel id="payment-status-filter-label">Payment Status</InputLabel>
                <Select
                  labelId="payment-status-filter-label"
                  id="payment-status-filter"
                  value={paymentStatusFilter}
                  label="Payment Status"
                  onChange={handlePaymentStatusFilterChange}
                >
                  {paymentStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <div className="filter-item">
              <FormControl fullWidth size="small">
                <InputLabel id="transaction-type-filter-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-filter-label"
                  id="transaction-type-filter"
                  value={transactionTypeFilter}
                  label="Transaction Type"
                  onChange={handleTransactionTypeFilterChange}
                >
                  {transactionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            <div className="filter-item">
              <TextField
                fullWidth
                size="small"
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-field"
                InputProps={{
                  startAdornment: <SearchIcon className="search-icon" />,
                }}
              />
            </div>
            
            <div className="filter-item">
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                fullWidth
                className="reset-filters-button"
              >
                Reset Filters
              </Button>
            </div>
          </div>
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
                        {finance.description?.length && finance.description.length > 30
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
    </div>
  );
};

export default ResidentFinancesList;
