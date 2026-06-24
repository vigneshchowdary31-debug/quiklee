const pool = require('../config/db');
class User {
  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }
}
module.exports = User;