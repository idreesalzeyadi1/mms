import { motion } from "framer-motion";
import {
  FaHandHoldingDollar,
  FaFileInvoiceDollar,
  FaWallet,
  FaUserGraduate,
  FaSackDollar,
  FaReceipt,
} from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { money, sum } from "../utils/helpers";
import { Card, ErrorNote } from "../components/ui";

export default function Dashboard() {
  const donations = useCollection("donations");
  const expenses = useCollection("expenses");
  const students = useCollection("students");
  const fees = useCollection("fees");

  const totalCharity = sum(donations.data);
  const totalExpenses = sum(expenses.data);
  const totalFees = sum(fees.data);
  const zakatPool = sum(
    donations.data.filter((d) => d.type === "Zakat" || d.type === "Sadaqa")
  );
  const netBalance = totalCharity + totalFees - totalExpenses;

  const stats = [
    {
      label: "Total Charity Received",
      value: money(totalCharity),
      icon: FaHandHoldingDollar,
      bg: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Expenses",
      value: money(totalExpenses),
      icon: FaFileInvoiceDollar,
      bg: "from-amber-500 to-orange-600",
    },
    {
      label: "Net Balance",
      value: money(netBalance),
      icon: FaWallet,
      bg: "from-blue-500 to-indigo-600",
    },
    {
      label: "Total Students",
      value: students.data.length,
      icon: FaUserGraduate,
      bg: "from-purple-500 to-pink-600",
    },
  ];

  const error =
    donations.error || expenses.error || students.error || fees.error;

  return (
    <>
      <ErrorNote message={error} />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br ${bg} p-4 text-white shadow-lg sm:p-6`}
          >
            <div>
              <p className="max-w-[9rem] text-sm font-medium leading-snug">
                {label}
              </p>
              <p className="mt-1 break-words text-2xl font-bold sm:text-3xl">{value}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl sm:h-[60px] sm:w-[60px] sm:text-2xl">
              <Icon />
            </div>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6 p-4 sm:p-6">
        <h3 className="mb-5 text-base font-bold text-slate-900 sm:text-lg">
          Quick Financial Summary
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Zakat &amp; Sadaqa Pool
              </p>
              <p className="break-words text-xl font-bold text-emerald-900 sm:text-2xl">
                {money(zakatPool)}
              </p>
            </div>
            <FaSackDollar className="text-3xl text-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Total Fee Collected
              </p>
              <p className="break-words text-xl font-bold text-blue-900 sm:text-2xl">
                {money(totalFees)}
              </p>
            </div>
            <FaReceipt className="text-3xl text-blue-500" />
          </div>
        </div>
      </Card>
    </>
  );
}
