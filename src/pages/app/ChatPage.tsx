import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Search, Plus, MessageSquare, Send, Paperclip, Smile, Mic, 
  Archive, Trash2, Star, Clock, Users, Hash, Bell, Forward, Reply, 
  Download, ImageIcon, Video, Phone, FileText,
  X, CheckCircle2, MoreVertical, Flag, Info, UserPlus, AlertCircle,
  ArrowLeft, ArrowRight, Globe, Check, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIndustryStore, Staff, CRMContact } from "@/lib/industry-store";
import { useLocation } from "react-router-dom";
// Email UI removed from Chat  keep chat-only experience.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- Types ---

type MessagingMode = 'chat';

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

const MOCK_CHATS: ChatSession[] = [];

const ChatPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { 
    staffList = [], 
    externalContacts = [], 
    crmContacts = [], 
    addExternalContact,
    currentUser,
    adminProfile
  } = useIndustryStore();
  
  const activeUser = currentUser || adminProfile;
  const [mode] = useState<MessagingMode>('chat');
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowSidebar] = useState(true);
  
  // Chat States
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  // Handle query params for starting new chats
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contactId');
    if (contactId) {
      const contact = crmContacts.find(c => c.id === contactId);
      if (contact) {
        startChatWithContact({ ...contact, type: 'external' } as any);
      }
    }
  }, [location.search, crmContacts]);

  const [chatMessage, setChatMessage] = useState("");
  const [isSearchUserOpen, setIsSearchUserOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync mobile sidebar when selection changes
  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowSidebar(false);
    }
  }, [selectedChat, isMobile]);

  // Reset sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const startChatWithContact = (contact: Staff | { id: string; name: string; email: string; type: 'external' }) => {
    const existing = chats.find(c => c.id === contact.id);
    if (existing) {
      setSelectedChat(existing);
    } else {
      const newChat: ChatSession = {
        id: contact.id,
        name: contact.name,
        avatar: contact.type === 'external' ? "" : `https://i.pravatar.cc/150?u=${contact.id}`,
        type: 'direct',
        lastMessage: "No messages yet",
        lastTime: "Just now",
        unreadCount: 0,
        online: contact.type !== 'external',
        messages: []
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
    }
    setIsSearchUserOpen(false);
    setUserSearchQuery("");
  };

  const handleExternalSearch = () => {
    // Strictly check for Cynda chat name format (username.cynda)
    const isChatName = userSearchQuery.toLowerCase().endsWith('.cynda');

    if (!isChatName) {
      toast({ 
        title: "Invalid Username", 
        description: "Please enter a valid Cynda username (e.g., name.cynda).", 
        variant: "destructive" 
      });
      return;
    }
    
    const newExternal: any = {
      id: Math.random().toString(36).substr(2, 9),
      name: userSearchQuery.split('.cynda')[0].replace(/\./g, ' '),
      email: "",
      chatName: userSearchQuery,
      type: 'external'
    };
    
    addExternalContact(newExternal);
    startChatWithContact(newExternal);
    toast({ title: "Contact Added", description: `Started chat with ${userSearchQuery}` });
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (s.chatName && s.chatName.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const filteredExternal = externalContacts.filter(c => 
    c.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (c as any).chatName?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Group Name Required", variant: "destructive" });
      return;
    }
    const newChat: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroupName,
      avatar: `https://i.pravatar.cc/150?u=${newGroupName}`,
      type: 'group',
      lastMessage: "Group created",
      lastTime: "Just now",
      unreadCount: 0,
      messages: []
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setIsNewGroupOpen(false);
    setNewGroupName("");
    setSelectedParticipants([]);
    toast({ title: "Group Created", description: `"${newGroupName}" is ready for messaging.` });
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) {
      toast({ title: "Channel Name Required", variant: "destructive" });
      return;
    }
    const newChat: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChannelName,
      avatar: "",
      type: 'channel',
      lastMessage: "Channel created",
      lastTime: "Just now",
      unreadCount: 0,
      messages: []
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setIsNewChannelOpen(false);
    setNewChannelName("");
    toast({ title: "Channel Created", description: `#${newChannelName} is now live.` });
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // --- Handlers ---

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
    const { subscriptionTier } = useIndustryStore.getState();
    if (subscriptionTier === 'trial') {
      toast({ 
        title: "Action Restricted", 
        description: "File sharing is disabled during the 3-day trial. Upgrade to a full plan to enable storage.",
        variant: "destructive"
      });
      return;
    }

    if (e.target.files) {
      toast({ title: "File selected", description: e.target.files[0].name });
    }
  };

  // --- UI Components ---

  const renderChatList = () => (
    <div className={cn("flex flex-col h-full", isMobile ? "bg-background" : "bg-muted/30")}>
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
        {/* User Profile Summary */}
        <div className="flex items-center gap-3 mb-6 p-2">
          <Avatar className="h-10 w-10 rounded-full border-2 border-primary/20 shadow-sm">
            <AvatarFallback className="bg-primary text-white font-black">
              {activeUser?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">
              {activeUser?.chatName || "username.cynda"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-foreground tracking-tight uppercase">Chats</h3>
          <div className="flex gap-1.5">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted text-muted-foreground" onClick={() => setIsNewGroupOpen(true)}>
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted text-muted-foreground" onClick={() => setIsNewChannelOpen(true)}>
              <Hash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-9 h-10 rounded-xl bg-muted border-none text-xs font-bold text-foreground placeholder:text-muted-foreground placeholder:italic shadow-inner"
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
              className={`p-4 cursor-pointer hover:bg-card/50 transition-all flex items-center gap-4 group relative ${selectedChat?.id === chat.id ? 'bg-card shadow-sm z-10' : ''}`}
            >
              {selectedChat?.id === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-black text-foreground truncate tracking-tight uppercase">{chat.name}</span>
                  <div className="flex items-center gap-2">
                    {chat.online && <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />}
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{chat.lastTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground truncate flex-1 font-bold leading-none">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 rounded-full px-1 text-[9px] font-black bg-primary text-white flex items-center justify-center shadow-md border border-white">{chat.unreadCount}</Badge>
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
    <div className="flex flex-col h-[calc(100vh-56px)] -m-4 md:-m-6 overflow-hidden bg-muted/30">
      {/* Horizontal Toolbar */}
      <div className="h-auto md:h-16 border-b border-border/50 bg-background/50 backdrop-blur-md px-4 py-2.5 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between shrink-0 gap-2.5 md:gap-3">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-0.5 md:pb-0">
          <div className="bg-muted p-1 rounded-xl flex gap-1 shrink-0">
            <Button 
              size="sm" 
              variant="default"
              className="h-8 md:h-9 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-1.5 md:gap-2 px-2.5 md:px-4 transition-all bg-primary hover:bg-primary/90 text-white shadow-md"
              onClick={() => setShowSidebar(true)}
            >
              <MessageSquare className="w-3 md:w-3.5 h-3 md:h-3.5" /> CHAT
            </Button>
          </div>
          <div className="hidden md:block h-6 w-px bg-border/50" />
          <Button 
            size="sm" 
            className="rounded-xl h-8 md:h-9 px-2.5 md:px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-1.5 md:gap-2 bg-primary hover:bg-primary/90 text-white shadow-md shrink-0"
            onClick={() => setIsSearchUserOpen(true)}
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4 stroke-[3px]" /> NEW
          </Button>
          <div className="relative flex-1 md:flex-none min-w-[100px] md:min-w-[120px]">
            <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Contacts..." 
              className="pl-7 md:pl-9 h-8 md:h-9 w-full md:w-48 lg:w-64 rounded-xl bg-muted border-none text-[10px] md:text-xs placeholder:text-muted-foreground shadow-inner"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-muted text-muted-foreground">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Column */}
        <AnimatePresence mode="wait">
          {showMobileSidebar && (
            <motion.div 
              initial={isMobile ? { x: -320 } : { x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={isMobile ? { x: -320 } : { x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "z-20 w-full md:w-[280px] lg:w-[320px] h-full flex-shrink-0 border-r border-border/50 flex-col shadow-xl md:shadow-none",
                isMobile ? "absolute inset-0 bg-background" : "relative bg-muted/30"
              )}
            >
              {renderChatList()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Column */}
        <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden bg-background">
              {!selectedChat ? (
                <div className="hidden md:flex flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                  <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-glow">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">SELECT A CHAT</h3>
                  <p className="text-muted-foreground text-[10px] max-w-xs mt-2 font-black uppercase tracking-widest opacity-60">Connect in real-time with colleagues.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  <div className="p-3 md:p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl bg-card shadow-sm" onClick={() => setShowSidebar(true)}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm md:text-base text-foreground tracking-tight leading-none mb-1 truncate uppercase">{selectedChat.name}</h3>
                        <div className="flex items-center gap-1.5">
                          {selectedChat.online ? (
                            <span className="text-[7px] md:text-[8px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ONLINE
                            </span>
                          ) : (
                            <span className="text-[7px] md:text-[8px] text-muted-foreground font-black uppercase tracking-widest italic opacity-60">ACTIVE {selectedChat.lastTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                    </div>
                  </div>

                  <ScrollArea className="flex-1 bg-background">
                    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
                      <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center border-b border-border/50 mb-8">
                        <h4 className="text-lg md:text-xl font-black text-foreground tracking-tight uppercase">{selectedChat.name}</h4>
                        <p className="text-muted-foreground text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-widest italic opacity-60">This is the beginning of your chat history.</p>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedChat.messages.map((msg, i) => {
                          const isMe = msg.senderId === 'me';
                          let senderName = isMe ? (activeUser?.chatName || "me.cynda") : selectedChat.name;
                          
                          // In group/channel, find the actual staff member's chatName
                          if (!isMe && (selectedChat.type === 'group' || selectedChat.type === 'channel')) {
                            const staff = staffList.find(s => s.id === msg.senderId);
                            if (staff) senderName = staff.chatName || staff.name;
                          }

                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1 px-1">
                                  {senderName}
                                </span>
                                <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-[16px] md:rounded-[20px] text-xs md:text-sm font-bold shadow-sm transition-all ${
                                  isMe 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-muted/30 text-foreground border border-border/50 rounded-tl-none'
                                }`}>
                                  {msg.text}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 px-1.5">
                                  <span className="text-[7px] md:text-[8px] text-muted-foreground font-black uppercase tracking-widest">{msg.time}</span>
                                  {isMe && (
                                    <div className="flex -space-x-1">
                                      <CheckCircle2 className={`w-2.5 md:w-3 h-2.5 md:h-3 ${msg.status === 'read' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="p-3 md:p-4 border-t border-border/50 bg-muted/30 shrink-0">
                    <div className="max-w-full mx-auto flex items-end gap-2 md:gap-3">
                      <div className="flex gap-1 md:gap-1.5 mb-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <Button size="icon" variant="ghost" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-card text-muted-foreground shadow-sm" onClick={() => fileInputRef.current?.click()}>
                          <Paperclip className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 relative">
                        <Textarea 
                          placeholder={`Message...`}
                          className="min-h-[38px] md:min-h-[44px] max-h-32 rounded-lg bg-card border-2 border-transparent focus-visible:border-primary/30 shadow-sm resize-none py-2 md:py-2.5 px-3 md:px-4 pr-9 md:pr-11 text-xs md:text-sm font-bold text-foreground placeholder:text-muted-foreground placeholder:italic"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button size="icon" variant="ghost" className="absolute right-1.5 md:right-2 bottom-1 md:bottom-1.5 h-7 w-7 md:h-8 md:w-8 rounded-lg text-muted-foreground hover:text-primary">
                          <Smile className="w-4 md:w-5 h-4 md:h-5" />
                        </Button>
                      </div>
                      <Button 
                        size="icon" 
                        className="h-9 w-9 md:h-11 md:w-11 rounded-lg shrink-0 transition-all shadow-md bg-primary text-white disabled:bg-muted disabled:text-muted-foreground disabled:scale-95"
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
        </div>
      </div>

      <Dialog open={isSearchUserOpen} onOpenChange={setIsSearchUserOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground uppercase tracking-tight">New Conversation</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Connect with team members or external contacts using their username.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Username (e.g. name.cynda)" 
                  className="pl-10 h-12 rounded-xl bg-muted border-none text-xs font-bold"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleExternalSearch}
                className="h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none font-black text-[10px] uppercase tracking-widest px-4"
              >
                <Globe className="w-4 h-4 mr-2" /> Invite
              </Button>
            </div>
            
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                {/* Staff Section */}
                {filteredStaff.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Team Members</h4>
                    <div className="space-y-1">
                      {filteredStaff.map((staff) => (
                        <button 
                          key={staff.id} 
                          className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-muted/30 transition-all group"
                          onClick={() => startChatWithContact(staff)}
                        >
                          <Avatar className="h-10 w-10 rounded-xl border-2 border-card shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-black">{staff.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase truncate">{staff.name}</p>
                              {staff.chatName && (
                                <span className="text-[9px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full">{staff.chatName}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{staff.role} • {staff.department}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Section */}
                {filteredExternal.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">External Contacts</h4>
                    <div className="space-y-1">
                      {filteredExternal.map((contact) => (
                        <button 
                          key={contact.id} 
                          className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-muted/30 transition-all group"
                          onClick={() => startChatWithContact(contact as any)}
                        >
                          <Avatar className="h-10 w-10 rounded-xl border-2 border-card shadow-sm">
                            <AvatarFallback className="bg-blue-500/10 text-blue-500 font-black">
                              <Globe className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase truncate">{contact.name}</p>
                              {(contact as any).chatName && (
                                <span className="text-[9px] text-blue-500 font-bold bg-blue-500/5 px-2 py-0.5 rounded-full">{(contact as any).chatName}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{(contact as any).chatName}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredStaff.length === 0 && filteredExternal.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No contacts found</p>
                    <p className="text-[9px] text-muted-foreground/60 font-medium mt-2">Enter a username (e.g. name.cynda) to connect.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Group Dialog */}
      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground uppercase tracking-tight">Create New Group</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Start a collaborative conversation with your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Group Name</Label>
              <Input 
                placeholder="e.g. Q3 Marketing Sync" 
                className="h-12 rounded-xl bg-muted border-none text-xs font-bold"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Members</Label>
              <ScrollArea className="h-[250px] pr-4 border border-border/30 rounded-xl p-2 bg-muted/20">
                <div className="space-y-1">
                  {staffList.map((staff) => (
                    <div 
                      key={staff.id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleParticipant(staff.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="text-[10px] font-black">{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold">{staff.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">{staff.role}</p>
                        </div>
                      </div>
                      <Checkbox checked={selectedParticipants.includes(staff.id)} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setIsNewGroupOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white" onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Channel Dialog */}
      <Dialog open={isNewChannelOpen} onOpenChange={setIsNewChannelOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground uppercase tracking-tight">Create New Channel</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Channels are for broad, department-wide communication.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Channel Name</Label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. general-announcements" 
                  className="h-12 pl-10 rounded-xl bg-muted border-none text-xs font-bold"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] text-primary font-bold uppercase tracking-widest leading-relaxed">Channels are public to all team members in the organization by default.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setIsNewChannelOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white" onClick={handleCreateChannel}>Create Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ChatPage;
