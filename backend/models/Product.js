const pool = require('../config/db');

class Product {
  static async create(data) {
    const sql = `
      INSERT INTO products
      (product_name, sku, category, store_name, stock_level, picked_quantity, reorder_level, status, expiry_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await pool.execute(sql, [
      data.product_name,
      data.sku,
      data.category,
      data.store_name,
      Number(data.stock_level) || 0,
      Number(data.picked_quantity) || 0,
      Number(data.reorder_level) || 0,
      data.status || 'active',
      data.expiry_date || null,
    ]);
    return result.insertId;
  }

  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (filter.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }
    if (filter.search) {
      conditions.push('(product_name LIKE ? OR sku LIKE ? OR category LIKE ?)');
      const like = `%${filter.search}%`;
      params.push(like, like, like);
    }

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      if (['product_name', 'sku', 'category', 'store_name', 'stock_level', 'picked_quantity', 'reorder_level', 'status', 'expiry_date'].includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    params.push(id);

    const sql = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute(sql, params);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Product;
