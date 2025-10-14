const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { upload } = require("../utils/cloudinary");
const { authRequired } = require("../middlewares/authMiddleware");
const validate = require('../middlewares/validate');
const authV = require('../validators/authValidators');

router
  .post("/register/attendee", authV.registerAttendee, validate, authController.registerAttendee)
  .post("/register/organizer", authV.registerOrganizer, validate, authController.registerOrganizer)
  .post("/login", authV.login, validate, authController.login)
  .post("/profile/update", authRequired, upload.single("profileImage"), authV.updateProfile, validate, authController.updateProfile);

router.get("/logout", authController.logout);

// ✅ แสดงหน้าโปรไฟล์ (เฉพาะคนที่ล็อกอิน)
router.get("/profile", authRequired, (req, res) => {
  res.render("profile", { title: "โปรไฟล์", user: res.locals.user });
});

module.exports = router;
