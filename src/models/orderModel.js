const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee',            // ผู้ซื้อคือ Attendee
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },

    qty: { type: Number, required: true, min: 1 },

    // เก็บ snapshot ราคาตอนซื้อ เพื่อความถูกต้องย้อนหลัง
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'THB' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'paid',           // โปรเจกต์นี้ชำระจำลอง จบที่ paid
      index: true,
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// คำนวณจำนวนเงิน + ตรึงเวลาจ่ายเมื่อสถานะเป็น paid
orderSchema.pre('validate', function (next) {
  if (this.unitPrice != null && this.qty != null) {
    this.amount = this.unitPrice * this.qty;
  }
  if (this.status === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema, 'Order');
