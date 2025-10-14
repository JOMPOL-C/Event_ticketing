const Event = require('../models/eventModel');
const Order = require('../models/orderModel');

exports.dashboard = async (req, res, next) => {
  try {
    const organizerId = req.user._id;
    const events = await Event.find({ organizer: organizerId }).sort({ startAt: -1 }).lean();
    const eventIds = events.map(e => e._id);

    const orders = await Order.find({ event: { $in: eventIds }, status: 'paid' })
      .populate('buyer', 'username email')
      .lean();

    const byEvent = new Map();
    events.forEach(e => byEvent.set(String(e._id), {
      ...e,
      metrics: { orders: 0, sold: 0, revenue: 0 },
      buyers: []
    }));

    for (const od of orders) {
      const bucket = byEvent.get(String(od.event));
      if (!bucket) continue;
      bucket.metrics.orders += 1;
      bucket.metrics.sold += Number(od.qty || 0);
      bucket.metrics.revenue += Number(od.amount || 0);
      bucket.buyers.push({
        username: od.buyer?.username,
        email: od.buyer?.email,
        qty: od.qty,
        amount: od.amount,
        paidAt: od.paidAt
      });
    }

    const enriched = Array.from(byEvent.values());
    const stats = {
      totalEvents: enriched.length,
      totalOrders: enriched.reduce((s, e) => s + e.metrics.orders, 0),
      totalTickets: enriched.reduce((s, e) => s + e.metrics.sold, 0),
      totalRevenue: enriched.reduce((s, e) => s + e.metrics.revenue, 0),
    };

    res.render('organizer/dashboard', { title: 'Organizer Dashboard', stats, events: enriched });
  } catch (err) { next(err); }
};
