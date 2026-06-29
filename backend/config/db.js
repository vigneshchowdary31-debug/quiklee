require("dotenv").config();
const path = require("path");

let pool;

if (process.env.DATABASE_URL) {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log("No DATABASE_URL found. Using embedded PostgreSQL (PGlite) for local development...");
  const { PGlite } = require("@electric-sql/pglite");
  const pglite = new PGlite(path.join(__dirname, "../quiklee_pgdata"));
  
  pool = {
    query: async (sql, params = []) => {
      const res = await pglite.query(sql, params);
      if (res && res.rowCount === undefined) {
        res.rowCount = res.affectedRows !== undefined ? res.affectedRows : (res.rows ? res.rows.length : 0);
      }
      return res;
    }
  };
}

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        store_name VARCHAR(100) NOT NULL,
        stock_level INTEGER NOT NULL DEFAULT 0,
        picked_quantity INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        alert_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_history (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        old_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_info TEXT,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplier_orders (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const userResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE username = $1",
      ["badri"]
    );
    if (userResult.rows[0].count === 0) {
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["badri", "1234567", "admin"]
      );
      console.log("PostgreSQL seeded: user 'badri' created.");
    }

    const staffResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE username = $1",
      ["staff"]
    );
    if (staffResult.rows[0].count === 0) {
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["staff", "staff", "staff"]
      );
    }

    const supplierResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM suppliers"
    );
    if (supplierResult.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO suppliers (name, contact_info, email)
        VALUES
        ('Global Foods Inc.', 'John Doe - 555-0101', 'contact@globalfoods.com'),
        ('Local Farm Organics', 'Jane Smith - 555-0202', 'hello@localfarm.com')
      `);
    }

    const productResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM products"
    );
    if (productResult.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO products
        (product_name, sku, category, store_name, stock_level, picked_quantity, reorder_level, status, expiry_date)
        VALUES
        ('Organic Rice', 'QR-001', 'Grains', 'Store A', 120, 30, 50, 'active', '2026-12-31'),
        ('Almond Milk', 'QR-002', 'Beverages', 'Store B', 45, 10, 20, 'active', '2026-07-15'),
        ('Chocolate Chip Cookies', 'QR-003', 'Snacks', 'Store A', 0, 0, 15, 'active', '2026-08-01')
      `);

      await pool.query(`
        INSERT INTO sales (product_id, quantity, total_price, sale_date)
        VALUES
        (1, 5, 25.00, NOW() - INTERVAL '5 days'),
        (1, 10, 50.00, NOW() - INTERVAL '3 days'),
        (1, 15, 75.00, NOW() - INTERVAL '1 day'),
        (2, 2, 8.00, NOW() - INTERVAL '4 days'),
        (2, 8, 32.00, NOW() - INTERVAL '2 days')
      `);

      console.log("PostgreSQL database seeded with products, suppliers, and sales.");
    }

    console.log("PostgreSQL connected successfully");
  } catch (err) {
    console.error("Error auto-initializing PostgreSQL database tables:", err);
  }
})();

// Compatibility adapter wrapper for pool.execute() used by models/controllers
pool.execute = async (sql, params = []) => {
  let index = 1;
  // Convert standard MySQL '?' placeholders to PostgreSQL '$1, $2' format
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);
  
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  try {
    const res = await pool.query(pgSql, params);
    if (/^\s*SELECT/i.test(pgSql) || /RETURNING/i.test(pgSql)) {
      if (isInsert) {
        const insertId = res.rows && res.rows[0] ? Number(res.rows[0].id) : null;
        return [{ insertId, affectedRows: res.rowCount }, null];
      }
      return [res.rows, null];
    } else {
      return [{ insertId: null, affectedRows: res.rowCount }, null];
    }
  } catch (err) {
    console.error('PostgreSQL execution error for query:', pgSql, 'with params:', params);
    throw err;
  }
};

module.exports = pool;
