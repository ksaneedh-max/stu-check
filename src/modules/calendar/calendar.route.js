const express = require("express");
const router = express.Router();

const calendar = require("../../data/calendar.json");

/* ---------- GET FULL CALENDAR ---------- */

router.get("/", (req, res) => {
  res.json(calendar);
});

/* ---------- GET MONTH ---------- */

router.get("/:month", (req, res) => {

  const month = req.params.month;

  const data = calendar["2026"][month];

  if (!data) {
    return res.status(404).json({
      error: "Month not found"
    });
  }

  res.json(data);

});

module.exports = router;
