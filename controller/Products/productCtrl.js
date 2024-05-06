const slugify = require('slugify')
const appError = require('../../utils/appError')
const Product = require('../../models/Product/productModel')
const asyncHandler = require('express-async-handler')
const httpStatusText = require('../../utils/httpStatusText')
const User = require('../../models/User/userModel')

// Create a new Product

const createProduct = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }
    const newProduct = await Product.create(req.body)
    res.json(newProduct)
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'This Product is Exit,Please Change Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Get all products

const getAllProducts = asyncHandler(async (req, res, next) => {
  // Filtering

  const queryObject = { ...req.query }
  const excludeFiels = ['page', 'sort', 'limit', 'fields']
  excludeFiels.forEach(el => delete queryObject[el])

  let queryStr = JSON.stringify(queryObject)
  queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`)

  let query = Product.find(JSON.parse(queryStr))

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
    const productCount = await Product.countDocuments()
    if (skip >= productCount) {
      const error = appError.create(
        'page is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  }

  const products = await query
  res.json(products)
})

// Get a Single Product

const getSingleProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  try {
    const product = await Product.findById(id).populate('color')
    if (product) {
      res.json(product)
    } else {
      const error = appError.create(
        'Product is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    const error = appError.create(
      'Some Things Went Wrong',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Updated Product

const updatedProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true })
    if (product) {
      res.json(product)
    } else {
      const error = appError.create(
        'Product is not exits',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
  } catch (err) {
    const error = appError.create(
      'Product is exits , Change the Title Of Product',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Delete a product

const deletedProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const product = await Product.findByIdAndDelete(id)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'Product is already deleted'
  })
})

// Add To Wishlist

const addToWishlist = asyncHandler(async (req, res, next) => {
  const { _id } = req.user
  validationMongoDbId(_id)
  const { productId } = req.body

  const user = await User.findById(_id)
  const alreadyAdded = user.wishlist.find(id => id.toString() === productId)
  if (alreadyAdded) {
    let user = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: productId } },
      { new: true }
    )
    res.json(user)
  } else {
    let user = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: productId } },
      { new: true }
    )
    res.json(user)
  }
})

// Rating

const rating = asyncHandler(async (req, res, next) => {
  const { _id } = req.user
  validationMongoDbId(_id)
  const { firstname } = req.user
  const { lastname } = req.user
  const { star, prodId, comment } = req.body
  const name = firstname + ' ' + lastname

  try {
    const product = await Product.findById(prodId)

    if (!product) {
      const error = appError.create(
        'Product Is Not Exist',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }

    let alreadyRated = product?.ratings?.find(
      userId => userId?.postedby?.toString() === _id?.toString()
    )
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated }
        },
        {
          $set: { 'ratings.$.star': star, 'ratings.$.comment': comment }
        },
        {
          new: true
        }
      )
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              postedby: _id,
              name: name,
              star: star,
              comment: comment
            }
          }
        },
        {
          new: true
        }
      )
    }

    const getallratings = await Product.findById(prodId)
    let totalRating = getallratings?.ratings?.length
    let ratingsum = getallratings.ratings
      .map(item => item.star)
      .reduce((prev, curr) => prev + curr, 0)
    let actualRating = Math.round(ratingsum / totalRating)

    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating
      },
      { new: true }
    )

    res.json(finalproduct)
  } catch (err) {
    console.log(err)
    const error = appError.create(
      'Some Things Went Wrong',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updatedProduct,
  deletedProduct,
  addToWishlist,
  rating
}
