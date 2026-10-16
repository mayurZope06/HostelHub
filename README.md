# 🏨 HostelHub — Smart Hostel Management System (MERN Stack)

A modern, full-stack **Hostel Management System** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with JWT Authentication, Role-Based Access Control, automated room capacity synchronization, fee invoicing with official printable receipts, and maintenance grievance tracking.

---

## 🚀 Key Features

### 1. 📌 Student Management
- **Student Registration**: Add new residents with comprehensive profiles (academic branch, year of study, blood group, home address, emergency contacts, guardian details).
- **Auto-Account Creation**: Automatically create linked student login credentials upon registration.
- **Detailed Profile Modal**: View full student record including currently allocated room, roommate information, fee history, and submitted maintenance tickets.
- **Search & Filters**: Instant search by student name, registration ID, email, course, and allocation status.
- **Data Export**: Export student directory to standard CSV file format with one click.

### 2. 🛏️ Room Management & Inventory
- **Room Configuration**: Manage rooms across multiple blocks (Block A, B, C, D, Main Wing) and floors with distinct room configurations (Single, Double, Triple, Dormitory).
- **Amenities Tracking**: Configure included amenities per room (AC, High-speed Wi-Fi, Attached Bath, Balcony, Study Table, Lockers, Geyser).
- **Live Bed Availability**: Automatic bed status tracking (`Available`, `Partially Occupied`, `Occupied`, `Maintenance`).
- **Dual View Modes**: Switch seamlessly between modern interactive **Card/Grid View** and **Data Table View**.

### 3. 🎯 Room Allotment & Bed Allocation
- **Smart Allotment**: Assign unallocated students to rooms with real-time available bed count indicators.
- **Room Transfers**: Move students from one room to another with automatic bed vacancy and occupancy updates.
- **Checkout / Vacate**: Check out residents with optional departure remarks, instantly freeing up bed capacity.
- **Auto-Invoicing**: Automatically issue semester rent invoices during student allotment.

### 4. 💳 Fee Invoicing & Payment Management
- **Invoice Generation**: Issue invoices for Hostel Rent, Mess & Dining, Caution Deposits, Maintenance, and Late Fines.
- **Payment Collection**: Record full or partial payments via UPI / QR, Net Banking, Credit/Debit Cards, or Cash with transaction reference numbers.
- **Printable Fee Receipt Voucher**: Clean, official printable fee receipt modal complete with institution header, paid status watermark stamp, invoice items table, and authorized warden signature block (`Ctrl + P` / Save PDF supported).
- **Financial Analytics**: Invoiced vs. collected revenue, pending balances, and overdue tracking.

### 5. 🛠️ Maintenance & Grievances
- **Ticket Submission**: Students and staff can report issues across Electrical, Plumbing, Wi-Fi, Furniture, Cleaning, and Dining.
- **Urgency Levels**: Set priority levels (`Low`, `Medium`, `High`, `Urgent`).
- **Ticket Lifecycle**: Track status from `Pending` → `In Progress` → `Resolved` with staff resolution remarks.

### 6. 📢 Notice Board & Announcements
- **Campus Broadcasts**: Post announcements targeted to All Students or specific hostel blocks.
- **Pinned Notices**: Highlight critical rules, mess schedules, or emergency alerts at the top of the board.

### 7. 📊 Operations Command Dashboard
- **Top KPI Cards**: Total Residents, Bed Occupancy %, Total Invoiced vs. Collected Revenue, and Open Maintenance Tickets.
- **Visual Occupancy Bar**: Gauge tracking percentage of available, partially occupied, full, and maintenance rooms.
- **Monthly Revenue Breakdown**: Visual bar trends for hostel revenue collection.
- **Quick Actions**: One-click shortcuts to allot rooms, add students, issue invoices, and post announcements.

### 8. 🔒 Authentication & Role-Based Access Control
- **JWT Authentication**: Secure Bearer tokens with 30-day validity and bcrypt password hashing.
- **Dual Roles**:
  - `admin`: Full operations command, student & room CRUD, invoicing, ticket resolution.
  - `student`: Resident portal to view their assigned room, pay invoices, print receipts, and file maintenance tickets.
- **Theme Switcher**: Fluid Dark and Light mode toggle with CSS custom properties.

---

## ⚡ Instant 1-Click Demo Accounts

The system automatically initializes with realistic demo records on first startup:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Hostel Warden (Admin)** | `admin@hostel.com` | `admin123` | Full administrative control |
| **Resident Student (Rahul)** | `rahul@student.com` | `student123` | Student portal, Room A-101, view fees & receipts |
| **Resident Student (Priya)** | `priya@student.com` | `student123` | Student portal, Room B-101 |

