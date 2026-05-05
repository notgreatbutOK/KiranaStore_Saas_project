# 🛒 KiranaStore SaaS

A full-stack SaaS-based application designed for **kirana (grocery) store management**, featuring inventory tracking, billing, WhatsApp automation, and subscription-based store management.

---

## 🚀 Features

### 🏪 Store Admin

* Product management with images, units, and categories
* Customer management
* Order tracking (cash & udhaar)
* Udhaar ledger with payment tracking
* Dashboard with analytics (revenue, stock, top products)
* Subscription management using PayU

---

### 🤖 WhatsApp Bot

* Customer self-registration (name & email)
* Product browsing via chat
* Cart and checkout flow
* Payment selection (cash / udhaar)
* Order confirmation & delivery notifications
* Due balance reminders

---

### 🧑‍💼 Super Admin

* Manage all stores (create, suspend, delete)
* Platform-wide analytics
* Revenue tracking
* Weekly email reports
* Subscription notifications

---

### 🔔 Automated Notifications

* Welcome email & WhatsApp message
* Low stock alerts (3 times daily)
* Daily sales summary (8 PM)
* Due reminders (daily)
* Weekly platform report (Monday)
* Reorder reminders (4 times/week)
* Subscription confirmations

---

## 🛠 Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Node.js + Express
* **Database:** MongoDB
* **WhatsApp API:** Meta WhatsApp Cloud API
* **Payments:** PayU (Test Mode)
* **Image Storage:** Cloudinary
* **Emails:** Nodemailer (Gmail)
* **Schedulers:** Node-cron

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js v18+
* MongoDB (Local or Atlas)
* Meta Developer Account
* Cloudinary Account
* PayU Account
* Gmail Account

---

### 📦 Installation

```bash
# Clone repo
git clone https://github.com/notgreatbutOK/KiranaStore_Saas_project.git

# Backend setup
cd storeapp
npm install

# Frontend setup
cd ../frontend
npm install
```

---

### ▶️ Run Project

```bash
# Start backend
cd storeapp
node server.js

# Start frontend
cd frontend
npm run dev
```

---

### 🌐 WhatsApp Webhook Setup

```bash
ngrok http 127.0.0.1:5000
```

* Copy ngrok URL
* Add `/webhook` at the end
* Paste in Meta Developer Dashboard

---

## 🔐 Environment Variables

Create a `.env` file inside **storeapp/**:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/kirana_saas
JWT_SECRET=your_jwt_secret

WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYU_MERCHANT_KEY=your_merchant_key
PAYU_SALT=your_salt
PAYU_CLIENT_ID=your_client_id
PAYU_CLIENT_SECRET=your_client_secret
PAYU_MODE=test

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```



## 📁 Project Structure

```
KiranaStore_Saas_project/
├── storeapp/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        └── components/
```

---

## 💬 WhatsApp Bot Commands

| Command        | Description      |
| -------------- | ---------------- |
| hi             | View products    |
| order name qty | Add item to cart |
| checkout       | View cart        |
| cash / udhaar  | Select payment   |
| balance        | Check due        |

---

## ⏱ Cron Jobs Schedule

| Job                | Time                       |
| ------------------ | -------------------------- |
| Trial expiry check | 9 AM daily                 |
| Low stock alerts   | 8 AM, 1 PM, 6 PM           |
| Daily summary      | 8 PM                       |
| Due reminders      | 9 AM                       |
| Reorder reminders  | Mon, Tue, Thu, Sat (10 AM) |
| Super admin report | Monday (9 AM)              |

---

## 📌 Notes

* `node_modules` is not included in repo (install via `npm install`) 
* PayU is in test mode (no real payments)
* WhatsApp uses test number (limited recipients)
* Images must be manually uploaded for products

---

## 👨‍💻 Author

**Gurram Harshavardhan**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
