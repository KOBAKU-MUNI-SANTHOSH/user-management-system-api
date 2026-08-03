const User = require("../models/user");


// ==========================================
// ADMIN AUTHORIZATION MIDDLEWARE
// ==========================================

const adminMiddleware = async (req, res, next) => {

    try {

        // Get the authenticated user
        // using the ID from the verified access token

        const user = await User
            .findById(req.user.id)
            .select("role");


        // ======================================
        // USER NOT FOUND
        // ======================================

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // ======================================
        // CHECK ADMIN ROLE
        // ======================================

        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access only"
            });

        }


        // ======================================
        // ADMIN VERIFIED
        // ======================================

        next();


    } catch (error) {

        console.error(
            "Admin authorization error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to verify admin access"
        });

    }

};


module.exports = adminMiddleware;