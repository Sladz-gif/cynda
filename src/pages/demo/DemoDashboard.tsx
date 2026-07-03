import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, CheckCircle, Clock } from "lucide-react";
import { AnimatedCounter } from "@/components/demo/AnimatedCounter";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import {
  KPIS,
  SALES_CHART_DATA,
  RECENT_DEALS,
  UPCOMING_TASKS,
  TEAM_ACTIVITY_FEED
} from "@/lib/demo-data";

export const DemoDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Rotate activity feed
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % TEAM_ACTIVITY_FEED.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(KPIS).map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: loading ? 0 : index * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            {loading ? (
              <SkeletonLoader variant="card" className="h-24" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-2">
                  {kpi.label}
                </p>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-black">
                    <AnimatedCounter
                      value={kpi.value}
                      prefix={kpi.label === "Total Revenue" ? "GHS " : ""}
                    />
                  </div>
                  {kpi.change > 0 && (
                    <div className="flex items-center text-green-600 text-sm font-bold gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>↑ {kpi.change}{kpi.label === "Active Deals" ? " new" : "%"}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
          {loading ? (
            <SkeletonLoader variant="card" className="h-80" />
          ) : (
            <>
              <h3 className="text-lg font-black tracking-tight mb-6">Sales Performance</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                      tickFormatter={(value) => `GHS ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Recent Deals & Upcoming Tasks */}
        <div className="space-y-6">
          {/* Recent Deals */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="text-lg font-black tracking-tight mb-4">Recent Deals</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <SkeletonLoader key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {RECENT_DEALS.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="p-3 rounded-xl bg-muted/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{deal.company}</p>
                      <p className="text-sm text-muted-foreground">GHS {deal.value.toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                      deal.status === "Won" ? "bg-green-100 text-green-700" : 
                      deal.status === "Negotiation" ? "bg-yellow-100 text-yellow-700" : 
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {deal.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="text-lg font-black tracking-tight mb-4">Upcoming Tasks</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <SkeletonLoader key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {UPCOMING_TASKS.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="p-3 rounded-xl bg-muted/30 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {task.assignee.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {task.due}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Activity */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h3 className="text-lg font-black tracking-tight mb-4">Team Activity</h3>
        {loading ? (
          <SkeletonLoader className="h-12" />
        ) : (
          <motion.div
            key={activityIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <p className="font-medium">{TEAM_ACTIVITY_FEED[activityIndex].message}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
