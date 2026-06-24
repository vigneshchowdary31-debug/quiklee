const express = require('express');
const router = express.Router();
const {
  productValidation,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductDetail
} = require('../controllers/productController');
const { validate } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Apply auth middleware to all product routes
router.use(auth);

router.post('/', productValidation, validate, asyncHandler(createProduct));
router.get('/', asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProduct));
router.get('/:id/detail', asyncHandler(getProductDetail));
router.put('/:id', productValidation, validate, asyncHandler(updateProduct));
router.delete('/:id', asyncHandler(deleteProduct));

module.exports = router;
