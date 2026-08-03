const helmet = require("helmet");
const dns = require("dns");

// ==========================================
// DNS CONFIGURATION
// ==========================================

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

require("dotenv").config();


// ==========================================
// PACKAGES
// ==========================================

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");


// ==========================================
// DATABASE
// ==========================================

const connectDB = require("./database");


// ==========================================
// ROUTES
// ==========================================

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");


// ==========================================
// ERROR MIDDLEWARE
// ==========================================

const errorMiddleware =
    require("./middlewares/errorMiddleware");


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// TRUST RAILWAY PROXY
// ==========================================

// Railway runs the application behind a proxy.
// This allows express-rate-limit to correctly
// identify the user's IP address.

app.set("trust proxy", 1);


// ==========================================
// CONNECT MONGODB
// ==========================================

connectDB();


// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);


// ==========================================
// CORS
// ==========================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://user-management--production.up.railway.app"
        ],

        credentials: true
    })
);


// ==========================================
// BODY PARSERS
// ==========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==========================================
// COOKIE PARSER
// ==========================================

app.use(cookieParser());


// ==========================================
// STATIC FILES
// ==========================================

app.use(
    "/uploads",
    express.static("uploads")
);


// ==========================================
// ROUTES
// ==========================================

app.use(
    "/products",
    productRoutes
);

app.use(
    "/users",
    userRoutes
);


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Backend Bootcamp API Running 🚀"
    });

});


// ==========================================
// ERROR MIDDLEWARE
// ==========================================

app.use(errorMiddleware);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `🚀 Server Running on ${PORT}`
    );

});