> 💡 *On the login screen, simply click the **"Warden (Admin)"** or **"Rahul (Student)"** quick buttons to automatically populate credentials!*

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js (Vite)
  - React Router DOM v7
  - Lucide React (Crisp modern icons)
  - Canvas Confetti
  - Axios HTTP Client
  - Pure Modern CSS3 Design System (CSS Custom Properties, Glassmorphism, Dual-Theme)
- **Backend**:
  - Node.js (ES Modules)
  - Express.js REST API
  - Mongoose & MongoDB Driver
  - JWT (`jsonwebtoken`) & `bcryptjs`
  - Resilient In-Memory & MongoDB Atlas hybrid database adapter
- **Database**:
  - MongoDB (Local / Atlas connection string in `backend/.env`)
  - Out-of-the-box In-Memory persistent JSON fallback (`backend/data/db.json`) for zero-configuration instant preview

---

## 📦 Project Structure

```
Project 2 - Hostel Management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Dual MongoDB Atlas & In-Memory fallback adapter
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── roomController.js
│   │   │   ├── allocationController.js
│   │   │   ├── feeController.js
│   │   │   ├── complaintController.js
│   │   │   ├── noticeController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification & role authorization
│   │   │   └── errorMiddleware.js  # Error formatting
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Room.js
│   │   │   ├── Allocation.js
│   │   │   ├── Fee.js
│   │   │   ├── Complaint.js
│   │   │   └── Notice.js
│   │   ├── routes/                 # Express API routes
│   │   ├── seed/
│   │   │   └── seedData.js         # Realistic initial data populator
│   │   ├── store/
│   │   │   └── inMemoryAdapter.js  # Zero-config in-memory database engine
│   │   └── server.js               # Express application entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js              # Vite server & API proxy
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Modal, Badge, StatCard, EmptyState
│   │   │   ├── forms/              # Student, Room, Allocation, Fee, Complaint, Notice Modals
│   │   │   ├── layout/             # Sidebar, Header, Master Layout
│   │   │   └── receipts/           # Printable FeeReceiptModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Allocations.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── Complaints.jsx
│   │   │   ├── Notices.jsx
│   │   │   ├── StudentPortal.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios service endpoints
│   │   ├── styles/
│   │   │   └── index.css           # Glassmorphism & modern design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── run-all.js                      # Root launcher script
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 supported)
- **npm**: v9 or higher

### 2. Run the Full Application
From the root directory:
```bash
npm start
```
*(or `node run-all.js`)*

This starts both:
- **Backend API**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173`

Open **`http://localhost:5173`** in your browser, click **"Warden (Admin)"**, and explore the system!

### 3. Optional: Connect to MongoDB Atlas
By default, the backend runs instantly using the persistent zero-config database in `backend/data/db.json`. To connect to a live MongoDB Atlas cluster:
1. Open `backend/.env`
2. Set your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_db?retryWrites=true&w=majority
   ```
3. Restart the backend server. It will automatically detect MongoDB Atlas and switch to it seamlessly.

---

## 📡 REST API Endpoint Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | Public |
| `POST` | `/api/auth/login` | User login & JWT issuance | Public |
| `POST` | `/api/auth/register` | Register new account | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Private |
| `GET` | `/api/dashboard/metrics` | Unified analytics & KPI stats | Private |
| `GET` | `/api/students` | List students with search & filter | Private |
| `POST` | `/api/students` | Register new student record | Admin |
| `GET` | `/api/students/:id` | Get student details & history | Private |
| `PUT` | `/api/students/:id` | Update student profile | Admin |
| `DELETE`| `/api/students/:id` | Delete student & release room | Admin |
| `GET` | `/api/rooms` | List rooms with occupants & availability | Private |
| `POST` | `/api/rooms` | Create new hostel room | Admin |
| `PUT` | `/api/rooms/:id` | Update room amenities & capacity | Admin |
| `DELETE`| `/api/rooms/:id` | Delete room | Admin |
| `GET` | `/api/allocations` | List room assignments & history | Private |
| `POST` | `/api/allocations` | Allot student to room bed | Admin |
| `POST` | `/api/allocations/:id/vacate` | Checkout student from room | Admin |
| `POST` | `/api/allocations/:id/transfer`| Transfer student to another room | Admin |
| `GET` | `/api/fees` | List invoices with status filter | Private |
| `POST` | `/api/fees` | Generate new fee invoice | Admin |
| `POST` | `/api/fees/:id/pay` | Record payment transaction | Private |
| `GET` | `/api/complaints` | List maintenance tickets | Private |
| `POST` | `/api/complaints` | File maintenance grievance | Private |
| `PUT` | `/api/complaints/:id`| Resolve or update ticket | Admin |
| `GET` | `/api/notices` | List announcements & alerts | Private |
| `POST` | `/api/notices` | Broadcast announcement | Admin |
