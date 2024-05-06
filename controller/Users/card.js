const appError = require('../../utils/appError')
const User = require('../../models/User/userModel')
const Cart = require('../../models/User/cartModel')
const asyncHandler = require('express-async-handler')
const Order = require('../../models/User/orderModel')
const Coupon = require('../../models/Product/couponModel')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// User Cart

const userCart = asyncHandler(async (req, res, next) => {
  const { productId, color, price, quantity } = req.body
  const { _id } = req.user
  validationMongoDbId(_id)

  try {
    const user = await User.findById(_id)

    const alreadyExistCart = await Cart.findOne({ orderby: user._id })
    if (alreadyExistCart) {
      alreadyExistCart.remove()
    }

    let newCart = await new Cart({
      userId: _id,
      color,
      price,
      productId,
      quantity
    }).save()
    res.json(newCart)
  } catch (error) {
    console.log(error)
    const err = appError.create(
      'Some Things Went Wrog',
      400,
      httpStatusText.FAIL
    )
    return next(err)
  }
})

// Get User Cart

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validationMongoDbId(_id)
  try {
    const cart = await Cart.find({ userId: _id })
      .populate('productId')
      .populate('color')
    res.json(cart)
  } catch (error) {
    console.log(error)
    const err = appError.create(
      'Some Things Went Wrog',
      400,
      httpStatusText.FAIL
    )
    return next(err)
  }
})

// Delete a Product Cart

const deleteProductCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { cartItemId } = req.params
  validationMongoDbId(_id)
  try {
    const cart = await Cart.findByIdAndDelete({ userId: _id, _id: cartItemId })
    res.json({
      status: httpStatusText.SUCCESS,
      message: 'Product is already deleted'
    })
  } catch (error) {
    console.log(error)
    const err = appError.create(
      'Some Things Went Wrog',
      400,
      httpStatusText.FAIL
    )
    return next(err)
  }
})

// Empty Cart

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validationMongoDbId(_id)
  try {
    const deleteCart = await Cart.deleteMany({ userId: _id })
    res.json({
      status: httpStatusText.SUCCESS,
      message: 'User is already deleted',
      data: { deleteCart }
    })
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update Quantity a Product Cart

const updateQuantity = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { cartItemId, quantity } = req.params
  validationMongoDbId(_id)

  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cartItemId
    })
    cartItem.quantity = quantity
    cartItem.save()
    res.json(cartItem)
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Apply The Coupon

const applyCoupon = asyncHandler(async (req, res, next) => {
  const { coupon } = req.body
  const { _id } = req.user
  validationMongoDbId(_id)

  try {
    const validCoupon = await Coupon.findOne({ name: coupon })
    if (validCoupon === null) {
      const error = appError.create('Invalid Coupon', 400, httpStatusText.FAIL)
      return next(error)
    } else {
      const user = await User.findOne({ _id })
      let { cartTotal } = await Cart.findOne({
        orderby: user._id
      }).populate('products.product')
      let totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
      ).toFixed(2)
      await Cart.findOneAndUpdate(
        { orderby: user._id },
        { totalAfterDiscount },
        { new: true }
      )
      res.json(totalAfterDiscount)
    }
  } catch (error) {
    console.log(error)
    const err = appError.create(
      'Some Things Went Wrog',
      400,
      httpStatusText.FAIL
    )
    return next(err)
  }
})

// Order

// Create Order

const createOrder = asyncHandler(async (req, res, next) => {
  const { _id } = req.user
  validationMongoDbId(_id)
  const {
    orderItems,
    ShippingInfo,
    // paymentInfo,
    totalPrice,
    totalPriceAfterDiscount
  } = req.body

  try {
    const orders = await Order.create({
      orderItems,
      ShippingInfo,
      // paymentInfo,
      totalPrice,
      totalPriceAfterDiscount,
      user: _id
    })
    const order = await orders.save()
    res.json(order)
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

//Get An Order

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validationMongoDbId(id)

  try {
    const orders = await Order.find({ user: _id })
    res.json(orders)
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Get All Orders

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const userAllorders = await Order.find().populate('user')
    res.json({ orders: userAllorders })
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Get Single Order

const getASingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const singleOrder = await Order.findOne({ _id: id })
      .populate('orderItems.product')
      .populate('orderItems.color')
    res.json({ order: singleOrder })
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update Order Status

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  validationMongoDbId(id)

  try {
    const updateOrderStatus = await Order.findOne({ _id: id })
    updateOrderStatus.orderStatus = req.body.status
    await updateOrderStatus.save()
    res.json(updateOrderStatus)
  } catch (error) {
    res.render('faild400', { status: error })
  }
})

// Get Months In Order

const getMonthsInOrder = asyncHandler(async (req, res, next) => {
  let monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  let d = new Date()
  let endDate = ''
  d.setDate(1)

  for (let i = 0; i < 11; i++) {
    d.setMonth(d.getMonth() + 1)
    endDate = monthNames[d.getMonth()] + ' ' + d.getFullYear()
  }

  const date = await Order.aggregate([
    // {
    //   $match: { createdAt: { $lte: new Date(), $gte: new Date(endDate) } }
    // },
    {
      $group: {
        _id: { month: '$month' },
        count: { $sum: 1 },
        amount: { $sum: '$totalPriceAfterDiscount' }
      }
    }
  ])
  res.json(date)
})

const getYearlyOrders = asyncHandler(async (req, res, next) => {
  let monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  let d = new Date()
  let endDate = ''
  d.setDate(1)

  for (let i = 0; i < 11; i++) {
    d.setMonth(d.getMonth() + 1)
    endDate = monthNames[d.getMonth()] + ' ' + d.getFullYear()
  }

  const date = await Order.aggregate([
    // {
    //   $match: { createdAt: { $lte: new Date(), $gte: new Date(endDate) } }
    // },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: '$totalPriceAfterDiscount' }
      }
    }
  ])
  res.json(date)
})

module.exports = {
  userCart,
  getUserCart,
  emptyCart,
  deleteProductCart,
  updateQuantity,
  applyCoupon,
  createOrder,
  getAllOrders,
  getASingleOrder,
  updateOrderStatus,
  getMyOrders,
  getMonthsInOrder,
  getYearlyOrders
}
