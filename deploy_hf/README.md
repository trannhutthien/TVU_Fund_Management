---
title: TVU Fund Management
emoji: 🏦
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
---

# TVU Fund Management System

Backend API for TVU (Trà Vinh University) Development Fund Management System.

## Features

- 🔐 Authentication & Authorization (JWT + Google OAuth)
- 💰 Fund Management (Multiple funds with categories)
- 📝 Application Processing (Support requests from students)
- 👥 Donor Management
- 💳 Transaction Tracking
- 📊 Reports & Statistics
- ✅ Approval Workflow (3-level approval)
- 🔍 Inspection & Verification
- 📧 Email Notifications
- 💸 Debt Management & Payment Schedules

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** MySQL (Aiven)
- **Authentication:** JWT + Google OAuth
- **File Upload:** Multer
- **Email:** Nodemailer
- **Document Generation:** Docxtemplater, ExcelJS

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `PORT` - Server port (default: 7860 for HF Spaces)
- Optional: Google OAuth, Email, Gemini AI credentials

## API Endpoints

- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/funds` - Fund management
- `/api/applications` - Support applications
- `/api/donations` - Donations & donors
- `/api/transactions` - Financial transactions
- `/api/statistics` - Reports & statistics
- And more...

## Deployment

This space runs a Dockerized Node.js Express backend.

**Port:** 7860 (Hugging Face Spaces standard)

## License

MIT License

## Contact

For questions or support, please contact the development team.
