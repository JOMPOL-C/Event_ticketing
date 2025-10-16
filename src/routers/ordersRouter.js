const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/orderController');

// ซื้อบัตร (attendee)
router.post('/orders/checkout', authRequired, requireRole('attendee'), ctrl.checkout);

module.exports = router;
