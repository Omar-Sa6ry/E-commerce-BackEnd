const express = require('express')
const userAuth = require('../../controller/Users/userCtrl')
const userOrderAndcarts = require('../../controller/Users/card')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

// User Controller

router.post('/login', userAuth.login)
router.post('/register', userAuth.register)
router.get('/reset-password/:id/:token', userAuth.getResetPassword)
router.post('/reset-password/:id/:token', userAuth.postResetPassword)
router.post('/Forgot-Password-Token', userAuth.forgotPasswordToken)
router.put('/Change-Password', authMiddlewares, userAuth.changePassword)
router.post('/admin-login', userAuth.loginAdmin)
router.get('/wishlist/:id', authMiddlewares, userAuth.getWishlist)
router.put('/edit-user', authMiddlewares, userAuth.updatedUser)

// User Order & cart

router.get(
  '/order/getAllorder',
  authMiddlewares,
  isAdmin,
  userOrderAndcarts.getAllOrders
)

router.get(
  '/order/getASingleorder/:id',
  authMiddlewares,
  isAdmin,
  userOrderAndcarts.getASingleOrder
)

router.post('/cart', authMiddlewares, userOrderAndcarts.userCart)
router.get('/cart', authMiddlewares, userOrderAndcarts.getUserCart)
router.delete('/cart/empty-cart', authMiddlewares, userOrderAndcarts.emptyCart)
router.delete(
  '/update-product-cart/:cartItemId/:quantity',
  authMiddlewares,
  userOrderAndcarts.updateQuantity
)

router.post(
  '/cart/apply-coupon',
  authMiddlewares,
  userOrderAndcarts.applyCoupon
)
router.post(
  '/cart/create-order',
  authMiddlewares,
  userOrderAndcarts.createOrder
)
router.get(
  '/order/get-my-order',
  authMiddlewares,
  userOrderAndcarts.getMyOrders
)
router.put(
  '/order/update-order/:id',
  authMiddlewares,
  isAdmin,
  userOrderAndcarts.updateOrderStatus
)
router.get('/order/getMonthWithOrders', userOrderAndcarts.getMonthsInOrder)
router.get('/order/getYearlyOrders', userOrderAndcarts.getYearlyOrders)

module.exports = router
