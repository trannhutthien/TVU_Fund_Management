# ✅ Frontend Development Checklist

## 📦 Setup & Configuration

### Initial Setup
- [x] Install Node.js & npm
- [x] Create Vite + React project
- [x] Install all dependencies
- [ ] Install Zustand: `npm install zustand`
- [ ] Create `.env` file from `.env.example`
- [ ] Configure `.env` with backend URL
- [ ] Run `npm run dev` successfully

### Project Structure
- [x] Create folder structure
- [x] Setup path aliases in `vite.config.js`
- [x] Create Zustand stores (authStore, uiStore)
- [x] Create React Query config
- [x] Create Ant Design theme config
- [x] Create SCSS mixins and variables
- [x] Create route components (ProtectedRoute, RoleBasedRoute)
- [x] Create custom hooks (usePermission)

---

## 🎨 Layout Components

### Main Layout
- [ ] Create `MainLayout` component
- [ ] Create `Header` component
  - [ ] Logo
  - [ ] User menu dropdown
  - [ ] Notifications icon
  - [ ] Logout button
- [ ] Create `Sidebar` component
  - [ ] Navigation menu
  - [ ] Collapsible functionality
  - [ ] Active menu highlight
  - [ ] Role-based menu items
- [ ] Create `Footer` component
  - [ ] Copyright text
  - [ ] Version info

---

## 🔐 Authentication

### Login Page
- [ ] Create Login page component
- [ ] Create login form with React Hook Form
- [ ] Add form validation with Yup
- [ ] Integrate with authService API
- [ ] Handle loading state
- [ ] Handle error messages
- [ ] Add "Remember me" checkbox
- [ ] Add "Forgot password" link
- [ ] Redirect to dashboard after login

### Auth Service
- [ ] Update `api.js` with interceptors
  - [ ] Request interceptor (attach token)
  - [ ] Response interceptor (handle 401)
- [ ] Test login API
- [ ] Test token persistence
- [ ] Test auto logout on 401

---

## 🛣️ Routing

### Route Setup
- [ ] Create main routes file (`routes/index.jsx`)
- [ ] Setup BrowserRouter
- [ ] Create public routes (Login)
- [ ] Create protected routes
- [ ] Create role-based routes
- [ ] Create 404 page
- [ ] Update `App.jsx` with routing
- [ ] Test all routes
- [ ] Test protected route redirect
- [ ] Test role-based access

---

## 📊 Dashboard Pages

### Student Dashboard
- [ ] Create StudentDashboard component
- [ ] Show application statistics
- [ ] Show available funds
- [ ] Show application history
- [ ] Add "Create Application" button
- [ ] Integrate with API

### Teacher Dashboard
- [ ] Create TeacherDashboard component
- [ ] Show pending approvals (Level 1)
- [ ] Show approval statistics
- [ ] Show student list
- [ ] Integrate with API

### Academic Staff Dashboard
- [ ] Create AcademicDashboard component
- [ ] Show pending approvals (Level 2)
- [ ] Show approval statistics
- [ ] Integrate with API

### Admin Dashboard
- [ ] Create AdminDashboard component
- [ ] Show system overview (users, funds, applications)
- [ ] Show charts (applications by status)
- [ ] Show recent activities
- [ ] Add quick action buttons
- [ ] Integrate with API

### Accountant Dashboard
- [ ] Create AccountantDashboard component
- [ ] Show pending approvals (Level 3)
- [ ] Show financial statistics
- [ ] Show transaction overview
- [ ] Show fund balances
- [ ] Integrate with API

---

## 📝 Application Module

### Application List
- [ ] Create ApplicationList component
- [ ] Create Ant Design Table
- [ ] Add pagination
- [ ] Add sorting
- [ ] Add filtering (by status, fund)
- [ ] Add search (by MSSV, name)
- [ ] Add action buttons (View, Approve, Reject)
- [ ] Integrate with React Query
- [ ] Handle loading state
- [ ] Handle empty state

### Application Detail
- [ ] Create ApplicationDetail component
- [ ] Show application information
- [ ] Show approval timeline (3 levels)
- [ ] Show documents/attachments
- [ ] Add approval actions (if has permission)
- [ ] Add reject action (if has permission)
- [ ] Integrate with API

### Create Application
- [ ] Create CreateApplication component
- [ ] Create form with React Hook Form
- [ ] Add fund selection dropdown
- [ ] Add amount input
- [ ] Add reason textarea
- [ ] Add document upload
- [ ] Add form validation
- [ ] Add preview before submit
- [ ] Integrate with API
- [ ] Handle success/error
- [ ] Redirect after success

### Approval Flow
- [ ] Create ApprovalFlow component
- [ ] Show 3-level approval status
- [ ] Add Approve button (role-based)
- [ ] Add Reject button (role-based)
- [ ] Add comment/reason input
- [ ] Integrate with API
- [ ] Show approval history
- [ ] Handle optimistic updates

---

## 💼 Fund Module

### Fund List
- [ ] Create FundList component
- [ ] Create card grid or table view
- [ ] Add filter by status
- [ ] Add search by name
- [ ] Add action buttons (View, Edit, Delete)
- [ ] Integrate with React Query
- [ ] Handle loading state
- [ ] Handle empty state

### Fund Detail
- [ ] Create FundDetail component
- [ ] Show fund information
- [ ] Show balance & transactions
- [ ] Show donations list
- [ ] Show applications using this fund
- [ ] Integrate with API

