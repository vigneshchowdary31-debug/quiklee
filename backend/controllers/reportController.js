const pool = require('../config/db');

const getSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active_products,
        SUM(CASE WHEN stock_level = 0 THEN 1 ELSE 0 END) AS out_of_stock,
        SUM(CASE WHEN stock_level > 0 AND stock_level <= reorder_level THEN 1 ELSE 0 END) AS low_stock
      FROM products
    `);
    
    // SQLite can return null values for SUM if no rows match, default them to 0
    const summary = rows[0] || {};
    res.json({
      total_products: Number(summary.total_products) || 0,
      active_products: Number(summary.active_products) || 0,
      out_of_stock: Number(summary.out_of_stock) || 0,
      low_stock: Number(summary.low_stock) || 0,
    });
  } catch (err) {
    next(err);
  }
};


const getSalesReports = async (req, res, next) => {
  try {
    const { period } = req.query;
    let limitDate = "datetime('now', '-7 days')";
    let formatStr = '%Y-%m-%d';
    if (period === 'monthly') {
      limitDate = "datetime('now', '-12 months')";
      formatStr = '%Y-%m';
    }
    const [rows] = await pool.execute("SELECT strftime('" + formatStr + "', sale_date) as date, SUM(total_price) as total_sales, SUM(quantity) as items_sold FROM sales WHERE sale_date >= " + limitDate + " GROUP BY date ORDER BY date ASC");
    res.json(rows);
  } catch (err) { next(err); }
};
module.exports = {
  getSummary,
  getSalesReports,
};
