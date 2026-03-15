const logoutService = require("./logout.service");

async function logoutController(req, res) {
  try {
    const result = await logoutService();
    res.json(result);
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
}

module.exports = logoutController;