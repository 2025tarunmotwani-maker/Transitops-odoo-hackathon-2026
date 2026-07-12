const express = require("express");
const router = express.Router();

const {
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense,
} = require("../controllers/costController");

router.get("/fuel", getFuelLogs);
router.post("/fuel", createFuelLog);
router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);

module.exports = router;
