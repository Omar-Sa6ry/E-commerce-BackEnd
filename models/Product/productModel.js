const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      tirm: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    totalrating: {
      type: String,
      default: 0
    },
    ratings: [
      {
        star: Number,
        name: String,
        comment: String,
        postedby: { type: mongoose?.Schema?.Types?.ObjectId, ref: 'User' }
      }
    ],
    images: [
      {
        public_id: String,
        url: String
      }
    ],
    sold: {
      type: Number,
      default: 0
    },
    brand: {
      type: String,
      required: true
    },
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],
    tags: String
  },
  { timestamps: true }
)

//Export the model
module.exports = mongoose.model('Product', productSchema)