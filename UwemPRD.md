Below is a full PRD you can use as the foundation for the remembrance event registration and access-control website.

# PRD: Remembrance Event Registration, Personalised Invite and Access Control Website

## 1. Product Overview

### 1.1 Product Name

**Remembrance Event Registration and Invitation Portal**

### 1.2 Purpose

The website will allow invited guests to register their participation for a remembrance event, confirm whether they will attend, add details of any extra people coming with them, and receive or access a personalised invitation.

The system will also provide a password-protected admin area where organisers can view registered attendees, manage guest details, open personalised invites, and manage attendee records, while QR codes lead to a public verification page that displays access confirmation for gate checks.

### 1.3 Core Idea

The platform will have three main parts:

1. **Public registration page**
   A simple, responsive page where guests can submit their details and confirm attendance.

2. **Admin dashboard**
   A password-protected page for organisers to view registrations, extras, personalised invite links, and check-in/access status.

3. **Personalised invite and QR access system**
   Each invitee can have a customised invitation image containing their name and a unique QR code. When scanned, the QR code opens a public verification page showing the person’s details and a clear green access confirmation.

---

## 2. Goals and Objectives

### 2.1 Primary Goals

- Allow guests to register attendance easily.
- Capture guest details and accompanying persons.
- Generate personalised invitation pages and/or images.
- Provide QR codes for event access verification.
- Give organisers a clear admin view of all attendees and extras.
- Support gate access control through QR scanning.
- Keep the system simple, mobile-friendly, and reliable.

### 2.2 Secondary Goals

- Reduce manual WhatsApp or paper-based RSVP tracking.
- Make invitations feel more personal and professional.
- Allow organisers to know expected attendance numbers in advance.
- Help gate volunteers quickly confirm valid invitees.
- Provide a clean record of checked-in attendees after the event.

---

## 3. Target Users

### 3.1 Public Users / Guests

Guests who receive the event link or invitation and need to confirm whether they are attending.

### 3.2 Admin Users / Organisers

Trusted family members or event organisers who need to view registrations, manage invitees, and monitor attendance.

### 3.3 Gate Volunteers

People at the event entrance who will scan QR codes and confirm whether a guest has valid access.

---

## 4. User-Facing Website

### 4.1 Public Registration Page

The public-facing page should be simple, elegant, and responsive.

#### Desktop Layout

- Left section:
  - Picture of your mum, or the event invitation design.
  - Optional short tribute text.
  - Event title, date, time, and venue.

- Right section:
  - Registration form.

#### Mobile Layout

- Image or invite appears at the top.
- Form appears below.
- Layout should be clean and easy to complete on a phone.

### 4.2 Registration Form Fields

#### Main Attendee Details

| Field                   | Type                    | Required | Notes                            |
| ----------------------- | ----------------------- | -------- | -------------------------------- |
| Full Name               | Text input              | Yes      | Primary attendee name            |
| Phone Number            | Text input              | Yes      | Used for contact or verification |
| Email Address           | Email input             | No       | Optional                         |
| Confirm Attendance      | Toggle or switch        | Yes      | Attending: Yes/No                |
| Number of Extra Persons | Number input or stepper | No       | Default 0                        |
| Submit Button           | Button                  | Yes      | Sends registration               |

### 4.3 Extra Persons Logic

If the user selects extra persons, the form should dynamically show fields for each extra person.

Example:

If user selects **2 extra persons**, show:

#### Extra Person 1

- Full Name, required
- Phone Number, optional

#### Extra Person 2

- Full Name, required
- Phone Number, optional

### 4.4 Form Behaviour

- If attendance is toggled to **No**, extras should be disabled or hidden.
- If attendance is toggled to **Yes**, extras can be added.
- Email should be optional.
- Phone number should be validated lightly, but should not block real users unnecessarily.
- Submit button should show loading state.
- Duplicate registrations should be handled carefully, ideally by checking phone number and name.

### 4.5 Success Page

After successful registration, the user should see a confirmation page.

