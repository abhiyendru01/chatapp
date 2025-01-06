import { X, Phone } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";  // Ensure this import

const socket = io(); // Initialize the socket

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleCall = () => {
    if (selectedUser && selectedUser._id) {
      console.log("Sending call event for user ID:", selectedUser._id);
      socket.emit("call", selectedUser._id);  // Correct use of socket instance
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Call button */}
          <button onClick={handleCall} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Call</span>
          </button>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-base-content/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
