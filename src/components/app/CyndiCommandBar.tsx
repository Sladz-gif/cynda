import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  Receipt,
  UserCheck,
  FileText,
  ChevronDown,
  CheckCircle,
  Inbox,
  Zap,
  ClipboardList,
  Plus,
  Bot,
  Search,
  User,
  Building2,
  Briefcase,
  File,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CyndiCommandBar = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // ⌘K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const mockSearchResults: any[] = [];

  const filteredResults = search.length > 0 
    ? mockSearchResults.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.detail.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search contacts, tasks, deals, files..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found for "{search}".</CommandEmpty>

        {search.length > 0 && (
          <CommandGroup heading="Search Results">
            {filteredResults.map((result) => {
              const Icon = result.icon;
              return (
                <CommandItem
                  key={result.id}
                  onSelect={() => go(result.path)}
                  className="flex items-center gap-3 px-3 py-3 text-sm cursor-pointer hover:bg-secondary rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground">{result.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{result.detail}</span>
                  </div>
                  <span className="ml-auto text-[10px] font-black uppercase tracking-tighter text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {result.type}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {search.length === 0 && (
          <>
            <CommandGroup heading="Navigation">
              {[
                { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
                { label: "Projects", icon: Kanban, path: "/app/projects" },
                { label: "CRM", icon: Users, path: "/app/crm" },
                { label: "Finance", icon: Receipt, path: "/app/finance" },
                { label: "HR", icon: UserCheck, path: "/app/hr" },
                { label: "Messages", icon: MessageSquare, path: "/app/chat" },
                { label: "Documents", icon: FileText, path: "/app/notes" },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() => go(item.path)}
                    className="flex items-center gap-2 px-3 py-3 text-sm cursor-pointer hover:bg-secondary rounded-lg transition-colors"
                  >
                    {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />}
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      ⌘{item.label[0]}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              <CommandItem>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create new task</span>
              </CommandItem>
              <CommandItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send message</span>
              </CommandItem>
              <CommandItem>
                <Receipt className="mr-2 h-4 w-4" />
                <span>Create invoice</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Cyndi AI Suggestions">
              <CommandItem onSelect={() => go('/app/crm')}>
                <Bot className="mr-2 h-4 w-4 text-primary" />
                <span>"I want to import our client list"</span>
              </CommandItem>
              <CommandItem onSelect={() => go('/app/file-management')}>
                <Bot className="mr-2 h-4 w-4 text-primary" />
                <span>"Find the Q3 report uploaded by Sarah"</span>
              </CommandItem>
              <CommandItem onSelect={() => go('/app/forms')}>
                <Bot className="mr-2 h-4 w-4 text-primary" />
                <span>"Create a form to collect feedback"</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CyndiCommandBar;
