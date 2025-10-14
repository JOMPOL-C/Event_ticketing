const jwt = require("jsonwebtoken");
const Attendee = require("../models/attendeeModel");
const Organizer = require("../models/organizerModel");

exports.authRequired = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("❌ No token found, redirecting to login");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔹 Token payload:", jwt.decode(token));
    const Model = decoded.role === "organizer" ? Organizer : Attendee;
    const user = await Model.findById(decoded.id).lean();

    if (!user) {
      console.log("❌ User not found in DB");
      return res.redirect("/login");
    }

    req.user = user;
    res.locals.user = user; // ✅ ให้ EJS ทุกหน้าเข้าถึงได้

    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.clearCookie("token");
    res.redirect("/login");
  }
};
