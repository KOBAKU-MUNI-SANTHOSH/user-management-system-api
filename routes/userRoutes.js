const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");

const upload = require("../config/multerConfig");

const {
    registerValidation,
    loginValidation,
    updateProfileValidation
} = require("../middlewares/userValidation");

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

// Auth
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

// Profile
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

// Upload
router.post(
    "/upload",
    authMiddleware,
    upload.single("profile"),
    uploadProfileImage
);

// Admin
router.get(
    "/admin",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin!"
        });
    }
);

router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

router.put(
    "/role/:id",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

module.exports = router;