import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Button, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import api from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}/detail`);
      setProduct(res.data);
    } catch (err) {
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="warning">Product not found.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: 'none' }}>
          Back to Inventory
        </Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ textTransform: 'none' }}>
          Print / Export
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {product.product_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          SKU: {product.sku} | Category: {product.category}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Current Stock</Typography>
            <Typography variant="h6">{product.stock_level}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Reorder Level</Typography>
            <Typography variant="h6">{product.reorder_level}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Store Name</Typography>
            <Typography variant="h6">{product.store_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip 
              label={product.status} 
              color={product.status === 'active' ? 'success' : 'default'} 
              size="small" 
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Inventory History</Typography>
            {product.history && product.history.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>New Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.history.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(h.change_date).toLocaleString()}</TableCell>
                        <TableCell>{h.new_stock - h.old_stock}</TableCell>
                        <TableCell>{h.new_stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">No inventory history available.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Active Alerts</Typography>
            {product.alerts && product.alerts.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2}>
                {product.alerts.map((a, i) => (
                  <Alert key={i} severity={a.alert_type === 'Out of Stock' || a.alert_type === 'Expired' ? 'error' : 'warning'}>
                    <Typography variant="subtitle2">{a.alert_type}</Typography>
                    <Typography variant="body2">{a.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(a.created_at).toLocaleString()}</Typography>
                  </Alert>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No alerts for this product.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;
