const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/organizerController');

router.get('/organizer/dashboard', authRequired, requireRole('organizer'), ctrl.dashboard);

module.exports = router;
