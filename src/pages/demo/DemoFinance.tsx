import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import {
  FINANCE_INVOICES,
  FINANCE_EXPENSES,
  FINANCE_EXPENSE_CATEGORIES
} from "@/lib/demo-data";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

export const DemoFinance = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Finance</h2>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="invoices" className="text-xs md:text-sm">Invoices</TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs md:text-sm">Expenses</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs md:text-sm">Payroll</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs md:text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {FINANCE_INVOICES.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{inv.number}</p>
                      <p className="text-sm text-muted-foreground">{inv.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <p className="font-bold">GHS {inv.amount.toLocaleString()}</p>
                    <span className={`flex items-center gap-1 text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      inv.status === "Paid" ? "bg-green-100 text-green-700" :
                      inv.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      inv.status === "Overdue" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {inv.status === "Paid" && <CheckCircle className="w-3 h-3" />}
                      {inv.status === "Pending" && <Clock className="w-3 h-3" />}
                      {inv.status === "Overdue" && <AlertCircle className="w-3 h-3" />}
                      {inv.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                {[1,2,3,4,5].map(i => <SkeletonLoader key={i} className="h-14 rounded-xl" />)}
              </div>
              <SkeletonLoader className="h-64 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                {FINANCE_EXPENSES.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{exp.category}</p>
                      <p className="text-sm text-muted-foreground">{exp.date}</p>
                    </div>
                    <p className="font-bold">GHS {exp.amount.toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-bold mb-4">Spending by Category</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={FINANCE_EXPENSE_CATEGORIES}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {FINANCE_EXPENSE_CATEGORIES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          {loading ? (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <SkeletonLoader className="h-8 mx-auto w-48 mb-4" />
              <SkeletonLoader className="h-12 mx-auto w-64" />
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <h3 className="text-xl font-black mb-4">Run Payroll</h3>
              <Button className="h-12 text-lg w-full md:w-auto">
                Process Payroll for 14 Employees
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          {loading ? (
            <SkeletonLoader variant="card" className="h-80" />
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <h3 className="text-xl font-black mb-2">Financial Reports</h3>
              <p className="text-muted-foreground">P&L, Balance Sheet, and more</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
