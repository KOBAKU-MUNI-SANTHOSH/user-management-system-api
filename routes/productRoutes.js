const express = require("express");
const router = express.Router();

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin Routes
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createProduct
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);

module.exports = router;