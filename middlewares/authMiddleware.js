const jwt = require("jsonwebtoken");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const authMiddleware = (req, res, next) => {

    // Get Authorization header
    const authHeader =
        req.headers.authorization;


    // ======================================
    // CHECK IF HEADER EXISTS
    // ======================================

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });

    }


    // ======================================
    // CHECK BEARER FORMAT
    // Expected:
    // Authorization: Bearer TOKEN
    // ======================================

    if (!authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            success: false,
            message: "Invalid authorization format."
        });

    }


    // ======================================
    // EXTRACT TOKEN
    // ======================================

    const token =
        authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Access token not found."
        });

    }


    // ======================================
    // VERIFY ACCESS TOKEN
    // ======================================

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.SECRET_KEY
            );


        // Store decoded JWT information
        // for the next middleware/controller

        req.user = decoded;


        next();


    } catch (error) {


        // ==================================
        // TOKEN EXPIRED
        // ==================================

        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Access token expired.",

                code:
                    "TOKEN_EXPIRED"

            });

        }


        // ==================================
        // INVALID TOKEN
        // ==================================

        return res.status(401).json({

            success: false,

            message:
                "Invalid access token.",

            code:
                "INVALID_TOKEN"

        });

    }

};


module.exports = authMiddleware;