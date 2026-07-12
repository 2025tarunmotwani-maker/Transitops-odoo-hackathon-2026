const express = require("express");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

function createServerApplication() {
    const app = express();

    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/vehicles", vehicleRoutes);

    return app;
}

module.exports = {
    createServerApplication,
};