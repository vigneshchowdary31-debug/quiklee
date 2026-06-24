const pool = require('../config/db');
class Supplier {
  static async create(data) {
    const sql = 'INSERT INTO suppliers (name, contact_info, email) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [data.name, data.contact_info, data.email]);
    return result.insertId;
  }
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM suppliers ORDER BY created_at DESC');
    return rows;
  }
}
module.exports = Supplier;