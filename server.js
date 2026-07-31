require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./database");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/products", productRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend Bootcamp API Running 🚀"
    });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server Running on ${PORT}`);
});