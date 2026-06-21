import { Link } from "react-router-dom";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

const MOCK_IMPORTS: { id: string; name: string; source: string; records: number; status: "Completed" | "Failed"; date: string; mappedBy: string }[] = [];

const CRMImportHistoryPage = () => {
  return (
    <div className={cn("space-y-8", "max-w-4xl mx-auto pb-16")}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 h-9 uppercase font-black text-[10px] tracking-widest" asChild>
            <Link to="/app/crm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to CRM
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">Import history</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Logs for data migrations and AI-mapped imports (see CYNDA_DOCUMENTATION.md  Clients → Import History).
          </p>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/20 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest">Recent imports</span>
        </div>
        <ul className="divide-y divide-border">
          {MOCK_IMPORTS.map((row) => (
            <li key={row.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm uppercase tracking-tight text-foreground truncate">{row.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {row.source} · {row.records} records · {row.date} · Mapped by {row.mappedBy}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {row.status === "Completed" ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CRMImportHistoryPage;
