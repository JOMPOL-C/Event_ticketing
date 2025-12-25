# 🎫 Event Ticketing System

An online **event management and ticketing platform**.  
Organizers can easily create and manage events, while attendees can discover events, purchase tickets, and store **digital tickets** in one unified system.

---

## 🧭 Project Scope

### User Authentication System
- Supports user registration and login using **JWT + Cookies**
- Two main user roles:
  - 👤 **Attendee** – Purchase tickets, manage profile, view ticket purchase history
  - 🧑‍💼 **Organizer** – Create, edit, delete events, and view attendee information

---

### Event Management (Organizer Side)
- Create, edit, and delete owned events
- Define essential event information:
  - Event name, description, location, cover image  
  - Start & end dates, ticket price, total ticket capacity
- Automatic **remaining ticket** tracking
- Event status control:
  - `draft` – Not published
  - `published` – Available for purchase
  - `archived` – Event finished / permanently closed
- Organizer **dashboard** displaying ticket buyers for each event
- Automatically prevents ticket sales after the event has ended

---

### Event Discovery & Booking (Attendee Side)
- **Home Page** displays only events that are currently available for ticket purchase  
  (sold-out or ended events are hidden)
- **All Events Page** displays all events, including those marked as **SOLD OUT** or ended
- Search and filtering features:
  - Search by name, location, price, or date
  - Sort by start date or price
- **Event Detail Page** includes:
  - Event information, remaining tickets, and event status  
    (upcoming / ongoing / ended)
  - **Two-stage countdown system**:
    - Before event starts → “Days remaining until event begins”
    - During event → “Days remaining until event ends”
  - Automatic notification and redirection to Home page when the event ends
- Mock ticket checkout system:
  - Checks ticket availability before purchase
  - Deducts ticket stock immediately after a successful purchase

---

### Digital Ticket Management
- “**My Tickets**” page for each user
- Each ticket includes:
  - Event name
  - Event date range
  - Ticket code
  - QR Code for ticket validation (mock)
  - Event status (upcoming / ongoing / ended)
- If the original event is deleted, the ticket displays  
  **“This event has been removed”** to prevent system errors
- Ticket card layout is designed to resemble a real ticket:  
  clean, minimal, shadowed, and consistent in size

---

### Frontend Views
- Built with **EJS Template Engine**
- Structured HTML + CSS (Tailwind-style utility approach)
- Fully responsive for all screen sizes
- Event and ticket cards visually indicate status using **clear colors and labels**

---

## 🔐 System Roles & Permissions

| Feature / Action | Guest | Attendee | Organizer |
|-----------------|:-----:|:--------:|:---------:|
| View home / event list | ✅ | ✅ | ✅ |
| View event details | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ |
| Edit personal profile | ❌ | ✅ | ❌ |
| Purchase / book tickets | ❌ | ✅ | ❌ |
| View ticket purchase history | ❌ | ✅ | ❌ |
| Create new event | ❌ | ❌ | ✅ |
| View own events | ❌ | ❌ | ✅ |
| Edit own events | ❌ | ❌ | ✅ |
| Delete own events | ❌ | ❌ | ✅ |
| View dashboard (attendee list) | ❌ | ❌ | ✅ |

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
