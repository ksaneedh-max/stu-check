const express = require("express");
const controller = require("./timetable.controller");

const router = express.Router();

router.get("/", controller.getTimetable);

module.exports = router;