Suggested message:

> Thank you for confirming your attendance. Your registration has been received.

Optional additions:

- Show event details again.
- Show “Add to Calendar” button.
- Show personalised invite if generated immediately.
- Show WhatsApp share button if you want people to share the event with approved family contacts.

---

## 5. Personalised Invitation System

### 5.1 Purpose

The personalised invite system allows each invitee to have a unique version of the event invitation containing:

- Invitee name
- Unique QR code
- Optional seat/table/category/access label
- Optional short message such as “Admit One” or “Family Guest”

### 5.2 Invite Generation Options

There are two possible approaches.

#### Option A: Dynamic Invite Page

Each guest has a public invite page, for example:

`/invite/abc123`

The page displays the invitation design, guest name, and QR code. This is easier to build and update.

#### Option B: Generated Invite Image

The system generates an actual image file, for example PNG or JPEG, by placing the guest name and QR code onto a base invite design.

This is better if you want guests to download or share the personalised invite as an image.

#### Recommended Approach

Use **both**, but in stages:

- Phase 1: Dynamic invite page.
- Phase 2: Generated invite image for download or WhatsApp sharing.

### 5.3 Base Invite Template

Admin should be able to upload or configure:

- Base invitation image
- Guest name position
- QR code position
- Font size
- Font colour
- QR size
- Optional label text

For a fast first version, these positions can be hardcoded based on one final invite design.

### 5.4 QR Code Behaviour

Each QR code should contain a unique verification URL, for example:

`/verify/abc123`

When scanned, this opens the verification page for that specific attendee.

### 5.5 Personalised Invite Link

In the admin table, each attendee should have:

- “Open Invite” button
- “Copy Invite Link” button
- “Open Verification Page” button, optional
- “Download Invite Image” button, optional for Phase 2

---

## 6. QR Verification and Gate Access Page

### 6.1 Purpose

This page is opened when the QR code is scanned at the event entrance.

### 6.2 Verification Page URL

Example:

`/verify/:inviteCode`

### 6.3 Verification Page Content

The page should show:

- Big green tick or confirmation mark
- Clear access status
- Guest full name
- Phone number, partially masked if needed
- Number of extras registered
- Names of extras
- Registration status
- Check-in status
- Button for admin/gate volunteer: “Mark as Checked In”

### 6.4 Access States

#### Valid Access

Display:

- Green tick
- “Access Confirmed”
- Guest details
- Extras listed

#### Already Checked In

Display:

- Amber or blue warning
- “Already Checked In”
- Show check-in time
- Show who checked them in, if tracked

#### Invalid QR Code

Display:

- Red warning
- “Invalid Invite”
- Message: “This QR code is not recognised.”

#### Not Attending

Display:

- Red or grey warning
- “Attendance Not Confirmed”
- Useful if someone registered but said they are not attending.

### 6.5 Check-in Feature

Gate volunteers should be able to mark the guest as checked in.

Two options:

#### Simple Version

Anyone with the QR verification link can see access and mark checked in.

#### Better Version

Only logged-in admin or gate volunteers can mark checked in.

Recommended:

- Public can view the green access page.
- Only admin/gate users can click “Mark as Checked In”.

---

## 7. Admin Dashboard

### 7.1 Admin Login

The admin page should be password-protected.

Simple options:

- Single shared admin password.
- Email and password login.
- Magic link login.

Recommended for a simple event:

- Use Supabase Auth or a simple protected admin login.
- Avoid exposing admin data publicly.

### 7.2 Admin Dashboard Features

Admin should be able to:

- View all registrations.
- Search by name or phone number.
- Filter by attending status.
- Filter by checked-in status.
- View number of extras per attendee.
- Open each personalised invite in a new tab.
- Copy invite link.
- Open QR verification page.
- Mark attendee as checked in or undo check-in.
- Export registrations as CSV.
- View summary statistics.

### 7.3 Admin Table Columns

