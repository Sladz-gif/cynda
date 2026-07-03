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
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useIndustryStore, Staff, CRMContact } from "@/lib/industry-store";
import { useLocation } from "react-router-dom";
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

type MessagingMode = 'chat';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'media' | 'voice';
  mediaUrl?: string;
  senderName?: string;
  senderChatName?: string;
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
  participants: string[];
}

const mockChats: ChatSession[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    type: 'direct',
    lastMessage: 'Hey, how are things going?',
    lastTime: '10:30 AM',
    unreadCount: 2,
    online: true,
    messages: [
      { id: 'm1', senderId: 'john', text: 'Hey there!', time: '10:00 AM', status: 'read', type: 'text', senderName: 'John Doe' },
      { id: 'm2', senderId: 'me', text: 'Hey John, good!', time: '10:15 AM', status: 'read', type: 'text', senderName: 'You' },
      { id: 'm3', senderId: 'john', text: 'Hey, how are things going?', time: '10:30 AM', status: 'delivered', type: 'text', senderName: 'John Doe' }
    ],
    participants: ['john', 'me']
  },
  {
    id: '2',
    name: 'Design Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100',
    type: 'group',
    lastMessage: 'New mockup uploaded',
    lastTime: '9:15 AM',
    unreadCount: 0,
    online: false,
    messages: [
      { id: 'm1', senderId: 'jane', text: 'Can we review the design?', time: '9:00 AM', status: 'read', type: 'text', senderName: 'Jane Smith' },
      { id: 'm2', senderId: 'me', text: 'Sure thing', time: '9:10 AM', status: 'read', type: 'text', senderName: 'You' },
      { id: 'm3', senderId: 'jane', text: 'New mockup uploaded', time: '9:15 AM', status: 'read', type: 'text', senderName: 'Jane Smith' }
    ],
    participants: ['jane', 'me', 'john']
  },
  {
    id: '3',
    name: 'general',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    type: 'channel',
    lastMessage: 'Welcome everyone!',
    lastTime: 'Yesterday',
    unreadCount: 5,
    online: true,
    messages: [
      { id: 'm1', senderId: 'admin', text: 'Welcome everyone!', time: 'Yesterday', status: 'read', type: 'text', senderName: 'Admin' }
    ],
    participants: ['admin', 'me', 'jane', 'john']
  }
];

const ChatPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
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
  
  const [chats, setChats] = useState<ChatSession[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(mockChats[0]);

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

  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowSidebar(false);
    }
  }, [selectedChat, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const sendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text',
      senderName: 'You'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: chatMessage,
          lastTime: newMessage.time
        };
      }
      return chat;
    }));

    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: chatMessage,
      lastTime: newMessage.time
    } : null);

    setChatMessage("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const createNewDirectChat = (contact: any) => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: contact.name,
      avatar: contact.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      type: 'direct',
      lastMessage: 'Start a conversation!',
      lastTime: 'Just now',
      unreadCount: 0,
      online: true,
      messages: [],
      participants: [contact.id, 'me']
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setIsSearchUserOpen(false);
  };

  const createGroupChat = () => {
    if (newGroupName.trim() && selectedParticipants.length > 0) {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        name: newGroupName,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100',
        type: 'group',
        lastMessage: 'Group created!',
        lastTime: 'Just now',
        unreadCount: 0,
        online: true,
        messages: [],
        participants: ['me', ...selectedParticipants]
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setNewGroupName('');
      setSelectedParticipants([]);
      setIsNewGroupOpen(false);
    }
  };

  const createChannel = () => {
    if (newChannelName.trim()) {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        name: newChannelName,
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
        type: 'channel',
        lastMessage: 'Channel created!',
        lastTime: 'Just now',
        unreadCount: 0,
        online: true,
        messages: [],
        participants: ['me']
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setNewChannelName('');
      setIsNewChannelOpen(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0A0A0B] text-white">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(showMobileSidebar || !isMobile) && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex flex-col bg-[#131316]/80 border-r border-[#262629]",
              isMobile ? "absolute z-50 h-full" : "relative",
              isTablet ? "w-[260px]" : "w-[300px]"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#262629] bg-[#131316]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#FF8A00] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-black">Chats</h1>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={() => setIsSearchUserOpen(true)}
                  className="flex-1 bg-[#FF6600] hover:bg-[#FF8A00] text-white font-bold text-sm py-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Button 
                  onClick={() => setIsNewGroupOpen(true)}
                  variant="ghost"
                  className="bg-[#1F1F23] hover:bg-[#262629] text-white font-bold text-sm py-2"
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => setIsNewChannelOpen(true)}
                  variant="ghost"
                  className="bg-[#1F1F23] hover:bg-[#262629] text-white font-bold text-sm py-2"
                >
                  <Hash className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search or start new chat" 
                  className="pl-10 bg-[#1F1F23] border-0 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    selectedChat?.id === chat.id 
                      ? "bg-[#FF6600]/10 border border-[#FF6600]/20" 
                      : "hover:bg-[#1F1F23] hover:border-[#262629]"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatar} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                        {chat.name.slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-[#131316] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-bold truncate",
                        chat.unreadCount > 0 ? "text-[#FF6600]" : "text-white"
                      )}>
                        {chat.type === 'channel' ? `#${chat.name}` : chat.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {chat.lastTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </span>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-[#FF6600] text-white text-xs font-black">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0B]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#262629] bg-[#131316]/80">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSidebar(true)}
                    className="mr-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                      {selectedChat.name.slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#131316] rounded-full" />
                  )}
                </div>

                <div>
                  <h2 className="font-black text-lg">
                    {selectedChat.type === 'channel' ? `#${selectedChat.name}` : selectedChat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.participants.length} participants` 
                      : selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1F1F23] border-[#262629]">
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {selectedChat.messages.map((message, i) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex gap-3",
                      message.senderId === 'me' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.senderId !== 'me' && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedChat.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                          {message.senderName?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "max-w-[65%]",
                      message.senderId === 'me' && "items-end flex flex-col"
                    )}>
                      {message.senderId !== 'me' && (
                        <span className="text-xs text-muted-foreground mb-1 ml-1">
                        {message.senderName}
                      </span>
                      )}
                      
                      <div className={cn(
                        "px-4 py-2 rounded-2xl",
                        message.senderId === 'me' 
                          ? "bg-gradient-to-r from-[#FF6600] to-[#FF8A00] text-white rounded-tr-md" 
                          : "bg-[#1F1F23] text-white rounded-tl-md"
                      )}>
                        {message.type === 'text' ? (
                          <p className="text-sm">{message.text}</p>
                        ) : message.type === 'media' ? (
                          <div className="rounded-xl overflow-hidden">
                            <img src={message.mediaUrl} alt="media" className="w-full h-auto" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                            <div className="w-20 h-1 bg-white/30 rounded-full" />
                            <span className="text-xs text-white/70">0:05</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                        {message.senderId === 'me' && (
                          <CheckCircle2 className="w-3 h-3 text-[#FF6600]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-[#262629] bg-[#131316]/80">
              <div className="max-w-3xl mx-auto flex items-end gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*,video/*"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={`Message ${selectedChat.type === 'channel' ? `#${selectedChat.name}` : selectedChat.name}`}
                    className="min-h-[44px] max-h-32 py-2.5 px-4 bg-[#1F1F23] border-0 resize-none"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 bottom-2"
                  >
                    <Smile className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
                <Button 
                  onClick={sendMessage} 
                  className="bg-[#FF6600] hover:bg-[#FF8A00] text-white font-black"
                  disabled={!chatMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 bg-[#1F1F23] rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 text-[#FF6600]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">No chat selected</h2>
            <p className="text-center max-w-xs">Select a chat from the sidebar or start a new one</p>
          </div>
        )}
      </div>

      {/* New User Search Modal */}
      <Dialog open={isSearchUserOpen} onOpenChange={setIsSearchUserOpen}>
        <DialogContent className={cn(
          "bg-[#131316] border-[#262629]",
          isMobile ? "w-[95%]" : isTablet ? "w-[90%]" : "w-[500px]"
        )}>
          <DialogHeader>
            <DialogTitle className="text-white font-black">New Chat</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Search for users to start chatting with
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Command className="bg-[#1F1F23] rounded-lg border-[#262629]">
              <CommandInput 
                placeholder="Search users by name or @cynda.chat"
                value={userSearchQuery}
                onValueChange={setUserSearchQuery}
                className="border-0"
              />
              <CommandList>
                <CommandEmpty>No users found</CommandEmpty>
                <CommandGroup heading="Team Members">
                  {[
                    { id: 'jane', name: 'Jane Smith', role: 'Designer', chatName: '@jane.cynda.chat', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
                    { id: 'john', name: 'John Doe', role: 'Developer', chatName: '@john.cynda.chat', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
                  ].map(user => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => createNewDirectChat(user)}
                      className="flex items-center gap-3 py-2"
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                          {user.name.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.chatName}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                <CommandGroup heading="External Contacts">
                  {[
                    { id: 'client1', name: 'Client X', role: 'Client', chatName: '@clientx.cynda.chat', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100' }
                  ].map(contact => (
                    <CommandItem
                      key={contact.id}
                      onSelect={() => createNewDirectChat(contact)}
                      className="flex items-center gap-3 py-2"
                    >
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                          {contact.name.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-white">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.chatName}</div>
                      </div>
                      <Globe className="w-4 h-4 text-[#FF6600]" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Group Modal */}
      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogContent className={cn(
          "bg-[#131316] border-[#262629]",
          isMobile ? "w-[95%]" : isTablet ? "w-[90%]" : "w-[500px]"
        )}>
          <DialogHeader>
            <DialogTitle className="text-white font-black">Create Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Group Name</Label>
              <Input
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="bg-[#1F1F23] border-[#262629]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Members</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {[
                  { id: 'jane', name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
                  { id: 'john', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
                ].map(member => (
                  <div
                    key={member.id}
                    onClick={() => toggleParticipant(member.id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1F1F23] cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedParticipants.includes(member.id)}
                    />
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#FF6600] to-[#FF8A00] font-black">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold text-white">{member.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsNewGroupOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={createGroupChat}
              className="bg-[#FF6600] hover:bg-[#FF8A00] text-white font-black"
              disabled={!newGroupName.trim() || selectedParticipants.length === 0}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Channel Modal */}
      <Dialog open={isNewChannelOpen} onOpenChange={setIsNewChannelOpen}>
        <DialogContent className={cn(
          "bg-[#131316] border-[#262629]",
          isMobile ? "w-[95%]" : isTablet ? "w-[90%]" : "w-[500px]"
        )}>
          <DialogHeader>
            <DialogTitle className="text-white font-black">Create Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Channel Name</Label>
              <Input
                placeholder="e.g. general"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="bg-[#1F1F23] border-[#262629]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsNewChannelOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={createChannel}
              className="bg-[#FF6600] hover:bg-[#FF8A00] text-white font-black"
              disabled={!newChannelName.trim()}
            >
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
