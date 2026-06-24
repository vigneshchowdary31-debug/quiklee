const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');
const Alert = require('../models/Alert');
const pool = require('../config/db');
const { body } = require('express-validator');

const productValidation = [
  body('product_name').notEmpty().withMessage('Product name required'),
  body('sku').notEmpty().withMessage('SKU required'),
  body('category').notEmpty().withMessage('Category required'),
  body('store_name').notEmpty().withMessage('Store name required'),
  body('stock_level')
    .isInt({ min: 0 })
    .withMessage('Stock level must be >= 0'),
  body('picked_quantity')
    .isInt({ min: 0 })
    .withMessage('Pick quantity must be >= 0'),
  body('reorder_level')
    .isInt({ min: 0 })
    .withMessage('Reorder level must be >= 0'),
  body('status')
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Invalid status'),
];

// Helper to trigger alerts
const checkAndTriggerAlert = async (productId, name, sku, stockLevel, reorderLevel) => {
  if (stockLevel === 0) {
    await Alert.create(productId, 'Out of Stock', `Product '${name}' (SKU: ${sku}) is completely Out of Stock!`);
  } else if (stockLevel <= reorderLevel) {
    await Alert.create(productId, 'Low Stock', `Product '${name}' (SKU: ${sku}) is at Low Stock. Current: ${stockLevel}, Reorder Level: ${reorderLevel}`);
  }
};


const checkAndTriggerExpiryAlert = async (productId, name, sku, expiryDate) => {
  if (!expiryDate) return;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30 && diffDays > 0) {
    await Alert.create(productId, 'Expiring Soon', 'Product ' + name + ' (SKU: ' + sku + ') expires in ' + diffDays + ' days.');
  } else if (diffDays <= 0) {
    await Alert.create(productId, 'Expired', 'Product ' + name + ' (SKU: ' + sku + ') has expired!');
  }
};
const createProduct = async (req, res, next) => {
  try {
    const id = await Product.create(req.body);
    // Log history and check alert
    await InventoryHistory.log(id, 0, req.body.stock_level);
    await checkAndTriggerAlert(id, req.body.product_name, req.body.sku, Number(req.body.stock_level), Number(req.body.reorder_level));
    await checkAndTriggerExpiryAlert(id, req.body.product_name, req.body.sku, req.body.expiry_date);

    res.status(201).json({ id, message: 'Product created successfully' });
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const filter = {
      status: req.query.status,
      search: req.query.search,
    };
    const products = await Product.findAll(filter);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const oldProduct = await Product.findById(id);
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });

    const rows = await Product.update(id, req.body);
    if (!rows) return res.status(404).json({ message: 'Product not found' });

    // If stock level changed, log history and check alert
    const newStock = Number(req.body.stock_level);
    const oldStock = Number(oldProduct.stock_level);
    if (newStock !== oldStock) {
      await InventoryHistory.log(id, oldStock, newStock);
      await checkAndTriggerAlert(id, req.body.product_name, req.body.sku, newStock, Number(req.body.reorder_level));
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
};


const getProductDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const db = pool.promise ? await pool.promise() : pool;
    let history = [];
    let alerts = [];

    if (db.query) {
      const [historyRows] = await db.query('SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC', [id]);
      history = historyRows || [];

      const [alertsRows] = await db.query('SELECT * FROM alerts WHERE product_id = ? ORDER BY created_at DESC', [id]);
      alerts = alertsRows || [];
    } else {
      history = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC', [id], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      });
      alerts = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM alerts WHERE product_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      });
    }

    res.json({
      ...product,
      history,
      alerts
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const rows = await Product.delete(req.params.id);
    if (!rows) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  productValidation,
  createProduct,
  getProducts,
  getProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
};
