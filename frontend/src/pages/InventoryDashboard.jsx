import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function InventoryDashboard() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchAllProducts = async () => {
    try {
      const data = await getProducts({});
      setAllProducts(data);
    } catch (err) {
      console.error('Error loading all products:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, searchQuery]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
        fetchAllProducts();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  // Returns stock status badge — only for active products
  const getStockStatusChip = (product) => {
    const stock = Number(product.stock_level);
    const reorder = Number(product.reorder_level);
    if (product.status === 'inactive') {
      return <Chip label="Inactive" color="info" size="small" sx={{ fontWeight: 'bold', width: 110 }} />;
    }
    if (product.status === 'archived') {
      return <Chip label="Archived" size="small" sx={{ fontWeight: 'bold', width: 110, bgcolor: '#7b1fa2', color: '#fff' }} />;
    }
    // Active product stock statuses
    if (stock === 0) return <Chip label="Out of Stock" color="error" size="small" sx={{ fontWeight: 'bold', width: 110 }} />;
    if (stock <= reorder) return <Chip label="Low Stock" color="warning" size="small" sx={{ fontWeight: 'bold', width: 110 }} />;
    return <Chip label="Healthy" color="success" size="small" sx={{ fontWeight: 'bold', width: 110 }} />;
  };

  // Stat counts from all products
  const activeCount = allProducts.filter(p => p.status === 'active').length;
  const inactiveCount = allProducts.filter(p => p.status === 'inactive').length;
  const archivedCount = allProducts.filter(p => p.status === 'archived').length;
  const activeProds = allProducts.filter(p => p.status === 'active');
  const lowStockCount = activeProds.filter(
    p => Number(p.stock_level) > 0 && Number(p.stock_level) <= Number(p.reorder_level)
  ).length;
  const outOfStockCount = activeProds.filter(p => Number(p.stock_level) === 0).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Inventory Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-product')}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'background.paper', borderLeft: '4px solid #009688' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total SKUs</Typography>
              <Typography variant="h3" fontWeight="bold">{allProducts.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Active: {activeCount} &nbsp;|&nbsp; Inactive: {inactiveCount} &nbsp;|&nbsp; Archived: {archivedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'background.paper', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Active Products</Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">{activeCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'background.paper', borderLeft: '4px solid #0288d1' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Inactive Products</Typography>
              <Typography variant="h3" fontWeight="bold" color="info.main">{inactiveCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'background.paper', borderLeft: '4px solid #ffb300' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Low Stock Items</Typography>
              <Typography variant="h3" fontWeight="bold" color="warning.main">{lowStockCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'background.paper', borderLeft: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Out of Stock</Typography>
              <Typography variant="h3" fontWeight="bold" color="error.main">{outOfStockCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Tabs */}
      <Paper sx={{ mb: 3, p: 2, bgcolor: 'background.paper' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="all" label={`All (${allProducts.length})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            <Tab value="active" label={`Active (${activeCount})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            <Tab value="inactive" label={`Inactive (${inactiveCount})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
            <Tab value="archived" label={`Archived (${archivedCount})`} sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          </Tabs>
          <TextField
            placeholder="Search SKU or Name..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState message={`No products found${activeTab !== 'all' ? ` with status "${activeTab}"` : ''}.`} />
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Details</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Store Location</TableCell>
                <TableCell align="right">Stock Level</TableCell>
                <TableCell align="right">Picked Qty</TableCell>
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell align="center">Stock Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{p.product_name}</Typography>
                      <Chip
                        label={p.status}
                        size="small"
                        color={
                          p.status === 'active' ? 'success' :
                          p.status === 'inactive' ? 'info' : 'default'
                        }
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.store_name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{p.stock_level}</TableCell>
                  <TableCell align="right">{p.picked_quantity}</TableCell>
                  <TableCell align="right">{p.reorder_level}</TableCell>
                  <TableCell align="center">{getStockStatusChip(p)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => navigate(`/add-product?id=${p.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(p)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{productToDelete?.product_name}</strong> (SKU: {productToDelete?.sku})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InventoryDashboard;
