const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, getSupplierOrders, createSupplierOrder, deleteSupplier } = require('../controllers/supplierController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getSuppliers);
router.post('/', createSupplier);
router.delete('/:id', deleteSupplier);
router.get('/orders', getSupplierOrders);
router.post('/orders', createSupplierOrder);

module.exports = router;