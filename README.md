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
6. Copy the configuration values from **Project Settings → Your apps → Web app**.
7. Create a `.env` file in the project root using the example below.

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

The app now reads Firebase config from environment variables instead of a hardcoded project config.

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
