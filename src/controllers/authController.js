const Organizer = require("../models/organizerModel");
const Attendee = require("../models/attendeeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary");

// สมัครสมาชิกผู้เข้าร่วม
exports.registerAttendee = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new Attendee({ username, email, password, role: "attendee" });
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
        const user = new Organizer({ username, email, password, role: "organizer" });
        await user.save();
        res.redirect("/select_login");
    } catch (err) {
        console.error("❌ Register Organizer Error:", err.message);
        res.status(400).send("สมัครสมาชิกผู้จัดงานไม่สำเร็จ");
    }
};

exports.login = async (req, res) => {
    const { email, password, userType } = req.body;

    try {
        let user;

        if (userType === "attendee") {
            user = await Attendee.findOne({ email });
        } else if (userType === "organizer") {
            user = await Organizer.findOne({ email });
        }

        if (!user) return res.status(400).send("ไม่พบบัญชีนี้");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("รหัสผ่านไม่ถูกต้อง");

        // สร้าง token
        const token = jwt.sign(
            {
                id: user._id.toString(),   // แปลง ObjectId เป็น string
                role: user.role.toLowerCase(), // ป้องกัน case-sensitive
                email: user.email          // ใส่ email ไว้ใช้ใน nav
            },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, { httpOnly: true });

        // redirect ตาม role
        if (user.role === "attendee") {
            return res.redirect("/");
        } else {
            return res.redirect("/");
        }
    } catch (err) {
        console.error("❌ Login Error:", err.message);
        res.status(500).send("เกิดข้อผิดพลาดภายในระบบ");
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    console.log("🚪 User logged out");
    res.redirect("/");
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const role = req.user.role.toLowerCase();

        // เลือก model ตาม role
        const Model = role === "organizer" ? Organizer : Attendee;

        // หาคนที่ล็อกอินอยู่
        const user = await Model.findById(userId);
        console.log("🧠 userId:", userId);
        console.log("🧠 role:", role);
        if (!user) return res.status(404).send("ไม่พบบัญชีผู้ใช้");

        console.log("🧾 req.file:", req.file ? req.file.originalname : "❌ no file");
        console.log("🧾 req.file.buffer size:", req.file?.buffer?.length || 0);
        console.log("🧾 req.body:", req.body);
        // อัปเดตรูปถ้ามีไฟล์
        if (req.file) {
            try {
                // ✅ ใช้ Promise + end ภายใน callback เดียวกัน
                const uploadResult = await new Promise((resolve, reject) => {
                    const upload = cloudinary.uploader.upload_stream(
                        {
                            folder: `event_ticketing/${role}_profiles`,
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    upload.end(req.file.buffer); // ✅ ต้องอยู่ข้างใน Promise นี้เท่านั้น
                });

                // ✅ update user หลังอัปโหลดสำเร็จ
                user.profileImage = uploadResult.secure_url;
                user.username = req.body.username || user.username;
                user.email = req.body.email || user.email;
                await user.save();

                console.log(`✅ Updated profile for ${role}:`, user.profileImage);
                return res.redirect("/profile");
            } catch (error) {
                console.error("❌ Cloudinary Upload Error:", error);
                return res.status(500).send("อัปโหลดรูปภาพล้มเหลว");
            }
        } else {
            // ไม่มีไฟล์ → อัปเดตเฉพาะชื่อหรืออีเมล
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            await user.save();
            console.log("✅ Updated user info only (no image)");
            return res.redirect("/api/profile");
        }
    } catch (err) {
        console.error("❌ Update Profile Error:", err);
        res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    }
};