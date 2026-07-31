require("dotenv").config();

const express = require("express");
const connectDB = require("./database");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/products", productRoutes);
app.use("/users", userRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("🚀 Backend Bootcamp API is Running...");
});

// Start Server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
});