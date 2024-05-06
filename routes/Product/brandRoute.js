const express = require('express')
const BrandCtrl = require('../../controller/Products/brandCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post(
  '/create-brand',
  authMiddlewares,
  isAdmin,
  BrandCtrl.createBrand
)
router.get('/all-Brand', BrandCtrl.getAllBrands)
router.get('/:id', BrandCtrl.getSingleBrand)
router.put('/:id', authMiddlewares, isAdmin, BrandCtrl.updatedBrand)
router.delete('/:id', authMiddlewares, isAdmin, BrandCtrl.deletedBrand)

module.exports = router
