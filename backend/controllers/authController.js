const bcrypt = require("bcrypt");

const User = require("../models/userSchema");

// ================= REGISTER =================

const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword,
            role,
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !confirmPassword ||
            !role
        ) {
            return res.status(400).json({
                message: "Please fill all fields.",
            });
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                message: "Email already exists.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration Successful",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// ================= LOGIN =================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter Email and Password.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Email",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Password",
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is inactive.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
    register,
    login,
};