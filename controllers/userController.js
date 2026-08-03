const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");
const transporter = require("../config/emailConfig");


// ======================================================
// TOKEN HELPERS
// ======================================================

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.SECRET_KEY,
        {
            expiresIn: "15m"
        }
    );
};


const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        process.env.REFRESH_SECRET_KEY,
        {
            expiresIn: "7d"
        }
    );
};


// ======================================================
// COOKIE OPTIONS
// ======================================================

const getRefreshCookieOptions = () => {
    return {
        httpOnly: true,

        secure:
            process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",

        maxAge:
            7 * 24 * 60 * 60 * 1000
    };
};


// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;


        const existingUser =
            await User.findOne({
                email
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already exists"
            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await User.create({
                name,
                email,
                password: hashedPassword
            });


        res.status(201).json({
            message:
                "User registered successfully",

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


// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await User.findOne({
                email
            });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const accessToken =
            generateAccessToken(user);


        const refreshToken =
            generateRefreshToken(user);


        res.cookie(
            "refreshToken",
            refreshToken,
            getRefreshCookieOptions()
        );


        res.status(200).json({
            message:
                "Login Successful",

            token: accessToken,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

const refreshAccessToken = async (req, res) => {
    try {

        const refreshToken =
            req.cookies.refreshToken;


        if (!refreshToken) {

            return res.status(401).json({
                message:
                    "Refresh token not found"
            });

        }


        let decoded;


        try {

            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET_KEY
            );

        } catch (error) {

            return res.status(401).json({
                message:
                    "Invalid or expired refresh token"
            });

        }


        const user =
            await User.findById(
                decoded.id
            );


        if (!user) {

            return res.status(401).json({
                message:
                    "User no longer exists"
            });

        }


        const newAccessToken =
            generateAccessToken(user);


        res.status(200).json({
            message:
                "Access token refreshed successfully",

            token: newAccessToken
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// LOGOUT
// ======================================================

const logoutUser = async (req, res) => {
    try {

        res.clearCookie(
            "refreshToken",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "none"
                        : "lax"
            }
        );


        res.status(200).json({
            message:
                "Logged out successfully"
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// GET PROFILE
// ======================================================

const getProfile =
    asyncHandler(async (req, res) => {

        const user =
            await User
                .findById(req.user.id)
                .select("-password");


        if (!user) {

            res.status(404);

            throw new Error(
                "User not found"
            );

        }


        res.status(200).json(user);

    });


// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (req, res) => {
    try {

        const users =
            await User
                .find()
                .select("-password");


        res.status(200).json(users);


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUser = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        await user.deleteOne();


        res.status(200).json({
            message:
                "User deleted successfully"
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// UPDATE USER ROLE
// ======================================================

const updateUserRole = async (req, res) => {
    try {

        const {
            role
        } = req.body;


        if (
            !["user", "admin"]
                .includes(role)
        ) {

            return res.status(400).json({
                message:
                    "Invalid role"
            });

        }


        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        user.role = role;

        await user.save();


        res.status(200).json({
            message:
                "User role updated successfully",

            user
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// UPLOAD PROFILE IMAGE
// ======================================================

const uploadProfileImage = async (req, res) => {
    try {

        if (!req.file) {

            return res.status(400).json({
                message:
                    "Please upload an image"
            });

        }


        const user =
            await User.findById(
                req.user.id
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        user.profileImage =
            req.file.path;


        await user.save();


        res.status(200).json({
            message:
                "Profile image uploaded successfully",

            profileImage:
                user.profileImage
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (req, res) => {
    try {

        const {
            name,
            email
        } = req.body;


        const user =
            await User.findById(
                req.user.id
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        user.name = name;
        user.email = email;


        await user.save();


        res.status(200).json({
            message:
                "Profile updated successfully",

            user
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (req, res) => {
    try {

        const {
            oldPassword,
            newPassword
        } = req.body;


        const user =
            await User.findById(
                req.user.id
            );


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        const isMatch =
            await bcrypt.compare(
                oldPassword,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({
                message:
                    "Old password is incorrect"
            });

        }


        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await user.save();


        res.status(200).json({
            message:
                "Password changed successfully"
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;


        // ==================================================
        // FIND USER
        // ==================================================

        const user = await User.findOne({
            email
        });


        // ==================================================
        // SECURITY
        //
        // Always return the same response even if the email
        // doesn't exist.
        // ==================================================

        if (!user) {

            return res.status(200).json({
                message:
                    "If an account exists with that email, a password reset link has been sent."
            });

        }


        // ==================================================
        // GENERATE RAW RESET TOKEN
        // ==================================================

        const resetToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        // ==================================================
        // HASH RESET TOKEN
        //
        // Raw token    -> Email
        // Hashed token -> MongoDB
        // ==================================================

        const hashedResetToken =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        // ==================================================
        // SAVE HASHED TOKEN + EXPIRY
        // ==================================================

        user.resetToken = hashedResetToken;

        user.resetTokenExpiry =
            Date.now() +
            15 * 60 * 1000;


        await user.save();


        // ==================================================
        // CREATE RESET URL
        // ==================================================

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


        // ==================================================
        // SEND RESET EMAIL
        // ==================================================

        try {

            await transporter.sendMail({

                // ==========================================
                // FROM
                // ==========================================

                from:
                    `"User Management System" <${process.env.EMAIL_USER}>`,


                // ==========================================
                // TO
                // ==========================================

                to:
                    user.email,


                // ==========================================
                // SUBJECT
                // ==========================================

                subject:
                    "Reset Your Password",


                // ==========================================
                // PLAIN TEXT FALLBACK
                // ==========================================

                text: `
Hello ${user.name},

We received a request to reset your password.

Open this link to create a new password:

${resetUrl}

This password reset link expires in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

User Management System
                `,


                // ==========================================
                // HTML EMAIL
                // ==========================================

                html: `
<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

</head>


<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: Arial, Helvetica, sans-serif;
    "
>


    <!-- EMAIL BACKGROUND -->

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        role="presentation"
        style="
            width: 100%;
            background-color: #f3f4f6;
        "
    >

        <tr>

            <td
                align="center"
                style="
                    padding: 40px 20px;
                "
            >


                <!-- EMAIL CARD -->

                <table
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    role="presentation"
                    style="
                        width: 100%;
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 12px;
                    "
                >

                    <tr>

                        <td
                            style="
                                padding: 40px;
                            "
                        >


                            <!-- TITLE -->

                            <h1
                                style="
                                    margin: 0 0 24px 0;
                                    color: #111827;
                                    font-size: 28px;
                                "
                            >
                                Reset Your Password
                            </h1>


                            <!-- GREETING -->

                            <p
                                style="
                                    margin: 0 0 16px 0;
                                    color: #4b5563;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >

                                Hello ${user.name},

                            </p>


                            <!-- MESSAGE -->

                            <p
                                style="
                                    margin: 0 0 16px 0;
                                    color: #4b5563;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >

                                We received a request to reset
                                the password for your User
                                Management System account.

                            </p>


                            <p
                                style="
                                    margin: 0 0 25px 0;
                                    color: #4b5563;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >

                                Click the button below to
                                create a new password.

                            </p>


                            <!-- RESET BUTTON -->

                            <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                role="presentation"
                                align="center"
                                style="
                                    margin: 30px auto;
                                "
                            >

                                <tr>

                                    <td
                                        align="center"
                                        bgcolor="#111827"
                                        style="
                                            background-color: #111827;
                                            border-radius: 8px;
                                        "
                                    >

                                        <a
                                            href="${resetUrl}"
                                            target="_blank"
                                            style="
                                                display: inline-block;
                                                padding: 15px 30px;
                                                color: #ffffff;
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 16px;
                                                font-weight: bold;
                                                line-height: 20px;
                                                text-decoration: none;
                                                border-radius: 8px;
                                            "
                                        >
                                            Reset Password
                                        </a>

                                    </td>

                                </tr>

                            </table>


                            <!-- FALLBACK LINK -->

                            <p
                                style="
                                    margin: 30px 0 10px 0;
                                    color: #6b7280;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                            >

                                If the button doesn't work,
                                click or copy the link below:

                            </p>


                            <p
                                style="
                                    margin: 0 0 25px 0;
                                    font-size: 13px;
                                    line-height: 1.6;
                                    word-break: break-all;
                                "
                            >

                                <a
                                    href="${resetUrl}"
                                    target="_blank"
                                    style="
                                        color: #2563eb;
                                        text-decoration: underline;
                                    "
                                >
                                    ${resetUrl}
                                </a>

                            </p>


                            <!-- EXPIRY -->

                            <div
                                style="
                                    margin: 25px 0;
                                    padding: 15px;
                                    background-color: #f9fafb;
                                    border-radius: 8px;
                                "
                            >

                                <p
                                    style="
                                        margin: 0;
                                        color: #4b5563;
                                        font-size: 14px;
                                        line-height: 1.6;
                                    "
                                >

                                    🔐 This password reset
                                    link expires in

                                    <strong>
                                        15 minutes
                                    </strong>.

                                </p>

                            </div>


                            <!-- SECURITY MESSAGE -->

                            <p
                                style="
                                    margin: 20px 0;
                                    color: #4b5563;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                            >

                                If you did not request this
                                password reset, you can safely
                                ignore this email.

                            </p>


                            <!-- DIVIDER -->

                            <hr
                                style="
                                    margin: 30px 0;
                                    border: 0;
                                    border-top: 1px solid #e5e7eb;
                                "
                            >


                            <!-- FOOTER -->

                            <p
                                style="
                                    margin: 0;
                                    color: #9ca3af;
                                    font-size: 12px;
                                    text-align: center;
                                "
                            >

                                User Management System

                            </p>


                        </td>

                    </tr>

                </table>


            </td>

        </tr>

    </table>


</body>

</html>
                `
            });


            // Safe log - does NOT expose reset token

            console.log(
                "PASSWORD RESET EMAIL SENT TO:",
                user.email
            );


        } catch (emailError) {


            // ==================================================
            // EMAIL FAILED
            //
            // Remove generated reset token from database.
            // ==================================================

            user.resetToken = "";

            user.resetTokenExpiry = null;


            await user.save();


            console.error(
                "RESET EMAIL ERROR:",
                emailError
            );


            return res.status(500).json({
                message:
                    "Unable to send password reset email. Please try again."
            });

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(200).json({
            message:
                "If an account exists with that email, a password reset link has been sent."
        });


    } catch (error) {


        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );


        return res.status(500).json({
            message:
                "Unable to process password reset request."
        });

    }
};




// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
    try {

        const {
            resetToken,
            newPassword
        } = req.body;


        // ==============================================
        // VALIDATE REQUEST
        // ==============================================

        if (
            !resetToken ||
            !newPassword
        ) {

            return res.status(400).json({
                message:
                    "Reset token and new password are required."
            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });

        }


        // ==============================================
        // HASH TOKEN RECEIVED FROM FRONTEND
        // ==============================================

        const hashedResetToken =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        // ==============================================
        // FIND VALID TOKEN
        //
        // We check the token AND expiry together.
        // ==============================================

        const user =
            await User.findOne({

                resetToken:
                    hashedResetToken,

                resetTokenExpiry: {
                    $gt: Date.now()
                }

            });


        if (!user) {

            return res.status(400).json({
                message:
                    "Reset link is invalid or has expired."
            });

        }


        // ==============================================
        // HASH NEW PASSWORD
        // ==============================================

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        // ==============================================
        // DESTROY RESET TOKEN
        //
        // This makes the link single-use.
        // ==============================================

        user.resetToken = "";
        user.resetTokenExpiry = null;


        await user.save();


        // ==============================================
        // CLEAR REFRESH COOKIE
        //
        // If password reset happens in a browser that
        // already has a refresh cookie, remove it.
        // ==============================================

        res.clearCookie(
            "refreshToken",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "none"
                        : "lax"
            }
        );


        // ==============================================
        // SUCCESS
        // ==============================================

        res.status(200).json({
            message:
                "Password reset successfully. Please sign in with your new password."
        });


    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );


        res.status(500).json({
            message:
                "Unable to reset password."
        });

    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    registerUser,
    loginUser,
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
};