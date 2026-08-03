const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ================================
        // BASIC USER INFORMATION
        // ================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },


        // ================================
        // ROLE
        // ================================

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },


        // ================================
        // PROFILE IMAGE
        // ================================

        profileImage: {
            type: String,
            default: ""
        },


        // ================================
        // PASSWORD RESET
        // ================================

        // IMPORTANT:
        // We will store the HASHED reset
        // token here, not the raw token.

        resetToken: {
            type: String,
            default: ""
        },

        resetTokenExpiry: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "User",
    userSchema
);