const pool = require('../config/db');

const getSummary = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0)::int AS active_products,
        COALESCE(SUM(CASE WHEN stock_level = 0 THEN 1 ELSE 0 END), 0)::int AS out_of_stock,
        COALESCE(SUM(CASE WHEN stock_level > 0 AND stock_level <= reorder_level THEN 1 ELSE 0 END), 0)::int AS low_stock
      FROM products
    `);

    const summary = result.rows[0] || {};
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

    let intervalText = "7 days";
    let formatStr = 'YYYY-MM-DD';

    if (period === 'monthly') {
      intervalText = "12 months";
      formatStr = 'YYYY-MM';
    }

    const result = await pool.query(
      `
      SELECT
        TO_CHAR(sale_date, $1) AS date,
        COALESCE(SUM(total_price), 0) AS total_sales,
        COALESCE(SUM(quantity), 0) AS items_sold
      FROM sales
      WHERE sale_date >= NOW() - CAST($2 AS interval)
      GROUP BY TO_CHAR(sale_date, $1)
      ORDER BY date ASC
      `,
      [formatStr, intervalText]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getSalesReports,
};