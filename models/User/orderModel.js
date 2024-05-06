const mongoose = require('mongoose') // Erase if already required
const orderStatus = require('../../utils/orderStatus')

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    orderItems: [],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ShippingInfo: {
      firstname: {
        type: 'string',
        required: true
      },
      lastname: {
        type: 'string',
        required: true
      },
      address: {
        type: 'string',
        required: true
      },
      country: {
        type: 'string',
        required: true
      },
      apartment: {
        type: 'string',
        required: true
      },
      city: {
        type: 'string',
        required: true
      },
      pincode: {
        type: 'String'
      }
    },
    // paymentInfo: {
    // },
    paidAt: { type: Date, default: Date.now() },
    totalPrice: { type: Number, required: true },
    totalPriceAfterDiscount: { type: Number, required: true },
    orderStatus: {
      type: String,
      default: 'Not Processed'
    },
    month: {
      type: String,
      default: new Date().getMonth()
    }
  },
  {
    timestamps: true
  }
)

//Export the model
module.exports = mongoose.model('Order', orderSchema)
