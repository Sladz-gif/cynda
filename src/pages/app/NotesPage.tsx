import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { 
  Plus, Search, FileText, Star, Clock, Bold, Italic, List, Link as LinkIcon, 
  Image as ImageIcon, Hash, Code, Heading1, Heading2, Heading3, Quote, Table as TableIcon, 
  Sparkles, MoreHorizontal, ChevronRight, ChevronDown, Folder, Trash2, 
  Share2, Pin, PinOff, Copy, ArrowUpRight, GripVertical, 
  CheckSquare, ListOrdered, Minus, Type, Layers, ExternalLink,
  RotateCcw, Trash, Search as SearchIcon, Filter, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// --- Types ---

type BlockType = 
  | 'text' | 'h1' | 'h2' | 'h3' 
  | 'bullet' | 'number' | 'todo' 
  | 'quote' | 'code' | 'divider' 
  | 'image' | 'video' | 'file' 
  | 'table' | 'callout' | 'toggle';

type Block = {
  id: string;
  type: BlockType;
  content: string;
  props?: any;
};

type Page = {
  id: string;
  title: string;
  icon?: string;
  parentId?: string;
  folder?: string;
  content: string; // HTML content from Quill
  isFavorite: boolean;
  isArchived: boolean;
  updatedAt: string;
  tags: string[];
};

// --- Mock Data ---

const FOLDERS = ["All Notes", "Brand", "Engineering", "Sales", "HR", "Product", "Finance", "Medical", "Education", "Restaurant", "Real Estate", "Freelancer"];

const INITIAL_PAGES: Page[] = [
  {
    id: '1',
    title: 'Q2 Brand Guidelines',
    icon: '🎨',
    folder: 'Brand',
    content: `
      <h1>Brand Identity Overview</h1>
      <p>This document outlines our key brand standards for Q2 2026.</p>
      <h2>Color Palette</h2>
      <ul>
        <li>Primary: Burning Orange (#FF7124)</li>
        <li>Secondary: Pale Cashmere (#E8DFD5)</li>
      </ul>
      <hr>
      <p><strong>Note:</strong> Always use the primary orange for main CTA buttons.</p>
    `,
    isFavorite: true,
    isArchived: false,
    updatedAt: new Date().toISOString(),
    tags: ['Design', 'Brand'],
  },
  {
    id: '2',
    title: 'Product Roadmap',
    icon: '🚀',
    folder: 'Product',
    content: `
      <h1>2026 Roadmap</h1>
      <p>Current priorities for the product team:</p>
      <ul>
        <li>Launch v2.0 Beta</li>
        <li>Integrate CRM</li>
      </ul>
    `,
    isFavorite: true,
    isArchived: false,
    updatedAt: new Date().toISOString(),
    tags: ['Product'],
  },
  {
    id: '3',
    title: 'Meeting Notes',
    icon: '📝',
    parentId: '2',
    folder: 'Product',
    content: `
      <p>Notes from the client sync on March 24th.</p>
    `,
    isFavorite: false,
    isArchived: false,
    updatedAt: new Date().toISOString(),
    tags: ['Meetings'],
  },
  {
    id: 'trash-1',
    title: 'Old Ideas',
    folder: 'Engineering',
    content: `<p>Discarded concepts.</p>`,
    isFavorite: false,
    isArchived: true,
    updatedAt: new Date().toISOString(),
    tags: [],
  }
];

const NotesPage = () => {
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState<string | null>(INITIAL_PAGES[0].id);
  const [activeFolder, setActiveFolder] = useState("All Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });
  const [folders, setFolders] = useState(FOLDERS);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFormat = useCallback((format: string, value: any = true) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    quill.focus();
    const range = quill.getSelection(true);
    if (!range) return;

    if (format === 'link') {
      const currentFormat = quill.getFormat(range);
      if (currentFormat.link) {
        quill.format('link', false);
      } else {
        const url = prompt('Enter link URL:');
        if (url) {
          // If no text is selected, we can't really "make a text a link" in the traditional sense 
          // without inserting text, but Quill handles this by applying to the selection.
          quill.format('link', url);
        }
      }
    } else if (format === 'image') {
      fileInputRef.current?.click();
    } else if (format === 'table') {
      setIsTableDialogOpen(true);
    } else if (format === 'list') {
      const currentFormat = quill.getFormat(range);
      quill.format('list', currentFormat.list === value ? false : value);
    } else if (format === 'header') {
      const currentFormat = quill.getFormat(range);
      quill.format('header', currentFormat.header === value ? false : value);
    } else if (format === 'blockquote') {
      const currentFormat = quill.getFormat(range);
      quill.format('blockquote', !currentFormat.blockquote);
    } else if (format === 'code-block') {
      const currentFormat = quill.getFormat(range);
      quill.format('code-block', !currentFormat['code-block']);
    } else {
      const currentFormat = quill.getFormat(range);
      quill.format(format, !currentFormat[format]);
    }
  }, [toast]);

  const activePage = useMemo(() => 
    pages.find(p => p.id === activePageId) || null
  , [pages, activePageId]);

  const favoritePages = useMemo(() => 
    pages.filter(p => p.isFavorite && !p.isArchived)
  , [pages]);

  const rootPages = useMemo(() => {
    let base = pages.filter(p => !p.parentId && !p.isArchived);
    if (activeFolder !== "All Notes") {
      base = base.filter(p => p.folder === activeFolder);
    }
    return base;
  }, [pages, activeFolder]);

  const archivedPages = useMemo(() => 
    pages.filter(p => p.isArchived)
  , [pages]);

  // --- Actions ---

  const createPage = useCallback((parentId?: string) => {
    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled',
      folder: activeFolder !== "All Notes" ? activeFolder : undefined,
      content: '',
      isFavorite: false,
      isArchived: false,
      updatedAt: new Date().toISOString(),
      tags: [],
      parentId,
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    toast({ title: "New Page Created", description: "Start typing to edit your new note." });
  }, [activeFolder, toast]);

  const deletePage = useCallback((id: string, permanently = false) => {
    if (permanently) {
      setPages(prev => prev.filter(p => p.id !== id));
      if (activePageId === id) setActivePageId(null);
      toast({ title: "Page Deleted Permanently" });
    } else {
      setPages(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p));
      toast({ title: "Moved to Trash", description: "You can restore it from the archive." });
    }
  }, [activePageId, toast]);

  const restorePage = useCallback((id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isArchived: false } : p));
    toast({ title: "Page Restored" });
  }, [toast]);

  const updatePage = useCallback((id: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  }, []);

  const insertTable = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    try {
      const rows = tableConfig.rows;
      const cols = tableConfig.cols;
      let tableHtml = '<table style="border: 2px solid black; border-collapse: collapse; width: 100%;"><tbody>';
      for (let i = 0; i < rows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < cols; j++) {
          tableHtml += '<td style="border: 2px solid black; padding: 12px; height: 40px;"><br></td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table><p><br></p>';
      
      const range = quill.getSelection(true);
      quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
      setIsTableDialogOpen(false);
      toast({ title: "Table Inserted", description: `Added a ${tableConfig.rows}x${tableConfig.cols} table.` });
    } catch (error) {
      console.error("Table insertion failed:", error);
      toast({ 
        title: "Insertion Failed", 
        description: "Could not insert table.",
        variant: "destructive"
      });
    }
  }, [tableConfig, toast]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        if (quill && range) {
          quill.insertEmbed(range.index, 'image', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // --- Components ---

  const PageItem = ({ page, depth = 0 }: { page: Page; depth?: number }) => {
    const hasChildren = pages.some(p => p.parentId === page.id && !p.isArchived);
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-0.5">
        <div 
          className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
            activePageId === page.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setActivePageId(page.id)}
        >
          <button 
            className={`p-0.5 rounded hover:bg-secondary transition-transform ${isOpen ? "rotate-90" : ""}`}
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {hasChildren && <ChevronRight className="w-3 h-3" />}
          </button>
          <span className="w-4 h-4 flex items-center justify-center text-sm">{page.icon || '📄'}</span>
          <span className="flex-1 truncate">{page.title || 'Untitled'}</span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button 
              className="p-1 hover:bg-secondary rounded"
              onClick={(e) => { e.stopPropagation(); createPage(page.id); }}
            >
              <Plus className="w-3 h-3" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-secondary rounded" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => toggleFavorite(page.id)}>
                  {page.isFavorite ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                  {page.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const newPage = { ...page, id: Math.random().toString(36).substr(2, 9), title: `${page.title} (Copy)` };
                  setPages(prev => [...prev, newPage]);
                }}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><Layers className="w-4 h-4 mr-2" /> Move to</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => updatePage(page.id, { parentId: undefined })}>Root</DropdownMenuItem>
                    {pages.filter(p => p.id !== page.id && !p.isArchived).map(p => (
                      <DropdownMenuItem key={p.id} onClick={() => updatePage(page.id, { parentId: p.id })}>{p.title}</DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => deletePage(page.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {isOpen && pages.filter(p => p.parentId === page.id && !p.isArchived).map(child => (
          <PageItem key={child.id} page={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const editorModules = useMemo(() => ({
    toolbar: false,
  }), []);

  const editorFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image', 'code-block'
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 border-t border-border overflow-hidden bg-background">
      <style>{`
        .quill-editor .ql-toolbar.ql-snow {
          display: none;
        }
        .quill-editor {
          background: hsl(var(--secondary) / 0.2);
          border-radius: 1rem;
          border: 1px dashed hsl(var(--border));
          transition: all 0.2s;
        }
        .quill-editor:hover {
          background: hsl(var(--secondary) / 0.3);
          border-color: hsl(var(--primary) / 0.3);
        }
        .quill-editor .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: inherit;
        }
        .quill-editor .ql-editor {
          padding: 32px !important;
          line-height: 1.6;
          color: hsl(var(--foreground));
          min-height: inherit;
        }
        .quill-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          left: 32px;
          opacity: 0.5;
        }
        .quill-editor .ql-editor h1 { font-family: var(--font-display); font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; }
        .quill-editor .ql-editor h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .quill-editor .ql-editor h3 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .quill-editor .ql-editor p { margin-bottom: 1rem; }
        .quill-editor .ql-editor ul, .quill-editor .ql-editor ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .quill-editor .ql-editor table { 
          border-collapse: collapse !important; 
          margin: 1rem 0 !important; 
          width: 100% !important; 
          border: 2px solid #000000 !important; 
          table-layout: fixed !important;
        }
        .quill-editor .ql-editor td { 
          border: 2px solid #000000 !important; 
          padding: 12px !important; 
          vertical-align: top !important; 
          min-width: 50px !important;
          height: 40px !important;
        }
        .quill-editor .ql-snow .ql-stroke { stroke: hsl(var(--muted-foreground)); }
        .quill-editor .ql-snow .ql-fill { fill: hsl(var(--muted-foreground)); }
        .quill-editor .ql-snow .ql-picker { color: hsl(var(--muted-foreground)); }
      `}</style>
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card/50">
        {/* Sidebar Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display font-semibold text-sm">Cynda Notes</span>
          </div>
          <button className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground" onClick={() => setIsSearchOpen(true)}><Search className="w-4 h-4" /></button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 space-y-6 py-2">
          {/* Create New Actions */}
          <div className="px-2 grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider gap-2 border-dashed hover:border-primary hover:text-primary transition-all"
              onClick={() => createPage()}
            >
              <Plus className="w-3 h-3" /> Note
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider gap-2 border-dashed hover:border-primary hover:text-primary transition-all"
              onClick={() => setIsNewFolderOpen(true)}
            >
              <Folder className="w-3 h-3" /> Folder
            </Button>
          </div>

          {/* Folders */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between group">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Folders</span>
            </div>
            <div className="space-y-0.5">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => { setActiveFolder(f); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                    activeFolder === f ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites */}
          {favoritePages.length > 0 && (
            <div>
              <div className="px-2 mb-1 flex items-center justify-between group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Favorites</span>
              </div>
              <div className="space-y-0.5">
                {favoritePages.map(page => <PageItem key={page.id} page={page} />)}
              </div>
            </div>
          )}

          {/* Private Workspace */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between group">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Pages</span>
              <button 
                className="p-0.5 hover:bg-secondary rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => createPage()}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              {rootPages.map(page => <PageItem key={page.id} page={page} />)}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-border space-y-1">
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary transition-colors"
            onClick={() => setIsTrashOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Trash
            <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{archivedPages.length}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {activePage ? (
          <>
            {/* Page Header / Toolbar */}
            <div className="h-11 px-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {[
                  { icon: Bold, action: () => handleFormat('bold'), label: 'Bold' },
                  { icon: Italic, action: () => handleFormat('italic'), label: 'Italic' },
                  { icon: Heading1, action: () => handleFormat('header', 1), label: 'H1' },
                  { icon: Heading2, action: () => handleFormat('header', 2), label: 'H2' },
                  { icon: Heading3, action: () => handleFormat('header', 3), label: 'H3' },
                  { icon: List, action: () => handleFormat('list', 'bullet'), label: 'Bullet List' },
                  { icon: ListOrdered, action: () => handleFormat('list', 'ordered'), label: 'Numbered List' },
                  { icon: Quote, action: () => handleFormat('blockquote'), label: 'Quote' },
                  { icon: Code, action: () => handleFormat('code-block'), label: 'Code' },
                  // { icon: LinkIcon, action: () => handleFormat('link'), label: 'Link' },
                  { icon: ImageIcon, action: () => handleFormat('image'), label: 'Image' },
                  // { icon: TableIcon, action: () => handleFormat('table'), label: 'Table' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" 
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent focus loss from the editor
                      item.action();
                    }} 
                    title={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                  </button>
                ))}
                <div className="mx-2 w-px h-5 bg-border" />
                <button className="p-1.5 rounded text-primary hover:bg-primary/5 transition-colors flex items-center gap-1" onClick={() => toast({ title: "AI Assistant", description: "Analyzing your note..." })}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-medium">AI</span>
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1.5 text-muted-foreground" onClick={() => toggleFavorite(activePage.id)}>
                  {activePage.isFavorite ? <PinOff className="w-3.5 h-3.5 text-primary" /> : <Pin className="w-3.5 h-3.5" />}
                  {activePage.isFavorite ? 'Pinned' : 'Pin'}
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1.5 text-muted-foreground">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="gap-2">
                      <Clock className="w-4 h-4" /> View History
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Copy className="w-4 h-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive gap-2" onClick={() => deletePage(activePage.id)}>
                      <Trash2 className="w-4 h-4" /> Delete Page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="w-full h-full px-12 py-16 space-y-2">
                {/* Title Section */}
                <div className="group mb-8">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">
                    <Folder className="w-3 h-3" />
                    <span>Workspace</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span>{activePage.folder || 'Unsorted'}</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-muted-foreground/60">{activePage.title || 'Untitled'}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-3xl shrink-0 group-hover:bg-primary/5 transition-colors cursor-pointer">
                      {activePage.icon || '📄'}
                    </div>
                    <input 
                      className="flex-1 bg-transparent border-none focus:outline-none text-4xl font-display font-bold placeholder:text-muted-foreground/20"
                      placeholder="Untitled"
                      value={activePage.title}
                      onChange={(e) => updatePage(activePage.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 ml-16">
                    {activePage.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{tag}</span>
                    ))}
                    <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors">+ Add tag</button>
                  </div>
                </div>

                {/* Content Section */}
                <div 
                  className="w-full min-h-[calc(100vh-25rem)] cursor-text pt-8 pb-20"
                  onClick={() => quillRef.current?.getEditor().focus()}
                >
                  <ReactQuill 
                    ref={quillRef}
                    theme="snow"
                    value={activePage.content || ""}
                    onChange={(content) => updatePage(activePage.id, { content })}
                    modules={{ toolbar: false }}
                    formats={editorFormats}
                    placeholder="Start typing your note here..."
                    className="quill-editor"
                  />
                  
                  {/* Backlinks Section */}
                  <div className="pt-12 border-t border-border mt-12 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">2 Backlinks</h4>
                    <div className="grid grid-cols-2 gap-4 pb-20">
                      {[
                        { title: 'Project Overview', date: 'Mar 20', icon: '📁' },
                        { title: 'Design Review', date: 'Mar 22', icon: '🎨' },
                      ].map((link, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">{link.icon}</span>
                            <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">{link.title}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Linked from "Project Roadmap"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">Select a page or create one</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">Use notes to capture ideas, collaborate with your team, and build your knowledge base.</p>
            <Button className="rounded-xl px-8 gap-2" onClick={() => createPage()}>
              <Plus className="w-4 h-4" /> Create New Page
            </Button>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageUpload}
      />

      {/* Table Configuration Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-[300px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
            <DialogDescription>
              Specify the dimensions for your table.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <Input 
                  id="rows" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={tableConfig.rows} 
                  onChange={(e) => setTableConfig(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols">Columns</Label>
                <Input 
                  id="cols" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={tableConfig.cols} 
                  onChange={(e) => setTableConfig(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsTableDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={insertTable}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your workspace with a new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input id="folder-name" placeholder="e.g. Marketing Assets" className="rounded-xl" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) {
                    setFolders(prev => [...prev, val]);
                    setIsNewFolderOpen(false);
                    toast({ title: "Folder Created", description: `"${val}" has been added to your workspace.` });
                  }
                }
              }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              const input = document.getElementById('folder-name') as HTMLInputElement;
              if (input.value) {
                setFolders(prev => [...prev, input.value]);
                setIsNewFolderOpen(false);
                toast({ title: "Folder Created", description: `"${input.value}" has been added to your workspace.` });
              }
            }}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trash Modal */}
      <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Trash Archive
            </DialogTitle>
            <DialogDescription>
              Items in trash can be restored or permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto space-y-2">
            {archivedPages.length > 0 ? archivedPages.map(page => (
              <div key={page.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{page.icon || '📄'}</span>
                  <div>
                    <p className="text-sm font-bold">{page.title || 'Untitled'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Deleted on {format(new Date(page.updatedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary" onClick={() => restorePage(page.id)}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deletePage(page.id, true)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trash className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Trash is empty</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl w-full" onClick={() => setIsTrashOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden top-[20%]">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
            <input 
              className="flex-1 bg-transparent border-none focus:outline-none text-lg" 
              placeholder="Search all notes, blocks, and tags..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ESC
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            <div className="px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Results</span>
            </div>
            {pages.filter(p => !p.isArchived && (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))).map(page => (
              <button
                key={page.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary text-left group transition-colors"
                onClick={() => {
                  setActivePageId(page.id);
                  setIsSearchOpen(false);
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-xl shrink-0">
                  {page.icon || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{page.title || 'Untitled'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{page.content.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-border bg-secondary/10 flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3" /> Select</span>
              <span className="flex items-center gap-1.5"><Filter className="w-3 h-3" /> Filter by tag</span>
            </div>
            <span>{pages.length} Pages indexed</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
