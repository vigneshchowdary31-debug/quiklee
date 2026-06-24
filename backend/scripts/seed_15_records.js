const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../quiklee_inventory.db');
const db = new sqlite3.Database(dbPath);

const products = [
  { product_name: 'Apple iPad Pro', sku: 'IPD-PRO-256', category: 'Electronics', store_name: 'Downtown', stock_level: 15, picked_quantity: 2, reorder_level: 5, status: 'active', supplier_id: 1, last_updated: new Date().toISOString() },
  { product_name: 'Samsung Galaxy S23', sku: 'SGS-23-128', category: 'Electronics', store_name: 'Uptown', stock_level: 0, picked_quantity: 5, reorder_level: 10, status: 'active', supplier_id: 2, last_updated: new Date().toISOString() },
  { product_name: 'Sony WH-1000XM5', sku: 'SNY-WH-XM5', category: 'Audio', store_name: 'Downtown', stock_level: 3, picked_quantity: 1, reorder_level: 5, status: 'active', supplier_id: 1, last_updated: new Date().toISOString() },
  { product_name: 'Dell XPS 15', sku: 'DLL-XPS-15', category: 'Computers', store_name: 'Midtown', stock_level: 25, picked_quantity: 0, reorder_level: 8, status: 'active', supplier_id: 3, last_updated: new Date().toISOString() },
  { product_name: 'Apple MacBook Air', sku: 'MBA-M2-512', category: 'Computers', store_name: 'Uptown', stock_level: 12, picked_quantity: 3, reorder_level: 10, status: 'active', supplier_id: 1, last_updated: new Date().toISOString() },
  { product_name: 'Nintendo Switch OLED', sku: 'NIN-SW-OLED', category: 'Gaming', store_name: 'Downtown', stock_level: 40, picked_quantity: 10, reorder_level: 15, status: 'active', supplier_id: 4, last_updated: new Date().toISOString() },
  { product_name: 'PlayStation 5', sku: 'PS5-DISC', category: 'Gaming', store_name: 'Midtown', stock_level: 0, picked_quantity: 20, reorder_level: 5, status: 'active', supplier_id: 4, last_updated: new Date().toISOString() },
  { product_name: 'Logitech MX Master 3S', sku: 'LOG-MXM-3S', category: 'Accessories', store_name: 'Uptown', stock_level: 5, picked_quantity: 2, reorder_level: 5, status: 'active', supplier_id: 3, last_updated: new Date().toISOString() },
  { product_name: 'LG C3 OLED TV', sku: 'LG-C3-65', category: 'Electronics', store_name: 'Downtown', stock_level: 8, picked_quantity: 1, reorder_level: 3, status: 'active', supplier_id: 2, last_updated: new Date().toISOString() },
  { product_name: 'Dyson V15 Detect', sku: 'DYS-V15-DET', category: 'Home', store_name: 'Midtown', stock_level: 18, picked_quantity: 4, reorder_level: 5, status: 'active', supplier_id: 5, last_updated: new Date().toISOString() },
  { product_name: 'Bose QuietComfort Earbuds', sku: 'BOS-QC-EAR', category: 'Audio', store_name: 'Uptown', stock_level: 2, picked_quantity: 8, reorder_level: 10, status: 'active', supplier_id: 1, last_updated: new Date().toISOString() },
  { product_name: 'Samsung 990 Pro 2TB', sku: 'SAM-990-2TB', category: 'Components', store_name: 'Downtown', stock_level: 30, picked_quantity: 5, reorder_level: 15, status: 'active', supplier_id: 2, last_updated: new Date().toISOString() },
  { product_name: 'Kindle Paperwhite', sku: 'KIN-PW-16GB', category: 'Electronics', store_name: 'Midtown', stock_level: 50, picked_quantity: 15, reorder_level: 20, status: 'active', supplier_id: 3, last_updated: new Date().toISOString() },
  { product_name: 'Apple Watch Series 9', sku: 'AWS-9-45', category: 'Wearables', store_name: 'Uptown', stock_level: 0, picked_quantity: 6, reorder_level: 10, status: 'active', supplier_id: 1, last_updated: new Date().toISOString() },
  { product_name: 'GoPro HERO12 Black', sku: 'GOP-H12-BLK', category: 'Cameras', store_name: 'Downtown', stock_level: 22, picked_quantity: 3, reorder_level: 8, status: 'active', supplier_id: 5, last_updated: new Date().toISOString() }
];

db.serialize(() => {
  products.forEach((p) => {
    db.run(
      `INSERT INTO products (product_name, sku, category, store_name, stock_level, picked_quantity, reorder_level, status, supplier_id, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.product_name, p.sku, p.category, p.store_name, p.stock_level, p.picked_quantity, p.reorder_level, p.status, p.supplier_id, p.last_updated],
      function (err) {
        if (err) console.error("Error inserting:", err);
        else console.log(`Inserted ${p.product_name} with ID ${this.lastID}`);
      }
    );
  });
});

db.close(() => console.log('Seeding finished.'));
