const express = require("express");

const router = express.Router();


// ======================================================
// MIDDLEWARE
// ======================================================

const authMiddleware =
    require("../middlewares/authMiddleware");

const adminMiddleware =
    require("../middlewares/adminMiddleware");

const validateMiddleware =
    require("../middlewares/validateMiddleware");

const upload =
    require("../config/multerConfig");

const authLimiter =
    require("../middlewares/rateLimitMiddleware");


// ======================================================
// VALIDATION
// ======================================================

const {
    registerValidation,
    loginValidation,
    updateProfileValidation
} = require(
    "../middlewares/userValidation"
);


// ======================================================
// CONTROLLERS
// ======================================================

const {
    registerUser,
    loginUser,

    // New
    refreshAccessToken,
    logoutUser,

    getProfile,
    getAllUsers,
    deleteUser,
    updateUserRole,
    uploadProfileImage,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
} = require(
    "../controllers/userController"
);


// ======================================================
// AUTH ROUTES
// ======================================================


// REGISTER

router.post(
    "/register",

    authLimiter,

    registerValidation,

    validateMiddleware,

    registerUser
);


// LOGIN

router.post(
    "/login",

    authLimiter,

    loginValidation,

    validateMiddleware,

    loginUser
);


// ======================================================
// REFRESH TOKEN
// ======================================================

router.post(
    "/refresh",
    refreshAccessToken
);


// ======================================================
// LOGOUT
// ======================================================

router.post(
    "/logout",
    logoutUser
);


// ======================================================
// PROFILE
// ======================================================

router.get(
    "/profile",

    authMiddleware,

    getProfile
);


router.put(
    "/update",

    authMiddleware,

    updateProfileValidation,

    validateMiddleware,

    updateProfile
);


// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
    "/change-password",

    authMiddleware,

    changePassword
);


// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post(
    "/forgot-password",

    authLimiter,

    forgotPassword
);


// ======================================================
// RESET PASSWORD
// ======================================================

router.put(
    "/reset-password",

    resetPassword
);


// ======================================================
// PROFILE IMAGE UPLOAD
// ======================================================

router.post(
    "/upload",

    authMiddleware,

    upload.single("profile"),

    uploadProfileImage
);


// ======================================================
// ADMIN TEST ROUTE
// ======================================================

router.get(
    "/admin",

    authMiddleware,

    adminMiddleware,

    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Welcome Admin!"

        });

    }
);


// ======================================================
// GET ALL USERS
// ======================================================

router.get(
    "/all",

    authMiddleware,

    adminMiddleware,

    getAllUsers
);


// ======================================================
// UPDATE USER ROLE
// ======================================================

router.put(
    "/role/:id",

    authMiddleware,

    adminMiddleware,

    updateUserRole
);


// ======================================================
// DELETE USER
// ======================================================

router.delete(
    "/:id",

    authMiddleware,

    adminMiddleware,

    deleteUser
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;