# NEXUS - Learning Management System

A comprehensive, multi-role Learning Management System designed for schools with advanced assessment tools and role-based access control.

## 🎯 Features

### Multi-Role System
- **Super Admin**: Creates schools and manages school administrators
- **School Admin**: Manages classes, subjects, teachers, and students for their school
- **Teacher**: Creates assignments, quizzes with timers, announcements, and resources
- **Student**: Accesses learning materials and takes interactive quizzes

### Key Features
- **ID/PIN Authentication**: Secure login using auto-generated IDs and PINs (no email/password)
- **Sequential ID Generation**: Auto-generated 8-digit school admin IDs with 5-digit PINs
- **Interactive Quiz System**: Visual timer with color-changing progress bar (green to red)
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Real-time Updates**: Live quiz timers and instant feedback
- **Role-based Dashboards**: Tailored interfaces for each user type

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with TypeScript
- **UI Framework**: Material-UI (MUI) v5 with custom theming
- **Styling**: Tailwind CSS + Material-UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT-based system
- **State Management**: React Hooks + localStorage

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18+ recommended)
- MongoDB installed and running
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to project directory
cd nexus

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/nexus-lms

# JWT Secret (change in production)
JWT_SECRET=nexus-lms-super-secret-key-change-in-production

# Next.js Config
NEXTAUTH_SECRET=nexus-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

Start MongoDB and initialize the Super Admin:

```bash
# Initialize Super Admin user
npm run init-super-admin
```

This will create the default Super Admin with:
- **ID**: `SUPERADMIN`
- **PIN**: `12345`

### 4. Run the Application

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Initial Setup (Super Admin)

1. **Login** with Super Admin credentials:
   - ID: `SUPERADMIN`
   - PIN: `12345`

2. **Create Schools**:
   - Navigate to Super Admin dashboard
   - Click "Create New School"
   - Fill in school details and admin information
   - Auto-generated credentials will be provided

### School Administration

1. **Login** with generated School Admin credentials
2. **Setup School Structure**:
   - Create Classes (e.g., "Grade 1A", "Grade 2B")
   - Create Subjects (e.g., "Mathematics", "English", "Science")
   - Add Teachers and assign them to classes/subjects
   - Enroll Students and assign them to classes

### Teacher Functions

1. **Dashboard Overview**:
   - View assigned classes and subjects
   - See list of students per class
   
2. **Create Content**:
   - **Assignments**: Text-based tasks with due dates
   - **Quizzes**: Timed assessments with multiple choice questions
   - **Announcements**: Important notices for students
   - **Resources**: File uploads and learning materials

3. **Quiz Creation**:
   - Set time limits for quizzes
   - Add multiple choice questions with point values
   - Activate/deactivate quizzes

### Student Experience

1. **Dashboard**:
   - View all assigned subjects
   - Access learning materials per subject

2. **Taking Quizzes**:
   - Visual timer with color progression (green → yellow → red)
   - Numerical countdown display
   - Auto-submit when time expires

## 🎨 UI/UX Features

### Design Principles
- **Mobile-First**: Optimized for smartphones and tablets
- **Material Design**: Consistent Google Material Design language
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Responsive**: Adapts to all screen sizes

### Color Scheme
- **Primary**: Blue (#1976d2) - Navigation and primary actions
- **Secondary**: Purple (#9c27b0) - Accent elements
- **Success**: Green (#4caf50) - Success states and timer start
- **Warning**: Orange (#ff9800) - Timer middle state
- **Error**: Red (#f44336) - Timer end state and errors

### Visual Timer System
The quiz timer features a dual indication system:
- **Numerical Display**: MM:SS format countdown
- **Progress Bar**: Visual bar that changes from green to red as time decreases
- **Color Coding**: 
  - Green (>50% time remaining)
  - Orange (25-50% time remaining)
  - Red (<25% time remaining)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-600px (xs)
- **Tablet**: 600-960px (sm)
- **Desktop**: 960px+ (md, lg, xl)

### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for navigation
- Optimized keyboard inputs
- Simplified layouts for small screens

## 🔒 Security Features

### Authentication
- JWT-based authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Automatic session expiration (24 hours)
- Secure PIN hashing with bcrypt

### Data Protection
- Input validation and sanitization
- MongoDB injection prevention
- CORS configuration
- Environment variable protection

## 🏗️ Project Structure

```
nexus/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── super-admin/   # Super admin endpoints
│   │   │   └── school-admin/  # School admin endpoints
│   │   ├── login/             # Login page
│   │   ├── super-admin/       # Super admin dashboard
│   │   ├── school-admin/      # School admin dashboard
│   │   ├── teacher/           # Teacher dashboard (TODO)
│   │   ├── student/           # Student dashboard (TODO)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   └── QuizTimer.tsx      # Quiz timer component
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication utilities
│   │   └── mongodb.ts         # Database connection
│   ├── models/                # Database models
│   │   └── index.ts           # Mongoose schemas
│   └── theme/                 # Material-UI theme
│       ├── theme.ts           # Theme configuration
│       └── ThemeProvider.tsx  # Theme provider component
├── scripts/
│   └── init-super-admin.js    # Super admin initialization
├── .env.local                 # Environment variables
└── package.json               # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run init-super-admin # Initialize Super Admin user
```

## 🚧 Roadmap

### Phase 1 (Completed)
- [x] Project setup and authentication
- [x] Super Admin dashboard
- [x] School creation and management
- [x] School Admin dashboard
- [x] Basic class and subject management
- [x] Responsive UI with Material-UI

### Phase 2 (In Progress)
- [ ] Teacher management system
- [ ] Student management system
- [ ] Teacher dashboard with content creation
- [ ] Student dashboard with learning materials

### Phase 3 (Planned)
- [ ] Advanced quiz system with question types
- [ ] Assignment submission system
- [ ] Grading and feedback system
- [ ] Analytics and reporting
- [ ] File upload and management
- [ ] Push notifications
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Email: support@nexus-lms.com
- Documentation: [Wiki](../../wiki)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Next.js team for the amazing React framework
- MongoDB team for the reliable database solution
- All contributors and testers

---

**NEXUS LMS** - Empowering Education Through Technology
