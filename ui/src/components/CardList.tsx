import React from 'react';
import { 
  Card as MuiCard, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Box,
  Divider
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
  fields = [], 
  actions = [],
  borderColor = 'var(--primary-color)',
  hoverBorderColor = 'var(--accent-color)'
}) => {
  return (
    <MuiCard 
      sx={{ 
        height: '100%', 
        width: '100%', // Takes full width of its container
        maxWidth: '100%', // Allow cards to fill available space
        minWidth: '240px', // Maintain minimum width for mobile
        margin: '2px', // Add a slight margin for better spacing
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '12px', // Slightly increased for less compact look
        overflow: 'hidden',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: hoverBorderColor,
          transform: 'translateY(-4px)', // Increased hover lift slightly
          boxShadow: 'var(--shadow-lg)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.25 }}> {/* Increased padding for less compact look */}
        {/* Card Title - Standardized for 25 characters with ellipsis */}
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            mb: 2, // Restored margin for title
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '260px', // Restored width for title
            fontSize: '1.25rem', // Increased font size
            lineHeight: 1.4 // Restored line height
          }}
          title={title} // Add title attribute to show full text on hover
        >
          {title}
        </Typography>
        
        <Divider sx={{ my: 1.25 }} /> {/* Increased spacing around divider */}
        
        {/* Card Fields - Only showing the minimal information */}
        {fields.map((field, index) => (
          <Box 
            key={index} 
            sx={{ 
              mt: index > 0 ? 1.75 : 2, // Increased spacing between fields
              display: 'flex', 
              alignItems: 'flex-start' 
            }}
          >
            {field.icon && (
              React.cloneElement(field.icon, { 
                sx: { 
                  fontSize: "small",
                  mr: 1.5, // Restored margin for icon
                  color: field.iconColor || 'var(--primary-color)',
                  mt: 0.3
                } 
              } as React.HTMLAttributes<HTMLElement>)
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontWeight: field.fontWeight || 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: field.icon ? 'calc(100% - 24px)' : '100%', // Account for icon width
                width: '100%',
                fontSize: '0.875rem',
                lineHeight: 1.6
              }}
              title={typeof field.value === 'string' ? field.value : ''} // Add title attribute for string values
            >
              {field.label && (
                <Box 
                  component="span" 
                  sx={{ 
                    fontWeight: 500, 
                    display: 'inline-block' 
                  }}
                >
                  {field.label}: 
                </Box>
              )}
              {field.value}
            </Typography>
          </Box>
        ))}
      </CardContent>
      
      {/* Action Buttons */}
      {actions.length > 0 && (
        <CardActions sx={{ p: 2, pt: 0.5 }}> {/* Increased padding for action buttons */}
          {actions.map((action, index) => (
            <Button 
              key={`action-${index}`}
              size="small" 
              variant={action.variant || "text"}
              startIcon={action.icon}
              endIcon={action.endIcon}
              disabled={action.disabled}
              sx={{ 
                ...(action.variant === 'contained' ? {
                  color: 'white',
                  fontWeight: 500
                } : {
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'var(--accent-color)',
                  }
                }),
                ...action.sx
              }}
              onClick={() => action.onClick && action.onClick(data)}
            >
              {action.label}
            </Button>
          ))}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default CardList;
