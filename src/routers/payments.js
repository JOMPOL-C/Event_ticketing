// src/routers/payments.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Event = require('../models/eventModel');
const Order = require('../models/orderModel');
const Ticket = require('../models/ticketModel');

const QRCode = require('qrcode');
const omise = require('omise')({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

function authRequired(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send('กรุณาเข้าสู่ระบบ');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).send('เข้าสู่ระบบใหม่');
  }
}

// 1) เริ่ม checkout: สร้าง Order pending + Omise Charge (PromptPay)
router.post('/checkout', authRequired, async (req, res, next) => {
  try {
    const { eventId, qty } = req.body;
    const n = Math.max(1, Number(qty || 1));

    // ตรวจ event และสต็อก
    const event = await Event.findOne({ _id: eventId, status: 'published' }).lean();
    if (!event) return res.status(404).send('ไม่พบอีเวนต์');
    if ((event.remainingTickets ?? event.totalTickets ?? 0) < n) {
      return res.status(400).send('ตั๋วไม่พอ');
    }

    const amount = Math.round(Number(event.price) * n * 100); // สตางค์
    const currency = (event.currency || 'THB').toUpperCase();

    // สร้าง Order: pending (ยังไม่ decrement สต็อก จนกว่าจะจ่ายสำเร็จ)
    const order = await Order.create({
      buyer: req.user.id,
      event: event._id,
      qty: n,
      unitPrice: event.price,
      amount: amount / 100,
      currency,
      status: 'pending'
    });

    // ใช้ PromptPay → สร้าง source แล้ว charge
    const source = await omise.sources.create({
      type: 'promptpay',
      amount,
      currency,
    });

    const charge = await omise.charges.create({
      amount,
      currency,
      source: source.id,
      // ให้ผู้ใช้จ่ายแล้วกลับมาหน้า tickets
      return_uri: `${process.env.BASE_URL}/api/payment/${order._id}`,
      description: `Order ${order._id} for Event ${event.title}`,
      metadata: { orderId: String(order._id), eventId: String(event._id) },
    });

    // เก็บรอยเชื่อมกับ Omise
    order.omiseSourceId = source.id;
    order.omiseChargeId = charge.id;
    await order.save();

    // ไปหน้าแสดง QR
    return res.redirect(`/api/payment/${order._id}`);
  } catch (err) { next(err); }
});

// 2) หน้าแสดง QR ของ PromptPay
router.get('/payment/:orderId', authRequired, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('event').lean();
    if (!order) return res.status(404).send('ไม่พบออเดอร์');

    // ถ้าจ่ายแล้ว ส่งไปตั๋วของฉัน
    if (order.status === 'paid') return res.redirect('/api/my-tickets');

    // ดึง charge ปัจจุบันเพื่อเอา QR (download_uri)
    const charge = order.omiseChargeId ? await omise.charges.retrieve(order.omiseChargeId) : null;

    // ค่า URI รูป QR จาก Omise (ถ้ายังไม่มี/หมดอายุ อาจสร้างใหม่ได้)
    let qrImageUrl = null;
    if (charge?.source?.scannable_code?.image?.download_uri) {
      qrImageUrl = charge.source.scannable_code.image.download_uri;
    }

    res.render('payments/pay_promptpay', {
      title: 'ชำระเงิน',
      order,
      event: order.event,
      qrImageUrl,
    });
  } catch (err) { next(err); }
});

// 3) endpoint สำหรับหน้า payment ไว้ poll สถานะออเดอร์
// 3) endpoint สำหรับหน้า payment ไว้ poll สถานะออเดอร์
router.get('/orders/:id/status', authRequired, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ status: 'not_found' });

    // 🔹 ถ้ายัง pending → ลองเช็กจาก Omise โดยตรง
    if (order.status === 'pending' && order.omiseChargeId) {
      const charge = await omise.charges.retrieve(order.omiseChargeId);
      if (charge.paid === true || charge.status === 'successful') {
        await Order.findByIdAndUpdate(order._id, {
          status: 'paid',
          paidAt: new Date()
        });
        return res.json({ status: 'paid' });
      }
    }

    return res.json({ status: order.status });
  } catch (err) {
    next(err);
  }
});


// 4) Webhook จาก Omise (ตั้งใน Dashboard → https://<ngrok>/api/webhooks/omise)
router.post('/webhooks/omise', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const event = req.body;
    console.log('🔔 Omise webhook received:', event.key || event.id);

    // ✅ ดึง charge ตรงจาก event.data
    const ch = event.data;

    console.log('💳 Charge ID:', ch.id, 'Status:', ch.status, 'Paid:', ch.paid);

    let order = await Order.findOne({ omiseChargeId: ch.id });
    if (!order && ch.metadata?.orderId) {
      order = await Order.findById(ch.metadata.orderId);
    }

    if (!order) {
      console.log('⚠️ No matching order found');
      return res.status(200).send('no order matched');
    }

    console.log('📦 Found order:', order._id);

    if (ch.status === 'successful' || ch.paid === true) {
      if (order.status !== 'paid') {
        console.log('✅ Payment success, updating order...');
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();

        // 🎫 ลดจำนวนตั๋วที่เหลือในอีเวนต์
        const updatedEvent = await Event.findOneAndUpdate(
          { _id: order.event, remainingTickets: { $gte: order.qty } },
          { $inc: { remainingTickets: -order.qty } },
          { new: true }
        );

        if (!updatedEvent) {
          console.log('⚠️ ไม่สามารถตัดสต็อกได้ (อาจหมดก่อน)');
          order.status = 'failed';
          await order.save();
          return res.status(200).send('stock not enough');
        }

        // 🎟️ ออกตั๋ว
        const tickets = [];
        for (let i = 0; i < order.qty; i++) {
          const t = new Ticket({
            order: order._id,
            event: order.event,
            owner: order.buyer,
          });
          await t.validate();
          const qrDataUrl = await QRCode.toDataURL(t.code);
          t.qrDataUrl = qrDataUrl;
          await t.save();
          tickets.push(t);
        }

        console.log(`🎟️ Created ${tickets.length} tickets and updated event stock`);
      }
    }



    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('ok');
  }
});




module.exports = router;
