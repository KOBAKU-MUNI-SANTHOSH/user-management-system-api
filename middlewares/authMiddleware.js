const jwt = require("jsonwebtoken");



const authMiddleware = (req, res, next) => {

    // Get token from request header
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            message: "Access Denied. No Token."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid Token"
        });

    }

};

module.exports = authMiddleware;