| Column        | Description                              |
| ------------- | ---------------------------------------- |
| Full Name     | Main attendee                            |
| Phone Number  | Main attendee phone                      |
| Email         | Optional                                 |
| Attendance    | Yes/No                                   |
| Extras Count  | Number of extra guests                   |
| Extra Names   | Displayed compactly or in expandable row |
| Registered At | Date and time                            |
| Invite Link   | Open personalised invite                 |
| QR Link       | Open verification page                   |
| Checked In    | Yes/No                                   |
| Checked In At | Time of check-in                         |
| Actions       | View, edit, check in, delete             |

### 7.4 Admin Summary Cards

At the top of the dashboard:

- Total registrations
- Total confirmed attendees
- Total extra persons
- Total expected guests
- Total checked in
- Not yet checked in
- Declined attendance

### 7.5 Guest Detail View

Clicking on a guest should show:

- Main attendee details
- Extra persons
- Invite code
- Personalised invite preview
- QR code
- Check-in history
- Admin notes, optional

---

## 8. Data Model

### 8.1 Tables

#### `registrations`

Stores the primary invitee or attendee.

| Field                | Type      | Notes                                                         |
| -------------------- | --------- | ------------------------------------------------------------- |
| id                   | UUID      | Primary key                                                   |
| full_name            | Text      | Required                                                      |
| phone_number         | Text      | Required                                                      |
| email                | Text      | Optional                                                      |
| attendance_confirmed | Boolean   | Yes/No                                                        |
| extra_count          | Integer   | Default 0                                                     |
| invite_code          | Text      | Unique public code                                            |
| table_assignment     | Text      | Optional table number or seating assignment, managed by admin |
| qr_code_url          | Text      | Optional stored QR image                                      |
| invite_image_url     | Text      | Optional generated invite image                               |
| checked_in           | Boolean   | Default false                                                 |
| checked_in_at        | Timestamp | Nullable                                                      |
| checked_in_by        | UUID/Text | Optional                                                      |
| admin_notes          | Text      | Optional                                                      |
| created_at           | Timestamp | Auto                                                          |
| updated_at           | Timestamp | Auto                                                          |

#### `registration_extras`

Stores extra persons attached to a main attendee.

| Field           | Type      | Notes                                      |
| --------------- | --------- | ------------------------------------------ |
| id              | UUID      | Primary key                                |
| registration_id | UUID      | Foreign key                                |
| full_name       | Text      | Required                                   |
| phone_number    | Text      | Optional                                   |
| checked_in      | Boolean   | Optional, if extras need separate check-in |
| checked_in_at   | Timestamp | Optional                                   |
| created_at      | Timestamp | Auto                                       |

#### `admin_users`

Only needed if using proper admin accounts.

| Field      | Type      | Notes                 |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary key           |
| email      | Text      | Admin email           |
| role       | Text      | admin, gate_volunteer |
| created_at | Timestamp | Auto                  |

#### `invite_templates`

Optional table if you want configurable templates.

| Field          | Type    | Notes                     |
| -------------- | ------- | ------------------------- |
| id             | UUID    | Primary key               |
| template_name  | Text    | Example: Main Invite      |
| base_image_url | Text    | Uploaded invitation image |
| name_x         | Integer | X position of name        |
| name_y         | Integer | Y position of name        |
| qr_x           | Integer | X position of QR          |
| qr_y           | Integer | Y position of QR          |
| qr_size        | Integer | QR code size              |
| font_size      | Integer | Name font size            |
| font_colour    | Text    | Example: #000000          |
| active         | Boolean | Current template          |

### 8.2 Table Assignment and Seating

To support event seating, admins should be able to assign a table number or seating reference to each registration.

Requirements:

- Table assignment should be stored as free-form text to allow flexibility.
- Examples:
  - `Table 1`
  - `VIP Table`
  - `Family A`
  - `Reserved Seating`

- Admin should be able to add, edit, and clear table assignments from the dashboard.
- Table assignment should be visible in:
  - Admin dashboard table
  - Guest detail view
  - Personalised invite page (optional)
  - QR verification page (optional)

