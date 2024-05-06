const slugify = require('slugify')
const Blog = require('../../models/Blog/blogModel')
const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Blog

const createBlog = asyncHandler(async (req, res, next) => {
  const createBlog = await Blog.create(req.body)
  if (createBlog) {
    res.json(createBlog)
  } else {
    const error = appError.create(400, httpStatusText.FAIL)
    return next(error)
  }
})

// Get All Blogs

const getAllBlogs = asyncHandler(async (req, res, next) => {
  // Filtering

  const queryObject = { ...req.query }
  const excludeFiels = ['page', 'sort', 'limit', 'fields']
  excludeFiels.forEach(el => delete queryObject[el])

  let queryStr = JSON.stringify(queryObject)
  queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

  let query = Blog.find(JSON.parse(queryStr))

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
    const blogCount = await Blog.countDocuments()
    if (skip >= blogCount) {
      const error = appError.create(
        'page is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  }

  const blogs = await query
  res.json(blogs)
})

// Get Single Blog

const getSingleBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  let blog = await Blog.findById(id).populate('likes').populate('dislikes')

  // To +1 to number of views
  blog = await Blog.findByIdAndUpdate(
    id,
    { $inc: { numViews: 1 } },
    { new: true }
  )

  if (blog) {
    res.json(blog)
  } else {
    const error = appError.create(
      'Blog is not exits',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

// Update Blog

const updatedBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true })
    if (blog) {
      res.json(blog)
    } else {
      const error = appError.create(
        'Blog is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Blog is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete a blog

const deletedBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  try {
    const blog = await Blog.findByIdAndDelete(id)
    res.json({
      status: httpStatusText.SUCCESS,
      message: 'Blog is already deleted'
    })
  } catch (error) {
    console.log(error)
    res.render('fails400', { status: 'Not Verified' })
  }
})

module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updatedBlog,
  deletedBlog
}
