const pool = require('../config/db');

class Alert {
  static async create(productId, type, message) {
    const sql = `
      INSERT INTO alerts (product_id, alert_type, message, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `;
    const result = await pool.query(sql, [productId, type, message]);
    return result.rows[0].id;
  }

  static async findAll() {
    const result = await pool.query(`
      SELECT a.*, p.product_name, p.sku
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  }
}

module.exports = Alert;