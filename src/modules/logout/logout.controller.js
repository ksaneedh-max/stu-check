const logoutService = require("./logout.service");

async function logoutController(req, res) {

  try {

    const sessionId = req.session.id;

    const result = await logoutService(sessionId);

    res.json(result);

  } catch (err) {

    console.error("Logout error:", err);

    res.status(500).json({
      error: "Logout failed"
    });

  }

}

module.exports = logoutController;
