const express = require("express");

const router = express.Router();

const {
    registerVehicle,
    getAllVehicles,
    getVehicleByRegistration,
    updateVehicle,
    deleteVehicle,
} = require("../controllers/vehicleController");

router.post("/", registerVehicle);

router.get("/", getAllVehicles);

router.get("/:registrationNumber", getVehicleByRegistration);

router.put("/:registrationNumber", updateVehicle);

router.delete("/:registrationNumber", deleteVehicle);

module.exports = router;