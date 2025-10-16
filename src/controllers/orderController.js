const QRCode = require('qrcode');
const Event = require('../models/eventModel');
const Order = require('../models/orderModel');
const Ticket = require('../models/ticketModel');

exports.checkout = async (req, res, next) => {
  try {
    const { eventId, qty } = req.body;
    const n = Math.max(1, Number(qty || 1));

    // 1️⃣ ตรวจสอบและลดจำนวนตั๋วที่เหลือ
    const event = await Event.findOneAndUpdate(
      { _id: eventId, remainingTickets: { $gte: n }, status: 'published' },
      { $inc: { remainingTickets: -n } },
      { new: true }
    );

    if (!event) {
      return res.status(400).send('ตั๋วไม่พอหรืออีเวนต์ไม่พร้อมขาย');
    }

    // 2️⃣ สร้างออร์เดอร์
    let order = await Order.create({
      buyer: req.user._id,
      event: event._id,
      qty: n,
      unitPrice: event.price,
      amount: event.price * n,
      status: 'paid',
      currency: event.currency || 'THB',
      paidAt: new Date()
    });

    // ✅ populate event และ buyer เพื่อให้ข้อมูลเต็มใน response
    order = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate('event', 'title venue startAt');

    // 3️⃣ สร้างตั๋ว + QR
    const tickets = [];
    for (let i = 0; i < n; i++) {
      const t = new Ticket({
        order: order._id,
        event: event._id,
        owner: req.user._id,
      });

      // ✅ generate QR
      const qrDataUrl = await QRCode.toDataURL(t.code);
      t.qrDataUrl = qrDataUrl;
      await t.save();
      tickets.push(t);
    }

    console.log(`🎟️ สร้างตั๋ว ${tickets.length} ใบ สำหรับอีเวนต์: ${event.title}`);

    // 4️⃣ redirect ไปหน้าตั๋วของฉัน
    return res.redirect('/api/my-tickets');
  } catch (err) {
    console.error('❌ Checkout Error:', err);
    next(err);
  }
};
