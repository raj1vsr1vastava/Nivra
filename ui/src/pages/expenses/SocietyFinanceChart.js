import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { societyFinanceService } from '../../services';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Modern color palette for charts
const COLORS = [
  '#3a86ff', // Primary blue
  '#8338ec', // Secondary purple
  '#ff006e', // Accent pink
  '#fb5607', // Orange
  '#ffbe0b', // Yellow
  '#06d6a0', // Green
  '#118ab2', // Teal
  '#073b4c', // Dark blue
  '#ff595e'  // Red
];

const SocietyFinanceChart = ({ societyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({ categories: {}, total: { amount: 0, count: 0 } });
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartType, setChartType] = useState('pie');
  const [timeRange, setTimeRange] = useState('6m'); // 3m, 6m, 1y

  useEffect(() => {
    if (societyId) {
      fetchFinanceSummary();
      fetchMonthlyData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyId, timeRange]);

  const fetchFinanceSummary = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      let startDate;
      
      switch (timeRange) {
        case '3m':
          startDate = subMonths(endDate, 3);
          break;
        case '1y':
          startDate = subMonths(endDate, 12);
          break;
        case '6m':
        default:
          startDate = subMonths(endDate, 6);
          break;
      }
      
      const data = await societyFinanceService.getFinanceSummary(societyId, {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });
      
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to fetch finance summary:', err);
      setError('Failed to load finance summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      let startDate;
      
      switch (timeRange) {
        case '3m':
          startDate = subMonths(endDate, 3);
          break;
        case '1y':
          startDate = subMonths(endDate, 12);
          break;
        case '6m':
        default:
          startDate = subMonths(endDate, 6);
          break;
      }
      
      // Initialize monthly totals array
      const months = [];
      let currentDate = startDate;
      
      while (currentDate <= endDate) {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        
        // Get month's finance data
        const monthData = await societyFinanceService.getSocietyFinancesBySocietyId(societyId, {
          start_date: format(monthStart, 'yyyy-MM-dd'),
          end_date: format(monthEnd, 'yyyy-MM-dd')
        });
        
        // Calculate totals
        const monthTotal = monthData.reduce((sum, finance) => sum + parseFloat(finance.amount), 0);
        
        // Add to months array
        months.push({
          month: format(currentDate, 'MMM yyyy'),
          total: monthTotal,
          count: monthData.length
        });
        
        // Move to next month
        currentDate = subMonths(currentDate, -1);
      }
      
      setMonthlyData(months);
    } catch (err) {
      console.error('Failed to fetch monthly data:', err);
      setError('Failed to load monthly data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Transform category data for charts
  const prepareCategoryChartData = () => {
    return Object.entries(summaryData.categories).map(([category, data]) => ({
      name: category,
      value: parseFloat(data.amount),
      count: data.count
    }));
  };

  return (
    <Paper elevation={0} sx={{ 
      p: 3, 
      mb: 4, 
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      background: 'white',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 2
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 40,
              height: 3,
              backgroundColor: '#3a86ff',
              borderRadius: 1
            },
            pb: 1
          }}
        >
          Finance Distribution
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <FormControl size="small" sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease'
            }
          }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="monthly">Monthly Trend</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease'
            }
          }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          minHeight: 300,
          animation: 'fadeIn 0.5s ease forwards'
        }}>
          <CircularProgress size={50} thickness={4} sx={{ color: '#3a86ff' }} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            my: 2, 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            animation: 'fadeIn 0.5s ease forwards'
          }}
        >
          {error}
        </Alert>
      ) : (
        <Box sx={{ 
          width: '100%', 
          height: 450, 
          animation: 'fadeIn 0.5s ease forwards',
          transition: 'all 0.3s ease'
        }}>
          {chartType === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareCategoryChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  innerRadius={50} // Added inner radius for donut effect
                  paddingAngle={2} // Added padding between segments
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000} // Increased animation duration
                  animationEasing="ease-out"
                >
                  {prepareCategoryChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: 'none'
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareCategoryChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
                barSize={40} // Larger bar size
                animationDuration={1000}
                animationEasing="ease-out"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#212529', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#eaeaea' }}
                />
                <YAxis 
                  tick={{ fill: '#212529', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#eaeaea' }}
                  tickFormatter={(value) => 
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                  }
                />
                <Tooltip 
                  formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: 'none'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8" 
                  name="Amount"
                  radius={[8, 8, 0, 0]} // Rounded corners on top
                >
                  {prepareCategoryChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
                barSize={40}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#212529', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#eaeaea' }}
                />
                <YAxis 
                  tick={{ fill: '#212529', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#eaeaea' }}
                  tickFormatter={(value) => 
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                  }
                />
                <Tooltip 
                  formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: 'none'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="total" 
                  fill="#3a86ff" 
                  name="Monthly Total"
                  radius={[8, 8, 0, 0]} // Rounded corners on top
                >
                  {/* Apply gradient to bars for more modern look */}
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3a86ff" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3a86ff" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#monthlyGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SocietyFinanceChart;
