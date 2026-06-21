import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Share2, X, Medal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { V12_HERO_ROTATION, V12_MOCK_LEADERBOARD, type V12LeaderPerson } from "@/data/v12-mock";
import { comingSoon } from "@/lib/v12-coming-soon";
import { useIndustryStore } from "@/lib/industry-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const FILTER_STORAGE = "cynda-performance-filters-v1";

const PerformancePage = () => {
  const { adminProfile, currentUser, userType = "solo" } = useIndustryStore();
  const me = currentUser || adminProfile;

  const [heroIdx, setHeroIdx] = useState(0);
  const [scope, setScope] = useState<"individual" | "team" | "department" | "company">("individual");
  const [geo, setGeo] = useState<"global" | "continent" | "country">("global");
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year" | "all">("month");
  const [metric, setMetric] = useState<string>("overall");
  const [profile, setProfile] = useState<V12LeaderPerson | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.scope) setScope(p.scope);
      if (p.geo) setGeo(p.geo);
      if (p.period) setPeriod(p.period);
      if (p.metric) setMetric(p.metric);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE, JSON.stringify({ scope, geo, period, metric }));
    } catch {
      /* ignore */
    }
  }, [scope, geo, period, metric]);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % V12_HERO_ROTATION.length), 8000);
    return () => clearInterval(t);
  }, []);

  const leaderboard = useMemo(() => {
    let rows = [...V12_MOCK_LEADERBOARD];
    if (metric !== "overall") {
      rows = rows.map((r, i) => ({ ...r, score: Math.max(400, r.score - i * 12 - (metric.length % 7) * 3) }));
    }
    return rows.sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
  }, [metric]);

  const myRow = leaderboard.find((r) => r.name === me?.name) ?? leaderboard[4];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto pb-24">
      <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Version 1.2 preview  Performance</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-4xl">
          Real-time leaderboards, filters, score breakdowns, and achievements are fully explorable below. Live scoring from your workspace, global opt-out, and shareable cards connect when v1.2 ships  try{" "}
          <span className="text-foreground font-semibold">Share my performance</span> for the notice.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-card via-card to-primary/10 p-6 md:p-8 min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow shrink-0">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Global #1 right now</p>
                    <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">{V12_HERO_ROTATION[heroIdx].name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {V12_HERO_ROTATION[heroIdx].company} · {V12_HERO_ROTATION[heroIdx].country}
                    </p>
                    <p className="text-xs font-bold text-primary mt-2">{V12_HERO_ROTATION[heroIdx].summary}</p>
                  </div>
                </div>
                <Badge className="w-fit text-[10px] font-black uppercase tracking-widest">Rotates top 3 · every 8s</Badge>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border-2 border-border bg-card/80 p-4 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filters (state persists in this browser)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Scope</span>
                <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                  <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Geography</span>
                <Select value={geo} onValueChange={(v) => setGeo(v as typeof geo)}>
                  <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="continent">By continent</SelectItem>
                    <SelectItem value="country">By country</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Time</span>
                <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                  <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Metric</span>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall score</SelectItem>
                    <SelectItem value="tasks">Tasks completed</SelectItem>
                    <SelectItem value="deals">Deals closed</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="projects">Projects delivered</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Industry</span>
                <Button type="button" variant="outline" className="w-full rounded-xl h-10 text-xs font-bold justify-between" onClick={() => comingSoon("Industry filter")}>
                  All industries <Badge variant="secondary" className="text-[8px]">Soon</Badge>
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-[10px]">
              <span className="font-black uppercase text-muted-foreground">Active:</span>
              {[
                scope,
                geo,
                period,
                metric === "overall" ? "overall score" : metric,
              ].map((c) => (
                <Badge key={c} variant="outline" className="text-[9px] font-bold uppercase">
                  {c}
                </Badge>
              ))}
              <button type="button" className="text-primary font-black uppercase ml-2 hover:underline" onClick={() => { setScope("individual"); setGeo("global"); setPeriod("month"); setMetric("overall"); }}>
                Reset all
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl border-2 border-border overflow-hidden bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg font-black uppercase tracking-tight">Individual leaderboard</h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{userType.replace("-", " ")} view</span>
            </div>
            <ScrollArea className="h-[min(520px,55vh)]">
              <ul className="divide-y divide-border">
                {leaderboard.map((row) => {
                  const isMe = row.name === me?.name;
                  const medal = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : null;
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setProfile(row)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                          isMe && "bg-primary/10 border-l-4 border-l-primary"
                        )}
                      >
                        <span className="w-8 text-center font-display font-black text-lg tabular-nums">{medal || row.rank}</span>
                        <Avatar className="h-10 w-10 rounded-xl border-2 border-border">
                          <AvatarFallback className="text-xs font-black">{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm truncate">{row.name}</span>
                            {row.badges.slice(0, 2).map((b) => (
                              <Badge key={b} variant="secondary" className="text-[8px] font-black uppercase shrink-0">
                                {b}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {row.title} · {row.company} · {row.flag} {row.country}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-black text-lg tabular-nums">{row.score}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{row.metricValue}</p>
                          <span className="inline-flex mt-1">
                            {row.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {row.trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                            {row.trend === "same" && <Minus className="w-4 h-4 text-muted-foreground" />}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
            {myRow && !leaderboard.some((r) => r.name === me?.name) && (
              <div className="px-4 py-3 border-t border-dashed border-primary/40 bg-primary/5 text-xs font-bold">
                Your position · #{myRow.rank} · pinned preview row when outside top 20
              </div>
            )}
          </div>
        </div>

        {/* My performance */}
        <aside className="rounded-2xl border-2 border-border bg-card p-5 space-y-5 xl:sticky xl:top-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">My performance</p>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary">
                <AvatarFallback className="font-black">{me?.name?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{me?.name ?? "You"}</p>
                <p className="text-xs text-muted-foreground">Rank #{myRow?.rank ?? ""} · Score {myRow?.score ?? ""}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Score mix (illustrative)</p>
            <div className="space-y-3">
              {[
                { label: "Tasks on time", v: 78 },
                { label: "Deals / revenue", v: 64 },
                { label: "Delivery", v: 55 },
                { label: "Attendance / response", v: 42 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>{s.label}</span>
                    <span>{s.v}%</span>
                  </div>
                  <Progress value={s.v} className="h-2" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["On a Streak", "Deal Closer", "Rising Star"].map((b) => (
              <span key={b} title={b} className="text-lg cursor-help">
                <Medal className="inline w-5 h-5 text-primary" />
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 inline text-primary mr-1" />
            Leaderboard refresh every 60s and Cyndi badge toasts will sync with live workspace data in v1.2.
          </p>
          <Button type="button" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-glow" onClick={() => comingSoon("Share performance card")}>
            <Share2 className="w-4 h-4" /> Share my performance
          </Button>
        </aside>
      </div>

      <Sheet open={!!profile} onOpenChange={() => setProfile(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display uppercase tracking-tight">Public profile</SheetTitle>
          </SheetHeader>
          {profile && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 rounded-2xl">
                  <AvatarFallback className="font-black text-lg">{profile.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-lg">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.title}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.company} · {profile.flag} {profile.country}
              </p>
              <div className="rounded-xl border-2 border-border p-4 space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Overall score</p>
                <p className="font-display text-3xl font-black">{profile.score}</p>
                <p className="text-xs text-muted-foreground">Breakdown donut + work history will tie to CRM, tasks, and HR in v1.2.</p>
              </div>
              <Button type="button" className="w-full rounded-xl font-black text-[10px] uppercase" onClick={() => comingSoon("Message from Performance")}>
                Send message
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default PerformancePage;
