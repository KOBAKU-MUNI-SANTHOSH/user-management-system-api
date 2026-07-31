const Product = require("../models/Product");

// Get All Products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get Single Product
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};