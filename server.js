const helmet = require("helmet");
const dns = require("dns");

// DNS configuration
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Environment variables
require("dotenv").config();

// Packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Database
const connectDB = require("./database");

// Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

// Error Middleware
const errorMiddleware = require("./middlewares/errorMiddleware");

// Create Express app
const app = express();

// Connect MongoDB
connectDB();

// ================================
// MIDDLEWARES
// ================================

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// ================================
// STATIC FILES
// ================================

app.use("/uploads", express.static("uploads"));

// ================================
// ROUTES
// ================================

app.use("/products", productRoutes);
app.use("/users", userRoutes);

// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend Bootcamp API Running 🚀"
    });
});

// ================================
// ERROR MIDDLEWARE
// IMPORTANT: Keep this AFTER routes
// ================================

app.use(errorMiddleware);

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server Running on ${PORT}`);
});