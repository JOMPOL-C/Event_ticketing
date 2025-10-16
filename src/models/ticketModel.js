const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const ticketSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee',
      required: true,
      index: true,
    },

    code: { type: String, unique: true, index: true }, // โค้ดไม่ซ้ำ
    qrDataUrl: { type: String },
    status: { type: String, enum: ['valid', 'used', 'void'], default: 'valid', index: true },
    scannedAt: { type: Date },
  },
  { timestamps: true }
);

// สร้าง code อัตโนมัติถ้ายังไม่มี (ใช้ randomUUID แทน uuid package)
ticketSchema.pre('validate', function (next) {
  if (!this.code) {
    const raw = randomUUID().replace(/-/g, '');
    this.code = `TKT_${raw.slice(0, 16)}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema, 'Ticket');
