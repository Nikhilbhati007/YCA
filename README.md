# YCA PACE

**Yadav Cricket Academy & Pace Foundation (Nagpur)**  
*Motto: Train. Perform. Progress.*

A full-stack cricket academy management web platform built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

---

## 🏏 Portals & Key Features

### 1. Public Landing & Admissions Portal (`/`)
- **Pitch & Timings:** High-impact showcase of morning (6:30–9:30 AM), evening (4:30–7:00 PM), and night floodlight sessions on Hingna Road, Nagpur.
- **Batches:** U14, U16, U19, U23, and Open categories.
- **Pace Foundation Showcase:** Fast bowling biomechanics diagram illustrating line and length zones (*Yorker, Full, Good Length, Short*).
- **Trial Booking & WhatsApp Inquiries:** Direct WhatsApp booking form with pre-filled message generation.
- **Local SEO:** Integrated JSON-LD `SportsClub` schema for Nagpur discoverability.

### 2. Admin / Academy Management Office (`/admin`)
- **Executive Metrics:** Live count of active students, daily attendance percentage, fee collection pool, and trial leads.
- **Student Roster & Enrollment:** Searchable directory with batch filters, role tags, and "Enroll Player" modal.
- **Batch Capacity:** Schedule breakdown across 3 turf wickets and 4 cemented nets.
- **Fee Ledger:** Month-by-month fee status (Paid, Pending, Overdue), offline cash recording, and 1-click WhatsApp payment reminders.
- **Trial Lead CRM:** Tracking prospect pipeline (*New Lead → Contacted → Trial Booked → Enrolled*).
- **Broadcast Announcements:** Broadcast circulars and alerts directly to coaches and parents.

### 3. Coach Field Operations (`/coach`)
- **Daily Attendance Roster:** Switch between active batches, 1-click "Mark All Present", and persistent session saving.
- **Pace Foundation Video Skill Analysis:** Record fast-bowling biomechanics reviews (*Run-up, Release Point, Seam & Wrist, Follow-through*), clocked speeds (km/h), and coaching pointers that sync to parents.
- **Match Performance Center:** Log batting runs and bowling figures against opponent clubs.

### 4. Parent Portal (`/parent`)
- **Multi-Child Switcher:** Seamlessly switch between enrolled siblings.
- **Interactive Attendance Heatmap:** Visual attendance percentage and session-by-session dot matrix.
- **Fee Account & UPI Payment:** View due dates, simulated UPI QR code checkout modal, and printable branded PDF receipts.
- **Video Skill Player:** Watch coach-uploaded biomechanical breakdowns and speeds.
- **Match Scorecards & Noticeboard:** Track weekend match figures and holiday notices.

### 5. Role-Based Login (`/login`)
- Role tabs for **Admin**, **Coach**, and **Parent** with instant demo access.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16.3.8 (App Router & Turbopack)
- **UI & Components:** React 19.2.8
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom cricket theme
- **Icons:** Lucide React
- **Typography:** Barlow & Barlow Condensed (via Google Fonts)
- **Database Schema:** PostgreSQL / Supabase ready (`supabase/schema.sql`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🗄 Database Setup (Supabase)

A production PostgreSQL schema with Row-Level Security (RLS) policies is included in [`supabase/schema.sql`](supabase/schema.sql):
- `profiles` (Admin, Coach, Parent)
- `batches` & `players`
- `attendance`
- `fees`
- `match_performances`
- `video_analyses`
- `announcements` & `enquiries`

You can run this migration directly in the Supabase SQL Editor.