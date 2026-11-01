import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()
    
    # Page setup - 0.8 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "🏏 Yadav Cricket Academy & Pace Foundation — Owner & Operating Guide"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.runs[0].font.size = Pt(8.5)
        hp.runs[0].font.color.rgb = RGBColor(120, 120, 120)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Confidential & Proprietary — Prepared for Head Coach Jay Singh Yadav"
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fp.runs[0].font.size = Pt(8.5)
        fp.runs[0].font.color.rgb = RGBColor(120, 120, 120)

    # Palette
    NAVY = RGBColor(15, 34, 64)       # Primary dark navy (#0F2240)
    GOLD = RGBColor(217, 119, 6)      # Accent amber/gold
    SLATE = RGBColor(71, 85, 105)     # Subtitle gray
    TEXT_COLOR = RGBColor(30, 41, 59) # Body dark slate
    
    # --- COVER / TITLE BLOCK ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(20)
    title_p.paragraph_format.space_after = Pt(4)
    run_icon = title_p.add_run("🏏 ")
    run_icon.font.size = Pt(26)
    run_title = title_p.add_run("YADAV CRICKET ACADEMY\n& PACE FOUNDATION")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(16)
    run_sub = sub_p.add_run("Official Academy Operating Manual & Client Handover Guide")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = GOLD
    run_sub.font.bold = True

    # Callout Box: Quick Academy Info
    callout = doc.add_table(rows=1, cols=1)
    callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = callout.rows[0].cells[0]
    set_cell_background(c_cell, "F1F5F9")
    set_cell_margins(c_cell, 180, 180, 240, 240)
    
    cp = c_cell.paragraphs[0]
    cp.paragraph_format.space_after = Pt(4)
    r = cp.add_run("📍 Academy Location: ")
    r.bold = True
    cp.add_run("Mahajanwadi, behind Dahi Handi Ground (Bhagiratha Park), Hingna Road, Nagpur\n")
    
    r = cp.add_run("👤 Head Coach & Founder: ")
    r.bold = True
    cp.add_run("Jay Singh Yadav (+91 77097 05181)\n")
    
    r = cp.add_run("🌐 Live Academy Website: ")
    r.bold = True
    r_link = cp.add_run("https://yca-two.vercel.app")
    r_link.bold = True
    r_link.font.color.rgb = NAVY
    cp.add_run("\n")
    
    r = cp.add_run("💳 Direct Academy UPI ID: ")
    r.bold = True
    r_upi = cp.add_run("7709705181@upi")
    r_upi.bold = True
    r_upi.font.color.rgb = GOLD
    cp.add_run(" (All fee collections deposit directly to your bank account)")

    doc.add_paragraph()

    # --- SECTION 1: WELCOME & WHAT YOU HAVE ---
    h1 = doc.add_heading("1. Welcome to Your New Digital Platform", level=1)
    h1.runs[0].font.color.rgb = NAVY
    h1.runs[0].font.size = Pt(16)
    
    p = doc.add_paragraph(
        "Congratulations Coach Jay Singh Sir! Your academy now has a complete, professional digital platform built specifically "
        "for Nagpur cricket operations. Everything has been set up with ZERO dummy or fake data—all 31 real players from your "
        "academy register, your exact batches, and your direct UPI payment system are fully configured."
    )
    p.style.font.size = Pt(10.5)
    
    p2 = doc.add_paragraph("Here are the 4 portals included in your platform:")
    
    table1 = doc.add_table(rows=5, cols=3)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    
    headers = ["Portal Name", "Website Link", "Who Uses It & Purpose"]
    for i, h in enumerate(headers):
        cell = table1.rows[0].cells[i]
        set_cell_background(cell, "0F2240")
        set_cell_margins(cell, 140, 140, 180, 180)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(10)

    rows_data = [
        ("Public Academy Website", "https://yca-two.vercel.app", "Public & Parents: View batches, facility photos, and book free trial practice sessions."),
        ("Coach Field Portal", "https://yca-two.vercel.app/coach", "Coach Jay & Nilesh Sir: Take daily attendance on ground from phone, record bowling speed (km/h) & video reviews."),
        ("Admin Control Center", "https://yca-two.vercel.app/admin", "Academy Office: Check who paid monthly fees, record cash, send 1-click WhatsApp payment reminders, see new admissions."),
        ("Student & Parent Portal", "https://yca-two.vercel.app/parent", "Academy Parents: Check attendance, pay monthly Rs. 2,500 fee via UPI QR, download receipts, watch bowling video feedback.")
    ]
    
    for row_idx, data in enumerate(rows_data):
        row = table1.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 120, 120, 160, 160)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY
            elif col_idx == 1:
                r.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_page_break()

    # --- SECTION 2: HOW COACHES USE IT DAILY (PHONE GUIDE) ---
    h2 = doc.add_heading("2. Daily On-Ground Guide for Coaches (Mobile Phone)", level=1)
    h2.runs[0].font.color.rgb = NAVY
    
    p = doc.add_paragraph(
        "You and Coach Nilesh Raut do not need a computer. You can use your mobile phone directly at the ground during "
        "morning and evening sessions."
    )
    p.style.font.size = Pt(10.5)

    doc.add_heading("A. Taking Attendance in 10 Seconds", level=2)
    steps_att = [
        ("Step 1: Open the link", "On your phone browser (Chrome/Safari), open https://yca-two.vercel.app/coach"),
        ("Step 2: Sign In", "Select 'Coach' tab. Email: coach@ycapace.com | Password: password123 (or tap Coach Demo)"),
        ("Step 3: Select Your Batch", "Tap on your current batch at the top (e.g., U14 Morning 6:30 AM or U19 Evening 4:30 PM)."),
        ("Step 4: Mark Attendance", "Tap the big green button 'Mark All Present'. If a student is absent, just tap their name to switch to 'Absent'."),
        ("Step 5: Tap Save", "Tap the blue 'Save Attendance' button. It immediately saves to the cloud and updates the student's parent dashboard!")
    ]
    for step_num, desc in steps_att:
        p = doc.add_paragraph()
        r1 = p.add_run(step_num + " — ")
        r1.bold = True
        r1.font.color.rgb = NAVY
        p.add_run(desc)

    doc.add_heading("B. Recording Pace Foundation Video Reviews", level=2)
    p = doc.add_paragraph(
        "YCA specializes in fast bowling biomechanics. When you record a bowler in the nets on your phone:"
    )
    steps_vid = [
        ("1. Tap 'Video Analysis'", "Inside the Coach Portal, tap the 'Pace Foundation Video Reviews' tab."),
        ("2. Select Student", "Choose the player's name from the dropdown (e.g. Aman Alam)."),
        ("3. Enter Speed & Technique Area", "Select technique aspect (e.g., Run-up, Release Point, Seam Presentation) and enter clocked speed (e.g. 116.5 km/h)."),
        ("4. Attach Video & Coach Feedback", "Choose the video clip from your phone gallery and type 1-2 coaching tips (e.g. 'Keep front arm high during delivery stride')."),
        ("5. Tap 'Publish Review'", "The video and feedback are immediately delivered to the parent's mobile phone dashboard!")
    ]
    for step_num, desc in steps_vid:
        p = doc.add_paragraph()
        r1 = p.add_run(step_num + " — ")
        r1.bold = True
        r1.font.color.rgb = GOLD
        p.add_run(desc)

    doc.add_page_break()

    # --- SECTION 3: MONTHLY FEES & CASH RECEIPTS ---
    h3 = doc.add_heading("3. Monthly Fee Management & Cash Receipts (Admin Office)", level=1)
    h3.runs[0].font.color.rgb = NAVY
    
    p = doc.add_paragraph(
        "In your Admin Portal (https://yca-two.vercel.app/admin), you have a complete financial ledger for all 31 enrolled students. "
        "Every student has an initial invoice of Rs. 2,500 for November 2026."
    )
    p.style.font.size = Pt(10.5)

    doc.add_heading("How Fee Collection Works:", level=2)
    
    fee_table = doc.add_table(rows=4, cols=2)
    fee_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    f_headers = ["Payment Situation", "What You Do in the Portal"]
    for i, h in enumerate(f_headers):
        cell = fee_table.rows[0].cells[i]
        set_cell_background(cell, "0F2240")
        set_cell_margins(cell, 140, 140, 180, 180)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    f_rows = [
        ("Parent pays online via UPI QR code", "100% AUTOMATIC. Money goes straight to your bank account (7709705181@upi). The student's status automatically turns green 'PAID'."),
        ("Parent pays CASH at the cricket ground", "Open Admin -> 'Fee Ledger' tab -> Find student name -> Click 'Record Cash'. Status turns green 'PAID', and a printable official PDF receipt is generated!"),
        ("Student fee is pending / overdue", "Click 'Remind WA' next to the student's name. It automatically opens WhatsApp on your phone with a polite reminder message and your UPI QR code.")
    ]
    for row_idx, data in enumerate(f_rows):
        row = fee_table.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 120, 120, 160, 160)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY

    doc.add_paragraph()

    # Callout Box: Cash Receipt Download
    box = doc.add_table(rows=1, cols=1)
    box.alignment = WD_TABLE_ALIGNMENT.CENTER
    b_cell = box.rows[0].cells[0]
    set_cell_background(b_cell, "FEF3C7") # Warm yellow/amber
    set_cell_margins(b_cell, 140, 140, 180, 180)
    bp = b_cell.paragraphs[0]
    r = bp.add_run("🧾 Instant PDF Receipts: ")
    r.bold = True
    r.font.color.rgb = RGBColor(180, 83, 9)
    bp.add_run("Whenever a fee is marked as paid, parents can download and print an official branded YCA Pace Receipt showing Academy GST/Tax header, student name, receipt number, and payment date.")

    doc.add_page_break()

    # --- SECTION 4: HOW PARENTS LOG IN ---
    h4 = doc.add_heading("4. Student & Parent Login (Super Easy & Password-Free)", level=1)
    h4.runs[0].font.color.rgb = NAVY
    
    p = doc.add_paragraph(
        "To make life easy for parents, they DO NOT need an email account or complicated password! "
        "They log in using their child's name and date of birth:"
    )
    p.style.font.size = Pt(10.5)
    
    p_steps = doc.add_paragraph()
    r = p_steps.add_run("1. Open Portal: ")
    r.bold = True
    p_steps.add_run("Visit https://yca-two.vercel.app/login and select 'Parent / Student'\n")
    r = p_steps.add_run("2. Student ID: ")
    r.bold = True
    p_steps.add_run("Enter Student's Full Registered Name (e.g. Aman Alam)\n")
    r = p_steps.add_run("3. Password: ")
    r.bold = True
    p_steps.add_run("Enter Date of Birth in DD-MM-YYYY format (e.g. 29-11-2013)\n")
    r = p_steps.add_run("4. Click Sign In: ")
    r.bold = True
    p_steps.add_run("Instantly opens their child's private dashboard.")

    doc.add_heading("Master Student Directory & Login Credentials (All 31 Verified Players)", level=2)
    
    p_info = doc.add_paragraph("Keep this table for your records. If any parent forgets their login, check their DOB below:")
    p_info.runs[0].font.italic = True
    p_info.runs[0].font.size = Pt(9.5)

    roster_table = doc.add_table(rows=32, cols=4)
    roster_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    r_headers = ["Student Name (ID)", "Password (DOB)", "Player Code", "Batch"]
    for i, h in enumerate(r_headers):
        cell = roster_table.rows[0].cells[i]
        set_cell_background(cell, "0F2240")
        set_cell_margins(cell, 100, 100, 140, 140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9)

    players_data = [
        ("Aman Alam", "29-11-2013", "YCA-0041", "U14 Morning"),
        ("Nayan Chaudhari", "25-05-2013", "YCA-0042", "U16 Morning"),
        ("Arpit K. Kamble", "22-08-2016", "YCA-0043", "U14 Morning"),
        ("Pushkar Gadge", "05-05-2009", "YCA-0044", "U19 Evening"),
        ("Harshit Watkar", "20-12-2013", "YCA-0045", "U14 Morning"),
        ("Virat Gulabe", "27-07-2015", "YCA-0046", "U14 Morning"),
        ("Jaitra Shrikant Tiwari", "09-08-2014", "YCA-0047", "U14 Morning"),
        ("Shiv Irpate", "13-11-2013", "YCA-0048", "U14 Morning"),
        ("Mithilesh Anil Hajare", "25-02-2013", "YCA-0049", "U14 Morning"),
        ("Nirmal Sontakke", "09-10-2008", "YCA-0050", "U19 Evening"),
        ("Atharv Falke", "13-11-2010", "YCA-0051", "U19 Evening"),
        ("Adnan Mahajan", "05-10-2012", "YCA-0052", "U16 Morning"),
        ("Sanskar Londhe", "20-07-2013", "YCA-0053", "U14 Morning"),
        ("Swanand Khawale", "07-08-2015", "YCA-0054", "U14 Morning"),
        ("Gaarvi Bhaisar", "14-02-2018", "YCA-0055", "U12 Morning"),
        ("Dev Tiwari", "09-08-2014", "YCA-0056", "U16 Morning"),
        ("Ojasya Chouriwar", "07-03-2014", "YCA-0057", "U14 Morning"),
        ("Gaurang Thawali", "21-04-2017", "YCA-0058", "U12 Morning"),
        ("Naksh Atkar", "20-06-2013", "YCA-0059", "U16 Morning"),
        ("Ajinkya Funde", "27-02-2014", "YCA-0060", "U16 Morning"),
        ("Nachiket Dangare", "21-07-2010", "YCA-0061", "U19 Evening"),
        ("Shourya Thakre", "07-01-2010", "YCA-0062", "U19 Evening"),
        ("Harshit Singh", "24-04-2012", "YCA-0063", "U16 Morning"),
        ("Tejas Singh", "12-11-2015", "YCA-0064", "U14 Morning"),
        ("Aarav Tandekar", "31-08-2012", "YCA-0065", "U16 Morning"),
        ("Anav Ghaiwat", "06-10-2015", "YCA-0066", "U12 Morning"),
        ("Kamesh Mahalle", "06-08-2010", "YCA-0067", "U19 Evening"),
        ("Aditya Jaiswal", "23-04-2013", "YCA-0068", "U16 Morning"),
        ("Akshay Musare", "25-11-2012", "YCA-0069", "U16 Morning"),
        ("Divesh Borkar", "03-03-2014", "YCA-0070", "U14 Morning"),
        ("Arnav Tiwari", "14-08-2011", "YCA-0071", "U19 Evening")
    ]

    for row_idx, data in enumerate(players_data):
        row = roster_table.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 80, 80, 120, 120)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY

    doc.add_page_break()

    # --- SECTION 5: READY-TO-USE WHATSAPP TEMPLATES ---
    h5 = doc.add_heading("5. Ready-to-Use WhatsApp Messages for Parents", level=1)
    h5.runs[0].font.color.rgb = NAVY
    
    p = doc.add_paragraph("Simply copy and paste these messages directly into your academy WhatsApp group:")
    p.style.font.size = Pt(10.5)

    doc.add_heading("Template 1: Official Academy Portal Launch Message", level=2)
    
    t1_box = doc.add_table(rows=1, cols=1)
    t1_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1 = t1_box.rows[0].cells[0]
    set_cell_background(c1, "F1F5F9")
    set_cell_margins(c1, 160, 160, 200, 200)
    p1 = c1.paragraphs[0]
    p1.add_run(
        "🏏 *Yadav Cricket Academy & Pace Foundation — Official Portal Launch*\n\n"
        "Namaste Parents & Students,\n\n"
        "We are pleased to introduce the official YCA Pace digital portal! Parents can now track daily practice attendance, "
        "view Pace Foundation bowling video analysis, and clear monthly coaching fees directly online.\n\n"
        "🌐 *Portal Website:* https://yca-two.vercel.app/login\n\n"
        "🔐 *How to Sign In (No password setup required):*\n"
        "1. Click the link above and select the 'Parent / Student' tab.\n"
        "2. Student ID: Enter your child's Registered Full Name (e.g., Aman Alam).\n"
        "3. Password: Enter your child's Date of Birth in DD-MM-YYYY format (e.g., 29-11-2013).\n\n"
        "Inside your dashboard you can:\n"
        "✅ View daily net practice attendance\n"
        "✅ Pay November coaching fee (Rs. 2,500) via UPI (GPay / PhonePe / Paytm)\n"
        "✅ Download official digital payment receipts\n"
        "✅ Watch high-speed bowling video reviews by Head Coach Jay Singh Yadav\n\n"
        "For any login assistance, contact Coach Jay Singh Yadav (+91 77097 05181).\n\n"
        "Warm regards,\n"
        "*Yadav Cricket Academy & Pace Foundation*\n"
        "Mahajanwadi, Hingna Road, Nagpur"
    )
    p1.runs[0].font.size = Pt(9.5)

    doc.add_paragraph()
    doc.add_heading("Template 2: Monthly Fee Reminder Message", level=2)
    
    t2_box = doc.add_table(rows=1, cols=1)
    t2_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c2 = t2_box.rows[0].cells[0]
    set_cell_background(c2, "F1F5F9")
    set_cell_margins(c2, 160, 160, 200, 200)
    p2 = c2.paragraphs[0]
    p2.add_run(
        "🏏 *YCA Pace — Monthly Coaching Fee Reminder*\n\n"
        "Dear Parents,\n\n"
        "This is a gentle reminder that the monthly coaching fee of Rs. 2,500 for the current month is due by the 5th.\n\n"
        "You can clear the fee online in 30 seconds using UPI (Google Pay, PhonePe, Paytm, BHIM):\n"
        "👉 Pay Online & Get Instant Receipt: https://yca-two.vercel.app/login\n"
        "👉 Direct Academy UPI ID: 7709705181@upi\n\n"
        "If you have already paid in cash at the ground, your digital receipt is ready to download in your portal.\n\n"
        "Thank you for your cooperation!\n"
        "*Head Coach Jay Singh Yadav (+91 77097 05181)*"
    )
    p2.runs[0].font.size = Pt(9.5)

    doc.add_page_break()

    # --- SECTION 6: DIGITAL ASSETS OWNERSHIP & CLOUD RECORDS (NEW!) ---
    h6_tech = doc.add_heading("6. Academy Digital Assets Ownership & Permanent Cloud Records", level=1)
    h6_tech.runs[0].font.color.rgb = NAVY
    
    p = doc.add_paragraph(
        "As the founder and owner of Yadav Cricket Academy, you hold 100% intellectual property ownership of your website, "
        "database, code, and student records. Below are the permanent cloud accounts and links where your platform lives:"
    )
    p.style.font.size = Pt(10.5)

    tech_table = doc.add_table(rows=4, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_table.autofit = False
    
    t_headers = ["Asset Name", "Cloud Link / Location", "Plain-English Explanation"]
    for i, h in enumerate(t_headers):
        cell = tech_table.rows[0].cells[i]
        set_cell_background(cell, "0F2240")
        set_cell_margins(cell, 140, 140, 180, 180)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(10)

    tech_rows = [
        (
            "GitHub Source Code Repository",
            "https://github.com/Nikhilbhati007/YCA.git",
            "The complete digital master blueprint and original code of your website, design files, and database scripts. You own the full rights to this software."
        ),
        (
            "Supabase Cloud Database",
            "https://supabase.com/dashboard/project/xhvyhxkufctsmzxssmqa",
            "Your academy's cloud database (Project: YCA, ID: xhvyhxkufctsmzxssmqa). All 31 student records, attendance logs, and fee ledgers are securely stored here with automatic daily backups."
        ),
        (
            "Vercel Cloud Hosting Engine",
            "https://vercel.com/nikhilbhati007/yca\n(Live: https://yca-two.vercel.app)",
            "The world-class high-speed cloud hosting server that keeps your academy website running 24 hours a day, 365 days a year with automatic bank-grade SSL security."
        )
    ]
    for row_idx, data in enumerate(tech_rows):
        row = tech_table.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 120, 120, 160, 160)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY
            elif col_idx == 1:
                r.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_paragraph()

    # Callout: Custom Domain Option
    domain_box = doc.add_table(rows=1, cols=1)
    domain_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    db_cell = domain_box.rows[0].cells[0]
    set_cell_background(db_cell, "ECFDF5") # Soft green
    set_cell_margins(db_cell, 140, 140, 180, 180)
    dbp = db_cell.paragraphs[0]
    r = dbp.add_run("🌐 Connecting a Custom Academy Domain (e.g. www.ycapace.com):\n")
    r.bold = True
    r.font.color.rgb = RGBColor(6, 95, 70)
    dbp.add_run(
        "Right now, your platform is live at https://yca-two.vercel.app. If you ever purchase a custom domain like "
        "ycapace.com or yadavcricketacademy.com (from GoDaddy/Hostinger for ~Rs. 499/year), it can be connected in 5 minutes "
        "without disrupting your website or database."
    )

    doc.add_page_break()

    # --- SECTION 7: QUICK CHEAT SHEET & SUPPORT ---
    h7 = doc.add_heading("7. Master Quick Cheat Sheet & Contact Card", level=1)
    h7.runs[0].font.color.rgb = NAVY
    
    summary_table = doc.add_table(rows=9, cols=2)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    s_headers = ["Item / Resource", "Website Link & Quick Login Details"]
    for i, h in enumerate(s_headers):
        cell = summary_table.rows[0].cells[i]
        set_cell_background(cell, "0F2240")
        set_cell_margins(cell, 140, 140, 180, 180)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    s_rows = [
        ("Live Academy Website", "https://yca-two.vercel.app"),
        ("Parent / Student Login", "https://yca-two.vercel.app/login (Student Name + Date of Birth)"),
        ("Coach Field Portal", "https://yca-two.vercel.app/coach (coach@ycapace.com / password123)"),
        ("Admin Office Portal", "https://yca-two.vercel.app/admin (admin@ycapace.com / password123)"),
        ("GitHub Source Code", "https://github.com/Nikhilbhati007/YCA.git"),
        ("Supabase Cloud Database", "https://supabase.com/dashboard/project/xhvyhxkufctsmzxssmqa"),
        ("Vercel Hosting Dashboard", "https://vercel.com/nikhilbhati007/yca"),
        ("Direct Academy UPI ID", "7709705181@upi (Head Coach Jay Singh Yadav)")
    ]
    for row_idx, data in enumerate(s_rows):
        row = summary_table.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 120, 120, 160, 160)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = NAVY
            elif "http" in text:
                r.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_paragraph()
    doc.add_paragraph()
    
    footer_callout = doc.add_table(rows=1, cols=1)
    footer_callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    fc_cell = footer_callout.rows[0].cells[0]
    set_cell_background(fc_cell, "E0F2FE") # Soft sky blue
    set_cell_margins(fc_cell, 180, 180, 240, 240)
    fcp = fc_cell.paragraphs[0]
    r = fcp.add_run("✨ Platform Architected & Developed by Nikhil Bhati\n")
    r.bold = True
    r.font.color.rgb = NAVY
    fcp.add_run(
        "For any technical updates, domain linking, or expanding platform features in the future, "
        "your development team is always available to assist and support Yadav Cricket Academy & Pace Foundation."
    )
    
    output_path = r"c:\Users\Nikhi\Downloads\Pace Academy\YCA_Pace\YCA_Pace_Academy_Owner_Guide.docx"
    doc.save(output_path)
    print("SUCCESS: Updated Word document created at:", output_path)

if __name__ == "__main__":
    create_document()
