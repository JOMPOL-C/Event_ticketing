const jwt = require("jsonwebtoken");

exports.authRequired = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("❌ No token found, redirecting to login");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // เก็บข้อมูล user (id, role)
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.clearCookie("token");
    res.redirect("/login");
  }
};
