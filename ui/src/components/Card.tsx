import React, { useState } from 'react';
import { 
  Card as MuiCard, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Box,
  Chip,
  Divider,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import Grid from './shared/Grid';
import { CardProps } from '../types';
import '../styles/theme.css';

/**
 * A generic reusable card component that can be used for different data types
 * with enhanced animations and hover effects inspired by Profile project styling
 */
const Card: React.FC<CardProps> = ({ 
  data, 
  title, 
  fields = [], 
  chips = [], 
  actions = [],
  borderColor = 'var(--primary-color)',
  hoverBorderColor = 'var(--accent-color)',
  image = null,
  animate = false,
  index = 0
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  return (
    <>
      <MuiCard 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '14px',
          overflow: 'hidden',
          borderLeft: `4px solid ${borderColor}`,
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: hoverBorderColor,
            transform: 'translateY(-6px)',
            boxShadow: 'var(--shadow-lg)'
          }
        }}
      >
        {/* Optional Image Section */}
        {image && (
          <Box 
            sx={{
              height: '160px',
              backgroundColor: `${borderColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              '&:hover img': {
                transform: 'scale(1.1)'
              },
              '&:hover::before': {
                opacity: 1
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: 1
              }
            }}
            onClick={() => setModalOpen(true)}
          >
            <img 
              src={image} 
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '15px',
                transition: 'transform 0.5s ease',
                maxHeight: '140px'
              }}
            />
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Card Title */}
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              mb: 2
            }}
          >
            {title}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Card Fields */}
          {fields.map((field, index) => (
            <Box 
              key={index} 
              sx={{ 
                mt: index > 0 ? 1.5 : 2, 
                display: 'flex', 
                alignItems: 'flex-start' 
              }}
            >
              {field.icon && (
                React.cloneElement(field.icon, { 
                  sx: { 
                    fontSize: "small",
                    mr: 1.5, 
                    color: field.iconColor || 'var(--primary-color)',
                    mt: 0.3
                  } 
                } as React.HTMLAttributes<HTMLElement>)
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: field.fontWeight || 400
                }}
              >
                {field.label && <span style={{ fontWeight: 500 }}>{field.label}: </span>}
                {field.value}
              </Typography>
            </Box>
          ))}
          
          {/* Grid Layout Fields (if any) */}
          {fields.filter(f => f.gridColumn).length > 0 && (
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {fields.filter(f => f.gridColumn).map((field, index) => (
                <Grid item key={`grid-${index}`} xs={field.gridColumn}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    {field.icon && (
                      React.cloneElement(field.icon, { 
                        sx: { 
                          fontSize: "small",
                          mr: 1.5, 
                          color: field.iconColor || 'var(--info)',
                          mt: 0.3
                        } 
                      } as React.HTMLAttributes<HTMLElement>)
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: field.fontWeight || 500,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {field.label && <span>{field.label} </span>}
                      {field.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Chips */}
          {chips.length > 0 && (
            <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {chips.map((chip, index) => (
                <Chip 
                  key={`chip-${index}`}
                  label={chip.label} 
                  variant={chip.variant || "outlined"} 
                  size="small" 
                  sx={{ 
                    borderColor: chip.color || 'var(--accent-color)', 
                    color: chip.color || 'var(--accent-color)',
                    fontWeight: chip.fontWeight || 500,
                    ...chip.sx
                  }}
                  onClick={chip.onClick}
                />
              ))}
            </Box>
          )}
        </CardContent>
        
        {/* Action Buttons */}
        {actions.length > 0 && (
          <CardActions sx={{ p: 2, pt: 0 }}>
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
                    background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, var(--secondary-color), var(--primary-color))',
                      transform: 'translateY(-2px)'
                    }
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
      
      {/* Image Modal (similar to Profile project) */}
      {image && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          closeAfterTransition
          slots={{
            backdrop: Backdrop
          }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={modalOpen}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90%',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              p: 4,
              outline: 'none',
              textAlign: 'center'
            }}>
              <img 
                src={image} 
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {title}
              </Typography>
              <Button 
                onClick={() => setModalOpen(false)}
                sx={{ 
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  minWidth: 'auto',
                  p: 1
                }}
              >
                ✕
              </Button>
            </Box>
          </Fade>
        </Modal>
      )}
    </>
  );
};

export default Card;
