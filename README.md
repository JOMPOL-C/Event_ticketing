# 🎫 อีเวนต์ทิคเก็ต (Event Ticketing)

ระบบจัดการอีเวนต์และจำหน่ายบัตรเข้าร่วมงานออนไลน์  
ผู้จัดสามารถสร้างและบริหารอีเวนต์ได้เองอย่างง่ายดาย  
ผู้เข้าร่วมสามารถค้นหาอีเวนต์ ซื้อตั๋ว และเก็บบัตรแบบดิจิทัลได้ในระบบเดียว

---

## 🧭 ขอบเขตของโครงการ (Scope of Work)

### ระบบสมาชิก (User Authentication System)
- รองรับการสมัครสมาชิกและเข้าสู่ระบบผ่าน **JWT + Cookie**
- แบ่งผู้ใช้ออกเป็น 2 บทบาทหลัก:
  - 👤 **ผู้เข้าร่วม (Attendee)** – ซื้อบัตร, จัดการโปรไฟล์, ดูประวัติการซื้อตั๋ว  
  - 🧑‍💼 **ผู้จัดงาน (Organizer)** – สร้าง, แก้ไข, ลบอีเวนต์ และดูข้อมูลผู้เข้าร่วม

---

### การจัดการอีเวนต์ (Event Management) – สำหรับ Organizer
- เพิ่ม, แก้ไข และลบอีเวนต์ของตนเองได้  
- กำหนดข้อมูลสำคัญของอีเวนต์:
  - ชื่อ, รายละเอียด, สถานที่, รูปภาพปก, วันที่เริ่ม-สิ้นสุด, ราคาบัตร, จำนวนบัตรทั้งหมด  
- ระบบตรวจสอบ **จำนวนตั๋วคงเหลือ (Remaining Tickets)** อัตโนมัติ
- ระบบจำกัดสถานะอีเวนต์:  
  - `draft` (ฉบับร่าง)  
  - `published` (เผยแพร่ให้ซื้อได้)  
  - `archived` (เก็บถาวร/จบงานแล้ว)
- หน้า **Dashboard** แสดงรายชื่อผู้ที่ซื้อบัตรแต่ละงาน
- ป้องกันการขายบัตรหลังอีเวนต์สิ้นสุดโดยอัตโนมัติ

---

### การค้นหาและซื้อตั๋ว (Event Discovery & Booking) – สำหรับ Attendee
- หน้า **Home** แสดงเฉพาะอีเวนต์ที่ยังเปิดขายบัตรอยู่  
  (อีเวนต์ที่ตั๋วหมดหรือสิ้นสุดแล้วจะไม่แสดง)
- หน้า **อีเวนต์ทั้งหมด (All Events)** แสดงทุกอีเวนต์ พร้อมป้าย **SOLD OUT** สำหรับงานที่หมดบัตรหรือสิ้นสุดแล้ว
- ฟังก์ชันค้นหา / กรอง:
  - ค้นหาตามชื่อ, สถานที่, ราคา, วันที่
  - เรียงลำดับได้ตาม “วันเริ่ม” หรือ “ราคา”
- หน้า **รายละเอียดอีเวนต์ (Detail Page)** แสดง:
  - รายละเอียดงาน, จำนวนบัตรคงเหลือ, สถานะ (ยังไม่เริ่ม / กำลังจัดงาน / สิ้นสุดแล้ว)
  - ระบบ **นับถอยหลังสองช่วง**:
    - ก่อนงานเริ่ม → “เหลืออีกกี่วันก่อนเริ่มงาน”
    - ระหว่างงาน → “เหลืออีกกี่วันก่อนงานสิ้นสุด”
  - เมื่ออีเวนต์สิ้นสุด ระบบจะแจ้งเตือนและพาไปหน้า Home โดยอัตโนมัติ
- ระบบสั่งซื้อบัตรจำลอง (Mock Checkout)
  - ตรวจสอบจำนวนบัตรคงเหลือก่อนชำระเงิน
  - ตัดสต็อกบัตรทันทีเมื่อสั่งซื้อสำเร็จ

---

### ระบบบัตรดิจิทัล (Ticket Management)
- แสดงหน้ารวม **“ตั๋วของฉัน”** สำหรับผู้ใช้แต่ละคน
- แต่ละบัตรประกอบด้วย:
  - ชื่ออีเวนต์
  - ช่วงวันจัดงาน
  - รหัสบัตร (Ticket Code)
  - QR Code สำหรับตรวจสอบบัตร (จำลอง)
  - สถานะของงาน (ยังไม่เริ่ม / กำลังจัดงาน / สิ้นสุดแล้ว)
- หากอีเวนต์ต้นทางถูกลบ บัตรจะแสดงข้อความ “อีเวนต์นี้ถูกลบแล้ว” เพื่อป้องกัน error
- Layout การ์ดตั๋วออกแบบให้คล้ายบัตรจริง: โปร่ง โล่ง มีเงา และขนาดคงที่

---

### ส่วนติดต่อผู้ใช้ (Frontend View)
- เขียนด้วย **EJS Template Engine**
- ใช้โครงสร้าง HTML + CSS (Tailwind Style) ที่อ่านง่าย
- รองรับการ responsive ทุกขนาดหน้าจอ
- การ์ดอีเวนต์และบัตรออกแบบให้ “แสดงสถานะด้วยสีและข้อความอย่างชัดเจน”

---

## 🔐 System Roles & Permissions

| ฟังก์ชัน / การกระทำ | Guest | Attendee | Organizer |
|----------------------|:----:|:----:|:----:|
| ดูหน้าแรก / รายการอีเวนต์ | ✅ | ✅ | ✅ |
| ดูรายละเอียดอีเวนต์ | ✅ | ✅ | ✅ |
| สมัครสมาชิก / เข้าสู่ระบบ | ✅ | ✅ | ✅ |
| ซื้อ/จองบัตรอีเวนต์ | ❌ | ✅ | ❌ |
| ดูประวัติการซื้อตั๋ว | ❌ | ✅ | ❌ |
| สร้าง / แก้ไข / ลบอีเวนต์ | ❌ | ❌ | ✅ |
| ดูรายชื่อผู้ซื้อตั๋ว | ❌ | ❌ | ✅ |

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
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Omise (Mock Payment)](https://img.shields.io/badge/Payment-Omise-blue?style=for-the-badge)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
