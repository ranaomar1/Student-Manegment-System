# 🎓 Student Management System (SMS)

A React-based web application for managing students in a university environment. It supports multiple user roles, student CRUD operations, statistics, activity tracking, and more.

---

## 📋 Features

- **Authentication** — Login, Signup, role-based access control
- **Dashboard** — Overview cards and recently viewed students
- **Students** — Add, edit, delete, search, filter, sort, and paginate students
- **Student Detail** — Full profile with grade progress bar, timeline, notes, and ID card export
- **Stats** — Visual statistics and grade/status breakdowns
- **Activity Log** — Track all add/edit/delete actions
- **User Management** — Admin can manage user roles
- **API Import** — Import students from an external API
- **Dark Mode** — Toggle between light and dark themes
- **Bulk Actions** — Select and delete multiple students at once
- **Compare Mode** — Compare two students side by side

---

## 👥 Default Accounts

| Role     | Email                        | Password      | Permissions                          |
|----------|------------------------------|---------------|--------------------------------------|
| Admin    | admin@university.edu         | Admin@123     | Full access                          |
| Doctor   | doctor@university.edu        | Doctor@123    | Add, edit, view stats & activity     |
| Engineer | engineer@university.edu      | Engineer@123  | View stats and compare only          |

> New signups are assigned the **viewer** role by default. An admin can change roles from the Users page.

---

## 🚀 Setup & Run Instructions

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### 1. Clone or extract the project

```bash
unzip react_project.zip
cd "react project"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
```

The optimized output will be in the `build/` folder.

---

## 🧪 Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run coverage
```

---

## 🗂️ Project Structure

```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components (Sidebar, Navbar, StudentCard, ...)
├── context/         # React Context providers (Auth, Student, Toast)
├── hooks/           # Custom hooks
├── pages/           # Page components (Dashboard, Students, Stats, ...)
├── services/        # API service functions
├── utils/           # Utility/helper functions
└── __tests__/       # Unit and integration tests
```

---

## 🛠️ Tech Stack

| Technology        | Usage                        |
|-------------------|------------------------------|
| React 18          | UI framework                 |
| React Router v6   | Client-side routing          |
| React Scripts 5   | Build tooling (CRA)          |
| CSS Modules       | Scoped component styling     |
| Jest              | Unit & integration testing   |
| localStorage      | Client-side data persistence |
| dummyjson.com API | Initial student data seeding |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).