require("dotenv").config();
console.log("OMISE_PUBLIC_KEY loaded?", !!process.env.OMISE_PUBLIC_KEY);
console.log("OMISE_SECRET_KEY loaded?", !!process.env.OMISE_SECRET_KEY);

const Attendee = require("./src/models/attendeeModel");
const Organizer = require("./src/models/organizerModel");

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pagerender = require('./src/utils/pagerender');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
// const Multer = require('multer');


const app = express();
const port = process.env.PORT || 3000;

/* ---------- Middlewares ---------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));


app.use(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = decoded.role === "organizer" ? Organizer : Attendee;
    const user = await Model.findById(decoded.id).lean();

    res.locals.user = user || decoded; // ถ้าไม่มีใน DB ใช้ข้อมูลจาก token
    console.log("✅ User loaded:", res.locals.user);
  } catch (err) {
    console.error("JWT decode error:", err.message);
    res.locals.user = null;
  }

  next();
});



// load .env
require('dotenv').config();


// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


/* ---------- View Engine (EJS) ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ---------- Routers ---------- */
fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });

/* ---------- Page render (EJS pages) ---------- */
app.get("/", pagerender.renderHome);
app.get("/attendee", pagerender.renderattendee);
app.get("/organizer", pagerender.renderorganizer);
app.get("/login", pagerender.renderSelectlogin);
// app.get("/profile", pagerender.renderProfile);


/* ---------- Start ---------- */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});