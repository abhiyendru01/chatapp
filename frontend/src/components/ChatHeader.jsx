import { useState } from "react";
import { Phone } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import socket from "../socket"; // Import socket.js for socket events

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [incomingCall, setIncomingCall] = useState(false); // State to manage incoming call
  const [callerName, setCallerName] = useState(""); // State to store the name of the caller

  const handleCall = () => {
    if (selectedUser && selectedUser._id) {
      console.log("Calling user:", selectedUser._id);
      socket.emit("call", selectedUser._id); // Emit the call event
    } else {
      console.log("No user selected for the call.");
    }
  };

  // Listen for incoming calls and show the modal
  socket.on("incomingCall", ({ senderName }) => {
    console.log(`Incoming call from ${senderName}`);
    setCallerName(senderName); // Set the name of the caller
    setIncomingCall(true); // Show the modal
  });

  // Handle Accept Call
  const acceptCall = () => {
    console.log(`Call accepted from ${callerName}`);
    setIncomingCall(false); // Hide the modal
    // Handle further call actions, like connecting to a call screen
  };

  // Handle Reject Call
  const rejectCall = () => {
    console.log(`Call rejected from ${callerName}`);
    setIncomingCall(false); // Hide the modal
  };

  return (
    <div>
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-bold">Incoming Call</h2>
              <p className="my-4 text-lg">You have an incoming call from {callerName}</p>

              <div className="flex justify-between">
                <button
                  onClick={acceptCall}
                  className="btn btn-success text-white w-24"
                >
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="btn btn-error text-white w-24"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-3.5 border-b bg-base-200 border-base-300 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-3xl hover:bg-base-300"
          >
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

          {/* Call Button */}
          <button
            onClick={handleCall}
            className="rounded-lg px-4 py-3 bg-base-300/55 hover:bg-base-300 text-base-content"
          >
            <Phone className="w-4 h-5 primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
