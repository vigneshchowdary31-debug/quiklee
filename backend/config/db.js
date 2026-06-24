const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dialect = process.env.DB_DIALECT || 'sqlite';

let pool;

if (dialect === 'mysql') {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  // SQLite mode
  const dbFile = path.resolve(__dirname, '../quiklee_inventory.db');
  const db = new sqlite3.Database(dbFile);
  
  pool = {
    execute: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        // Simple adaptation of mysql syntax to sqlite syntax if needed
        let sqliteSql = sql
          .replace(/NOW\(\)/gi, "datetime('now', 'localtime')")
          .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, "");

        const sqlUpper = sqliteSql.trim().toUpperCase();
        if (sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('PRAGMA')) {
          db.all(sqliteSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve([rows, null]);
          });
        } else {
          db.run(sqliteSql, params, function (err) {
            if (err) return reject(err);
            resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
          });
        }
      });
    }
  };

    // Initialize SQLite tables
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        store_name TEXT NOT NULL,
        stock_level INTEGER NOT NULL DEFAULT 0,
        picked_quantity INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        expiry_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`ALTER TABLE products ADD COLUMN expiry_date TEXT`, (err) => { /* ignore if exists */ });

    db.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        old_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_info TEXT,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS supplier_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        order_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL DEFAULT 0,
        sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Seed sample data if empty
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (row && row.count === 0) {
        db.run(`
          INSERT INTO users (username, password, role)
          VALUES 
          ('admin', 'admin', 'admin'),
          ('staff', 'staff', 'staff')
        `);
      }
    });

    db.get("SELECT COUNT(*) as count FROM suppliers", (err, row) => {
      if (row && row.count === 0) {
        db.run(`
          INSERT INTO suppliers (name, contact_info, email)
          VALUES 
          ('Global Foods Inc.', 'John Doe - 555-0101', 'contact@globalfoods.com'),
          ('Local Farm Organics', 'Jane Smith - 555-0202', 'hello@localfarm.com')
        `);
      }
    });

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (row && row.count === 0) {
        db.run(`
          INSERT INTO products (product_name, sku, category, store_name, stock_level, picked_quantity, reorder_level, status, expiry_date)
          VALUES 
          ('Organic Rice', 'QR-001', 'Grains', 'Store A', 120, 30, 50, 'active', '2026-12-31'),
          ('Almond Milk', 'QR-002', 'Beverages', 'Store B', 45, 10, 20, 'active', '2026-07-15'),
          ('Chocolate Chip Cookies', 'QR-003', 'Snacks', 'Store A', 0, 0, 15, 'active', '2026-08-01')
        `);
        console.log("Database seeded with sample products, users, and suppliers.");
        
        db.run(`
          INSERT INTO sales (product_id, quantity, total_price, sale_date)
          VALUES 
          (1, 5, 25.00, datetime('now', '-5 days')),
          (1, 10, 50.00, datetime('now', '-3 days')),
          (1, 15, 75.00, datetime('now', '-1 days')),
          (2, 2, 8.00, datetime('now', '-4 days')),
          (2, 8, 32.00, datetime('now', '-2 days'))
        `);
      }
    });
  });
}

module.exports = pool;
