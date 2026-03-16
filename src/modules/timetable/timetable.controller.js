const service = require("./timetable.service");

exports.getTimetable = async (req, res) => {

  try {

    const sessionId = req.session.id;

    const data = await service.getTimetable(sessionId);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};