- Table assignment should be included in CSV exports.

### 8.3 Admin Dashboard Updates

Add the following column to the admin registrations table:

| Column           | Description                                      |
| ---------------- | ------------------------------------------------ |
| Table Assignment | Admin-assigned table number or seating reference |

Admins should be able to:

- Filter registrations by table assignment.
- Search by table assignment.
- Bulk assign table numbers in future enhancements.

### 8.4 Future Seating Enhancements

Optional future features:

- Dedicated tables table for managing seating capacity.
- Automatic guest counts per table.
- Seating charts.
- Table occupancy reports.
- QR verification page displaying assigned table location.

### 8.1 Tables

#### `registrations`

Stores both the main attendee and any extra persons as individual records in the same table.

| Field                | Type      | Notes                                                          |
| -------------------- | --------- | -------------------------------------------------------------- |
| id                   | UUID      | Primary key                                                    |
| full_name            | Text      | Required                                                       |
| phone_number         | Text      | Optional for extras, required for main attendee                |
| email                | Text      | Optional                                                       |
| attendance_confirmed | Boolean   | Yes/No                                                         |
| invite_code          | Text      | Unique public code (main attendee only)                        |
| qr_code_url          | Text      | Optional stored QR image                                       |
| invite_image_url     | Text      | Optional generated invite image                                |
| is_primary_attendee  | Boolean   | Identifies main attendee vs extra person                       |
| linked_to_id         | UUID      | References the main attendee record if this is an extra person |
| checked_in           | Boolean   | Default false                                                  |
| checked_in_at        | Timestamp | Nullable                                                       |
| admin_notes          | Text      | Optional                                                       |
| created_at           | Timestamp | Auto                                                           |
| updated_at           | Timestamp | Auto                                                           |

Notes:

- Main attendees will have `is_primary_attendee = true` and `linked_to_id = null`.
- Extra persons will have `is_primary_attendee = false` and `linked_to_id` set to the main attendee's record ID.
- This removes the need for a separate extras table while still allowing organisers to see which guests belong together.
- One QR code and invite can be generated for the main attendee and their linked extras.

#### Admin Access

Since this is a simple application, there is no need for an `admin_users` table.

The admin dashboard will instead be protected by a single password known only to the organiser. Access can be implemented using:

- Environment variable password
- Basic password-protected admin route
- Session-based login after entering the password

No admin user records need to be stored in the database.

#### `invite_templates`

Optional table if you want configurable templates.

| Field          | Type    | Notes                     |
| -------------- | ------- | ------------------------- |
| id             | UUID    | Primary key               |
| template_name  | Text    | Example: Main Invite      |
| base_image_url | Text    | Uploaded invitation image |
| name_x         | Integer | X position of name        |
| name_y         | Integer | Y position of name        |
| qr_x           | Integer | X position of QR          |
| qr_y           | Integer | Y position of QR          |
| qr_size        | Integer | QR code size              |
| font_size      | Integer | Name font size            |
| font_colour    | Text    | Example: #000000          |
| active         | Boolean | Current template          |

---

## 9. User Flows

### 9.1 Guest Registration Flow

1. Guest opens registration website.
2. Guest sees invite image and registration form.
3. Guest enters name and phone number.
4. Guest optionally enters email.
5. Guest confirms attendance.
6. Guest enters number of extra persons.
7. Extra person fields appear dynamically.
8. Guest fills extra names and optional phone numbers.
9. Guest submits form.
10. System saves registration.
11. System generates unique invite code.
12. System shows success page.
13. Optional: System displays personalised invite link.

### 9.2 Admin Invite Management and Table Assignment Flow

1. Admin logs in.
2. Admin views dashboard.
3. Admin sees list of registered guests.
4. Admin assigns or updates a table number or seating assignment for a guest.
5. Admin clicks “Open Invite”.
6. Personalised invite opens in new tab.
7. Admin can copy or share invite link.
8. Admin can export list if needed.
9. Table assignments are visible in the guest detail view

