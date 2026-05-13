import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  Eye,
  AlertTriangle,
  Info,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SURVEILLANCE_MOCK_EVENTS, type SurveillanceEvent } from "@/data/surveillance-mock";
import { comingSoon } from "@/lib/v12-coming-soon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const severityStyle: Record<SurveillanceEvent["severity"], string> = {
  info: "bg-secondary text-foreground border-border",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const SurveillancePage = () => {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selected, setSelected] = useState<SurveillanceEvent | null>(null);

  const modules = useMemo(() => {
    const m = new Set(SURVEILLANCE_MOCK_EVENTS.map((e) => e.module));
    return ["all", ...Array.from(m).sort()];
  }, []);

  const filtered = useMemo(() => {
    return SURVEILLANCE_MOCK_EVENTS.filter((e) => {
      if (moduleFilter !== "all" && e.module !== moduleFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.module.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, moduleFilter, severityFilter]);

  const stats = useMemo(() => {
    const today = filtered.length;
    const crit = filtered.filter((e) => e.severity === "critical").length;
    const warn = filtered.filter((e) => e.severity === "warning").length;
    return { today, crit, warn, actors: new Set(filtered.map((e) => e.actor)).size };
  }, [filtered]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto pb-24">
      <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Surveillance · activity & audit trail
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            A single place to review who did what across CRM, Finance, HR, Files, and Automations. Filters and the table below are fully explorable. Streaming ingestion, retention policies, SIEM export, and alerts will
            connect when your workspace enables the production surveillance layer — use <span className="text-foreground font-semibold">Export</span> or <span className="text-foreground font-semibold">Create alert</span> for the
            coming-soon notice.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/40 text-[9px] font-black uppercase tracking-widest">
          Preview data
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Events (filtered)", value: String(stats.today), icon: Activity },
          { label: "Unique actors", value: String(stats.actors), icon: Eye },
          { label: "Warnings", value: String(stats.warn), icon: AlertTriangle },
          { label: "Critical", value: String(stats.crit), icon: ShieldCheck },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-black tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, action, target, module…"
              className="pl-9 rounded-xl h-10 text-xs font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[140px] rounded-xl h-10 text-xs font-bold">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "all" ? "All modules" : m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px] rounded-xl h-10 text-xs font-bold">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2 text-[10px] font-black uppercase" onClick={() => comingSoon("Saved surveillance views")}>
              <Filter className="w-4 h-4" /> Saved views
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" className="rounded-xl text-[10px] font-black uppercase" onClick={() => comingSoon("Export audit log (CSV/JSON)")}>
            <Download className="w-4 h-4 mr-2" /> Export log
          </Button>
          <Button type="button" className="rounded-xl text-[10px] font-black uppercase shadow-glow" onClick={() => comingSoon("Create alert rule")}>
            Create alert rule
          </Button>
        </div>

        <ScrollArea className="h-[min(520px,60vh)] rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase">Time</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Actor</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Module</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Target</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() => setSelected(row)}
                >
                  <TableCell className="text-xs font-mono whitespace-nowrap">
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold">{row.actor}</span>
                    <span className="block text-[10px] text-muted-foreground">{row.actorRole}</span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{row.module}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate">{row.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{row.target}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase", severityStyle[row.severity])}>
                      {row.severity === "info" && <Info className="w-3 h-3 mr-1 inline" />}
                      {row.severity === "warning" && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                      {row.severity === "critical" && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                      {row.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {filtered.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-8">No events match your filters.</p>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left font-display uppercase tracking-tight">Event detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Timestamp</p>
                <p className="font-mono text-xs mt-1">{new Date(selected.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Actor</p>
                <p className="font-bold mt-1">{selected.actor}</p>
                <p className="text-xs text-muted-foreground">{selected.actorRole}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Action</p>
                <p className="mt-1">{selected.action}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Target</p>
                <p className="mt-1">{selected.target}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Detail</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">{selected.detail}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Source IP</p>
                <p className="font-mono text-xs mt-1">{selected.ip}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="rounded-xl text-[10px] font-black uppercase flex-1" onClick={() => comingSoon("Open in module")}>
                  Open in module
                </Button>
                <Button type="button" className="rounded-xl text-[10px] font-black uppercase flex-1 shadow-glow" onClick={() => comingSoon("Flag for review")}>
                  Flag for review
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default SurveillancePage;
