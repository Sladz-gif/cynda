import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Plus, Mail, MessageSquare, Send, Paperclip, Smile, Mic, 
  Archive, Trash2, Star, Clock, Users, Hash, Bell, Forward, Reply, 
  Download, Image as ImageIcon, Video, Phone, FileText,
  X, CheckCircle2, MoreVertical, Flag, Info, UserPlus,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---

type MessagingMode = 'email' | 'chat';

interface EmailMessage {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  category: 'Primary' | 'Social' | 'Promotions';
  attachments?: string[];
  labels: string[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'media' | 'voice';
  mediaUrl?: string;
}

interface ChatSession {
  id: string;
  name: string;
  avatar: string;
  type: 'direct' | 'group' | 'channel';
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online?: boolean;
  messages: ChatMessage[];
}

// --- Mock Data ---

const MOCK_EMAILS: EmailMessage[] = [
  {
    id: "e1",
    sender: "Sarah Chen",
    senderEmail: "sarah@cynda.ai",
    subject: "Q2 Product Strategy Update",
    body: "Hi team, I've updated the roadmap for Q2. Please review the attached document and let me know your thoughts by Friday.",
    time: "10:24 AM",
    read: false,
    starred: true,
    category: "Primary",
    attachments: ["Q2_Roadmap.pdf"],
    labels: ["Strategy", "Priority"]
  },
  {
    id: "e2",
    sender: "Alex Rivera",
    senderEmail: "alex@cynda.ai",
    subject: "Design Review: Mobile App",
    body: "Hey, the new mobile mockups are ready. Can we hop on a quick call to go over the feedback from the last session?",
    time: "Yesterday",
    read: true,
    starred: false,
    category: "Primary",
    attachments: [],
    labels: ["Design"]
  },
  {
    id: "e3",
    sender: "Marketing Weekly",
    senderEmail: "news@marketing.com",
    subject: "Your Weekly Growth Report",
    body: "Check out how your campaigns performed this week. Engagement is up by 15% across all channels!",
    time: "Mar 22",
    read: true,
    starred: false,
    category: "Promotions",
    attachments: [],
    labels: []
  }
];

const MOCK_CHATS: ChatSession[] = [
  {
    id: "c1",
    name: "Marcus Johnson",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    type: "direct",
    lastMessage: "The API endpoint is live now.",
    lastTime: "11:05 AM",
    unreadCount: 2,
    online: true,
    messages: [
      { id: "m1", senderId: "me", text: "Hey Marcus, any update on the backend?", time: "10:55 AM", status: "read", type: "text" },
      { id: "m2", senderId: "marcus", text: "Just finished the last deployment.", time: "11:02 AM", status: "read", type: "text" },
      { id: "m3", senderId: "marcus", text: "The API endpoint is live now.", time: "11:05 AM", status: "read", type: "text" },
    ]
  },
  {
    id: "c2",
    name: "Product Design",
    avatar: "https://i.pravatar.cc/150?u=design",
    type: "group",
    lastMessage: "Alex: Love the new icon set!",
    lastTime: "09:45 AM",
    unreadCount: 0,
    messages: []
  },
  {
    id: "c3",
    name: "General",
    avatar: "",
    type: "channel",
    lastMessage: "Sarah: Reminder about the all-hands.",
    lastTime: "Yesterday",
    unreadCount: 0,
    messages: []
  }
];

const ChatPage = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<MessagingMode>('chat');
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowSidebar] = useState(true);
  
  // Email States
  const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailCategory, setEmailCategory] = useState<'Primary' | 'Social' | 'Promotions'>('Primary');
  
  // Chat States
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(MOCK_CHATS[0]);
  const [chatMessage, setChatMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync mobile sidebar when selection changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (selectedChat || selectedEmail) {
        setShowSidebar(false);
      }
    }
  }, [selectedChat, selectedEmail]);
  

  // --- Handlers ---

  const handleSendEmail = () => {
    toast({ title: "Email Sent", description: "Your message is on its way." });
    setIsComposeOpen(false);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return;
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: "me",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text'
    };

    setChats(prev => prev.map(c => 
      c.id === selectedChat.id 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: chatMessage, lastTime: newMessage.time } 
        : c
    ));
    setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
    setChatMessage("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      toast({ title: "File selected", description: e.target.files[0].name });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      toast({ title: "Image selected", description: e.target.files[0].name });
    }
  };

  // --- UI Components ---

  const renderEmailList = () => (
    <div className="flex flex-col h-full bg-[#F8F8F5]">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-[#222220] tracking-tight">INBOX</h3>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-[#EBEBE6] text-[#555550]" onClick={() => setEmails([...emails])}>
            <Clock className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1.5 border-b border-border/50 pb-3 overflow-x-auto scrollbar-hide">
          {['Primary', 'Social', 'Promotions'].map(cat => (
            <Button 
              key={cat}
              size="sm" 
              variant={emailCategory === cat ? 'default' : 'ghost'} 
              className={`text-[9px] font-black uppercase tracking-widest rounded-lg h-8 px-3 transition-all ${
                emailCategory === cat ? "bg-[#FF6600] text-white shadow-md" : "text-[#888880] hover:bg-black/5"
              }`}
              onClick={() => setEmailCategory(cat as any)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/30">
          {emails.filter(e => e.category === emailCategory).map(email => (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmail(email)}
              className={`p-4 cursor-pointer hover:bg-white/50 transition-all group relative ${!email.read ? 'bg-[#FF6600]/5' : ''} ${selectedEmail?.id === email.id ? 'bg-white shadow-sm z-10' : ''}`}
            >
              {selectedEmail?.id === email.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6600]" />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] uppercase tracking-widest ${!email.read ? 'font-black text-[#FF6600]' : 'font-bold text-[#888880]'}`}>{email.sender}</span>
                <span className="text-[9px] text-[#888880] font-black uppercase tracking-widest opacity-60">{email.time}</span>
              </div>
              <h4 className={`text-xs truncate leading-tight ${!email.read ? 'font-black text-[#222220]' : 'font-bold text-[#555550]'}`}>{email.subject}</h4>
              <p className="text-[11px] text-[#888880] line-clamp-1 mt-1 font-medium">{email.body}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                {email.labels.map(label => (
                  <Badge key={label} variant="outline" className="text-[7px] font-black uppercase tracking-tighter h-4 px-1.5 bg-[#EBEBE6] border-none text-[#555550]">{label}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChatList = () => (
    <div className="flex flex-col h-full bg-[#F8F8F5]">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-[#222220] tracking-tight uppercase">Chats</h3>
          <div className="flex gap-1.5">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-[#EBEBE6] text-[#555550]" onClick={() => toast({ title: "New Group created" })}>
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-[#EBEBE6] text-[#555550]" onClick={() => toast({ title: "New Channel created" })}>
              <Hash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888880]" />
          <Input 
            placeholder="Search messages..." 
            className="pl-9 h-10 rounded-xl bg-[#EBEBE6] border-none text-xs font-bold text-[#222220] placeholder:text-[#888880] placeholder:italic shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/30">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer hover:bg-white/50 transition-all flex items-center gap-4 group relative ${selectedChat?.id === chat.id ? 'bg-white shadow-sm z-10' : ''}`}
            >
              {selectedChat?.id === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6600]" />
              )}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 rounded-[16px] border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                  <AvatarImage src={chat.avatar} className="object-cover" />
                  <AvatarFallback className="rounded-[16px] bg-[#FF6600]/10 text-[#FF6600] font-black text-base">
                    {chat.type === 'channel' ? <Hash className="w-5 h-5" /> : chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#F8F8F5] bg-green-500 shadow-sm" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-black text-[#222220] truncate tracking-tight uppercase">{chat.name}</span>
                  <span className="text-[9px] text-[#888880] font-black uppercase tracking-widest opacity-60">{chat.lastTime}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#888880] truncate flex-1 font-bold leading-none">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 rounded-full px-1 text-[9px] font-black bg-[#FF6600] text-white flex items-center justify-center shadow-md border border-white">{chat.unreadCount}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-4 md:-m-6 overflow-hidden bg-[#F8F8F5]">
      {/* Horizontal Toolbar */}
      <div className="h-auto md:h-16 border-b border-border/50 bg-[#F8F8F5] px-4 py-2 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="bg-[#EBEBE6] p-1 rounded-xl flex gap-1 shrink-0">
            <Button 
              size="sm" 
              variant={mode === 'chat' ? 'default' : 'ghost'} 
              className={`h-8 md:h-9 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-1.5 md:gap-2 px-2 md:px-4 transition-all ${
                mode === 'chat' ? "bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-md" : "text-[#555550] hover:bg-black/5"
              }`}
              onClick={() => { setMode('chat'); setShowSidebar(true); }}
            >
              <MessageSquare className="w-3 md:w-3.5 h-3 md:h-3.5" /> CHAT
            </Button>
            <Button 
              size="sm" 
              variant={mode === 'email' ? 'default' : 'ghost'} 
              className={`h-8 md:h-9 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-1.5 md:gap-2 px-2 md:px-4 transition-all ${
                mode === 'email' ? "bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-md" : "text-[#555550] hover:bg-black/5"
              }`}
              onClick={() => { setMode('email'); setShowSidebar(true); }}
            >
              <Mail className="w-3 md:w-3.5 h-3 md:h-3.5" /> EMAIL
            </Button>
          </div>
          <div className="hidden md:block h-6 w-px bg-border/50" />
          <Button 
            size="sm" 
            className="rounded-xl h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-1.5 md:gap-2 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-md shrink-0"
            onClick={() => mode === 'email' ? setIsComposeOpen(true) : toast({ title: "New chat started" })}
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4 stroke-[3px]" /> {mode === 'email' ? 'NEW EMAIL' : 'NEW CHAT'}
          </Button>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 text-[#888880]" />
            <Input 
              placeholder={mode === 'email' ? "Search..." : "Contacts..."} 
              className="pl-8 md:pl-9 h-8 md:h-9 w-full md:w-48 lg:w-64 rounded-xl bg-[#EBEBE6] border-none text-[10px] md:text-xs placeholder:text-[#888880]"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-[#EBEBE6] text-[#555550]">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Column */}
        <AnimatePresence mode="wait">
          {showMobileSidebar && (
            <motion.div 
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute md:relative z-20 w-full md:w-[280px] lg:w-[320px] h-full flex-shrink-0 border-r border-border/50 flex-col bg-[#F8F8F5]"
            >
              {mode === 'email' ? renderEmailList() : renderChatList()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Column */}
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          {mode === 'email' ? (
            <div className="h-full flex flex-col">
              {!selectedEmail ? (
                <div className="hidden md:flex flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8F8F5]">
                  <div className="w-16 h-16 rounded-[24px] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] mb-6 shadow-glow">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-[#222220] uppercase tracking-tighter">SELECT AN EMAIL</h3>
                  <p className="text-[#888880] text-[10px] max-w-xs mt-2 font-black uppercase tracking-widest opacity-60">Pick a conversation to view the thread.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  <div className="p-3 md:p-4 border-b border-border/50 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                      <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl bg-secondary/50" onClick={() => setShowSidebar(true)}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Avatar className="h-9 w-9 md:h-10 md:w-10 rounded-xl border-2 border-[#EBEBE6] shadow-sm shrink-0">
                        <AvatarFallback className="bg-[#FF6600]/10 text-[#FF6600] font-black text-sm md:text-lg">{selectedEmail.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm md:text-base text-[#222220] tracking-tight truncate">{selectedEmail.subject}</h3>
                        <p className="text-[9px] md:text-[10px] font-bold text-[#888880] mt-0.5 uppercase tracking-widest truncate">{selectedEmail.sender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-[#F8F8F5]" onClick={() => toast({ title: "Email starred" })}>
                        <Star className={`w-3.5 md:w-4 h-3.5 md:h-4 ${selectedEmail.starred ? 'fill-[#FF6600] text-[#FF6600]' : 'text-[#555550]'}`} />
                      </Button>
                      <Button size="icon" variant="ghost" className="hidden sm:flex h-8 w-8 md:h-9 md:w-9 rounded-xl bg-[#F8F8F5]" onClick={() => toast({ title: "Email archived" })}>
                        <Archive className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#555550]" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-red-50 text-red-500" onClick={() => toast({ title: "Email deleted" })}>
                        <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-[#F8F8F5]">
                            <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#555550]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-40 p-1">
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer"><Reply className="w-3.5 h-3.5" /> Reply</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer"><Forward className="w-3.5 h-3.5" /> Forward</DropdownMenuItem>
                          <DropdownMenuItem className="md:hidden gap-2 text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer"><Archive className="w-3.5 h-3.5" /> Archive</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer text-red-500"><Flag className="w-3.5 h-3.5" /> Spam</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 bg-[#F8F8F5]">
                    <div className="p-3 md:p-4">
                      <div className="max-w-3xl mx-auto bg-white rounded-[20px] md:rounded-[24px] border border-border/50 shadow-lg overflow-hidden">
                        <div className="p-4 md:p-6">
                          <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 border-b border-border/50">
                            <span className="text-[9px] md:text-[10px] font-black text-[#888880] uppercase tracking-widest">{selectedEmail.time}</span>
                            <div className="flex gap-1.5">
                              {selectedEmail.labels.map(l => (
                                <Badge key={l} variant="secondary" className="text-[7px] md:text-[9px] font-black uppercase px-1.5 md:px-2 py-0.5 rounded-md bg-[#EBEBE6] text-[#555550]">{l}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs md:text-sm text-[#222220] leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                            {selectedEmail.body}
                          </div>
                          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/50">
                              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#888880] mb-3 md:mb-4">Attachments ({selectedEmail.attachments.length})</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                                {selectedEmail.attachments.map(att => (
                                  <div key={att} className="p-2 md:p-3 rounded-xl border border-border/50 bg-[#F8F8F5] flex items-center justify-between group cursor-pointer hover:border-[#FF6600]/30 transition-all">
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                      <div className="p-1.5 md:p-2 rounded-lg bg-white border border-border/50 shadow-sm shrink-0">
                                        <FileText className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#FF6600]" />
                                      </div>
                                      <span className="text-[10px] md:text-xs font-bold text-[#222220] truncate">{att}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-[#FF6600] hover:text-white shrink-0">
                                      <Download className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="bg-[#F8F8F5] p-4 md:p-6 flex gap-2 md:gap-3">
                          <Button className="flex-1 rounded-xl gap-1.5 md:gap-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest h-10 md:h-11 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-md"><Reply className="w-3.5 md:w-4 h-3.5 md:h-4" /> Reply</Button>
                          <Button variant="outline" className="flex-1 rounded-xl gap-1.5 md:gap-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest h-10 md:h-11 border-[#EBEBE6] bg-white text-[#555550] shadow-sm"><Forward className="w-3.5 md:w-4 h-3.5 md:h-4" /> Forward</Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col overflow-hidden bg-white">
              {!selectedChat ? (
                <div className="hidden md:flex flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8F8F5]">
                  <div className="w-16 h-16 rounded-[24px] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] mb-6 shadow-glow">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-[#222220] uppercase tracking-tighter">SELECT A CHAT</h3>
                  <p className="text-[#888880] text-[10px] max-w-xs mt-2 font-black uppercase tracking-widest opacity-60">Connect in real-time with colleagues.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  <div className="p-3 md:p-4 border-b border-border/50 bg-[#F8F8F5] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl bg-white shadow-sm" onClick={() => setShowSidebar(true)}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9 md:h-10 md:w-10 rounded-xl border-2 border-white shadow-sm">
                          <AvatarImage src={selectedChat.avatar} />
                          <AvatarFallback className="rounded-xl bg-[#FF6600]/10 text-[#FF6600] font-black text-sm md:text-lg">
                            {selectedChat.type === 'channel' ? <Hash className="w-4 md:w-5 h-4 md:h-5" /> : selectedChat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedChat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-[2.5px] md:border-[3px] border-[#F8F8F5] bg-green-500 shadow-sm" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm md:text-base text-[#222220] tracking-tight leading-none mb-1 truncate">{selectedChat.name}</h3>
                        <div className="flex items-center gap-1.5">
                          {selectedChat.online ? (
                            <span className="text-[7px] md:text-[8px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ONLINE
                            </span>
                          ) : (
                            <span className="text-[7px] md:text-[8px] text-[#888880] font-black uppercase tracking-widest italic opacity-60">ACTIVE {selectedChat.lastTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-white text-[#555550] shadow-sm"><Video className="w-3.5 md:w-4 h-3.5 md:h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-white text-[#555550] shadow-sm"><Phone className="w-3.5 md:w-4 h-3.5 md:h-4" /></Button>
                      <div className="hidden sm:block h-6 w-px bg-border/50 mx-1" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-white text-[#555550] shadow-sm" onClick={() => toast({ title: "User info opened" })}><Info className="w-3.5 md:w-4 h-3.5 md:h-4" /></Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 bg-white">
                    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
                      <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                        <div className="relative mb-4">
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 rounded-[20px] md:rounded-[24px] border-4 border-[#F8F8F5] shadow-xl">
                            <AvatarImage src={selectedChat.avatar} />
                            <AvatarFallback className="rounded-[20px] md:rounded-[24px] bg-[#FF6600]/10 text-[#FF6600] text-xl md:text-2xl font-black">
                              {selectedChat.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 rounded-[20px] md:rounded-[24px] border-2 border-[#FF6600]/20 pointer-events-none" />
                        </div>
                        <h4 className="text-lg md:text-xl font-black text-[#222220] tracking-tight">{selectedChat.name}</h4>
                        <p className="text-[#888880] text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-widest italic opacity-60">This is the beginning of your chat history.</p>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedChat.messages.map((msg, i) => (
                          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-[16px] md:rounded-[20px] text-xs md:text-sm font-bold shadow-sm transition-all ${
                                msg.senderId === 'me' 
                                  ? 'bg-[#FF6600] text-white rounded-tr-none' 
                                  : 'bg-[#F8F8F5] text-[#222220] border border-border/50 rounded-tl-none'
                              }`}>
                                {msg.text}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 px-1.5">
                                <span className="text-[7px] md:text-[8px] text-[#888880] font-black uppercase tracking-widest">{msg.time}</span>
                                {msg.senderId === 'me' && (
                                  <div className="flex -space-x-1">
                                    <CheckCircle2 className={`w-2.5 md:w-3 h-2.5 md:h-3 ${msg.status === 'read' ? 'text-[#FF6600]' : 'text-[#888880]'}`} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="p-3 md:p-4 border-t border-border/50 bg-[#F8F8F5] shrink-0">
                    <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3">
                      <div className="flex gap-1 md:gap-1.5 mb-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <input type="file" ref={imageInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
                        <Button size="icon" variant="ghost" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white text-[#555550] shadow-sm" onClick={() => fileInputRef.current?.click()}>
                          <Paperclip className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white text-[#555550] shadow-sm" onClick={() => imageInputRef.current?.click()}>
                          <ImageIcon className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 relative">
                        <Textarea 
                          placeholder={`Message...`}
                          className="min-h-[38px] md:min-h-[44px] max-h-32 rounded-[18px] md:rounded-[20px] bg-white border-2 border-transparent focus-visible:border-[#FF6600]/30 shadow-sm resize-none py-2 md:py-2.5 px-3 md:px-4 pr-9 md:pr-11 text-xs md:text-sm font-bold text-[#222220] placeholder:text-[#888880] placeholder:italic"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button size="icon" variant="ghost" className="absolute right-1.5 md:right-2 bottom-1 md:bottom-1.5 h-7 w-7 md:h-8 md:w-8 rounded-lg text-[#888880] hover:text-[#FF6600]">
                          <Smile className="w-4 md:w-5 h-4 md:h-5" />
                        </Button>
                      </div>
                      <Button 
                        size="icon" 
                        className="h-9 w-9 md:h-11 md:w-11 rounded-[18px] md:rounded-[20px] shrink-0 transition-all shadow-md bg-[#FF6600] text-white disabled:bg-[#EBEBE6] disabled:text-[#888880] disabled:scale-95"
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                      >
                        <Send className="w-4 md:w-5 h-4 md:h-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b border-border/50 bg-[#F8F8F5]">
            <DialogTitle className="font-black text-xl text-[#222220] uppercase tracking-tight">COMPOSE NEW EMAIL</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mt-0.5">Send a formal message with a subject and title.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4 bg-white">
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#888880] w-14 text-right">To:</span>
              <Input placeholder="Recipient username or email" className="border-none h-8 p-0 focus-visible:ring-0 text-xs font-bold text-[#222220] placeholder:text-[#888880]/50" />
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase px-2 rounded-md bg-[#EBEBE6] text-[#555550]">CC</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase px-2 rounded-md bg-[#EBEBE6] text-[#555550]">BCC</Button>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#888880] w-14 text-right">Subject:</span>
              <Input placeholder="Add a subject line" className="border-none h-8 p-0 focus-visible:ring-0 text-sm font-black text-[#222220] placeholder:text-[#888880]/50" />
            </div>
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#888880] w-14 text-right">Title:</span>
              <Input placeholder="Formal message title (optional)" className="border-none h-8 p-0 focus-visible:ring-0 text-xs font-bold italic text-[#555550] placeholder:text-[#888880]/50" />
            </div>
            <Textarea 
              placeholder="Write your message here..." 
              className="min-h-[250px] border-none resize-none p-0 focus-visible:ring-0 text-sm font-medium leading-relaxed text-[#222220] placeholder:text-[#888880]/30"
            />
          </div>
          <DialogFooter className="p-6 bg-[#F8F8F5] border-t border-border/50 flex items-center justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white text-[#555550] shadow-sm hover:text-[#FF6600]"><Paperclip className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white text-[#555550] shadow-sm hover:text-[#FF6600]"><ImageIcon className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white text-red-500 shadow-sm hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] border-[#EBEBE6] bg-white text-[#555550]" onClick={() => setIsComposeOpen(false)}>Save Draft</Button>
              <Button className="rounded-xl h-10 px-8 font-black uppercase tracking-widest text-[9px] gap-2 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-md" onClick={handleSendEmail}>
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
