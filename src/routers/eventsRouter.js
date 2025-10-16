// src/routers/eventsRouter.js
const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { upload } = require('../utils/cloudinary');
const ctrl = require('../controllers/eventController');
const validate = require('../middlewares/validate');
const evV = require('../validators/eventValidators');
const { Types } = require('mongoose');

// ----- Public -----
router.get('/events', ctrl.listPublic);

// ----- Organizer only (วางก่อนเส้นพารามิเตอร์เสมอ) -----
router.get('/events/mine', authRequired, requireRole('organizer'), ctrl.mine);
router.get('/events/new',  authRequired, requireRole('organizer'), ctrl.newForm);
router.post(
  '/events',
  authRequired, requireRole('organizer'),
  upload.single('coverImage'),
  evV.createOrUpdate, validate,
  ctrl.create
);

// ----- ตรวจ id ล่วงหน้าว่าเป็น ObjectId -----
router.param('id', (req, res, next, id) => {
  if (!Types.ObjectId.isValid(id)) {
    // กันไม่ให้ /events/mine หรือค่าที่ไม่ใช่ ObjectId หลุดเข้ามา
    return res.status(404).send('Invalid event id');
  }
  next();
});

// ----- Routes ที่มีพารามิเตอร์ (ใช้ /events/:id ธรรมดา) -----
router.get   ('/events/:id',        ctrl.detail);
router.get   ('/events/:id/edit',   authRequired, requireRole('organizer'), ctrl.editForm);
router.patch ('/events/:id',        authRequired, requireRole('organizer'),
  upload.single('coverImage'),
  evV.createOrUpdate, validate,
  ctrl.update
);
router.delete('/events/:id',        authRequired, requireRole('organizer'), ctrl.remove);

module.exports = router;
