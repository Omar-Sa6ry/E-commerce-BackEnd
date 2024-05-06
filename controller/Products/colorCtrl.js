const slugify = require('slugify')
const Color = require('../../models/Product/colorModel')
const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Color
const createColor = asyncHandler(async (req, res, next) => {
  const getBrnd = await Color.findOne({ title: req.body.title })
  if (!getBrnd) {
    const color = await Color.create(req.body)
    if (color) {
      res.json(color)
    } else {
      const error = appError.create(400, httpStatusText.ERROR)
      return next(error)
    }
  } else {
    const error = appError.create('color is Exit', 400, httpStatusText.ERROR)
    return next(error)
  }
})

// Get All Colors

const getAllColors = asyncHandler(async (req, res, next) => {
  // Filtering

  const queryObject = { ...req.query }
  const excludeFiels = ['page', 'sort', 'limit', 'fields']
  excludeFiels.forEach(el => delete queryObject[el])

  let queryStr = JSON.stringify(queryObject)
  queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

  let query = Color.find(JSON.parse(queryStr))

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
  Color
  // Pagination (To organizate the page)
  const limit = req.query.limit
  const page = req.query.page
  const skip = (page - 1) * limit
  query = query.limit(limit).skip(skip)
  if (page) {
    const colorCount = await Color.countDocuments()
    if (skip >= colorCount) {
      const error = appError.create(
        'page is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  }

  const colors = await query
  res.json(colors)
})

// Get Single Color

const getSingleColor = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const color = await Color.findById(id)
  if (color) {
    res.json(color)
  } else {
    const error = appError.create(
      'Color is not exits',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update Color

const updatedColor = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const color = await Color.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (color) {
      res.json(color)
    } else {
      const error = appError.create(
        'Color is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Color is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete Color

const deletedColor = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const color = await Color.findByIdAndDelete(id)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'Color is already deleted'
  })
})

module.exports = {
  createColor,
  getAllColors,
  getSingleColor,
  updatedColor,
  deletedColor
}
