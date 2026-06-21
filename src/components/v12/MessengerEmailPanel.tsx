import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Star,
  Archive,
  Trash2,
  Search,
  Paperclip,
  Plus,
  ChevronDown,
  X,
  MoreHorizontal,
  Cloud,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { V12_MOCK_EMAILS, type V12Email } from "@/data/v12-mock";
import { comingSoon } from "@/lib/v12-coming-soon";
import { useIndustryStore } from "@/lib/industry-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FolderId = "inbox" | "sent" | "drafts" | "starred" | "spam" | "trash";

function cyndaAddressFromName(name?: string) {
  const base =
    (name || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "user";
  return `${base}@cynda.xyz`;
}

/** v1.2 @cynda.xyz email client  embedded in Messenger (`/app/messages?tab=email`). */
const MessengerEmailPanel = () => {
  const { adminProfile, currentUser } = useIndustryStore();
  const active = currentUser || adminProfile;
  const cyndaEmail = cyndaAddressFromName(active?.name);

  const [account, setAccount] = useState<"cynda" | "gmail">("cynda");
  const [folder, setFolder] = useState<FolderId>("inbox");
  const [emails, setEmails] = useState<V12Email[]>(() => [...V12_MOCK_EMAILS]);
  const [selectedId, setSelectedId] = useState<string | null>(V12_MOCK_EMAILS[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "attachments">("all");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [bulkIds, setBulkIds] = useState<Set<string>>(new Set());

  const folders: { id: FolderId; label: string; icon: typeof Inbox; unread?: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, unread: emails.filter((e) => e.folder === "inbox" && e.unread).length },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: FileText },
    { id: "starred", label: "Starred", icon: Star },
    { id: "spam", label: "Spam", icon: Archive },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const filteredList = useMemo(() => {
    return emails.filter((e) => {
      if (e.account !== account) return false;
      if (folder === "starred") {
        if (!e.starred) return false;
      } else if (e.folder !== folder) return false;
      if (filter === "unread" && !e.unread) return false;
      if (filter === "starred" && !e.starred) return false;
      if (filter === "attachments" && !e.hasAttachment) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.subject.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q) ||
          e.from.name.toLowerCase().includes(q) ||
          e.from.email.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [emails, account, folder, filter, search]);

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  const toggleStar = (id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  };

  const markRead = (id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, unread: false } : e)));
  };

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 max-w-[1800px] mx-auto w-full">
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email @cynda.xyz · v1.2 preview</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">
            Same client as the full spec: folders, reading pane, compose. Live send/receive and OAuth ship in v1.2  use Send or connect to see “coming soon”.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/40 text-[9px] font-black uppercase tracking-widest">
          {cyndaEmail}
        </Badge>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0 rounded-2xl border-2 border-border bg-card/50 overflow-hidden">
        <aside className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-background/80 max-h-[40vh] lg:max-h-none">
          <div className="p-3 border-b border-border space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Account</p>
            <Select value={account} onValueChange={(v) => setAccount(v as "cynda" | "gmail")}>
              <SelectTrigger className="rounded-xl h-10 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cynda">{cyndaEmail}</SelectItem>
                <SelectItem value="gmail">Connect Gmail…</SelectItem>
              </SelectContent>
            </Select>
            {account === "gmail" && (
              <Button type="button" variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-tight" onClick={() => comingSoon("Gmail connection (OAuth)")}>
                Finish connecting Gmail
              </Button>
            )}
            <Button type="button" className="w-full rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest shadow-glow" onClick={() => setComposeOpen(true)}>
              <Plus className="w-4 h-4" /> Compose
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-[120px]">
            <nav className="p-2 space-y-0.5">
              {folders.map((f) => {
                const Icon = f.icon;
                const activeF = folder === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFolder(f.id);
                      setSelectedId(null);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-colors",
                      activeF ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{f.label}</span>
                    </span>
                    {f.unread ? (
                      <span className={cn("text-[10px] font-black tabular-nums", activeF ? "text-primary-foreground" : "text-primary")}>{f.unread}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="p-3 border-t border-border text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5" />
            Storage · 2.1 / 25 GB
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-border min-h-[200px]">
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sender, subject, body…" className="pl-9 rounded-xl h-10 text-xs font-medium" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "unread", "starred", "attachments"] as const).map((f) => (
                <Button key={f} type="button" size="sm" variant={filter === f ? "default" : "outline"} className="h-8 text-[10px] font-black uppercase tracking-tight" onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : f === "unread" ? "Unread" : f === "starred" ? "Starred" : "With attachments"}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Cloud className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="font-display text-base font-black uppercase tracking-tight">Your inbox is clear.</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">New @cynda.xyz mail appears here when receiving is live in v1.2.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredList.map((e) => (
                  <li key={e.id}>
                    <div
                      className={cn(
                        "flex gap-2 items-start p-3 cursor-pointer transition-colors hover:bg-secondary/40",
                        selectedId === e.id && "bg-secondary/60",
                        e.unread && "bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedId(e.id);
                        markRead(e.id);
                      }}
                    >
                      <Checkbox
                        className="mt-1"
                        checked={bulkIds.has(e.id)}
                        onCheckedChange={(c) => {
                          setBulkIds((prev) => {
                            const next = new Set(prev);
                            if (c) next.add(e.id);
                            else next.delete(e.id);
                            return next;
                          });
                        }}
                        onClick={(ev) => ev.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-xs font-bold truncate", e.unread && "text-foreground font-black")}>{e.from.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">{e.time}</span>
                        </div>
                        <p className={cn("text-xs truncate", e.unread ? "font-black text-foreground" : "font-semibold text-foreground/90")}>{e.subject}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{e.preview}</p>
                        <div className="flex items-center gap-2 pt-1">
                          {e.hasAttachment && <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />}
                          <button
                            type="button"
                            className="text-[10px] font-black uppercase text-primary"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              toggleStar(e.id);
                            }}
                          >
                            {e.starred ? "★ Starred" : "☆ Star"}
                          </button>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(ev) => ev.stopPropagation()}>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => markRead(e.id)}>Mark as read</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStar(e.id)}>Star</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => comingSoon("Move to folder")}>Move to folder</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => comingSoon("Delete (sync)")}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          {bulkIds.size > 0 && (
            <div className="p-2 border-t border-border flex flex-wrap gap-2 bg-background/90 shrink-0">
              <Button type="button" size="sm" variant="outline" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Bulk mark read")}>
                Mark read ({bulkIds.size})
              </Button>
              <Button type="button" size="sm" variant="outline" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Bulk move")}>
                Move
              </Button>
              <Button type="button" size="sm" variant="destructive" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Bulk delete")}>
                Delete
              </Button>
            </div>
          )}
        </div>

        <section className={cn("w-full lg:w-[min(44%,480px)] shrink-0 flex flex-col bg-background/60 min-h-[200px]", !selected && "hidden lg:flex items-center justify-center")}>
          {selected ? (
            <>
              <div className="p-4 border-b border-border space-y-3 shrink-0">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Reply")}>
                    Reply
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Forward")}>
                    Forward
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="text-[10px] font-black uppercase" onClick={() => toggleStar(selected.id)}>
                    Star
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="text-[10px] font-black uppercase" onClick={() => comingSoon("Print")}>
                    Print
                  </Button>
                </div>
                <div>
                  <h2 className="font-display text-lg font-black text-foreground leading-tight">{selected.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-2">
                    From <span className="text-foreground font-bold">{selected.from.name}</span> · {selected.from.email}
                  </p>
                  <p className="text-xs text-muted-foreground">To {selected.to.join(", ")} · {selected.time}</p>
                </div>
                {selected.hasAttachment && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-lg cursor-pointer" onClick={() => comingSoon("Attachment download")}>
                      <Paperclip className="w-3 h-3 mr-1" /> Q2-specs.pdf
                    </Badge>
                  </div>
                )}
              </div>
              <ScrollArea className="flex-1 p-4">
                <pre className="text-xs font-sans whitespace-pre-wrap text-foreground/90 leading-relaxed font-medium">{selected.body}</pre>
              </ScrollArea>
            </>
          ) : (
            <p className="text-sm text-muted-foreground font-medium px-6 text-center">Select a message to read</p>
          )}
        </section>
      </div>

      {composeOpen && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 right-4 md:right-8 z-[90] w-full max-w-lg rounded-t-2xl border-2 border-border bg-card shadow-2xl flex flex-col max-h-[70vh]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/90 rounded-t-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> New message
            </span>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setComposeOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">From</Label>
              <Button type="button" variant="outline" className="w-full justify-between rounded-xl h-10 text-xs font-bold">
                {cyndaEmail}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">To</Label>
              <Input value={composeTo} onChange={(e) => setComposeTo(e.target.value)} placeholder="Recipients  autocomplete from CRM when live" className="rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Subject</Label>
              <Input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} className="rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Body</Label>
              <Textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)} rows={6} className="rounded-xl text-xs resize-none" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" className="rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow" onClick={() => comingSoon("Send via Resend")}>
                Send
              </Button>
              <Button type="button" variant="outline" className="rounded-xl text-[10px] font-black uppercase" onClick={() => comingSoon("Save draft (cloud sync)")}>
                Save draft
              </Button>
              <Button type="button" variant="ghost" className="rounded-xl text-[10px] font-black uppercase text-muted-foreground" onClick={() => comingSoon("Schedule send")}>
                Schedule send · soon
              </Button>
              <Button type="button" variant="ghost" className="rounded-xl text-[10px] font-black uppercase" onClick={() => comingSoon("Attachments")}>
                Attach
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessengerEmailPanel;
