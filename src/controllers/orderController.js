const QRCode = require('qrcode');
const Event = require('../models/eventModel');
const Order = require('../models/orderModel');
const Ticket = require('../models/ticketModel');

exports.checkout = async (req, res, next) => {
  try {
    const { eventId, qty } = req.body;
    const n = Math.max(1, Number(qty || 1));

    const event = await Event.findOneAndUpdate(
      { _id: eventId, remainingTickets: { $gte: n }, status: 'published' },
      { $inc: { remainingTickets: -n } },
      { new: true }
    );

    if (!event) {
      return res.status(400).send('ตั๋วไม่พอหรืออีเวนต์ไม่พร้อมขาย');
    }

    // สร้างออเดอร์
    const order = await Order.create({
      buyer: req.user._id,
      event: event._id,
      qty: n,
      unitPrice: event.price,
      status: 'paid',
      currency: event.currency || 'THB'
    });

    // ออกตั๋ว + QR
    const tickets = [];
    for (let i = 0; i < n; i++) {
      const t = new Ticket({
        order: order._id,
        event: event._id,
        owner: req.user._id,
      });
      // สร้าง code อัตโนมัติ
      await t.validate();
      const qrDataUrl = await QRCode.toDataURL(t.code);
      t.qrDataUrl = qrDataUrl;
      await t.save();
      tickets.push(t);
    }

    // เสร็จแล้วพาไปหน้าตั๋วของฉัน
    return res.redirect('/api/my-tickets');
  } catch (err) { next(err); }
};
