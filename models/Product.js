const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    stock: {
        type: Number,
        default: 0
    },

    image: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);