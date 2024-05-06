const slugify = require('slugify')
const Brand = require('../../models/Product/brandModel')
const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Brand

const createBrand = asyncHandler(async (req, res, next) => {
  const getBrnd = await Brand.findOne({ title: req.body.title })
  if (!getBrnd) {
    const brand = await Brand.create(req.body)
    if (brand) {
      res.json(brand)
    } else {
      const error = appError.create(400, httpStatusText.ERROR)
      return next(error)
    }
  } else {
    const error = appError.create('Brand is Exit', 400, httpStatusText.ERROR)
    return next(error)
  }
})

// Get All Brands

const getAllBrands = asyncHandler(async (req, res, next) => {
  // Filtering

  const queryObject = { ...req.query }
  const excludeFiels = ['page', 'sort', 'limit', 'fields']
  excludeFiels.forEach(el => delete queryObject[el])

  let queryStr = JSON.stringify(queryObject)
  queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

  let query = Brand.find(JSON.parse(queryStr))

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
    const brandCount = await Brand.countDocuments()
    if (skip >= brandCount) {
      const error = appError.create(
        'page is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  }

  const brands = await query
  res.json(brands)
})

// Get Single Brand

const getSingleBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const brand = await Brand.findById(id)
  if (brand) {
    res.json(brand)
  } else {
    const error = appError.create(
      'Brand is not exits',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update Brand

const updatedBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const brand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (brand) {
      res.json(brand)
    } else {
      const error = appError.create(
        'Brand is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Brand is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete Brand

const deletedBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const brand = await Brand.findByIdAndDelete(id)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'Brand is already deleted'
  })
})

module.exports = {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updatedBrand,
  deletedBrand
}
