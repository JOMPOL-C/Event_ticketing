const User = require("../models/userModel");

// สมัครสมาชิกผู้เข้าร่วม
exports.registerAttendee = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password, role: "attendee" });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error("❌ Register Attendee Error:", err.message);
    res.status(400).send("สมัครสมาชิกผู้เข้าร่วมไม่สำเร็จ");
  }
};

// สมัครสมาชิกผู้จัดงาน
exports.registerOrganizer = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password, role: "organizer" });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error("❌ Register Organizer Error:", err.message);
    res.status(400).send("สมัครสมาชิกผู้จัดงานไม่สำเร็จ");
  }
};
