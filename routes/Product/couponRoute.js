const express = require('express')
const CouponCtrl = require('../../controller/Products/couponCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post('/create-coupon', authMiddlewares, isAdmin, CouponCtrl.createCoupon)
router.get('/all-coupon', authMiddlewares, isAdmin, CouponCtrl.getAllCoupons)
router.get('/:name', CouponCtrl.getSingleCoupon)
router.put('/:id', authMiddlewares, isAdmin, CouponCtrl.updatedCoupon)
router.delete('/:id', authMiddlewares, isAdmin, CouponCtrl.deletedCoupon)

module.exports = router
