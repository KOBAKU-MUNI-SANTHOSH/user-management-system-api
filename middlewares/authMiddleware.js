const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            success: false,
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

    } catch (err) {

        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });

    }

};

module.exports = authMiddleware;