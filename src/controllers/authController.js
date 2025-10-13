const Organizer = require("../models/organizerModel");
const Attendee = require("../models/attendeeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// สมัครสมาชิกผู้เข้าร่วม
exports.registerAttendee = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new Attendee({ username, email, password, role: "attendee" });
        await user.save();
        res.redirect("/select_login");
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
            { id: user._id, role: user.role },
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