const service = require("./profile.service");

exports.getProfile = async (req, res) => {

  try {

    const sessionId = req.session.id;

    const data = await service.getProfile(sessionId);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};
