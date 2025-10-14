const Event = require('../models/eventModel');

exports.home = async (req, res, next) => {
  try {
    const now = new Date();
    const upcoming = await Event.find({ status: 'published', startAt: { $gte: now } })
      .sort({ startAt: 1 })
      .limit(6)
      .lean();
    res.render('home', { title: 'Home', events: upcoming });
  } catch (e) { next(e); }
};
