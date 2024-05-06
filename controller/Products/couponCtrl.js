const slugify = require('slugify')
const Coupon = require('../../models/Product/couponModel')
const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Coupon

const createCoupon = asyncHandler(async (req, res, next) => {
  const getBrnd = await Coupon.findOne({ title: req.body.name })
  if (!getBrnd) {
    const coupon = await Coupon.create(req.body)
    if (coupon) {
      res.json(coupon)
    } else {
      const error = appError.create(400, httpStatusText.ERROR)
      return next(error)
    }
  } else {
    const error = appError.create('coupon is Exit', 400, httpStatusText.ERROR)
    return next(error)
  }
})

// Get All Coupons

const getAllCoupons = asyncHandler(async (req, res, next) => {
  try {
    // Filtering

    const queryObject = { ...req.query }
    const excludeFiels = ['page', 'sort', 'limit', 'fields']
    excludeFiels.forEach(el => delete queryObject[el])

    let queryStr = JSON.stringify(queryObject)
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

    let query = Coupon.find(JSON.parse(queryStr))

    // Sorting by abcdefg
    if (req.query.sort) {
      const sortedBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortedBy)
    } else {
      query = query.sort('-createdAt')
    }

    // Limiting (which i select what i want to show in the page)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      query = query.select('-__v')
    }

    // Pagination (To organizate the page)
    const limit = req.query.limit
    const page = req.query.page
    const skip = (page - 1) * limit
    query = query.limit(limit).skip(skip)
    if (page) {
      const couponCount = await Coupon.countDocuments()
      if (skip >= couponCount) {
        const error = appError.create(
          'page is not exits',
          404,
          httpStatusText.ERROR
        )
        return next(error)
      }
    }

    const coupons = await query
    res.json(coupons)
  } catch (err) {
    res.render('faild400', { status: 'Not Verified' })
    const error = appError.create(
      'Some Things Went Wrong ,Please Try Again later',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Get Single Coupon

const getSingleCoupon = asyncHandler(async (req, res, next) => {
  const { name } = req.params
  try {
    const coupon = await Coupon.findOne({ name: name })

    if (coupon) {
      res.json(coupon)
    } else {
      const error = appError.create(
        'Coupon is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (error) {
    res.render('faild400', { status: 'Not Verified' })
  }
})

// Update Coupon

const updatedCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (coupon) {
      res.json(coupon)
    } else {
      const error = appError.create(
        'Coupon is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Coupon is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete Coupon

const deletedCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const coupon = await Coupon.findByIdAndDelete(id)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'Coupon is already deleted'
  })
})

module.exports = {
  createCoupon,
  getAllCoupons,
  getSingleCoupon,
  updatedCoupon,
  deletedCoupon
}
