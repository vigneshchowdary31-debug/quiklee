const pool = require('../config/db');

class InventoryHistory {
  static async log(productId, oldStock, newStock) {
    const sql = `
      INSERT INTO inventory_history (product_id, old_stock, new_stock, updated_at)
      VALUES ($1, $2, $3, NOW())
    `;
    await pool.query(sql, [productId, oldStock, newStock]);
  }

  static async recentByProduct(productId, limit = 10) {
    const result = await pool.query(
      `
      SELECT * FROM inventory_history
      WHERE product_id = $1
      ORDER BY updated_at DESC
      LIMIT $2
      `,
      [productId, limit]
    );
    return result.rows;
  }
}

module.exports = InventoryHistory;