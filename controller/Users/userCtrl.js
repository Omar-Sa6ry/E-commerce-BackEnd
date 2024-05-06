const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const appError = require('../../utils/appError')
const userRoles = require('../../utils/userRols')
const User = require('../../models/User/userModel')
const asyncHandler = require('express-async-handler')
const { generateToken } = require('../../config/jwtToken')
const httpStatusText = require('../../utils/httpStatusText')
const { generateRefreshToken } = require('../../config/RefreshToken')
const validationMongoDbId = require('../../utils/validationMongoDbId')

const PORT = process.env.PORT || 4000

// Register
const register = asyncHandler(async (req, res, next) => {
  const email = req.body.email
  const mobile = req.body.mobile

  const findEmail = await User.findOne({ email: email })
  const findPhone = await User.findOne({ mobile: mobile })

  if (!findEmail && !findPhone) {
    // Create User
    const newUser = await User.create(req.body)
    return res.json({
      _id: newUser?._id,
      firstname: newUser?.firstname,
      lastname: newUser?.lastname,
      email: newUser?.email,
      mobile: newUser?.mobile,
      password: newUser?.password,
      token: generateToken(newUser?._id)
    })
  } else if (findPhone) {
    const error = appError.create(
      'Mobile is existed ,Change Mobile Phone',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  } else {
    const error = appError.create(
      'User is existed ,Change Email',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// Login

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  try {
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
      const erro = appError.create(
        'Email is not Exist',
        400,
        httpStatusText.FAIL
      )
      return next(erro)
    } else {
      const confirmationPassword = await findUser.isPasswordMatched(password)
      if (findUser && confirmationPassword) {
        const refreshToken = await generateRefreshToken(findUser?._id) // Refresh token
        const updatedUser = await User.findByIdAndUpdate(
          findUser?.id,
          {
            refreshToken: refreshToken
          },
          {
            new: true
          }
        )
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000
        })
        return res.json({
          _id: findUser?._id,
          firstname: findUser?.firstname,
          lastname: findUser?.lastname,
          email: findUser?.email,
          mobile: findUser?.mobile,
          password: findUser?.password,
          token: generateToken(findUser?._id)
        })
      } else {
        const error = appError.create(
          'Password is Wrong',
          400,
          httpStatusText.FAIL
        )
        return next(error)
      }
    }
  } catch (err) {
    const error = appError.create(
      'Some Things Went Wrong ,Please Try Again later',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }
})

// LoginAdmin

const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  try {
    const findAdmin = await User.findOne({ email })

    if (!findAdmin) {
      const erro = appError.create(
        'Email is not Exist',
        400,
        httpStatusText.FAIL
      )
      return next(erro)
    }

    if (findAdmin?.roles !== userRoles?.ADMIN) {
      const error = appError.create('Not Authorised', 400, httpStatusText.FAIL)
      return next(error)
    } else {
      const confirmationPassword = await findAdmin.isPasswordMatched(password)
      if (findAdmin && confirmationPassword) {
        const refreshToken = await generateRefreshToken(findAdmin?._id) // Refresh token
        const updatedUser = await User.findByIdAndUpdate(
          findAdmin.id,
          {
            refreshToken: refreshToken
          },
          {
            new: true
          }
        )
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000
        })
        return res.json({
          _id: findAdmin?._id,
          firstname: findAdmin?.firstname,
          lastname: findAdmin?.lastname,
          email: findAdmin?.email,
          mobile: findAdmin?.mobile,
          password: findAdmin?.password,
          token: generateToken(findAdmin?._id)
        })
      } else {
        const error = appError.create('Invalid User', 400, httpStatusText.FAIL)
        return next(error)
      }
    }
  } catch (err) {
    console.log(err)
    const error = appError.create('Invalid User', 400, httpStatusText.FAIL)
    return next(error)
  }
})

// Update the User

const updatedUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.user
  validationMongoDbId(_id)

  const findEmail = await User.findOne({ email: req?.body?.email })
  const findPhone = await User.findOne({ mobile: req?.body?.mobile })

  if (findPhone) {
    const error = appError.create(
      'Mobile is existed ,Change Mobile Phone',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  } else if (findEmail) {
    const error = appError.create(
      'User is existed ,Change Email',
      400,
      httpStatusText.FAIL
    )
    return next(error)
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile
      },
      {
        new: true
      }
    )
    res.json(updatedUser)
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

// Change Password

const changePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { password } = req.body
  validationMongoDbId(_id)
  const user = await User.findById(_id)
  if (password) {
    user.password = password
    const changePassword = await user.save()
    res.json(changePassword)
  } else {
    res.json(user)
  }
})

// Forget The Password

const forgotPasswordToken = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  try {
    const oldUser = await User.findOne({ email })
    if (!oldUser) {
      const error = appError.create(
        'User is not Exited',
        404,
        httpStatusText.ERROR
      )
      return next(error)
    }
    const userName = oldUser?.firstname
    const secret = process.env.JWT_SECRET_KEY + oldUser?.password
    const token = jwt.sign(
      { email: oldUser?.email, id: oldUser?._id },
      secret,
      {
        expiresIn: '5m'
      }
    )
    const link = `http://localhost:${PORT}/api/user/reset-password/${oldUser?._id}/${token}`

    try {
      // Send Email For Gmail
      const data = {
        to: email,
        text: `Hey ${userName}`,
        subject: 'Forget Password Link',
        html: link
      }
      sendEmail(data)
      res.json('Email sent successfully')
    } catch (error) {
      const err = appError.create(
        'Some Things Went Wrog When Send Link',
        400,
        httpStatusText.FAIL
      )
      return next(err)
    }
  } catch (error) {
    const err = appError.create(
      'Some Things Went Wrog',
      400,
      httpStatusText.FAIL
    )
    return next(err)
  }
})

// Reset The Password

const getResetPassword = asyncHandler(async (req, res, next) => {
  const { id, token } = req.params

  const oldUser = await User.findOne({ _id: id })
  if (!oldUser) {
    const error = appError.create(
      'User is not Exited',
      404,
      httpStatusText.ERROR
    )
    return next(error)
  }

  const secret = process.env.JWT_SECRET_KEY + oldUser.password
  try {
    const verify = jwt.verify(token, secret)
    res.render('resetPassword', { email: verify.email, status: 'Not Verified' })
  } catch (error) {
    res.render('error404', { status: 'Not Verified' })
  }
})

const postResetPassword = asyncHandler(async (req, res, next) => {
  const { id, token } = req.params
  const { password } = req.body

  const oldUser = await User.findOne({ _id: id })
  if (!oldUser) {
    return res.json({ status: 'User is Not Existed!' })
  }

  const secret = process.env.JWT_SECRET_KEY + oldUser?.password
  try {
    const verify = jwt.verify(token, secret)
    const encryptedPassword = await bcrypt.hash(password, 10)
    const userr = await User.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          password: encryptedPassword
        }
      }
    )
    res.redirect('http://localhost:3001/login')
  } catch (error) {
    res.render('faild400', { status: 'Not Verified' })
  }
})

// Get Wishlist

const getWishlist = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user
    const findUser = await User.findById(_id).populate('wishlist')
    res.json(findUser)
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

module.exports = {
  register,
  login,
  loginAdmin,
  updatedUser,
  changePassword,
  forgotPasswordToken,
  getResetPassword,
  postResetPassword,
  getWishlist
}
