const Vehicle = require("../models/vehicleSchema");

// ================= REGISTER VEHICLE =================

const registerVehicle = async (req, res) => {
    try {

        const vehicleExist = await Vehicle.findOne({
            registrationNumber: req.body.registrationNumber,
        });

        if (vehicleExist) {
            return res.status(400).json({
                success: false,
                message: "Vehicle already exists.",
            });
        }

        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            message: "Vehicle Registered Successfully",
            data: vehicle,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

// ================= GET ALL VEHICLES =================

const getAllVehicles = async (req, res) => {
    try {

        const vehicles = await Vehicle.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

// ================= GET SINGLE VEHICLE =================

const getVehicleByRegistration = async (req, res) => {
    try {

        const vehicle = await Vehicle.findOne({
            registrationNumber: req.params.registrationNumber,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

// ================= UPDATE VEHICLE =================

const updateVehicle = async (req, res) => {
    try {

        const vehicle = await Vehicle.findOneAndUpdate(
            {
                registrationNumber: req.params.registrationNumber,
            },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle Updated Successfully",
            data: vehicle,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

// ================= DELETE VEHICLE =================

const deleteVehicle = async (req, res) => {
    try {

        const vehicle = await Vehicle.findOneAndDelete({
            registrationNumber: req.params.registrationNumber,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle Deleted Successfully",
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
    registerVehicle,
    getAllVehicles,
    getVehicleByRegistration,
    updateVehicle,
    deleteVehicle,
};