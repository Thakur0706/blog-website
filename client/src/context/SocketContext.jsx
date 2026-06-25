import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { userId, isSignedIn } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", userId);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("unreadUpdate", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isSignedIn, userId]);

  const resetUnread = () => setUnreadCount(0);
  const incrementUnread = (n = 1) => setUnreadCount((prev) => prev + n);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        unreadCount,
        setUnreadCount,
        resetUnread,
        incrementUnread,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
