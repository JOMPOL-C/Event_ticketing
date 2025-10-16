const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, trim: true, unique: true, sparse: true },
    description: { type: String, trim: true, maxlength: 5000 },
    coverImage: { type: String, default: '' },
    venue: { type: String, required: true, trim: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date },

    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'THB' },

    totalTickets: { type: Number, required: true, min: 0 },
    remainingTickets: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

// ค้นหา
eventSchema.index({ title: 'text', description: 'text', venue: 'text' });

// ตั้งค่า remainingTickets ตอนสร้าง / ป้องกันเกิน total
eventSchema.pre('validate', function (next) {
  if (this.isNew && (this.remainingTickets === undefined || this.remainingTickets === null)) {
    this.remainingTickets = this.totalTickets;
  }
  if (this.remainingTickets > this.totalTickets) {
    this.remainingTickets = this.totalTickets;
  }
  next();
});

eventSchema.virtual('isSoldOut').get(function () {
  const now = new Date();
  const noTicketsLeft = (this.remainingTickets || 0) <= 0;
  const eventEnded = this.endAt && this.endAt < now;
  return noTicketsLeft || eventEnded;
});
console.log('🧩 Event model reloaded');


module.exports = mongoose.model('Event', eventSchema, 'Event');