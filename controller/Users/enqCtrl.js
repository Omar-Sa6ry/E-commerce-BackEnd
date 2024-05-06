const appError = require('../../utils/appError')
const asyncHandler = require('express-async-handler')
const Enquiry = require('../../models/User/enqModel')
const httpStatusText = require('../../utils/httpStatusText')
const validationMongoDbId = require('../../utils/validationMongoDbId')

// Create a new Enquiry
const createEnquiry = asyncHandler(async (req, res) => {
  const getEnquiry = await Enquiry.findOne({ title: req?.body?.title })
  if (!getEnquiry) {
    const enquiry = await Enquiry.create(req.body)
    if (enquiry) {
      res.json(enquiry)
    } else {
      const error = appError.create(400, httpStatusText.FAIL)
      return next(error)
    }
  } else {
    const error = appError.create('enquiry is Exit', 400, httpStatusText.FAIL)
    return next(error)
  }
})

// Delete Enquiry

const deletedEnquiry = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  validationMongoDbId(id)
  const enquiry = await Enquiry.findByIdAndDelete(id)
  res.json({
    status: httpStatusText.SUCCESS,
    message: 'Enquiry is already deleted'
  })
})

// Get Single Enquiry

const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params
  validationMongoDbId(id)
  try {
    const getaEnquiry = await Enquiry.findById(id)
    res.json(getaEnquiry)
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

// Delete All Enquiries

const getallEnquiry = asyncHandler(async (req, res) => {
  try {
    const getallEnquiry = await Enquiry.find()
    res.json(getallEnquiry)
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

// Update Enquiry

const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params
  validationMongoDbId(id)
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true
    })
    res.json(updatedEnquiry)
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
  createEnquiry,
  deletedEnquiry,
  getEnquiry,
  getallEnquiry,
  updateEnquiry
}
