import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import api from '../services/api';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier_id: '', product_id: '', quantity: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const oRes = await api.get('/suppliers/orders');
    setOrders(oRes.data);
    const sRes = await api.get('/suppliers');
    setSuppliers(sRes.data);
    const pRes = await api.get('/products');
    setProducts(pRes.data);
  };

  const handleSave = async () => {
    await api.post('/suppliers/orders', form);
    setOpen(false);
    loadData();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">Supplier Orders</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Create Order</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Supplier</TableCell><TableCell>Product</TableCell><TableCell>Quantity</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id}>
                <TableCell>{o.supplier_name}</TableCell><TableCell>{o.product_name}</TableCell><TableCell>{o.quantity}</TableCell><TableCell>{o.status}</TableCell><TableCell>{new Date(o.order_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Order</DialogTitle>
        <DialogContent>
          <TextField select margin="dense" label="Supplier" fullWidth value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}>
            {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select margin="dense" label="Product" fullWidth value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}>
            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.product_name}</MenuItem>)}
          </TextField>
          <TextField type="number" margin="dense" label="Quantity" fullWidth value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
