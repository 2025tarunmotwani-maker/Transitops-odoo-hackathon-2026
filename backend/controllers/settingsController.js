const Settings = require("../models/settingsSchema");

const DEFAULT_SETTINGS = {
  key: "global",
  depotName: "Gandhinagar Depot GJ-4",
  currency: "INR (Rs)",
  distanceUnit: "Kilometres",
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "global" });

    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { depotName, currency, distanceUnit } = req.body;

    if (!depotName || !currency || !distanceUnit) {
      return res.status(400).json({
        success: false,
        message: "Missing required settings values.",
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      { depotName, currency, distanceUnit },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
