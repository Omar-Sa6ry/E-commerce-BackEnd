const slugify = require('slugify')
const BCategory = require('../../models/Blog/blogCategoryModel')
const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Category

const createCategory = asyncHandler(async (req, res, next) => {
  const getBrnd = await BCategory.findOne({ title: req.body.title })
  if (!getBrnd) {
    const category = await BCategory.create(req.body)
    if (category) {
      res.json(category)
    } else {
      const error = appError.create(400, httpStatusText.ERROR)
      return next(error)
    }
  } else {
    const error = appError.create('category is Exit', 400, httpStatusText.ERROR)
    return next(error)
  }
})

// Get All Categories

const getAllCategories = asyncHandler(async (req, res, next) => {
  // Filtering

  const queryObject = { ...req.query }
  const excludeFiels = ['page', 'sort', 'limit', 'fields']
  excludeFiels.forEach(el => delete queryObject[el])

  let queryStr = JSON.stringify(queryObject)
  queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

  let query = BCategory.find(JSON.parse(queryStr))

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
    const categoryCount = await BCategory.countDocuments()
    if (skip >= categoryCount) {
      const error = appError.create(
        'page is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  }

  const categories = await query
  res.json(categories)
})

// Get Single Category

const getSingleCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const category = await BCategory.findById(id)
  if (category) {
    res.json(category)
  } else {
    const error = appError.create(
      'category is not exits',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update category

const updatedCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)

  try {
    if (req.body.title) {
      req.body.slug = slugify(req?.body.title)
    }

    const category = await BCategory.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (category) {
      res.json(category)
    } else {
      const error = appError.create(
        'category is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Category is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete category
const deletedCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const category = await BCategory.findByIdAndDelete(id)
  console.log(category)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'category is already deleted'
  })
})

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updatedCategory,
  deletedCategory
}
