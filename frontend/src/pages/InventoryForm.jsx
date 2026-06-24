import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createProduct, getProductById, updateProduct } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

function InventoryForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');

  const [form, setForm] = useState({
    product_name: '',
    sku: '',
    category: '',
    store_name: '',
    stock_level: 0,
    picked_quantity: 0,
    reorder_level: 0,
    status: 'active',
    expiry_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          const data = await getProductById(productId);
          setForm({
            product_name: data.product_name || '',
            sku: data.sku || '',
            category: data.category || '',
            store_name: data.store_name || '',
            stock_level: data.stock_level || 0,
            picked_quantity: data.picked_quantity || 0,
            reorder_level: data.reorder_level || 0,
            status: data.status || 'active',
            expiry_date: data.expiry_date || '',
          });
        } catch (err) {
          setError('Failed to load product data.');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.product_name.trim()) errors.product_name = 'Product name is required';
    if (!form.sku.trim()) errors.sku = 'SKU Code is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.store_name.trim()) errors.store_name = 'Store name is required';

    const stock = Number(form.stock_level);
    const pick = Number(form.picked_quantity);
    const reorder = Number(form.reorder_level);

    if (isNaN(stock) || stock < 0) errors.stock_level = 'Stock must be >= 0';
    if (isNaN(pick) || pick < 0) errors.picked_quantity = 'Pick quantity must be >= 0';
    if (isNaN(reorder) || reorder < 0) errors.reorder_level = 'Reorder level must be >= 0';

    if (pick > stock) {
      errors.picked_quantity = 'Pick quantity cannot be greater than current stock level';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    try {
      setLoading(true);
      if (productId) {
        await updateProduct(productId, form);
      } else {
        await createProduct(form);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const backendErrs = {};
        err.response.data.errors.forEach((e) => {
          backendErrs[e.field] = e.message;
        });
        setValidationErrors(backendErrs);
      } else {
        setError(err.response?.data?.message || 'An error occurred while saving the product.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="primary.main">
        {productId ? 'Edit Inventory Item' : 'Create Inventory Item'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="product_name"
              label="Product Name"
              fullWidth
              value={form.product_name}
              onChange={handleChange}
              error={!!validationErrors.product_name}
              helperText={validationErrors.product_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="sku"
              label="SKU Code"
              fullWidth
              value={form.sku}
              onChange={handleChange}
              error={!!validationErrors.sku}
              helperText={validationErrors.sku}
              disabled={!!productId} // Usually SKU is fixed
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="category"
              label="Category"
              fullWidth
              value={form.category}
              onChange={handleChange}
              error={!!validationErrors.category}
              helperText={validationErrors.category}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="store_name"
              label="Store Name"
              fullWidth
              value={form.store_name}
              onChange={handleChange}
              error={!!validationErrors.store_name}
              helperText={validationErrors.store_name}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              required
              type="number"
              name="stock_level"
              label="Stock Level"
              fullWidth
              value={form.stock_level}
              onChange={handleChange}
              error={!!validationErrors.stock_level}
              helperText={validationErrors.stock_level}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              required
              type="number"
              name="picked_quantity"
              label="Pick Quantity"
              fullWidth
              value={form.picked_quantity}
              onChange={handleChange}
              error={!!validationErrors.picked_quantity}
              helperText={validationErrors.picked_quantity}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              required
              type="number"
              name="reorder_level"
              label="Reorder Level"
              fullWidth
              value={form.reorder_level}
              onChange={handleChange}
              error={!!validationErrors.reorder_level}
              helperText={validationErrors.reorder_level}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              value={form.status}
              onChange={handleChange}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit" sx={{ fontWeight: 'bold' }}>
              Save Product
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default InventoryForm;
