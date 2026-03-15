const service = require("./marks.service");

exports.getMarks = async (req, res) => {

  try {

    const sessionId = req.session.id;

    const data = await service.getMarks(sessionId);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};
