const express = require("express");
const router = express.Router();
const Event = require("../models/eventModel"); // import model event

// แสดงหน้า Home พร้อมอีเวนต์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    // ดึงอีเวนต์ทั้งหมดจากฐานข้อมูล
    const events = await Event.find().sort({ startAt: 1 });
    // ส่ง events ไปให้หน้า home.ejs
    res.render("home", { events });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.render("home", { events: [] });
  }
});

module.exports = router;
