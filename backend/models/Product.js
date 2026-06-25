const pool = require('../config/db');

class Product {
  static async create(data) {
    const sql = `
      INSERT INTO products
      (product_name, sku, category, store_name, stock_level, picked_quantity, reorder_level, status, expiry_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `;

    const result = await pool.query(sql, [
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

    return result.rows[0].id;
  }

  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`status = $${params.length}`);
    }

    if (filter.search) {
      const like = `%${filter.search}%`;
      params.push(like);
      const p1 = `$${params.length}`;
      params.push(like);
      const p2 = `$${params.length}`;
      params.push(like);
      const p3 = `$${params.length}`;
      conditions.push(`(product_name ILIKE ${p1} OR sku ILIKE ${p2} OR category ILIKE ${p3})`);
    }

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await pool.query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      if (
        [
          'product_name',
          'sku',
          'category',
          'store_name',
          'stock_level',
          'picked_quantity',
          'reorder_level',
          'status',
          'expiry_date',
        ].includes(key)
      ) {
        params.push(value);
        fields.push(`${key} = $${params.length}`);
      }
    }

    if (fields.length === 0) return 0;

    params.push(id);
    const sql = `
      UPDATE products
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${params.length}
    `;

    const result = await pool.query(sql, params);
    return result.rowCount;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = Product;