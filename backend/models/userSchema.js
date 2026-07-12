const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    confirmPassword: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: [
            "Admin",
            "Fleet Manager",
            "Driver",
            "Safety Officer",
            "Financial Analyst"
        ],
        default: "Driver"
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
},
{
    timestamps: true
}
);

const User = mongoose.model("USER_COLLECTION", userSchema);

module.exports = User;