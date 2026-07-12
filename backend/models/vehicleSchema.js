const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        vehicleName: {
            type: String,
            required: true,
            trim: true,
        },

        vehicleType: {
            type: String,
            required: true,
        },

        logisticsHub: {
            type: String,
            required: true,
        },

        maxLoadCapacity: {
            type: Number,
            required: true,
            min: 0,
        },

        odometer: {
            type: Number,
            required: true,
            default: 0,
        },

        acquisitionCost: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "Available",
                "On Trip",
                "In Shop",
                "Retired",
            ],
            default: "Available",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);