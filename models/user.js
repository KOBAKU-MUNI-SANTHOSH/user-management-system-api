const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: String,

    email: String,

    password: String,

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    profileImage: {
        type: String,
        default: ""
    },

    resetToken: {
        type: String,
        default: ""
    },

    resetTokenExpiry: Date

});

module.exports = mongoose.model("User", userSchema);