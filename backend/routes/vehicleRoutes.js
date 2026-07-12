const express = require("express");

const router = express.Router();

const {
    registerVehicle,
} = require("../controllers/vehicleController");

router.post("/", registerVehicle);

module.exports = router;