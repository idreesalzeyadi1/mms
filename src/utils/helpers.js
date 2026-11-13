// Edit classes / categories here
export const CLASSES = ["Qaida", "Nazra", "Hifz", "Tajweed", "Dars-e-Nizami"];
export const DONATION_TYPES = ["Zakat", "Sadaqa", "General"];
export const EXPENSE_CATEGORIES = [
  "Food / Mess",
  "Utility Bills",
  "Salaries",
  "Maintenance",
  "Books & Stationery",
  "Other",
];

export const MADRASA_NAME = "Madrasa Dar Ul Uloom Anwar Ul Quran";

export const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

export const sum = (list, key = "amount") =>
  list.reduce((total, item) => total + (Number(item[key]) || 0), 0);

// Local date (YYYY-MM-DD) — avoids the wrong date at night caused by UTC
export const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const monthLabel = (m) =>
  m
    ? new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

export const byRoll = (a, b) =>
  (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0);

export const gradeOf = (p) => {
  if (p >= 80) return "A+";
  if (p >= 70) return "A";
  if (p >= 60) return "B";
  if (p >= 50) return "C";
  if (p >= 40) return "D";
  return "F";
};

export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
