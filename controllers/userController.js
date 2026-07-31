const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");

// ================= Register User =================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Login User =================

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Profile =================

const getProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user);

});

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Update Role =================

const updateUserRole = async (req, res) => {
    try {

        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            message: "User role updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Upload Image =================

const uploadProfileImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.profileImage = req.file.path;

        await user.save();

        res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: user.profileImage
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Update Profile =================

const updateProfile = async (req, res) => {
    try {

        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = name;
        user.email = email;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Change Password =================

const changePassword = async (req, res) => {
    try {

        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Forgot Password =================

const forgotPassword = async (req, res) => {
    try {

        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        await user.save();

        res.status(200).json({
            message: "Password reset token generated successfully",
            resetToken
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= Reset Password =================

const resetPassword = async (req, res) => {
    try {

        const { resetToken, newPassword } = req.body;

        const user = await User.findOne({
            resetToken
        });

        if (!user) {
            return res.status(404).json({
                message: "Invalid reset token"
            });
        }

        if (user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({
                message: "Reset token expired"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = "";
        user.resetTokenExpiry = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
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
};