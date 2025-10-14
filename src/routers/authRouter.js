const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { upload } = require("../utils/cloudinary");
const { authRequired } = require("../middlewares/authMiddleware");


router
    .post("/register/attendee", authController.registerAttendee) // /api/register/attendee
    .post("/register/organizer", authController.registerOrganizer) // /api/register/organizer
    .post("/login", authController.login) // /api/login
    .post("/profile/update", authRequired, upload.single("profileImage"), authController.updateProfile); // /api/profile/update

router
    .get("/logout", authController.logout); // /api/logout

// ✅ แสดงหน้าโปรไฟล์ (เฉพาะคนที่ล็อกอิน)
router.get("/profile", authRequired, (req, res) => {
    res.render("profile", { user: res.locals.user });
});


module.exports = router;