### 9.3 Gate Verification Flow

1. Guest presents QR code.
2. Gate volunteer scans QR code.
3. Verification page opens.
4. System checks invite code.
5. If valid, green access confirmation appears.
6. Volunteer confirms name and extras.
7. Volunteer clicks “Mark as Checked In”.
8. System records check-in time.

---

## 10. Pages Required

### 10.1 Public Pages

| Page                     | Route                 | Purpose                       |
| ------------------------ | --------------------- | ----------------------------- |
| Registration Page        | `/` or `/register`    | Guest registration            |
| Success Page             | `/success`            | Confirmation after submission |
| Personalised Invite Page | `/invite/:inviteCode` | Public invite page            |
| Verification Page        | `/verify/:inviteCode` | QR access confirmation        |

### 10.2 Admin Pages

| Page              | Route                      | Purpose                        |
| ----------------- | -------------------------- | ------------------------------ |
| Admin Login       | `/admin/login`             | Admin authentication           |
| Admin Dashboard   | `/admin`                   | Registration list and stats    |
| Guest Detail      | `/admin/registrations/:id` | Full guest details             |
| Template Settings | `/admin/template`          | Optional invite template setup |

---

## 11. Functional Requirements

### 11.1 Registration

- User can submit main attendee details.
- User can confirm attendance.
- User can add extra persons.
- Extra fields should be generated dynamically based on selected number.
- System should validate required fields.
- System should prevent accidental duplicate registrations where possible.
- System should save timestamp of registration.

### 11.2 Invite Code

- Every registration should have a unique invite code.
- Invite code should not be easily guessable.
- Invite code should be used in invite and verification URLs.

### 11.3 QR Code

- System should generate a QR code for each invitee.
- QR code should point to `/verify/:inviteCode`.
- QR code should be visible on personalised invite page.
- QR code can later be embedded into a generated invite image.

### 11.4 Personalised Invite

- Invite page should show the base invite design.
- Invitee name should appear on the invite.
- QR code should appear on the invite.
- Invite should be publicly accessible by unique link.
- Admin table should include a link to open the invite.

### 11.5 Admin Dashboard

- Admin can log in.
- Admin can view all registrations.
- Admin can search and filter.
- Admin can view extras.
- Admin can open personalised invite.
- Admin can check in guests.
- Admin can export registrations.

### 11.6 Gate Verification

- QR scan opens verification page.
- Valid invite shows green access confirmation.
- Invalid invite shows error.
- Already checked-in guest shows warning.
- Admin/gate user can mark as checked in.

---

## 12. Non-Functional Requirements

### 12.1 Responsiveness

The site must work well on:

- Mobile phones
- Tablets
- Desktop screens

Most guests and gate volunteers will likely use mobile phones, so mobile usability is critical.

### 12.2 Performance

- Registration page should load quickly.
- Invite page should load quickly even with images.
- QR verification should open fast at the gate.

### 12.3 Security

- Admin routes must be protected.
- Public invite and verification links should use unique, hard-to-guess codes.
- Admin data should not be exposed publicly.
- Only authorised users should export data or mark check-in, unless you intentionally choose the simpler version.

### 12.4 Privacy

- Public verification page should avoid exposing too much personal information.
- Phone numbers can be partially masked.
- Example: `*******1234`
- Admin dashboard can show full details.

### 12.5 Reliability

- Registration submissions should not be lost.
- The gate verification system should work on mobile data.
- Admin should be able to export the list before the event as backup.

---

## 13. Suggested Tech Stack

### 13.1 Recommended Stack

Since you already work with React, TypeScript and Supabase, the best fit would be:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes or Supabase Edge Functions
- **Database:** Supabase Postgres
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage for invite image templates and generated invite images
- **QR Code:** `qrcode` npm package
- **Image Generation:** `sharp` or `canvas`
- **Deployment:** Vercel
- **Admin protection:** Supabase Auth with role-based access

### 13.2 Why Next.js Is Better Than Plain React Here

