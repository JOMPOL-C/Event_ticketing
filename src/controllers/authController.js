const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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

exports.login = async (req, res) => {
    const { email, password, userType } = req.body;

    try {
        const user = await User.findOne({ email, role: userType });
        if (!user) return res.status(400).send("ไม่พบบัญชีนี้");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("รหัสผ่านไม่ถูกต้อง");

        // JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });

        // redirect ตามประเภท
        if (userType === "attendee") {
            return res.redirect("/attendee/home");
        } else {
            return res.redirect("/organizer/dashboard");
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("เกิดข้อผิดพลาดภายในระบบ");
    }
};

