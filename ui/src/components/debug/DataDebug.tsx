import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface DataDebugProps {
  data: any;
  title?: string;
  collapsed?: boolean;
}

const DataDebug: React.FC<DataDebugProps> = ({ data, title = 'Debug Data', collapsed = false }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mt: 2, 
        mb: 2, 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontFamily: 'monospace' }}>
        {title}
      </Typography>
      <Box 
        component="pre" 
        sx={{ 
          backgroundColor: '#212529', 
          color: '#f8f9fa', 
          p: 2, 
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '0.875rem',
          maxHeight: collapsed ? '200px' : 'none',
          overflow: collapsed ? 'auto' : 'visible'
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Box>
    </Paper>
  );
};

export default DataDebug;
