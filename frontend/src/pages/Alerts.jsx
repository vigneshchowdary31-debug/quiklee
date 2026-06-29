import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import ArchiveIcon from '@mui/icons-material/Archive';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { getAlerts, getProducts, scanAlerts } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  const runScanAndLoad = useCallback(async (showMessage = false) => {
    try {
      setScanning(true);
      const result = await scanAlerts();
      const [freshAlerts, productList] = await Promise.all([
        getAlerts(),
        getProducts({}),
      ]);
      setAlerts(freshAlerts);
      setProducts(productList);
      if (showMessage) {
        setSnack({ open: true, message: result.message || 'Alerts refreshed successfully.', severity: 'success' });
      }
    } catch (err) {
      console.error('Failed to scan alerts:', err);
      try {
        const [alertList, productList] = await Promise.all([getAlerts(), getProducts({})]);
        setAlerts(alertList);
        setProducts(productList);
      } catch (e) {
        console.error('Fallback load failed:', e);
      }
      if (showMessage) {
        setSnack({ open: true, message: 'Failed to refresh alerts.', severity: 'error' });
      }
    } finally {
      setScanning(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runScanAndLoad(false);
  }, [runScanAndLoad]);

  const handleManualScan = () => runScanAndLoad(true);

  const getAlertStyle = (type) => {
    switch (type) {
      case 'Out of Stock':
        return { color: '#d32f2f', icon: <ErrorIcon sx={{ color: '#d32f2f' }} />, bg: 'rgba(211,47,47,0.08)' };
      case 'Low Stock':
        return { color: '#ffb300', icon: <WarningIcon sx={{ color: '#ffb300' }} />, bg: 'rgba(255,179,0,0.08)' };
      case 'Expired':
        return { color: '#b71c1c', icon: <CancelIcon sx={{ color: '#b71c1c' }} />, bg: 'rgba(183,28,28,0.08)' };
      case 'Expiring Soon':
        return { color: '#e65100', icon: <WarningIcon sx={{ color: '#e65100' }} />, bg: 'rgba(230,81,0,0.08)' };
      case 'Achieved':
        return { color: '#2e7d32', icon: <CheckCircleIcon sx={{ color: '#2e7d32' }} />, bg: 'rgba(46,125,50,0.08)' };
      case 'Inactive':
        return { color: '#0288d1', icon: <PowerOffIcon sx={{ color: '#0288d1' }} />, bg: 'rgba(2,136,209,0.08)' };
      case 'Archived':
        return { color: '#7b1fa2', icon: <ArchiveIcon sx={{ color: '#7b1fa2' }} />, bg: 'rgba(123,31,162,0.08)' };
      default:
        return { color: '#757575', icon: <InfoIcon sx={{ color: '#757575' }} />, bg: 'rgba(117,117,117,0.08)' };
    }
  };

  const now = new Date();
  const activeProds = products.filter(p => p.status === 'active');
  const outOfStockCount = activeProds.filter(p => Number(p.stock_level) === 0).length;
  const lowStockCount = activeProds.filter(
    p => Number(p.stock_level) > 0 && Number(p.stock_level) <= Number(p.reorder_level)
  ).length;
  const healthyCount = activeProds.filter(
    p => Number(p.stock_level) > Number(p.reorder_level)
  ).length;
  const inactiveCount = products.filter(p => p.status === 'inactive').length;
  const archivedCount = products.filter(p => p.status === 'archived').length;
  const expiryIssueCount = activeProds.filter(p => {
    if (!p.expiry_date) return false;
    const diff = Math.ceil((new Date(p.expiry_date) - now) / 86400000);
    return diff <= 30;
  }).length;

  const alertMap = {
    all: alerts,
    out_of_stock: alerts.filter(a => a.alert_type === 'Out of Stock'),
    low_stock: alerts.filter(a => a.alert_type === 'Low Stock'),
    expiry: alerts.filter(a => a.alert_type === 'Expired' || a.alert_type === 'Expiring Soon'),
  };

  const filteredAlertList = alertMap[activeFilterTab] || alerts;

  if (loading) return <LoadingSpinner />;

  const SummaryCard = ({ icon, label, count, color, bg }) => (
    <Card sx={{ bgcolor: bg, border: `1.5px solid ${color}`, borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 2, px: 1 }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography variant="caption" sx={{ color, fontWeight: 'bold', display: 'block', mt: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h3" fontWeight="bold" sx={{ color }}>
          {count}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Alerts & Notifications
        </Typography>
        <Button
          variant="contained"
          color="warning"
          startIcon={scanning ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          onClick={handleManualScan}
          disabled={scanning}
          sx={{ fontWeight: 'bold', textTransform: 'none' }}
        >
          {scanning ? 'Refreshing...' : 'Scan & Refresh Alerts'}
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4} md={4}>
          <SummaryCard icon={<ErrorIcon />} label="Out of Stock" count={outOfStockCount} color="#d32f2f" bg="rgba(211,47,47,0.08)" />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <SummaryCard icon={<WarningIcon />} label="Low Stock" count={lowStockCount} color="#ffb300" bg="rgba(255,179,0,0.08)" />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <SummaryCard icon={<CancelIcon />} label="Expiry Issues" count={expiryIssueCount} color="#e65100" bg="rgba(230,81,0,0.08)" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>System Alert Log</Typography>
        <Tabs
          value={activeFilterTab}
          onChange={(_, val) => setActiveFilterTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab value="all" label={`All (${alertMap.all.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab value="out_of_stock" label={`Out of Stock (${alertMap.out_of_stock.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab value="low_stock" label={`Low Stock (${alertMap.low_stock.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab value="expiry" label={`Expiry (${alertMap.expiry.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>

        {filteredAlertList.length === 0 ? (
          <EmptyState message="No alerts in this category." />
        ) : (
          <List disablePadding>
            {filteredAlertList.map((alert, idx) => {
              const style = getAlertStyle(alert.alert_type);
              return (
                <React.Fragment key={alert.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ borderRadius: 2, bgcolor: style.bg, border: `1px solid ${style.color}44`, px: 2, py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>{style.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight="bold">{alert.product_name}</Typography>
                          <Chip label={alert.sku} size="small" sx={{ height: 20, fontSize: '0.72rem' }} />
                        </Box>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Typography variant="body2" color="text.primary">{alert.message}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            Generated at: {new Date(alert.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={alert.alert_type}
                      size="small"
                      sx={{ bgcolor: style.color, color: '#fff', fontWeight: 'bold', alignSelf: 'center', ml: 1, flexShrink: 0 }}
                    />
                  </ListItem>
                  {idx < filteredAlertList.length - 1 && <Divider sx={{ my: 0.5, opacity: 0.25 }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <MuiAlert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Alerts;
