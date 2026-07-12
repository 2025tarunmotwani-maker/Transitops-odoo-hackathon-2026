const express = require("express");

function createServerApplication() {
    const app = express();

    app.use(express.json());

    return app;
}

module.exports = {
    createServerApplication,
};