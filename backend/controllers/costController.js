const FuelLog = require("../models/fuelLogSchema");
const Expense = require("../models/expenseSchema");

const getFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createFuelLog = async (req, res) => {
  try {
    const { id, vehicleId, date, liters, cost, odometer } = req.body;
    if (!id || !vehicleId || date == null || liters == null || cost == null || odometer == null) {
      return res.status(400).json({ success: false, message: "Missing required fuel log fields." });
    }

    const fuelLog = await FuelLog.create({ id, vehicleId, date, liters, cost, odometer });
    return res.status(201).json({ success: true, data: fuelLog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { id, vehicleId, date, category, cost, description } = req.body;
    if (!id || !vehicleId || date == null || !category || cost == null || !description) {
      return res.status(400).json({ success: false, message: "Missing required expense fields." });
    }

    const expense = await Expense.create({ id, vehicleId, date, category, cost, description });
    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense,
};
