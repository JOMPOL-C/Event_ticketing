const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// --- Core & libs ---
const express = require('express');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const methodOverride = require('method-override');
const fs = require('fs');


// --- Models used in auth middleware ---
const Attendee = require('./src/models/attendeeModel');
const Organizer = require('./src/models/organizerModel');

// --- Page controllers / utils ---
const pageCtrl = require('./src/controllers/pageController');
const pagerender = require('./src/utils/pagerender');

const app = express();
const port = process.env.PORT || 3000;

// ถ้าวิ่งหลัง proxy (Render/Heroku/NGINX)
app.set('trust proxy', 1);

// --- Middlewares (global) ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));
app.use(methodOverride('_method')); // รองรับ PATCH/DELETE จากฟอร์ม


// --- (เลือก) log คีย์เฉพาะตอน dev ---
if (process.env.NODE_ENV !== 'production') {
  console.log('OMISE_PUBLIC_KEY loaded?', !!process.env.OMISE_PUBLIC_KEY);
  console.log('OMISE_SECRET_KEY loaded?', !!process.env.OMISE_SECRET_KEY);
}

// --- Attach user จาก JWT cookie -> res.locals.user ---
app.use(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = decoded.role === 'organizer' ? Organizer : Attendee;
    const user = await Model.findById(decoded.id).lean();
    res.locals.user = user || decoded; // fallback ข้อมูลจาก token
  } catch (err) {
    console.error('JWT decode error:', err.message);
    res.locals.user = null;
  }
  next();
});

app.use((req, res, next) => {
  if (typeof res.locals.title === 'undefined') res.locals.title = 'EventTic';
  next();
});

// --- Cloudinary config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


// --- MongoDB connect ---
const uri = (process.env.MONGODB_URI || '').trim();
if (!uri) {
  console.error('❌ MONGODB_URI is missing. Put it in your .env at project root.');
  process.exit(1);
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('🚫 MongoDB connection error:', err.message);
    process.exit(1);
  });


// --- View Engine (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ---------- Routers ---------- */
fs.readdirSync(path.join(__dirname, "src/routers"))
  .filter(file => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(path.join(__dirname, "src/routers", file));
    console.log("👉 Loaded file:", file);
    app.use("/api", route);
  });

// --- Page render (EJS pages) ---
app.get('/', pageCtrl.home); // ดึง upcoming events จาก DB
app.get('/attendee', pagerender.renderattendee);
app.get('/organizer', pagerender.renderorganizer);
app.get('/login', pagerender.renderSelectlogin);

// --- 404 ---
app.use((req, res) => {
  res.status(404).render('404', { title: 'ไม่พบหน้า' });
});

// --- Error handler (Express 5) ---
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  const status = err.status || 500;
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ error: err.message || 'Server error' });
  }
  return res.status(status).render('500', { title: 'เกิดข้อผิดพลาด', message: err.message || 'Server error' });
});

// --- Start ---
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
