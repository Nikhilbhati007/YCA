# 🏏 YCA PACE — Client Handover & Launch Guide
**Client:** Yadav Cricket Academy & Pace Foundation  
**Head Coach & Founder:** Jay Singh Yadav (+91 77097 05181)  
**Location:** Mahajanwadi, behind Dahi Handi Ground (Bhagiratha Park), Hingna Road, Nagpur  
**Platform Version:** 1.0.0 (Production Ready)  

---

## 📋 Table of Contents
1. [Executive Summary & Deliverables](#1-executive-summary--deliverables)
2. [Step 1: Production Deployment (Vercel / Custom Domain)](#step-1-production-deployment-vercel--custom-domain)
3. [Step 2: Cloud Database Setup (Supabase)](#step-2-cloud-database-setup-supabase)
4. [Step 3: Payment Gateway & Bank Account Linking (Razorpay & UPI)](#step-3-payment-gateway--bank-account-linking-razorpay--upi)
5. [Step 4: Operational Logins & Access Credentials](#step-4-operational-logins--access-credentials)
6. [Step 5: Daily Operating SOP (Admin & Coach Workflows)](#step-5-daily-operating-sop-admin--coach-workflows)
7. [Step 6: Parent Launch Broadcast (WhatsApp Template)](#step-6-parent-launch-broadcast-whatsapp-template)
8. [Maintenance, Backups & Support](#maintenance-backups--support)

---

## 1. Executive Summary & Deliverables

The web platform is delivered complete with zero dummy data and ready for live academy use:

| Component | URL / Route | Primary Users | Purpose |
| :--- | :--- | :--- | :--- |
| **Public Landing Page** | `/` | Public & Prospective Students | Batches, fast-bowling biomechanics showcase, ground location, and free trial WhatsApp booking. |
| **Admin Control Center** | `/admin` | Head Coach & Academy Office | Student directory (31 enrolled players), fee ledger, cash recording, printable receipts, trial lead pipeline, notice broadcasts. |
| **Coach Operations** | `/coach` | Coach Jay Singh & Nilesh Raut | Daily batch attendance roster, fast-bowling video skill upload (clocked km/h + feedback), match scorecards. |
| **Parent Portal** | `/parent` | Academy Parents & Students | Attendance percentage, monthly coaching fee account, UPI online payments, printable receipts, coach video reviews. |
| **Role-Based Auth** | `/login` | All Academy Stakeholders | Secure role-based login (Email OTP/Password for Admin & Coach, Student Name + DOB for Parents). |

---

## Step 1: Production Deployment (Vercel / Custom Domain)

### A. Deploy to Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with GitHub/GitLab.
2. Click **Add New... → Project** and select the `YCA_Pace` repository.
3. In the project settings, under **Environment Variables**, add the variables from your `.env.local` or `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   NEXT_PUBLIC_ACADEMY_UPI_ID=7709705181@upi
   NEXT_PUBLIC_ACADEMY_NAME=Yadav Cricket Academy & Pace Foundation
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. Click **Deploy**. Vercel will build and assign an instant HTTPS URL (e.g., `ycapace.vercel.app`).

### B. Connect the Academy Custom Domain (e.g., `ycapace.com`)
1. In the Vercel Project Dashboard, navigate to **Settings → Domains**.
2. Enter the client's custom domain (e.g. `ycapace.com` or `yadavcricketacademy.com`).
3. In the client's domain registrar DNS settings (GoDaddy, Namecheap, Hostinger, etc.), add:
   - **Type A Record**: `@` → `76.76.21.21`
   - **Type CNAME Record**: `www` → `cname.vercel-dns.com`
4. SSL certificates generate automatically within 5–15 minutes.

---

## Step 2: Cloud Database Setup (Supabase)

To enable live cloud sync for attendance, fee records, student profiles, and video uploads:

1. Create a free account at [supabase.com](https://supabase.com) using the academy's official email (e.g., `ycapace@gmail.com`).
2. Click **New Project**:
   - **Name:** `YCA-PACE-Nagpur`
   - **Region:** `South Asia (Mumbai) - ap-south-1` (ensures lowest latency for Nagpur users).
3. In the left navigation, click **SQL Editor → New Query** and execute the following 3 scripts in order:

### Script 1: Database Schema & Security
- Copy and run the entire file: [`supabase/schema.sql`](supabase/schema.sql)
- *Creates: Batches, Players, Attendance, Fees, Match Performances, Video Analyses, Enquiries, Announcements, and Row-Level Security (RLS) policies.*

### Script 2: Cloud Video Storage Bucket
- Copy and run the entire file: [`supabase/storage.sql`](supabase/storage.sql)
- *Creates the public `bowling-videos` bucket (100MB video file support for high-speed pitch camera recordings).*

### Script 3: Real Academy Roster Seed
- Copy and run the entire file: [`supabase/seed.sql`](supabase/seed.sql)
- *Seeds the 5 active batches (U12, U14, U16, U19, Open) and the 31 genuine players from `players.csv`.*

4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public key**
   Paste these into your Vercel Environment Variables.

---

## Step 3: Payment Gateway & Bank Account Linking (Razorpay & UPI)

Parents can clear monthly coaching fees via **UPI Apps (GPay, PhonePe, Paytm, BHIM)** or **NetBanking/Cards**:

### Option 1: Direct UPI (Instant, Zero Setup Fees, Direct Bank Deposit)
- The system is pre-configured to Coach Jay Singh Yadav's registered UPI ID: **`7709705181@upi`**.
- When parents click **Pay via UPI QR / App Intent**, payments deposit directly into the academy's bank account with 0% transaction fee.

### Option 2: Razorpay Business Gateway (Automated Receipt Verification)
1. Register at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Complete KYC using the Academy's Bank Account & PAN.
3. Navigate to **Account Settings → API Keys** and click **Generate Key**.
4. Set in production environment variables:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`

---

## Step 4: Operational Logins & Access Credentials

### 1. Academy Management Office (Admin)
- **Portal URL:** `/admin`
- **Email:** `admin@ycapace.com` (or the academy's registered email)
- **Default Password:** `password123` (Client should change after first login)
- **Features:**
  - View total collected fees and pending dues.
  - Record offline cash collections with instant digital receipt generation.
  - 1-Click WhatsApp payment reminders to parents.
  - Website trial lead CRM.
  - Broadcast circulars to parents and coaches.

### 2. Coach Field Operations
- **Portal URL:** `/coach`
- **Email:** `coach@ycapace.com` (Jay Singh Yadav / Nilesh Raut)
- **Default Password:** `password123`
- **Features:**
  - Select batch (U12, U14, U16, U19, Open) and mark attendance in 1 click.
  - Record bowling videos directly from mobile phone camera with clocked speed (km/h) and biomechanics feedback.
  - Publish weekend match scorecards.

### 3. Student & Parent Login
Parents do not need to remember complicated passwords or email accounts:
- **Portal URL:** `/parent` (or click **Login → Parent / Student** on homepage)
- **User ID:** Student's Registered Full Name (e.g. `Aman Alam` or Player Code `YCA-0041`)
- **Password:** Student's Date of Birth in `DD-MM-YYYY` format (e.g. `29-11-2013`)

#### Sample Logins from Real Roster:
| Student Name | ID | Password (DOB) | Batch |
| :--- | :--- | :--- | :--- |
| **Aman Alam** | `Aman Alam` | `29-11-2013` | U14 |
| **Nayan Chaudhari** | `Nayan Chaudhari` | `25-05-2013` | U16 |
| **Pushkar Gadge** | `Pushkar Gadge` | `05-05-2009` | U19 |
| **Gaarvi Bhaisar** | `Gaarvi Bhaisar` | `14-02-2018` | U12 |

---

## Step 5: Daily Operating SOP (Admin & Coach Workflows)

### Morning / Evening Routine for Coaches
1. Open `yourdomain.com/coach` on smartphone.
2. Select current batch (e.g., **U14 Morning**).
3. Tap **Mark All Present** or toggle absent students.
4. Tap **Save Attendance**. Attendance is instantly recorded in the cloud.
5. If capturing high-speed bowling clips:
   - Tap **Pace Video Review**.
   - Select student name, choose technique area (e.g. *Release Point*), enter clocked speed (e.g. *118 km/h*), attach video, and tap **Publish**.

### Monthly Routine for Academy Admin
1. Open `yourdomain.com/admin`.
2. Click **Fee Ledger** to see which students have cleared fees for the month.
3. For cash payments received at the ground:
   - Click **Record Cash** next to the student's invoice.
   - Click **Receipt** to download or print the official branded YCA Pace PDF receipt.
4. For unpaid dues:
   - Click **Remind WA** to automatically send a polite WhatsApp reminder with UPI details.

---

## Step 6: Parent Launch Broadcast (WhatsApp Template)

Copy and send this message to the Academy Parents' WhatsApp group or individual contacts:

```text
🏏 *Yadav Cricket Academy & Pace Foundation — Official Portal Launch*

Namaste Parents & Students,

We are pleased to introduce the official YCA Pace digital portal for student attendance, fast-bowling video skill reviews, and monthly fee accounts.

🌐 *Portal Link:* https://yourdomain.com/login

🔐 *Login Credentials for Parents & Students:*
• Role: Select "Parent / Student"
• Student ID: Enter Student's Full Registered Name (e.g., Aman Alam)
• Password: Enter Student's Date of Birth in DD-MM-YYYY format (e.g., 29-11-2013)

Inside your dashboard you can:
✅ Track daily net practice attendance
✅ Watch high-speed bowling video reviews & speed analysis by Coach Jay Singh Yadav
✅ Clear monthly coaching fees via UPI & download official receipts
✅ View match scorecards and academy circulars

For any assistance or queries, kindly contact Coach Jay Singh Yadav at +91 77097 05181.

Warm regards,
*Yadav Cricket Academy & Pace Foundation*
Mahajanwadi, Hingna Road, Nagpur
```

---

## Maintenance, Backups & Support

1. **Backing up Database**: In your Supabase dashboard, navigate to **Database → Backups** to download periodic snapshots.
2. **Adding New Players**: The Academy Admin can enroll new students anytime from `/admin` using the **Enroll Player** button.
3. **Updating Fees / Batches**: All batch timings and fee structures can be updated directly from the Admin portal or database.
4. **Offline Resilience**: Even if the cloud connection is temporarily interrupted, all dashboards retain local session states seamlessly.

