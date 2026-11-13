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
  { path: "/", label: "Dashboard", title: "Dashboard Overview", icon: FaChartPie },
  {
    path: "/donations",
    label: "Charity & Donations",
    title: "Charity & Donations Management",
    icon: FaHandHoldingDollar,
  },
  {
    path: "/expenses",
    label: "Expenses",
    title: "Madrasah Expenses Tracker",
    icon: FaFileInvoiceDollar,
  },
  {
    path: "/students",
    label: "Students",
    title: "Students Management",
    icon: FaUserGraduate,
  },
  {
    path: "/attendance",
    label: "Attendance",
    title: "Attendance Management",
    icon: FaClipboardUser,
  },
  {
    path: "/fees",
    label: "Fee Collection",
    title: "Fee Collection",
    icon: FaReceipt,
  },
  {
    path: "/marks",
    label: "Exam Marks Entry",
    title: "Exam Marks Entry",
    icon: FaPenToSquare,
  },
  {
    path: "/results",
    label: "Exam Results & Merit",
    title: "Position-wise Exam Leaderboard & Merit List",
    icon: FaAward,
  },
  {
    path: "/teachers",
    label: "Manage Teachers",
    title: "Manage Teachers",
    icon: FaChalkboardUser,
  },
];
