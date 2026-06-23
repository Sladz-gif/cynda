import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  File, FileText, ImageIcon, FileSpreadsheet, FileArchive, 
  MoreHorizontal, Download, Trash2, Share2, Search, Filter, 
  Plus, Upload, Folder, HardDrive, Clock, Star, Shield, ShieldCheck,
  ChevronRight, ArrowRight, Bot, Info, Eye, ExternalLink, Users, AlertCircle, Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// --- Types ---

interface CyndaFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  dateUploaded: string;
  module: string;
  isFavorite: boolean;
  access: { userId: string; name: string; role: 'Owner' | 'Editor' | 'Viewer' }[];
}

const MOCK_FILES: CyndaFile[] = [];

const FilesPage = () => {
  const { toast } = useToast();
  const { currentUser, adminProfile, staffList } = useIndustryStore();
  const [files, setFiles] = useState<CyndaFile[]>(MOCK_FILES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<CyndaFile | null>(null);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState("");

  const activeUser = currentUser || adminProfile;
  const isDeptHead = activeUser?.role === 'Super Admin' || activeUser?.role?.includes('Director') || activeUser?.role?.includes('Manager');

  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'favorites' | 'shared'>('all');

  const visibleFiles = useMemo(() => {
    // Dept heads see everything
    if (isDeptHead) return files;
    
    // Staff see only what they have access to
    return files.filter(f => 
      f.access.some(a => a.userId === activeUser?.id || a.userId === 'admin')
    );
  }, [files, isDeptHead, activeUser]);

  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteFile = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      setFiles(files.filter(f => f.id !== itemToDelete));
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
      toast({ title: "File deleted", description: "The file has been permanently removed." });
    }
  };

  const filteredFiles = useMemo(() => {
    return visibleFiles.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           f.module.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeFilter === 'favorites') return f.isFavorite;
      if (activeFilter === 'shared') {
        // Shared with me = I have access but I'm not the owner (unless I'm dept head seeing everything)
        return f.access.some(a => a.userId === activeUser?.id && a.role !== 'Owner');
      }
      
      return true;
    });
  }, [visibleFiles, searchQuery, activeFilter, activeUser]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { subscriptionTier } = useIndustryStore.getState();
    if (subscriptionTier === 'trial') {
      toast({ 
        title: "Action Restricted", 
        description: "File uploads are disabled during the 3-day trial. Upgrade to a full plan to enable storage.",
        variant: "destructive"
      });
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            const newFile: CyndaFile = {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.name.split('.').pop() || 'file',
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedBy: activeUser?.name || "Unknown",
              dateUploaded: new Date().toISOString().split('T')[0],
              module: "Files",
              isFavorite: false,
              access: [{ userId: 'current', name: activeUser?.name || "User", role: 'Owner' }]
            };
            setFiles([newFile, ...files]);
            toast({ title: "File Uploaded", description: `"${file.name}" is now in your database.` });
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'zip': case 'rar': return <FileArchive className="text-primary" />;
      case 'csv': case 'xlsx': return <FileSpreadsheet className="text-green-500" />;
      case 'png': case 'jpg': case 'jpeg': return <ImageIcon className="text-blue-500" />;
      default: return <File className="text-muted-foreground" />;
    }
  };

  const handleRevokeAccess = (fileId: string, userId: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return { ...f, access: f.access.filter(a => a.userId !== userId) };
      }
      return f;
    }));
    toast({ title: "Access Revoked" });
  };

  const handleGrantAccess = (fileId: string, staff: any) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        if (f.access.find(a => a.userId === staff.id)) return f;
        return { ...f, access: [...f.access, { userId: staff.id, name: staff.name, role: 'Viewer' }] };
      }
      return f;
    }));
    setShareSearchQuery("");
    toast({ title: "Access Granted", description: `${staff.name} can now view this file.` });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground uppercase">File Drive</h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-[0.2em] opacity-60">
              Your centralized workspace for cloud storage and team collaboration.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button className="w-full md:w-auto rounded-xl shadow-glow h-12 px-6 uppercase font-black tracking-widest text-[10px]">
                <Upload className="w-4 h-4 mr-2" /> Upload File
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-[2rem] border-2 border-border bg-card shadow-sm relative overflow-hidden group min-h-[140px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <HardDrive className="w-16 h-16 text-primary" />
            </div>
            <div className="flex flex-col justify-center h-full">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground opacity-60 mb-2">Total Storage</p>
              <p className="text-4xl font-black tracking-tighter">0 GB</p>
            </div>
          </div>

          {[
            { label: "Recent Files", value: files.length, icon: Clock, color: "text-blue-500" },
            { label: "Starred Items", value: files.filter(f => f.isFavorite).length, icon: Star, color: "text-primary" },
            { label: "Shared with Me", value: files.filter(f => f.access.length > 1).length, icon: Users, color: "text-green-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-[2rem] border-2 border-border bg-card shadow-sm min-h-[140px]">
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground opacity-60">{stat.label}</p>
              <p className="text-2xl font-black tracking-tighter mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Drive Sidebar */}
        <div className="space-y-6">
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 no-scrollbar lg:overflow-visible lg:pb-0">
            {[
              { id: 'all', label: 'All Files', icon: HardDrive },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'favorites', label: 'Starred', icon: Star },
              { id: 'shared', label: 'Shared', icon: Users },
              { id: 'trash', label: 'Trash', icon: Trash2 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id as any)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeFilter === item.id ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:block pt-6 border-t-2 border-border">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground opacity-40 px-4 mb-4">Quick Folders</h3>
            <div className="space-y-1">
              {[''].filter(f => f).map((folder) => (
                <button key={folder} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all group">
                  <div className="flex items-center gap-3">
                    <Folder className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {folder}
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search your drive..." 
                className="pl-12 h-14 rounded-2xl border-2 bg-card font-bold text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 shrink-0 hidden sm:flex">
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          <div className="rounded-[2rem] border-2 border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b-2 border-border bg-secondary/20">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploaded By</th>
                    <th className="hidden sm:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Size</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {filteredFiles.map((file) => (
                    <motion.tr 
                      layout
                      key={file.id} 
                      className="group hover:bg-secondary/10 transition-colors"
                    >
                      <td className="px-6 py-5 min-w-[200px]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight text-foreground truncate">{file.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{file.dateUploaded}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-border shrink-0">
                            <AvatarFallback className="text-[8px] font-black bg-primary/10 text-primary">
                              {file.uploadedBy.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-muted-foreground">{file.uploadedBy}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-5">
                        <span className="text-xs font-black text-muted-foreground">{file.size}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => { setSelectedFile(file); setIsAccessDialogOpen(true); }}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-2 shadow-xl">
                              <DropdownMenuItem className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
                                <Eye className="w-3.5 h-3.5" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2" onClick={() => {
                                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isFavorite: !f.isFavorite } : f));
                                toast({ title: file.isFavorite ? "Removed from Favorites" : "Added to Favorites" });
                              }}>
                                <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-primary text-primary' : ''}`} /> {file.isFavorite ? 'Unstar' : 'Star Item'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="h-0.5" />
                              <DropdownMenuItem 
                                className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteFile(file.id);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Access Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Permission Control</span>
            </div>
            <DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight">MANAGE ACCESS</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Control who can view or edit "{selectedFile?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8 bg-background">
            {/* Search/Grant Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Add people</h4>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-10 h-12 rounded-xl bg-muted/30 border-none text-xs font-bold"
                    value={shareSearchQuery}
                    onChange={(e) => setShareSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[9px] bg-primary text-white shadow-lg">Search</Button>
              </div>
              
              {/* Search Results */}
              <AnimatePresence>
                {shareSearchQuery.length > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-border rounded-2xl overflow-hidden"
                  >
                    <ScrollArea className="h-[150px]">
                      <div className="divide-y divide-border">
                        {staffList.filter(s => s.name.toLowerCase().includes(shareSearchQuery.toLowerCase())).map((staff) => (
                          <button 
                            key={staff.id} 
                            className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                            onClick={() => handleGrantAccess(selectedFile?.id!, staff)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="bg-secondary text-[10px] font-black">{staff.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight">{staff.name}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{staff.role}</p>
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Current Access List */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Who has access</h4>
              <div className="space-y-3">
                {selectedFile?.access.map((acc) => (
                  <div key={acc.userId} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">{acc.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-foreground">{acc.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{acc.userId === 'admin' ? 'Global Access' : 'Individual Access'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={acc.role}>
                        <SelectTrigger className="h-7 border-none bg-transparent text-[9px] font-black uppercase tracking-widest focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="Owner" className="text-[9px] font-black uppercase" disabled>Owner</SelectItem>
                          <SelectItem value="Editor" className="text-[9px] font-black uppercase">Editor</SelectItem>
                          <SelectItem value="Viewer" className="text-[9px] font-black uppercase">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      {acc.role !== 'Owner' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRevokeAccess(selectedFile?.id!, acc.userId)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 border-t border-border bg-muted/30">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                Changes to file permissions take effect immediately. Department heads retain master access to all documents.
              </p>
            </div>
            <Button variant="outline" className="rounded-xl h-10 px-8 font-black uppercase tracking-widest text-[9px] border-border bg-card text-muted-foreground" onClick={() => setIsAccessDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 1 */}
      <Dialog open={isDeleteModal1Open} onOpenChange={setIsDeleteModal1Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Delete File?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to permanently delete this file?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="destructive"
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={confirmDeleteStep1}
            >
              Yes, I'm sure
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={() => setIsDeleteModal1Open(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 2 */}
      <Dialog open={isDeleteModal2Open} onOpenChange={setIsDeleteModal2Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card border-destructive">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive flex items-center justify-center text-white mb-4 animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">Final Confirmation</DialogTitle>
            <DialogDescription className="text-sm font-bold text-destructive/80 uppercase tracking-widest">
              This action is irreversible. Are you absolutely certain?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="destructive"
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-destructive/20"
              onClick={finalizeDelete}
            >
              Permanently Delete
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={() => setIsDeleteModal2Open(false)}
            >
              I changed my mind
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesPage;
