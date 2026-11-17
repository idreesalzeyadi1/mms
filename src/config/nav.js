import {
  FaChartPie,
  FaHandHoldingDollar,
  FaFileInvoiceDollar,
  FaUserGraduate,
  FaClipboardUser,
  FaReceipt,
  FaPenToSquare,
  FaAward,
  FaChalkboardUser,
} from "react-icons/fa6";

// Sidebar menu and header titles come from this single list
export const NAV = [
  { path: "/", label: "Dashboard", title: "Dashboard Overview", icon: FaChartPie, permission: "dashboard" },
  {
    path: "/donations",
    label: "Charity & Donations",
    title: "Charity & Donations Management",
    icon: FaHandHoldingDollar,
    permission: "donations",
  },
  {
    path: "/expenses",
    label: "Expenses",
    title: "Madrasah Expenses Tracker",
    icon: FaFileInvoiceDollar,
    permission: "expenses",
  },
  {
    path: "/students",
    label: "Students",
    title: "Students Management",
    icon: FaUserGraduate,
    permission: "students",
  },
  {
    path: "/attendance",
    label: "Attendance",
    title: "Attendance Management",
    icon: FaClipboardUser,
    permission: "attendance",
  },
  {
    path: "/fees",
    label: "Fee Collection",
    title: "Fee Collection",
    icon: FaReceipt,
    permission: "fees",
  },
  {
    path: "/marks",
    label: "Exam Marks Entry",
    title: "Exam Marks Entry",
    icon: FaPenToSquare,
    permission: "marks",
  },
  {
    path: "/results",
    label: "Exam Results & Merit",
    title: "Position-wise Exam Leaderboard & Merit List",
    icon: FaAward,
    permission: "results",
  },
  {
    path: "/teachers",
    label: "Manage Teachers",
    title: "Manage Teachers",
    icon: FaChalkboardUser,
    adminOnly: true,
  },
  {
    path: "/activity",
    label: "Activity Log",
    title: "Activity Log",
    icon: FaClipboardUser,
    adminOnly: true,
  },
];
