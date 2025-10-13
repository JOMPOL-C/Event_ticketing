# 🎫 อีเวนต์ทิคเก็ต (Event Ticketing)

ระบบจัดการอีเวนต์และจำหน่ายบัตรเข้าร่วมงาน ที่ช่วยให้ผู้จัดงานสามารถสร้างและบริหารอีเวนต์ของตนเองได้ง่าย  
พร้อมทั้งเปิดให้ผู้เข้าร่วมค้นหาอีเวนต์และจองบัตรได้สะดวกผ่านระบบออนไลน์

---

## 🧭 ขอบเขตของโครงการ (Scope of Work)

### ระบบสมาชิก (User Authentication System)
- ผู้ใช้ทั่วไปสามารถสมัครสมาชิกและเข้าสู่ระบบได้
- แบ่งผู้ใช้ออกเป็น 2 บทบาทหลัก:
  - **ผู้เข้าร่วม (Attendee)**  
  - **ผู้จัดงาน (Organizer)**

---

### การจัดการอีเวนต์ (Event Management) – สำหรับ Organizer
- สร้าง, แก้ไข และลบอีเวนต์ของตนเองได้
- กำหนดรายละเอียดอีเวนต์ได้ (ชื่อ, รายละเอียด, รูปภาพ, วันที่, สถานที่, จำนวนบัตร, ราคา)
- มีหน้า **Dashboard** แสดงรายชื่อผู้ที่ซื้อบัตรเข้าร่วมอีเวนต์ของตนเอง

---

### การค้นหาและซื้อตั๋ว (Event Discovery & Booking) – สำหรับ Attendee
- ดูรายการอีเวนต์ทั้งหมดที่เปิดขายบัตร
- ค้นหาและกรองอีเวนต์ตามชื่อหรือหมวดหมู่
- ดูรายละเอียดของแต่ละอีเวนต์ได้
- ทำการจอง/ซื้อตั๋ว (จำลองการชำระเงิน)
- ดูประวัติการซื้อบัตรของตนเองได้
- ผู้ใช้สามารถแก้ไขโปรไฟล์ส่วนตัวได้

---

## 🔐 System Roles & Permissions

| ฟังก์ชัน / การกระทำ | ผู้ใช้ทั่วไป (Guest) | ผู้เข้าร่วม (Attendee) | ผู้จัดงาน (Organizer) |
|----------------------|:--------------------:|:-----------------------:|:----------------------:|
| ดูหน้าแรก / รายการอีเวนต์ | ✅ | ✅ | ✅ |
| ดูรายละเอียดอีเวนต์ | ✅ | ✅ | ✅ |
| สมัครสมาชิก | ✅ | ❌ | ❌ |
| เข้าสู่ระบบ | ✅ | ✅ | ✅ |
| แก้ไขโปรไฟล์ส่วนตัว | ❌ | ✅ | ❌ |
| ซื้อ/จองบัตรอีเวนต์ | ❌ | ✅ | ❌ |
| ดูประวัติการซื้อตั๋ว | ❌ | ✅ | ❌ |
| สร้างอีเวนต์ใหม่ | ❌ | ❌ | ✅ |
| ดูรายการอีเวนต์ของตนเอง | ❌ | ❌ | ✅ |
| แก้ไขอีเวนต์ของตนเอง | ❌ | ❌ | ✅ |
| ลบอีเวนต์ของตนเอง | ❌ | ❌ | ✅ |
| ดู Dashboard (รายชื่อผู้ซื้อตั๋ว) | ❌ | ❌ | ✅ |

---

## 🧩 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-9C9C9C?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![bcryptjs](https://img.shields.io/badge/bcryptjs-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![cookie-parser](https://img.shields.io/badge/cookie--parser-000000?style=for-the-badge&logo=node.js&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

---
