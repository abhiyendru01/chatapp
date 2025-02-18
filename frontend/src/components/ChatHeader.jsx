import { useState } from "react";
import { Phone, Video, Mic, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";
import { createPeer } from "../lib/peer";

const socket = io("https://fullstack-chat-app-master-j115.onrender.com", "http://localhost:5001", { withCredentials: true });

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCall = async (callType) => {
    if (!selectedUser) return;

    try {
      // Determine constraints for media stream based on call type
      const constraints = callType === "video" ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create a WebRTC peer connection for signaling
      const peer = createPeer(selectedUser._id, socket, stream);
      
      peer.on("signal", (signal) => {
        socket.emit("callUser", { 
          userToCall: selectedUser._id, 
          from: authUser._id, 
          signal, 
          callType 
        });
      });

      console.log(`📞 ${callType === "video" ? "Video" : "Voice"} call started with ${selectedUser.fullName}`);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }

    setShowDropdown(false); // Hide dropdown after selection
  };

  return (
    <div className="p-3.5 border-b bg-base-200 border-base-300 backdrop-blur-md relative">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <button onClick={() => setSelectedUser(null)} className="p-2 rounded-3xl hover:bg-base-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Centered User Info */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="font-bold">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>

        {/* Call Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="rounded-lg px-4 py-3 bg-base-300/55 hover:bg-base-300 text-base-content flex items-center gap-2"
          >
            <Phone className="w-4 h-5" />
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2">
              <button
                onClick={() => handleCall("voice")}
                className="flex items-center gap-2 p-2 w-full text-left hover:bg-base-200 rounded-lg"
              >
                <Mic className="w-4 h-4" /> Voice Call
              </button>
              <button
                onClick={() => handleCall("video")}
                className="flex items-center gap-2 p-2 w-full text-left hover:bg-base-200 rounded-lg"
              >
                <Video className="w-4 h-4" /> Video Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