### Create/Edit Fund
- [ ] Create FundForm component
- [ ] Create form with validation
- [ ] Add fund name input
- [ ] Add description textarea
- [ ] Add initial balance input
- [ ] Add status select
- [ ] Integrate with API
- [ ] Handle create mode
- [ ] Handle edit mode

---

## 💵 Donation Module

### Donation List
- [ ] Create DonationList component
- [ ] Create table with pagination
- [ ] Add filtering
- [ ] Add search
- [ ] Integrate with API

### Donation Detail
- [ ] Create DonationDetail component
- [ ] Show donation information
- [ ] Show donor information
- [ ] Show fund information
- [ ] Integrate with API

### Create Donation
- [ ] Create CreateDonation component
- [ ] Create form with validation
- [ ] Add donor selection
- [ ] Add fund selection
- [ ] Add amount input
- [ ] Integrate with API

---

## 👥 User Management Module

### User List
- [ ] Create UserList component
- [ ] Create table with pagination
- [ ] Add filtering by role
- [ ] Add search
- [ ] Add action buttons
- [ ] Integrate with API

### User Detail
- [ ] Create UserDetail component
- [ ] Show user information
- [ ] Show role information
- [ ] Show activity history
- [ ] Integrate with API

### User Profile
- [ ] Create UserProfile component
- [ ] Show current user info
- [ ] Add edit profile form
- [ ] Add change password form
- [ ] Integrate with API

---

## 💳 Transaction Module

### Transaction List
- [ ] Create TransactionList component
- [ ] Create table with pagination
- [ ] Add filtering (by type, date)
- [ ] Add search
- [ ] Add export functionality
- [ ] Integrate with API

---

## 🧩 Common Components

### UI Components
- [ ] Create Loading component
- [ ] Create ErrorBoundary component
- [ ] Create EmptyState component
- [ ] Create ConfirmModal component
- [ ] Create StatusBadge component
- [ ] Create PageHeader component
- [ ] Create Breadcrumb component

### Form Components
- [ ] Create FormInput component
- [ ] Create FormSelect component
- [ ] Create FormTextarea component
- [ ] Create FormDatePicker component
- [ ] Create FormUpload component

---

## 🎨 Styling

### Global Styles
- [ ] Complete `_variables.scss`
- [ ] Complete `_mixins.scss`
- [ ] Complete `_base.scss`
- [ ] Complete `_utilities.scss`
- [ ] Complete `main.scss`

### Component Styles
- [ ] Style Header component
- [ ] Style Sidebar component
- [ ] Style Footer component
- [ ] Style all page components
- [ ] Ensure responsive design
- [ ] Test on mobile devices

---

## 🔧 Features & Functionality

### Core Features
- [ ] Authentication flow working
- [ ] Role-based access control working
- [ ] Protected routes working
- [ ] API integration working
- [ ] Form validation working
- [ ] Error handling working
- [ ] Loading states working
- [ ] Toast notifications working

### Advanced Features
- [ ] Pagination working
- [ ] Sorting working
- [ ] Filtering working
- [ ] Search working
- [ ] File upload working
- [ ] Export functionality working
- [ ] Real-time updates (optional)

---

## 🧪 Testing

### Manual Testing
- [ ] Test all routes
- [ ] Test all forms
- [ ] Test all API calls
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test responsive design
- [ ] Test on different browsers

### Automated Testing (Optional)
- [ ] Setup testing framework
- [ ] Write unit tests
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Run tests

---

## 🚀 Optimization

### Performance
- [ ] Implement code splitting
- [ ] Implement lazy loading
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Check Lighthouse score

### SEO & Accessibility
- [ ] Add meta tags
- [ ] Add alt text to images
- [ ] Ensure keyboard navigation
- [ ] Test with screen reader
- [ ] Check color contrast

---

## 📦 Deployment

### Pre-deployment
- [ ] Update environment variables
- [ ] Test production build locally
- [ ] Check for console errors
- [ ] Check for console warnings
- [ ] Update README

### Deployment
- [ ] Build for production (`npm run build`)
- [ ] Deploy to hosting (Vercel/Netlify/etc.)
- [ ] Configure domain (if needed)
- [ ] Test production site
- [ ] Monitor for errors

---

## 📚 Documentation

### Code Documentation
- [ ] Add JSDoc comments to functions
- [ ] Add PropTypes or TypeScript
- [ ] Document complex logic
- [ ] Update README

### User Documentation
- [ ] Create user guide
- [ ] Create admin guide
- [ ] Create API documentation
- [ ] Create deployment guide

---

## 🎯 Progress Tracking

### Week 1
- [ ] Setup & Configuration
- [ ] Layout Components
- [ ] Authentication
- [ ] Routing

### Week 2
- [ ] Dashboard Pages
- [ ] Application Module (List, Detail)

### Week 3
- [ ] Application Module (Create, Approval)
- [ ] Fund Module

### Week 4
- [ ] Donation Module
- [ ] User Management Module
- [ ] Transaction Module

### Week 5
- [ ] Common Components
- [ ] Styling & Polish
- [ ] Testing

### Week 6
- [ ] Optimization
- [ ] Deployment
- [ ] Documentation

---

## 📊 Overall Progress

```
Total Tasks: ~150
Completed: 0
In Progress: 0
Remaining: 150

Progress: 0%
```

---

**Cập nhật checklist này thường xuyên để theo dõi tiến độ! ✅**
