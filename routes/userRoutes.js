const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const upload = require("../config/multerConfig");

const {
    registerValidation,
    loginValidation,
    updateProfileValidation
} = require("../middlewares/userValidation");

const validateMiddleware = require("../middlewares/validateMiddleware");

const {
    registerUser,
    loginUser,
    getProfile,
    getAllUsers,
    deleteUser,
    updateUserRole,
    uploadProfileImage,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/userController");

// ====================
// Admin Test Route
// ====================

router.get(
    "/admin",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin!"
        });
    }
);

// ====================
// Auth Routes
// ====================

router.post(
    "/register",
    registerValidation,
    validateMiddleware,
    registerUser
);

router.post(
    "/login",
    loginValidation,
    validateMiddleware,
    loginUser
);

// ====================
// User Routes
// ====================

router.get(
    "/profile",
    authMiddleware,
    getProfile
);
router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);
router.put(
    "/update",
    authMiddleware,
    updateProfileValidation,
    validateMiddleware,
    updateProfile
);

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.put(
    "/reset-password",
    resetPassword
);

router.post(
    "/upload",
    authMiddleware,
    upload.single("profile"),
    uploadProfileImage
);
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);
router.put(
    "/role/:id",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);
module.exports = router;