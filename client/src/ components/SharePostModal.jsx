import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { X, Search, Send, MessageCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const SharePostModal = ({ post, onClose }) => {
  const { userId, getToken } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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

  const toggleTarget = (target) => {
    setSelectedTargets((prev) => {
      const exists = prev.find((t) => t.id === target.id);
      return exists ? prev.filter((t) => t.id !== target.id) : [...prev, target];
    });
  };

  const isSelected = (id) => selectedTargets.some((t) => t.id === id);

  const handleSend = async () => {
    if (selectedTargets.length === 0 || !socket) return;
    setSending(true);
    try {
      const token = await getToken();
      for (const target of selectedTargets) {
        // Get or create chat
        const chatRes = await axios.post(
          `${API}/chats`,
          { targetUserId: target.clerkId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatId = chatRes.data._id;

        socket.emit("sendMessage", {
          chatId,
          sender: userId,
          content: message.trim() || "",
          sharedPost: {
            postId: post._id,
            title: post.title,
            slug: post.slug,
            img: post.img || null,
            desc: post.desc || null,
          },
        });
      }
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Share Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 bg-gray-50">
          {post.img && (
            <img src={post.img} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{post.title}</p>
            {post.desc && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.desc}</p>}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Selected tags */}
        {selectedTargets.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 py-2">
            {selectedTargets.map((t) => (
              <span
                key={t.id}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1 font-medium"
              >
                {t.username}
                <button onClick={() => toggleTarget(t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* User list */}
        <div className="max-h-52 overflow-y-auto">
          {/* Search results */}
          {searchResults.length > 0 && searchResults.map((u) => (
            <button
              key={u.clerkId}
              onClick={() => toggleTarget({ id: u.clerkId, clerkId: u.clerkId, username: u.username, img: u.img })}
              className={`w-full flex items-center gap-3 px-5 py-2.5 transition-colors ${isSelected(u.clerkId) ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              {u.img ? (
                <img src={u.img} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {u.username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-800 flex-1 text-left">{u.username}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected(u.clerkId) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                {isSelected(u.clerkId) && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}

          {/* Existing chats */}
          {!searchQuery && chats.map((c) => {
            const other = c.otherUser;
            if (!other) return null;
            const id = other.clerkId;
            return (
              <button
                key={c._id}
                onClick={() => toggleTarget({ id, clerkId: id, username: other.username, img: other.img })}
                className={`w-full flex items-center gap-3 px-5 py-2.5 transition-colors ${isSelected(id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                {other.img ? (
                  <img src={other.img} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {other.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 flex-1 text-left">{other.username}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected(id) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                  {isSelected(id) && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional message */}
        <div className="px-5 pt-3 pb-2 border-t border-gray-100">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message... (optional)"
            className="w-full px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Send button */}
        <div className="px-5 py-4">
          <button
            onClick={handleSend}
            disabled={selectedTargets.length === 0 || sending}
            className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {sent ? (
              "✓ Sent!"
            ) : sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {selectedTargets.length > 0 ? selectedTargets.length : ""} {selectedTargets.length === 1 ? "person" : selectedTargets.length > 1 ? "people" : "..."}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
