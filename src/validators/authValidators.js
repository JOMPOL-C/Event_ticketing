const { body } = require('express-validator');

exports.registerAttendee = [
  body('username').trim().notEmpty().withMessage('กรอกชื่อผู้ใช้'),
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านอย่างน้อย 6 ตัว'),
];

exports.registerOrganizer = [
  body('username').trim().notEmpty().withMessage('กรอกชื่อผู้ใช้'),
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านอย่างน้อย 6 ตัว'),
];

exports.login = [
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง').normalizeEmail(),
  body('password').notEmpty().withMessage('กรอกรหัสผ่าน'),
];

exports.updateProfile = [
  body('username').trim().notEmpty().withMessage('กรอกชื่อผู้ใช้'),
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง').normalizeEmail(),
];
