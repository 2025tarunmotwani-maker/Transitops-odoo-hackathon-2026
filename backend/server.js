const express = require("express");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const costRoutes = require("./routes/costRoutes");

function createServerApplication() {
    const app = express();

    app.use(express.json());

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        const isLocalOrigin = typeof origin === "string" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (isLocalOrigin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }

        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }

        next();
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/vehicles", vehicleRoutes);
    app.use("/api/settings", settingsRoutes);
    app.use("/api/costs", costRoutes);

    return app;
}

module.exports = {
    createServerApplication,
};