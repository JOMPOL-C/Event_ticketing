const { body } = require('express-validator');

exports.createOrUpdate = [
  body('title').trim().notEmpty().withMessage('กรอกชื่ออีเวนต์'),
  body('venue').trim().notEmpty().withMessage('กรอกสถานที่'),
  body('startAt')
    .isISO8601()
    .withMessage('วันที่เริ่มไม่ถูกต้อง'),
  body('endAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('วันที่สิ้นสุดไม่ถูกต้อง')
    .custom((endAt, { req }) => {
      if (!endAt) return true; // ถ้าไม่ได้กรอก endAt ก็ข้ามไป
      const start = new Date(req.body.startAt);
      const end = new Date(endAt);
      if (end < start) {
        throw new Error('วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น');
      }
      return true;
    }),
  body('price').isFloat({ min: 0 }).withMessage('ราคา ≥ 0'),
  body('totalTickets').isInt({ min: 0 }).withMessage('จำนวนตั๋ว ≥ 0'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('สถานะไม่ถูกต้อง'),
];
