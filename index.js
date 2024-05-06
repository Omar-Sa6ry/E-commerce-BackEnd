const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const dotenv = require('dotenv').config() // To env
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dbConnect = require('./config/dbConnect')
const authRoute = require('./routes/User/authRoute')
const blogRoute = require('./routes/Blog/blogRoute')
const enquiryRoute = require('./routes/User/enqRoute')
const httpStatusText = require('./utils/httpStatusText')
const brandRoute = require('./routes/Product/brandRoute')
const colorRoute = require('./routes/Product/colorRoute')
const couponRoute = require('./routes/Product/couponRoute')
const uploadRouter = require('./routes/Product/uploadRoute')
const productRoute = require('./routes/Product/productRoute')
const blogCategoryRoute = require('./routes/Blog/BlogCategoryRoute')
const productCategoryRoute = require('./routes/Product/productCategoryRoute')

const app = express()
const PORT = process.env.PORT || 4000

dbConnect() // Database connection

// middlewales
app.use(cors())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(express.json({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }))

// Routes
app.use('/api/user', authRoute)
app.use('/api/blog', blogRoute)
app.use('/api/brand', brandRoute)
app.use('/api/color', colorRoute)
app.use('/api/coupon', couponRoute)
app.use('/api/upload', uploadRouter)
app.use('/api/product', productRoute)
app.use('/api/enquiry', enquiryRoute)
app.use('/api/blog-category', blogCategoryRoute)
app.use('/api/product-category', productCategoryRoute)

// Global middleware for not found router
app.use('*', (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: 'This resource is not available'
  })
})

// Global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500
  })
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
