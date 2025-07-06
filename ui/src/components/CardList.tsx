import React from 'react';
import { 
  Card as MuiCard, 
  CardContent, 
  Typography
} from '@mui/material';
import { CardProps } from '../types';
import '../styles/theme.css';

/**
 * A generic card list component that displays minimal information with a View Details button.
 * Used for displaying items in list views with minimal information.
 * 
 * Features:
 * - Standard width to accommodate 25 character names
 * - Text truncation with ellipsis for overflowing content
 * - Consistent mobile-friendly design
 */
const CardList: React.FC<CardProps> = ({ 
  data, 
  title, 
  subtitle,
  fields = [], 
  actions = [],
  borderColor = 'var(--primary-color)',
  hoverBorderColor = 'var(--accent-color)'
}) => {
  // Get the primary action (first action) for card click
  const primaryAction = actions.length > 0 ? actions[0] : null;

  const handleCardClick = () => {
    if (primaryAction && primaryAction.onClick) {
      primaryAction.onClick(data);
    }
  };

  return (
    <MuiCard 
      onClick={handleCardClick}
      sx={{ 
        height: '80px', // Fixed small height
        width: '100%', 
        maxWidth: '100%', 
        minWidth: '160px', 
        margin: '2px', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '8px', // Smaller border radius for compact look
        overflow: 'hidden',
        borderLeft: `3px solid ${borderColor}`, // Thinner border for compact look
        boxShadow: 'var(--shadow-sm)', // Lighter shadow for smaller cards
        transition: 'all 0.2s ease',
        cursor: primaryAction ? 'pointer' : 'default', // Show hand cursor when clickable
        '&:hover': {
          borderColor: hoverBorderColor,
          transform: primaryAction ? 'translateY(-2px)' : 'none', // Subtle hover lift
          boxShadow: primaryAction ? 'var(--shadow-md)' : 'var(--shadow-sm)', // Enhanced shadow on hover
          backgroundColor: primaryAction ? 'rgba(var(--primary-rgb), 0.02)' : 'inherit' // Subtle background change
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}> {/* Center content vertically */}
        {/* Card Title - Unit Number */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            mb: subtitle ? 0.25 : 0, // Minimal margin for compact layout
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            fontSize: '1.1rem', // Smaller font for compact cards
            lineHeight: 1.2
          }}
          title={title}
        >
          {title}
        </Typography>
        
        {/* Card Subtitle - Full Name */}
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'var(--text-secondary)',
              mb: 0, // No bottom margin for compact layout
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              fontSize: '0.9rem', // Smaller font for compact cards
              fontWeight: 400
            }}
            title={subtitle}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </MuiCard>
  );
};

export default CardList;
