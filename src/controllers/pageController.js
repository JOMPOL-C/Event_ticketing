const Event = require('../models/eventModel');

exports.home = async (req, res, next) => {
  try {
    // เอาทุกสถานะ ไม่กรอง startAt
    const allEvents = await Event.find()
      .sort({ startAt: 1 })
      .lean();

    res.render("home", { title: "Home", events: allEvents });
  } catch (e) {
    next(e);
  }
};
