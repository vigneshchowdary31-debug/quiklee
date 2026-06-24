const Supplier = require('../models/Supplier');
const SupplierOrder = require('../models/SupplierOrder');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) { next(err); }
};

const createSupplier = async (req, res, next) => {
  try {
    const id = await Supplier.create(req.body);
    res.status(201).json({ id, message: 'Supplier created' });
  } catch (err) { next(err); }
};

const getSupplierOrders = async (req, res, next) => {
  try {
    const orders = await SupplierOrder.findAll();
    res.json(orders);
  } catch (err) { next(err); }
};

const createSupplierOrder = async (req, res, next) => {
  try {
    const id = await SupplierOrder.create(req.body);
    res.status(201).json({ id, message: 'Supplier order created' });
  } catch (err) { next(err); }
};

module.exports = { getSuppliers, createSupplier, getSupplierOrders, createSupplierOrder };