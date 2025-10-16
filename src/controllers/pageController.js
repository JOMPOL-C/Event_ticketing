const Event = require('../models/eventModel');

exports.home = async (req, res, next) => {
  try {
    const now = new Date();

    const events = await Event.find({
      status: 'published',
      endAt: { $gt: now },              // ยังไม่จบ
      remainingTickets: { $gt: 0 }      // ยังมีตั๋วเหลือ
    })
      .sort({ startAt: 1 })
      .lean();

    res.render('home', {
      title: 'หน้าแรก',
      events,
      user: res.locals.user || null
    });
  } catch (err) {
    next(err);
  }
};
