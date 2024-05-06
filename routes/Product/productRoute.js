const express = require('express')
const productCtrl = require('../../controller/Products/productCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post(
  '/create-product',
  authMiddlewares,
  isAdmin,
  productCtrl.createProduct
)
router.get('/all-products', productCtrl.getAllProducts)
router.get('/:id', productCtrl.getSingleProduct)
router.put('/:id', authMiddlewares, isAdmin, productCtrl.updatedProduct)
router.delete('/:id', authMiddlewares, isAdmin, productCtrl.deletedProduct)
router.put('/wishlist/:id', authMiddlewares, productCtrl.addToWishlist)
router.put('/rating/:id', authMiddlewares, productCtrl.rating)

module.exports = router