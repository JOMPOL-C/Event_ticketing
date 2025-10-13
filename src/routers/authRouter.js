const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");


router
    .post("/register/attendee", authController.registerAttendee) // /api/register/attendee
    .post("/register/organizer", authController.registerOrganizer) // /api/register/organizer
    .post("/login", authController.login) // /api/login

router
    .get("/logout", authController.logout); // /api/logout

module.exports = router;