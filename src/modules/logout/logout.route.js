const express = require("express");
const router = express.Router();
const logoutController = require("./logout.controller");

router.post("/", logoutController);

module.exports = router;