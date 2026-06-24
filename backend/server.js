require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const sanitizeInput = require('./middleware/sanitizeMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// Public health check and base path
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);

// Page fallback or standard static delivery if needed, else API only
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(require('path').join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => res.sendFile(require('path').resolve(__dirname, '../frontend/dist', 'index.html')));
} else {
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
