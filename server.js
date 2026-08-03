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
//
// credentials: true is IMPORTANT because
// our refresh token is stored inside an
// HttpOnly cookie.
//
// We allow:
//
// 1. Local Vite frontend
// 2. Deployed Railway frontend
//
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

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==========================================
// COOKIE PARSER
// ==========================================
//
// Needed for:
//
// req.cookies.refreshToken
//
// ==========================================

app.use(
    cookieParser()
);


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
//
// IMPORTANT:
// Error middleware must remain AFTER routes.
//
// ==========================================

app.use(
    errorMiddleware
);


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