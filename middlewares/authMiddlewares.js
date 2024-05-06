const jwt = require('jsonwebtoken')
const User = require('../models/User/userModel')
const userRols = require('../utils/userRols')
const asyncHandler = require('express-async-handler')
const appError = require('../utils/appError')
const httpStatusText = require('../utils/httpStatusText')

const authMiddlewares = asyncHandler(async (req, res, next) => {
  let token
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decoded?.id)
        req.user = user
        next()
      }
    } catch (err) {
      const error = appError.create(
        'Not Authorized token expired ,Please Login again',
        400,
        httpStatusText.FAIL
      )
      return next(error)
    }
  } else {
    const error = appError.create(
      'there is no token attached to headers',
      400,
      httpStatusText.ERROR
    )
    return next(error)
  }
  if (!req.user) {
    const error = appError.create(
      'Not Authorized token expired ,Please Login again',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }
})

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user
  const adminUser = await User.findOne({ email })
  console.log(adminUser?.roles)
  if (adminUser.roles !== userRols.ADMIN) {
    const error = appError.create('You are not Admin', 400, httpStatusText.FAIL)
    return next(error)
  } else {
    next()
  }
})

module.exports = { authMiddlewares, isAdmin }
