const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only."
        });
    }

    next();

};

module.exports = adminMiddleware;