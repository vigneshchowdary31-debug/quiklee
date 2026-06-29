const pool = require('../config/db');

class Supplier {
  static async create(data) {
    const sql = 'INSERT INTO suppliers (name, contact_info, email) VALUES ($1, $2, $3) RETURNING id';
    const result = await pool.query(sql, [data.name, data.contact_info, data.email]);
    return result.rows[0].id;
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = Supplier;