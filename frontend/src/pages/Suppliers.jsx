import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contact_info: '', email: '' });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
  };

  const handleSave = async () => {
    await api.post('/suppliers', form);
    setOpen(false);
    loadSuppliers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will also delete any related supplier orders.')) {
      try {
        await api.delete(`/suppliers/${id}`);
        loadSuppliers();
      } catch (err) {
        console.error('Failed to delete supplier:', err);
        alert('Failed to delete supplier.');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">Suppliers</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Supplier</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.contact_info}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(s.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" fullWidth value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField margin="dense" label="Contact Info" fullWidth value={form.contact_info} onChange={e => setForm({...form, contact_info: e.target.value})} />
          <TextField margin="dense" label="Email" fullWidth value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
