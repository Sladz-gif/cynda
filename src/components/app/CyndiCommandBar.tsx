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
  Sparkles,
  Search,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CyndiCommandBar = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();

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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or ask Cyndi anything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {[
            { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
            { label: "Projects", icon: Kanban, path: "/app/projects" },
            { label: "Automation", icon: Zap, path: "/app/automation" },
            { label: "Forms", icon: ClipboardList, path: "/app/forms" },
            { label: "CRM", icon: Users, path: "/app/crm" },
            { label: "Finance", icon: Receipt, path: "/app/finance" },
            { label: "HR", icon: UserCheck, path: "/app/hr" },
            { label: "Chat", icon: MessageSquare, path: "/app/chat" },
            { label: "Notes", icon: FileText, path: "/app/notes" },
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

        <CommandGroup heading="Cyndi AI">
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>Summarize today's activity</span>
          </CommandItem>
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>Generate weekly report</span>
          </CommandItem>
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>Suggest next actions</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CyndiCommandBar;
