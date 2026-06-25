import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { format } from "timeago.js";
import { useSocket } from "../context/SocketContext";
import { Search, Send, X, ChevronLeft, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL;

// ────────────────────────────────────────────────
// ChatPage
// ────────────────────────────────────────────────
const ChatPage = () => {
  const { userId, getToken } = useAuth();
  const { socket, onlineUsers, setUnreadCount } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ──── Load chats ────
  const loadChats = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [getToken]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // ──── Socket listeners ────
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      if (activeChat && msg.chatId === activeChat._id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit("markRead", { chatId: activeChat._id, userId });
      }
      // Update last message in sidebar
      setChats((prev) =>
        prev
          .map((c) =>
            c._id === msg.chatId
              ? { ...c, lastMessage: msg, updatedAt: new Date() }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("typing", ({ userId: typerId, isTyping: t }) => {
      if (t) setTypingUser(typerId);
      else setTypingUser(null);
    });

    socket.on("unreadUpdate", ({ chatId }) => {
      if (!activeChat || activeChat._id !== chatId) {
        setChats((prev) =>
          prev.map((c) =>
            c._id === chatId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("unreadUpdate");
    };
  }, [socket, activeChat, userId]);

  // ──── Scroll to bottom ────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ──── Reset global unread badge when on chat page ────
  useEffect(() => {
    setUnreadCount(0);
  }, [setUnreadCount]);

  // ──── Select a chat ────
  const selectChat = async (chat) => {
    if (activeChat?._id === chat._id) return;

    // Leave previous chat room
    if (activeChat) socket?.emit("leaveChat", activeChat._id);

    setActiveChat(chat);
    setMessages([]);
    setLoading(true);
    setMobileShowChat(true);

    try {
      const token = await getToken();
      const res = await axios.get(`${API}/chats/${chat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    // Join new chat room & mark read
    socket?.emit("joinChat", chat._id);
    socket?.emit("markRead", { chatId: chat._id, userId });

    // Reset unread for this chat in sidebar
    setChats((prev) =>
      prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // ──── Search users ────
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/chats/search-users?query=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // ──── Start new chat ────
  const startNewChat = async (targetUser) => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API}/chats`,
        { targetUserId: targetUser.clerkId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChat = {
        ...res.data,
        otherUser: targetUser,
        unreadCount: 0,
      };
      setSearchQuery("");
      setSearchResults([]);
      // Add to chats if not already there
      setChats((prev) => {
        const exists = prev.find((c) => c._id === newChat._id);
        if (exists) { selectChat(exists); return prev; }
        return [newChat, ...prev];
      });
      selectChat(newChat);
    } catch (e) {
      console.error(e);
    }
  };

  // ──── Send message ────
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || !socket) return;

    socket.emit("sendMessage", {
      chatId: activeChat._id,
      sender: userId,
      content: input.trim(),
    });

    setInput("");
  };

  // ──── Typing indicator ────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !activeChat) return;
    socket.emit("typing", { chatId: activeChat._id, userId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId: activeChat._id, userId, isTyping: false });
    }, 1500);
  };

  const isOnline = (clerkId) => onlineUsers.includes(clerkId);

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* ── LEFT SIDEBAR ── */}
      <div
        className={`
          flex flex-col border-r border-gray-100 bg-white
          w-full md:w-80 flex-shrink-0
          ${mobileShowChat ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            {totalUnread > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {totalUnread}
              </span>
            )}
          </div>
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">
              People
            </p>
            {searchResults.map((u) => (
              <button
                key={u.clerkId}
                onClick={() => startNewChat(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  {u.img ? (
                    <img src={u.img} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {u.username[0]?.toUpperCase()}
                    </div>
                  )}
                  {isOnline(u.clerkId) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800">{u.username}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No conversations yet. Search for a user to start chatting!</p>
            </div>
          )}
          {chats.map((chat) => {
            const other = chat.otherUser;
            const isActive = activeChat?._id === chat._id;
            const online = isOnline(other?.clerkId);
            return (
              <button
                key={chat._id}
                onClick={() => selectChat(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors
                  ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}
                `}
              >
                <div className="relative flex-shrink-0">
                  {other?.img ? (
                    <img src={other.img} alt={other.username} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {other?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  {online && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold truncate ${chat.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>
                      {other?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {chat.lastMessage ? format(chat.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                      {chat.lastMessage?.sharedPost?.title
                        ? `📰 ${chat.lastMessage.sharedPost.title}`
                        : chat.lastMessage?.content || "Start a conversation"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center flex-shrink-0 ml-1">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT CHAT PANEL ── */}
      <div
        className={`
          flex-1 flex flex-col
          ${mobileShowChat ? "flex" : "hidden md:flex"}
        `}
      >
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
              <button
                className="md:hidden text-gray-500 mr-1"
                onClick={() => { setMobileShowChat(false); socket?.emit("leaveChat", activeChat._id); setActiveChat(null); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                {activeChat.otherUser?.img ? (
                  <img src={activeChat.otherUser.img} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {activeChat.otherUser?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                {isOnline(activeChat.otherUser?.clerkId) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{activeChat.otherUser?.username || "Unknown"}</p>
                <p className="text-xs text-gray-400">
                  {isOnline(activeChat.otherUser?.clerkId)
                    ? "🟢 Online"
                    : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {loading && (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender === userId;
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {/* Shared Post Card */}
                      {msg.sharedPost?.postId && (
                        <Link
                          to={`/${msg.sharedPost.slug}`}
                          className={`block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm w-64 hover:shadow-md transition-shadow ${isMine ? "self-end" : "self-start"}`}
                        >
                          {msg.sharedPost.img && (
                            <img src={msg.sharedPost.img} alt="" className="w-full h-32 object-cover" />
                          )}
                          <div className="p-3">
                            <p className="text-xs font-bold text-gray-800 line-clamp-2">{msg.sharedPost.title}</p>
                            {msg.sharedPost.desc && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.sharedPost.desc}</p>
                            )}
                          </div>
                        </Link>
                      )}
                      {/* Text bubble */}
                      {msg.content && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${isMine
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                            }
                          `}
                        >
                          {msg.content}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 px-1">{format(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              {typingUser && typingUser !== userId && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder={`Message ${activeChat.otherUser?.username || ""}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">Select a conversation</p>
            <p className="text-sm mt-1 opacity-70">or search for a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
