import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { HR_TEAM_DIRECTORY } from "@/lib/demo-data";

const DEPARTMENTS = ["All", "Sales", "Operations", "Finance", "Marketing", "Admin"];

export const DemoHR = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTeam = HR_TEAM_DIRECTORY.filter(
    (member) =>
      (dept === "All" || member.department === dept) &&
      (member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">HR</h2>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="directory" className="text-xs md:text-sm">Team Directory</TabsTrigger>
          <TabsTrigger value="timeoff" className="text-xs md:text-sm">Time Off</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs md:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="hiring" className="text-xs md:text-sm">Hiring</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    dept === d
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <SkeletonLoader key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeam.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground flex-shrink-0">Dept:</span>
                      <span className="truncate">{member.department}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground flex-shrink-0">Email:</span>
                      <span className="truncate break-all">{member.email}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeoff" className="mt-6">
          {loading ? (
            <SkeletonLoader className="h-64 rounded-2xl" />
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <h3 className="text-xl font-black mb-2">Time Off Management</h3>
              <p className="text-muted-foreground">View and approve leave requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {loading ? (
            <SkeletonLoader className="h-64 rounded-2xl" />
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <h3 className="text-xl font-black mb-2">Performance Reviews</h3>
              <p className="text-muted-foreground">Track and manage team performance</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hiring" className="mt-6">
          {loading ? (
            <SkeletonLoader className="h-64 rounded-2xl" />
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <h3 className="text-xl font-black mb-2">Hiring Pipeline</h3>
              <p className="text-muted-foreground">Manage job postings and candidates</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
