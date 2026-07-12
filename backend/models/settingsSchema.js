const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    depotName: {
      type: String,
      required: true,
      default: "Gandhinagar Depot GJ-4",
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR (Rs)",
      trim: true,
    },
    distanceUnit: {
      type: String,
      required: true,
      default: "Kilometres",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
