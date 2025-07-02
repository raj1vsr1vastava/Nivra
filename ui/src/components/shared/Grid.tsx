import React from 'react';
import { Grid as MuiGrid, GridProps } from '@mui/material';

// Create a wrapper around Grid that properly types responsive props
interface ExtendedGridProps extends GridProps {
  item?: boolean;
  container?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
}

const Grid: React.FC<ExtendedGridProps> = (props) => {
  return <MuiGrid {...props} />;
};

export default Grid;
