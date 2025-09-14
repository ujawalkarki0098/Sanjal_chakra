import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Search, Send, MoreVertical,
  UserPlus, UserMinus, Trash2, Settings, Crown,
  Phone, Video, Paperclip, Smile, X, ArrowLeft, ChevronLeft, ChevronRight,
  Bell, Shield, Edit3, Upload, LogOut, Info
} from 'lucide-react';

class SocketService {
  constructor() { this.socket = null; this.isConnected = false; }
  connect(userId) { console.log('Connected to server'); this.isConnected = true; return this.socket; }
  disconnect() { this.socket = null; this.isConnected = false; }
  sendMessage(d) { console.log('Sending message:', d); }
  joinRoom(r) { console.log('Joining room:', r); }
  leaveRoom(r) { console.log('Leaving room:', r); }
  createGroup(g) { console.log('Creating group:', g); }
  addToGroup(g, u) { console.log('Add to group:', { g, u }); }
  removeFromGroup(g, u) { console.log('Remove from group:', { g, u }); }
  deleteChat(c) { console.log('Deleting chat:', c); }
  on() {}
  off() {}
}
const socketService = new SocketService();

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
    '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
    '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
    '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤝', '🙏', '✍️'
  ];

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 w-80 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Emojis</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button key={index} onClick={() => onEmojiSelect(emoji)} className="text-xl hover:bg-slate-100 rounded p-1 transition-colors">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'blue', icon = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center space-x-3 mb-4">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-lg text-white hover:opacity-90 ${confirmColor === 'red' ? 'bg-red-500' : confirmColor === 'green' ? 'bg-green-500' : 'bg-blue-500'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarView, setSidebarView] = useState('all');
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser] = useState({ id: 'user1', name: 'Current User' });
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showOnlineUserConfirm, setShowOnlineUserConfirm] = useState(null);
  const [showProfileRedirect, setShowProfileRedirect] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState({ 
    isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm', confirmColor: 'blue', icon: null 
  });
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupDescription, setGroupDescription] = useState('');
  const [groupSettings, setGroupSettings] = useState({ notifications: true, adminOnly: false });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const onlineSliderRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const dummyConnectionsData = [
    { _id: 'user2', full_name: 'John Doe', username: 'johndoe', bio: 'Software Developer', profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', isOnline: true, lastSeen: new Date() },
    { _id: 'user3', full_name: 'Jane Smith', username: 'janesmith', bio: 'Designer', profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b84bf26e?w=400&h=400&fit=crop&crop=face', isOnline: false, lastSeen: new Date(Date.now() - 300000) },
    { _id: 'user4', full_name: 'Mike Johnson', username: 'mikej', bio: 'Product Manager', profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isOnline: true, lastSeen: new Date() },
    { _id: 'user5', full_name: 'Alice Brown', username: 'alice', bio: 'Marketing', profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', isOnline: true, lastSeen: new Date() },
    { _id: 'user6', full_name: 'Bob Wilson', username: 'bob', bio: 'Sales', profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', isOnline: true, lastSeen: new Date() }
  ];

  const dummyConversations = [
    { id: 'conv1', type: 'direct', participants: ['user1', 'user2'], name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', lastMessage: 'Hey, how are you doing?', lastMessageTime: new Date(Date.now() - 120000), unreadCount: 2, isOnline: true },
    { id: 'conv2', type: 'group', participants: ['user1', 'user2', 'user3'], name: 'Team Chat', avatar: null, lastMessage: 'Meeting at 3 PM', lastMessageTime: new Date(Date.now() - 3600000), unreadCount: 0, adminId: 'user1', settings: { notifications: true, adminOnly: false } },
    { id: 'conv3', type: 'direct', participants: ['user1', 'user3'], name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b84bf26e?w=400&h=400&fit=crop&crop=face', lastMessage: 'Thanks for the help!', lastMessageTime: new Date(Date.now() - 7200000), unreadCount: 0, isOnline: false }
  ];

  useEffect(() => { 
    socketService.connect(currentUser.id); 
    return () => socketService.disconnect(); 
  }, [currentUser.id]);

  useEffect(() => setConversations(dummyConversations), []);
  
  useEffect(() => { 
    if (selectedChatId) { 
      const c = conversations.find(x => x.id === selectedChatId); 
      if (c) { 
        setActiveChat(c); 
        socketService.joinRoom(selectedChatId); 
        loadMessages(selectedChatId);
        if (c.type === 'group' && c.settings) {
          setGroupSettings(c.settings);
        }
      } 
    } 
  }, [selectedChatId, conversations]);
  
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMessages = (conversationId) => {
    const dummyMessages = [
      { id: 'msg1', senderId: 'user2', content: 'Hey there! How are you doing?', timestamp: new Date(Date.now() - 3600000), type: 'text' },
      { id: 'msg2', senderId: 'user1', content: 'Hi! I am doing great. Thanks for asking!', timestamp: new Date(Date.now() - 3000000), type: 'text' },
      { id: 'msg3', senderId: 'user2', content: 'That is awesome! Are we still on for the meeting tomorrow?', timestamp: new Date(Date.now() - 1800000), type: 'text' }
    ];
    setMessages(dummyMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    const messageData = { 
      id: Date.now().toString(), senderId: currentUser.id, conversationId: activeChat.id, 
      content: newMessage, timestamp: new Date(), type: 'text' 
    };
    socketService.sendMessage(messageData);
    setMessages(prev => [...prev, messageData]);
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, lastMessage: newMessage, lastMessageTime: new Date() } : c
    ));
    setNewMessage('');
  };

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSendMessage(); 
    } 
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const createGroup = () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    const newGroup = { 
      id: `group_${Date.now()}`, name: groupName, description: groupDescription,
      participants: [currentUser.id, ...selectedUsers], adminId: currentUser.id, type: 'group', 
      avatar: null, lastMessage: 'Group created', lastMessageTime: new Date(), unreadCount: 0,
      settings: { notifications: true, adminOnly: false }
    };
    socketService.createGroup(newGroup);
    setConversations(prev => [...prev, newGroup]);
    setShowGroupModal(false); 
    setGroupName(''); 
    setGroupDescription('');
    setSelectedUsers([]);
  };

  const addMemberToGroup = (userId) => {
    if (!activeChat || activeChat.adminId !== currentUser.id) return;
    socketService.addToGroup(activeChat.id, userId);
    setActiveChat(prev => ({ ...prev, participants: [...prev.participants, userId] }));
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, participants: [...c.participants, userId] } : c
    ));
    setShowAddMemberModal(false);
  };

  const removeMemberFromGroup = (userId) => {
    if (!activeChat || activeChat.adminId !== currentUser.id) return;
    socketService.removeFromGroup(activeChat.id, userId);
    setActiveChat(prev => ({ ...prev, participants: prev.participants.filter(id => id !== userId) }));
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, participants: c.participants.filter(id => id !== userId) } : c
    ));
  };

  const leaveGroup = () => {
    if (!activeChat || activeChat.type !== 'group') return;
    socketService.leaveRoom(activeChat.id);
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, participants: c.participants.filter(id => id !== currentUser.id) } : c
    ));
    setActiveChat(null); 
    setSelectedChatId(null); 
    setCurrentView('list');
  };

  const deleteConversation = (conversationId) => {
    socketService.deleteChat(conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeChat?.id === conversationId) { 
      setActiveChat(null); 
      setCurrentView('list'); 
      setSelectedChatId(null); 
    }
  };

  const handleChatSelect = (chatId) => { 
    setSelectedChatId(chatId); 
    setCurrentView('chat'); 
  };

  const handleProfileRedirect = (userId) => {
    alert(`Redirecting to profile: /profile/${userId}`);
    console.log(`Navigate to /profile/${userId}`);
  };

  const toggleGroupNotifications = () => {
    const newSettings = { ...groupSettings, notifications: !groupSettings.notifications };
    setGroupSettings(newSettings);
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, settings: newSettings } : c
    ));
    setActiveChat(prev => ({ ...prev, settings: newSettings }));
    console.log('Group notifications toggled:', newSettings.notifications);
  };

  const toggleAdminOnly = () => {
    const newSettings = { ...groupSettings, adminOnly: !groupSettings.adminOnly };
    setGroupSettings(newSettings);
    setConversations(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, settings: newSettings } : c
    ));
    setActiveChat(prev => ({ ...prev, settings: newSettings }));
    console.log('Admin only setting toggled:', newSettings.adminOnly);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const formatLastSeen = (date) => {
    const diffMins = Math.floor((new Date() - new Date(date)) / 60000);
    if (diffMins < 1) return 'Just now'; 
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`; 
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const onlineUsers = dummyConnectionsData.filter(u => u.isOnline);
  const scrollOnline = (dir) => { 
    const el = onlineSliderRef.current; 
    if (el) el.scrollBy({ left: dir * 120, behavior: 'smooth' }); 
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUsers = dummyConnectionsData.filter(user => 
    activeChat?.participants && !activeChat.participants.includes(user._id)
  );

  const showConfirm = (config) => setShowConfirmModal({ isOpen: true, ...config });

  const closeConfirm = () => {
    setShowConfirmModal({ 
      isOpen: false, title: '', message: '', onConfirm: () => {},
      confirmText: 'Confirm', confirmColor: 'blue', icon: null 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto flex h-screen">
        <div className={`w-80 bg-white border-r border-slate-200 flex flex-col ${currentView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
              <button onClick={() => setShowGroupModal(true)} className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm" title="Create Group">
                <Users className="w-4 h-4" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
            </div>
            
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setSidebarView('all')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sidebarView === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>All</button>
              <button onClick={() => setSidebarView('connections')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sidebarView === 'connections' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Connections</button>
              <button onClick={() => setSidebarView('chats')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sidebarView === 'chats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Recent</button>
            </div>
          </div>

          {(sidebarView === 'all' || sidebarView === 'connections') && (
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Online ({onlineUsers.length})</h3>
                <div className="flex space-x-1">
                  <button onClick={() => scrollOnline(-1)} className="p-1 rounded-full hover:bg-white/50 transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
                  <button onClick={() => scrollOnline(1)} className="p-1 rounded-full hover:bg-white/50 transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
                </div>
              </div>
              <div ref={onlineSliderRef} className="flex space-x-3 overflow-x-auto scroll-smooth scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {onlineUsers.map((user) => (
                  <div key={user._id} onClick={() => setShowOnlineUserConfirm(user)} className="flex-shrink-0 cursor-pointer group" title={user.full_name}>
                    <div className="relative">
                      <img src={user.profile_picture} alt={user.full_name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-blue-200 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-slate-600 truncate max-w-[48px]">{user.full_name.split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(sidebarView === 'all' || sidebarView === 'connections') && (
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">All Connections</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dummyConnectionsData.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => setShowOnlineUserConfirm(user)}>
                    <div className="relative">
                      <img src={user.profile_picture} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 truncate">{user.full_name}</h4>
                        <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{user.bio}</p>
                      {!user.isOnline && <p className="text-xs text-slate-400">{formatLastSeen(user.lastSeen)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(sidebarView === 'all' || sidebarView === 'chats') && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Recent Chats</h3>
              </div>
              {filteredConversations.map((conv) => (
                <div key={conv.id} onClick={() => handleChatSelect(conv.id)} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${activeChat?.id === conv.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {conv.type === 'group' ? <Users className="w-6 h-6" /> : conv.name[0]}
                        </div>
                      )}
                      {conv.type === 'direct' && conv.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 truncate flex items-center">
                          {conv.name}
                          {conv.type === 'group' && conv.adminId === currentUser.id && <Crown className="inline w-4 h-4 ml-1 text-yellow-500" />}
                        </h3>
                        <span className="text-xs text-slate-500">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">{conv.unreadCount}</span>}
                      </div>
                      {conv.type === 'direct' && !conv.isOnline && <p className="text-xs text-slate-400 mt-1">Last seen {formatLastSeen(conv.lastSeen)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col ${currentView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <button onClick={() => { setCurrentView('list'); setActiveChat(null); setSelectedChatId(null); }} className="p-1 hover:bg-slate-100 rounded md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {activeChat.avatar ? (
                      <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all" onClick={() => {
                        if (activeChat.type === 'direct') {
                          const user = dummyConnectionsData.find(u => activeChat.participants.includes(u._id) && u._id !== currentUser.id);
                          if (user) setShowProfileRedirect(user);
                        }
                      }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
                        {activeChat.type === 'group' ? <Users className="w-5 h-5" /> : activeChat.name[0]}
                      </div>
                    )}
                    {activeChat.type === 'direct' && activeChat.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 flex items-center">
                      <span onClick={() => {
                        if (activeChat.type === 'direct') {
                          const user = dummyConnectionsData.find(u => activeChat.participants.includes(u._id) && u._id !== currentUser.id);
                          if (user) setShowProfileRedirect(user);
                        }
                      }} className="cursor-pointer hover:text-blue-600 transition-colors">
                        {activeChat.name}
                      </span>
                      {activeChat.type === 'group' && activeChat.adminId === currentUser.id && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {activeChat.type === 'group' ? `${activeChat.participants?.length || 0} members` : activeChat.isOnline ? 'Online' : `Last seen ${formatLastSeen(activeChat.lastSeen)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Voice Call">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Video Call">
                    <Video className="w-5 h-5 text-slate-600" />
                  </button>
                  <div className="relative group">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {activeChat.type === 'group' && activeChat.adminId === currentUser.id && (
                        <>
                          <button onClick={() => setShowAddMemberModal(true)} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 transition-colors">
                            <UserPlus className="w-4 h-4" />
                            <span>Add Member</span>
                          </button>
                          <button onClick={() => setShowGroupSettings(true)} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 transition-colors">
                            <Settings className="w-4 h-4" />
                            <span>Group Settings</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => showConfirm({
                        title: 'Delete Chat',
                        message: `Are you sure you want to delete this ${activeChat.type === 'group' ? 'group' : 'conversation'}? This action cannot be undone.`,
                        confirmText: 'Delete',
                        confirmColor: 'red',
                        icon: <Trash2 className="w-5 h-5 text-red-500" />,
                        onConfirm: () => {
                          deleteConversation(activeChat.id);
                          closeConfirm();
                        }
                      })} className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((message) => {
                  const sender = dummyConnectionsData.find(u => u._id === message.senderId);
                  const isCurrentUser = message.senderId === currentUser.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!isCurrentUser && activeChat.type === 'group' && (
                        <div className="mr-2 mt-auto">
                          <img src={sender?.profile_picture || ''} alt={sender?.full_name || 'User'} className="w-6 h-6 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all" onClick={() => handleProfileRedirect(message.senderId)} title={sender?.full_name || 'User'} />
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
                        {!isCurrentUser && activeChat.type === 'group' && (
                          <p className="text-xs text-slate-500 mb-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleProfileRedirect(message.senderId)}>
                            {sender?.full_name || 'Unknown User'}
                          </p>
                        )}
                        <div className={`px-4 py-2 rounded-lg shadow-sm ${isCurrentUser ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'}`}>
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-slate-500'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Attach File">
                    <Paperclip className="w-5 h-5 text-slate-600" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" />
                  <div className="flex-1 relative">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                  </div>
                  <div className="relative" ref={emojiPickerRef}>
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Emoji">
                      <Smile className="w-5 h-5 text-slate-600" />
                    </button>
                    {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
                  </div>
                  <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a conversation</h3>
                <p className="text-slate-500 mb-4">Choose a conversation from the sidebar to start messaging</p>
                <button onClick={() => setShowGroupModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Start New Chat</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Create Group</h3>
              <button onClick={() => setShowGroupModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Group Name *</label>
                <input type="text" placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                <textarea placeholder="Enter group description" value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-3">Add Members *</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {dummyConnectionsData.map((user) => (
                    <label key={user._id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user._id]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user._id));
                        }
                      }} className="rounded text-blue-500 focus:ring-blue-500" />
                      <img src={user.profile_picture} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <span className="font-medium text-slate-900">{user.full_name}</span>
                        <p className="text-sm text-slate-500">{user.bio}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                    </label>
                  ))}
                </div>
                {selectedUsers.length > 0 && <p className="text-sm text-blue-600 mt-2">{selectedUsers.length} member(s) selected</p>}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowGroupModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={createGroup} disabled={!groupName.trim() || selectedUsers.length === 0} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">Create Group</button>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Members</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No available users to add</p>
                </div>
              ) : (
                availableUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <img src={user.profile_picture} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <span className="font-medium text-slate-900">{user.full_name}</span>
                        <p className="text-sm text-slate-500">{user.bio}</p>
                      </div>
                    </div>
                    <button onClick={() => addMemberToGroup(user._id)} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Add</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showGroupSettings && activeChat?.type === 'group' && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Group Settings</h3>
              <button onClick={() => setShowGroupSettings(false)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900">{activeChat.name}</h4>
                <p className="text-sm text-slate-500">{activeChat.participants.length} members</p>
              </div>

              <div className="space-y-2">
                <button onClick={() => showConfirm({
                  title: 'Edit Group Name',
                  message: 'This feature will allow you to change the group name.',
                  confirmText: 'Continue',
                  icon: <Edit3 className="w-5 h-5 text-blue-500" />,
                  onConfirm: () => {
                    alert('Edit group name feature would be implemented here');
                    closeConfirm();
                  }
                })} className="w-full p-3 flex items-center space-x-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <Edit3 className="w-5 h-5 text-slate-600" />
                  <span>Edit Group Name</span>
                </button>
                
                <button onClick={() => showConfirm({
                  title: 'Change Group Photo',
                  message: 'This feature will allow you to upload a new group photo.',
                  confirmText: 'Continue',
                  icon: <Upload className="w-5 h-5 text-blue-500" />,
                  onConfirm: () => {
                    alert('Change group photo feature would be implemented here');
                    closeConfirm();
                  }
                })} className="w-full p-3 flex items-center space-x-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <Upload className="w-5 h-5 text-slate-600" />
                  <span>Change Group Photo</span>
                </button>

                <button onClick={() => showConfirm({
                  title: 'Group Description',
                  message: 'This feature will allow you to edit the group description.',
                  confirmText: 'Continue',
                  icon: <Info className="w-5 h-5 text-blue-500" />,
                  onConfirm: () => {
                    alert('Edit group description feature would be implemented here');
                    closeConfirm();
                  }
                })} className="w-full p-3 flex items-center space-x-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <Info className="w-5 h-5 text-slate-600" />
                  <span>Edit Description</span>
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h5 className="font-medium text-slate-700 mb-3">Notifications & Privacy</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-slate-600" />
                      <span>Notifications</span>
                    </div>
                    <button onClick={toggleGroupNotifications} className={`w-12 h-6 rounded-full p-1 transition-colors ${groupSettings.notifications ? 'bg-blue-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${groupSettings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-slate-600" />
                      <span>Only Admins Can Send</span>
                    </div>
                    <button onClick={toggleAdminOnly} className={`w-12 h-6 rounded-full p-1 transition-colors ${groupSettings.adminOnly ? 'bg-blue-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${groupSettings.adminOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h5 className="font-medium text-slate-700 mb-3">Members ({activeChat.participants.length})</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeChat.participants.map((uid) => {
                    const user = dummyConnectionsData.find(x => x._id === uid) || { 
                      _id: uid, full_name: uid === currentUser.id ? 'You' : 'Unknown User', 
                      profile_picture: '', bio: ''
                    };
                    
                    return (
                      <div key={uid} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => uid !== currentUser.id && handleProfileRedirect(uid)}>
                          <img src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <span className="font-medium text-slate-900">{user.full_name}</span>
                            {uid === activeChat.adminId && <Crown className="inline w-4 h-4 ml-1 text-yellow-500" />}
                            {user.bio && <p className="text-sm text-slate-500">{user.bio}</p>}
                          </div>
                        </div>
                        {uid !== currentUser.id && activeChat.adminId === currentUser.id && (
                          <button onClick={() => showConfirm({
                            title: 'Remove Member',
                            message: `Are you sure you want to remove ${user.full_name} from the group?`,
                            confirmText: 'Remove',
                            confirmColor: 'red',
                            icon: <UserMinus className="w-5 h-5 text-red-500" />,
                            onConfirm: () => {
                              removeMemberFromGroup(uid);
                              closeConfirm();
                            }
                          })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button onClick={() => showConfirm({
                title: 'Leave Group',
                message: 'Are you sure you want to leave this group? You will no longer receive messages from this group.',
                confirmText: 'Leave',
                confirmColor: 'red',
                icon: <LogOut className="w-5 h-5 text-red-500" />,
                onConfirm: () => {
                  leaveGroup();
                  setShowGroupSettings(false);
                  closeConfirm();
                }
              })} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Leave Group</button>
              {activeChat.adminId === currentUser.id && (
                <button onClick={() => showConfirm({
                  title: 'Delete Group',
                  message: 'Are you sure you want to permanently delete this group? This action cannot be undone and all messages will be lost.',
                  confirmText: 'Delete',
                  confirmColor: 'red',
                  icon: <Trash2 className="w-5 h-5 text-red-500" />,
                  onConfirm: () => {
                    deleteConversation(activeChat.id);
                    setShowGroupSettings(false);
                    closeConfirm();
                  }
                })} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete Group</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showOnlineUserConfirm && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <img src={showOnlineUserConfirm.profile_picture} alt={showOnlineUserConfirm.full_name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">Start chat with</h3>
              <p className="text-xl font-bold text-blue-600">{showOnlineUserConfirm.full_name}</p>
              <p className="text-sm text-slate-500">{showOnlineUserConfirm.bio}</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowOnlineUserConfirm(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => {
                const existing = conversations.find(c => 
                  c.type === 'direct' && c.participants.includes(showOnlineUserConfirm._id)
                );
                if (existing) {
                  handleChatSelect(existing.id);
                } else {
                  const newConv = { 
                    id: `conv_${showOnlineUserConfirm._id}_${Date.now()}`, type: 'direct', 
                    participants: [currentUser.id, showOnlineUserConfirm._id], 
                    name: showOnlineUserConfirm.full_name, avatar: showOnlineUserConfirm.profile_picture, 
                    lastMessage: '', lastMessageTime: new Date(), unreadCount: 0, 
                    isOnline: showOnlineUserConfirm.isOnline 
                  };
                  setConversations(prev => [...prev, newConv]);
                  handleChatSelect(newConv.id);
                }
                setShowOnlineUserConfirm(null);
              }} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Start Chat</button>
            </div>
          </div>
        </div>
      )}

      {showProfileRedirect && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <img src={showProfileRedirect.profile_picture} alt={showProfileRedirect.full_name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">View Profile</h3>
              <p className="text-xl font-bold text-blue-600">{showProfileRedirect.full_name}</p>
              <p className="text-sm text-slate-500 mb-2">@{showProfileRedirect.username}</p>
              <p className="text-sm text-slate-600">{showProfileRedirect.bio}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${showProfileRedirect.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                <span className="text-xs text-slate-500">
                  {showProfileRedirect.isOnline ? 'Online' : `Last seen ${formatLastSeen(showProfileRedirect.lastSeen)}`}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowProfileRedirect(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => { 
                handleProfileRedirect(showProfileRedirect._id); 
                setShowProfileRedirect(null); 
              }} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">View Profile</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={showConfirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={showConfirmModal.onConfirm}
        title={showConfirmModal.title}
        message={showConfirmModal.message}
        confirmText={showConfirmModal.confirmText}
        confirmColor={showConfirmModal.confirmColor}
        icon={showConfirmModal.icon}
      />
    </div>
  );
};

export default Messages;