Plain React can work for a simple registration form, but Next.js is better because this project has:

- Public invite URLs
- Dynamic verification pages
- Admin pages
- Server-side image generation
- API routes
- Better routing
- Easier deployment on Vercel

Recommended: **Next.js + Supabase**.

---

## 14. Invite Image Generation Approach

### 14.1 Basic Method

1. Upload the base invite image.
2. Generate QR code as image.
3. Use a server-side image library to place:
   - Guest name
   - QR code

4. Save generated image to storage.
5. Store image URL in the registration record.

### 14.2 Suggested Libraries

- `qrcode` for QR code generation.
- `sharp` for image composition.
- `canvas` if more complex text positioning is needed.

### 14.3 Image Generation Trigger

Options:

- Generate immediately after registration.
- Generate manually from admin dashboard.
- Generate in bulk for all registered guests.

Recommended:

- Start with dynamic invite page.
- Add generated downloadable image later.

---

## 15. Useful Enhancements

### 15.1 WhatsApp Sharing

Add a button on the invite page:

> Share Invite on WhatsApp

This can help organisers send personalised invites easily.

### 15.2 Add to Calendar

Add an “Add to Calendar” button after registration.

### 15.3 Admin Export

Allow CSV export with:

- Name
- Phone
- Email
- Attendance
- Extras
- Total guests
- Checked-in status

### 15.4 Manual Guest Creation

Admin should be able to add invitees manually, especially for elderly guests or people who register through phone calls.

### 15.5 Edit Registration

Admin should be able to correct mistakes in names, phone numbers, or extras.

### 15.6 Duplicate Detection

Warn admin if two registrations have:

- Same phone number
- Very similar name
- Same email

### 15.7 Gate Mode

A simplified admin view for gate volunteers:

- Search guest by name or phone
- Scan QR
- Mark checked in
- Show total checked in

### 15.8 Backup Guest List

Before the event, admin should export the list as CSV or PDF in case internet access is poor at the venue.

### 15.9 Attendance Categories

Optional categories:

- Family
- Church member
- Friend
- Colleague
- VIP
- Vendor
- Media
- Other

This can help with seating or protocol.

### 15.10 Notes Field

Admin-only notes, for example:

- “Coming with elderly parent”
- “Reserved seat”
- “Needs parking”
- “Protocol guest”

---

## 16. MVP Scope

### 16.1 Must-Have Features

For the first working version:

- Responsive registration page
- Main attendee form
- Extra persons dynamic fields
- Supabase database
- Admin login
- Admin dashboard table
- Unique invite code per registration
- Public personalised invite page
- QR code pointing to verification page
- Verification page with green access confirmation
- Check-in button
- CSV export

### 16.2 Should-Have Features

- Invite image preview
- WhatsApp share button
- Search and filters in admin dashboard
- Duplicate detection
- Admin edit registration

### 16.3 Could-Have Features

- Bulk generated invite images
- Template editor for name and QR placement
- Multiple admin roles
- Gate-only mode
- SMS or email confirmation
- Seat/table allocation
- Analytics dashboard

---

## 17. Suggested Build Phases

### Phase 1: Registration and Database

- Create Next.js project.
- Set up Supabase tables.
- Build public registration page.
- Add form validation.
- Save main attendee and extras.
- Generate invite code.

### Phase 2: Admin Dashboard

- Add admin authentication.
- Build admin table.
- Add search and filters.
- Add registration detail view.
- Add CSV export.

### Phase 3: Invite and QR System

- Generate QR code from invite code.
- Build personalised invite page.
- Add invite link to admin table.
- Add WhatsApp share option.

### Phase 4: Gate Verification

- Build verification page.
- Show access confirmation.
- Show guest and extras.
- Add check-in function.
- Add already checked-in warning.

### Phase 5: Generated Invite Images

- Upload base invite image.
- Use fixed coordinates for name and QR code.
- Generate personalised PNG/JPEG.
- Store generated image.
- Add download/open image button.

---

