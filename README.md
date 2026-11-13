# Madrasa Management System

React + Vite + Tailwind CSS + Firebase (Auth + Firestore) + Framer Motion.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

## Firebase setup (one time)

1. Create or open a Firebase project in the Firebase Console.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Go to **Authentication → Users → Add user** and create the admin email + password used to log in.
4. Create a **Firestore Database** (Production mode).
5. In **Firestore → Rules**, paste the contents of `firestore.rules` and click Publish.
6. Firebase configuration is included in `src/firebase.js`; no Vercel environment variables are needed.

## Pages

| Route | File |
|---|---|
| `/login` | `src/pages/Login.jsx` |
| `/` Dashboard | `src/pages/Dashboard.jsx` |
| `/donations` | `src/pages/Donations.jsx` |
| `/expenses` | `src/pages/Expenses.jsx` |
| `/students` | `src/pages/Students.jsx` |
| `/attendance` | `src/pages/Attendance.jsx` |
| `/fees` | `src/pages/FeeCollection.jsx` |
| `/marks` | `src/pages/ExamMarksEntry.jsx` |
| `/results` | `src/pages/ExamResults.jsx` |
| `/teachers` | `src/pages/ManageTeachers.jsx` |

## Firestore collections

`donations`, `expenses`, `students`, `attendance`, `fees`, `exams`, `marks`, `teachers`

## Customize

- Classes / categories / madrasa name: `src/utils/helpers.js`
- Sidebar menu: `src/config/nav.js`
- Firebase config: `src/firebase.js`

## Deploy

- **Vercel**: import the repo, framework Vite, build `npm run build`, output `dist`.
- **GitHub Pages**: Publish the `dist/` folder (HashRouter + `base: "./"` is used, so no extra config is needed).

## Dashboard formula

Net Balance = Total Charity + Total Fee Collected − Total Expenses
