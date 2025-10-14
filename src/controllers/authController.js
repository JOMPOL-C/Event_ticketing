const Organizer = require("../models/organizerModel");
const Attendee = require("../models/attendeeModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary");

// สมัครสมาชิกผู้เข้าร่วม
exports.registerAttendee = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // กันอีเมลซ้ำข้าม
    const dupA = await Attendee.findOne({ email });
    const dupO = await Organizer.findOne({ email });
    if (dupA || dupO) return res.status(400).send("อีเมลนี้ถูกใช้งานแล้ว");

    const user = new Attendee({ username, email, password, role: "attendee" });
    await user.save();

    // กลับไปหน้า login
    return res.redirect("/login");
  } catch (err) {
    console.error("❌ Register Attendee Error:", err.message);
    return res.status(400).send("สมัครสมาชิกผู้เข้าร่วมไม่สำเร็จ");
  }
};

// สมัครสมาชิกผู้จัดงาน
exports.registerOrganizer = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const dupA = await Attendee.findOne({ email });
    const dupO = await Organizer.findOne({ email });
    if (dupA || dupO) return res.status(400).send("อีเมลนี้ถูกใช้งานแล้ว");

    const user = new Organizer({ username, email, password, role: "organizer" });
    await user.save();

    return res.redirect("/login");
  } catch (err) {
    console.error("❌ Register Organizer Error:", err.message);
    return res.status(400).send("สมัครสมาชิกผู้จัดงานไม่สำเร็จ");
  }
};

// เข้าสู่ระบบ
exports.login = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // เลือกโมเดลตามประเภทผู้ใช้จากฟอร์ม
    const Model = userType === "organizer" ? Organizer : Attendee;
    const user = await Model.findOne({ email });
    if (!user) return res.status(400).send("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

    // สร้าง JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: (user.role || "").toLowerCase(),
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ตั้งคุกกี้ให้ปลอดภัย
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // ไปหน้าแรกทั้งสองบทบาท
    return res.redirect("/");
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    return res.status(500).send("เกิดข้อผิดพลาดภายในระบบ");
  }
};

// ออกจากระบบ
exports.logout = (req, res) => {
  res.clearCookie("token");
  console.log("🚪 User logged out");
  return res.redirect("/");
};

// อัปเดตโปรไฟล์
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role = (req.user.role || "").toLowerCase();

    const Model = role === "organizer" ? Organizer : Attendee;
    const user = await Model.findById(userId);
    if (!user) return res.status(404).send("ไม่พบบัญชีผู้ใช้");

    // อัปเดตรูป (ถ้ามีไฟล์)
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { folder: `event_ticketing/${role}_profiles`, resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          upload.end(req.file.buffer);
        });

        user.profileImage = uploadResult.secure_url;
      } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        return res.status(500).send("อัปโหลดรูปภาพล้มเหลว");
      }
    }

    // อัปเดตข้อมูลพื้นฐาน
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    await user.save();
    console.log(`✅ Updated profile for ${role}`);

    return res.redirect("/api/profile");
  } catch (err) {
    console.error("❌ Update Profile Error:", err);
    return res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
  }
};