## 18. Suggested Database Schema

```sql
create table registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  email text,
  attendance_confirmed boolean not null default true,
  extra_count integer not null default 0,
  invite_code text not null unique,
  invite_image_url text,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  checked_in_by uuid,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table registration_extras (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  full_name text not null,
  phone_number text,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index registrations_invite_code_idx on registrations(invite_code);
create index registrations_phone_number_idx on registrations(phone_number);
create index registration_extras_registration_id_idx on registration_extras(registration_id);
```

Optional admin profile table:

```sql
create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
```

---

## 19. Example Route Structure

```txt
/
  Public registration page

/success
  Registration success page

/invite/[inviteCode]
  Personalised public invite page

/verify/[inviteCode]
  QR verification and access page

/admin/login
  Admin login page

/admin
  Admin dashboard

/admin/registrations/[id]
  Guest detail page

/admin/template
  Optional invite template settings
```

---

## 20. Key Design Requirements

### 20.1 Visual Style

The design should feel:

- Respectful
- Warm
- Elegant
- Simple
- Family-oriented
- Easy to use

### 20.2 Suggested Page Style

- Soft neutral background
- Large photo or invite image
- Clean white form card
- Clear typography
- Gentle accent colour
- Green confirmation for successful access
- Red only for invalid access or errors

### 20.3 Accessibility

- Inputs should have labels.
- Buttons should be large enough on mobile.
- Text should have good contrast.
- Errors should be clear.
- Verification page should be readable outdoors at the gate.

---

## 21. Open Questions

These should be confirmed before development:

1. Should anyone be able to register, or only people with a pre-approved invite link?
   anyone can register

2. Should each extra person receive their own QR code, or should they enter under the main attendee?
   each their oen qr and their own invite

3. Should the QR code admit the whole group or only the main invitee?
   Ech qr is for a person

4. Should gate volunteers need to log in before marking someone checked in?
   no, its should eb a public link

5. Should the invite image be downloadable by guests?
   Yes, it can

6. Will personalised invites be generated only for registered guests, or for a preloaded guest list?
   regstred guest post registration

7. Should the system support declined attendance, or only confirmed attendance?
   you cant decline invite, you cant register as not attending

8. Should phone number be mandatory?
   no,

9. Should email confirmation or WhatsApp sharing be included?
   no

10. Is there a maximum number of extras per person?
    no

---

## 22. Recommended Decisions

For a simple and practical first version:

1. Allow public registration from one shared link.
2. Make phone number required and email optional.
3. Let each main attendee bring extras.
4. Use one QR code for the main attendee and their registered extras.
5. Show extras on the verification page.
6. Let only logged-in admin/gate users mark checked in.
7. Start with a dynamic personalised invite page.
8. Add generated invite image after the main system works.
9. Export the guest list before the event as backup.
10. Use Next.js, Supabase, TypeScript and Tailwind CSS.

---

## 23. Success Metrics

The project is successful if:

- Guests can register without confusion.
- Admin can see all registrations and extras.
- Each attendee has a working personalised invite link.
- QR codes open the correct verification page.
- Gate volunteers can confirm access quickly.
- Check-in status updates correctly.
- Organisers have an accurate expected guest count before the event.

---

## 24. MVP Acceptance Criteria

The MVP is complete when:

- A guest can submit the registration form.
- Extra person fields appear dynamically and save correctly.
- Registration data appears in the admin dashboard.
- Admin can log in securely.
- Each registration has a unique invite link.
- Invite page displays attendee name and QR code.
- QR code opens the verification page.
- Verification page shows valid access confirmation.
- Admin/gate user can mark guest as checked in.
- Already checked-in guests are clearly flagged.
- Admin can export the registration list.

My strongest recommendation is to build this in **Next.js + Supabase** and treat the generated invite image as Phase 2. For Phase 1, the personalised invite can be a dynamic webpage that looks like the invitation, shows her picture/invite design, the invitee’s name, and the QR code. That gets you working registration, admin, and gate control much faster.
