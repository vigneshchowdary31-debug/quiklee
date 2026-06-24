const express = require('express');
const router = express.Router();
const { getSummary, getSalesReports } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/summary', getSummary);
router.get('/sales', getSalesReports);

module.exports = router;
