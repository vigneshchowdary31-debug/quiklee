import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
  { text: 'Add Product', icon: <AddBoxIcon />, to: '/add-product' },
  { text: 'Reports', icon: <BarChartIcon />, to: '/reports' },
  { text: 'Alerts', icon: <NotificationsActiveIcon />, to: '/alerts' },
  { text: 'Suppliers', icon: <PeopleIcon />, to: '/suppliers', role: 'admin' },
  { text: 'Supplier Orders', icon: <LocalShippingIcon />, to: '/supplier-orders', role: 'admin' },
];

function Sidebar() {
  const location = useLocation();
  let userRole = 'staff';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) userRole = payload.role;
    }
  } catch(e) {}


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1a1a1a',
          borderRight: '1px solid #2d2d2d',
        },
      }}
    >
      <Box p={3} display="flex" alignItems="center" gap={1.5} borderBottom="1px solid #2d2d2d">
        <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold" color="primary.main" letterSpacing={1}>
          QUIKLEE
        </Typography>
      </Box>

      <List sx={{ mt: 2, px: 2 }}>
        {menuItems.map((item) => {
          if (item.role && item.role !== userRole) return null;
          const active = location.pathname === item.to;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: active ? 'rgba(0, 150, 136, 0.12)' : 'transparent',
                  color: active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 'medium' : 'regular' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
