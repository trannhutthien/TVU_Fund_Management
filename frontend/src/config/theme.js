/**
 * Ant Design Theme Configuration
 * Customize Ant Design components theo brand của TVU
 */
export const antdTheme = {
  token: {
    // Primary colors
    colorPrimary: '#1890ff', // Blue - có thể thay bằng màu của TVU
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    
    // Border
    borderRadius: 6,
    
    // Layout
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
  },
  
  components: {
    // Button customization
    Button: {
      controlHeight: 36,
      borderRadius: 6,
    },
    
    // Input customization
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    
    // Table customization
    Table: {
      borderRadius: 6,
      headerBg: '#fafafa',
    },
    
    // Card customization
    Card: {
      borderRadius: 8,
    },
    
    // Modal customization
    Modal: {
      borderRadius: 8,
    },
  },
};

/**
 * Custom CSS Variables
 * Có thể sử dụng trong SCSS
 */
export const cssVariables = {
  // Colors
  '--color-primary': '#1890ff',
  '--color-success': '#52c41a',
  '--color-warning': '#faad14',
  '--color-error': '#ff4d4f',
  '--color-text': '#262626',
  '--color-text-secondary': '#8c8c8c',
  '--color-border': '#d9d9d9',
  '--color-bg': '#ffffff',
  '--color-bg-secondary': '#fafafa',
  
  // Spacing
  '--spacing-xs': '4px',
  '--spacing-sm': '8px',
  '--spacing-md': '16px',
  '--spacing-lg': '24px',
  '--spacing-xl': '32px',
  
  // Border radius
  '--radius-sm': '4px',
  '--radius-md': '6px',
  '--radius-lg': '8px',
  
  // Shadows
  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
  '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
  '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
  
  // Transitions
  '--transition-fast': '0.15s',
  '--transition-base': '0.3s',
  '--transition-slow': '0.5s',
};
