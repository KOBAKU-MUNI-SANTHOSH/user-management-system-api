const User = require("../models/user");

const adminMiddleware = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access only"
            });

        }

        next();

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = adminMiddleware;