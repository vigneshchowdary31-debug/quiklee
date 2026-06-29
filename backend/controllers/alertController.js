const Alert = require('../models/Alert');
const pool = require('../config/db');

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.findAll();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// Scan ALL products and update their alert states accurately
const scanAndGenerateAlerts = async (req, res, next) => {
  try {
    const productsResult = await pool.query('SELECT * FROM products');
    let generated = 0;

    for (const product of productsResult.rows) {
      const stock = Number(product.stock_level);
      const reorder = Number(product.reorder_level);
      const status = product.status;

      let alertType = '';
      let msg = '';

      if (status === 'inactive' || status === 'archived') {
        alertType = null;
        msg = '';
      } else {
        // Active product: evaluate stock level
        if (stock === 0) {
          alertType = 'Out of Stock';
          msg = `Product '${product.product_name}' (SKU: ${product.sku}) is completely Out of Stock!`;
        } else if (stock <= reorder) {
          alertType = 'Low Stock';
          msg = `Product '${product.product_name}' (SKU: ${product.sku}) is at Low Stock. Current: ${stock}, Reorder Level: ${reorder}`;
        } else {
          alertType = null;
          msg = '';
        }
      }

      // Atomically clear old stock/status alerts and insert the correct one if active/critical
      await Alert.updateAlertState(product.id, alertType, msg);
      generated++;

      // Check expiry date alerts (only for active products)
      if (status === 'active' && product.expiry_date) {
        const expiry = new Date(product.expiry_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        let expiryType = null;
        let expiryMsg = '';

        if (diffDays <= 0) {
          expiryType = 'Expired';
          expiryMsg = `Product '${product.product_name}' (SKU: ${product.sku}) has expired!`;
        } else if (diffDays <= 30) {
          expiryType = 'Expiring Soon';
          expiryMsg = `Product '${product.product_name}' (SKU: ${product.sku}) expires in ${diffDays} days.`;
        }

        await Alert.updateExpiryAlertState(product.id, expiryType, expiryMsg);
      } else {
        // Inactive/archived or no expiry date: clear any old expiry alert
        await Alert.updateExpiryAlertState(product.id, null, '');
      }
    }

    const allAlerts = await Alert.findAll();
    res.json({
      message: `Scan complete. Alert states updated for all ${generated} products.`,
      alerts: allAlerts
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  scanAndGenerateAlerts,
};
