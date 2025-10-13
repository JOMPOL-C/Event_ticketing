require("dotenv").config();
console.log("OMISE_PUBLIC_KEY loaded?", !!process.env.OMISE_PUBLIC_KEY);
console.log("OMISE_SECRET_KEY loaded?", !!process.env.OMISE_SECRET_KEY);

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pagerender = require('./src/utils/pagerender');
const { Script } = require("vm");


const app = express();
const port = process.env.PORT || 3000;

/* ---------- Middlewares ---------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// load .env
require('dotenv').config();


// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


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
app.get("/select_login", pagerender.renderSelectlogin);

/* ---------- Start ---------- */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});