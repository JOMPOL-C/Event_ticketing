const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/ticketController');

// ตั๋วของฉัน (attendee)
router.get('/my-tickets', authRequired, requireRole('attendee'), ctrl.myTickets);

// ตรวจ QR (organizer/staff)
router.get('/tickets/verify', authRequired, requireRole('organizer'), ctrl.verify);

module.exports = router;
