import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";
import { acceptPeer } from "../lib/peer";
import "./bubble.css";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const socket = io("https://fullstack-chat-app-master-j115.onrender.com", { withCredentials: true });

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Video Call State
  const [incomingCall, setIncomingCall] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isOnCall, setIsOnCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("incomingCall", ({ from, signal }) => {
      console.log(`📞 Incoming call from ${from}`);
      setIncomingCall({ from, signal });
    });

    socket.on("callAccepted", (signal) => {
      console.log("✅ Call accepted!");
      if (peerConnection) {
        peerConnection.signal(signal);
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
    };
  }, [peerConnection]);

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = acceptPeer(incomingCall.signal, socket, stream);
      setPeerConnection(peer);
      setIsOnCall(true);

      peer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on("signal", (signal) => {
        socket.emit("acceptCall", { signal, to: incomingCall.from });
      });

      console.log("✅ Call accepted!");
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setPeerConnection(null);
    setIsOnCall(false);
    setLocalStream(null);
    setRemoteStream(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader />

      {/* Video Call UI */}
      {isOnCall && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <div className="flex flex-col items-center">
            <h3 className="text-white mb-3">In Call with {selectedUser.fullName}</h3>
            <div className="relative w-80 h-80 border-4 border-white rounded-md">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full rounded-md" />
            </div>
            <div className="absolute bottom-3 right-3 w-24 h-24 border-2 border-white rounded-md">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full rounded-md" />
            </div>
          </div>
          <button
            onClick={endCall}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            End Call
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="w-12 h-12 rounded-full border-2 border-primary">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div
              className={`${
                message.senderId === authUser._id ? "bg-primary" : "bg-base-300/100"
              } p-4 rounded-lg shadow-lg transition duration-300 ease-in-out hover:shadow-xl w-max max-w-full`}
            >
              {message.text && (
                <p
                  className={`${
                    message.senderId === authUser._id
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  {message.text}
                </p>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="w-full mt-3 rounded-md shadow-md"
                />
              )}
              <div
                className={`mt-1 text-xs ${
                  message.senderId === authUser._id
                    ? "text-primary-content/70"
                    : "text-base-content/60"
                }`}
              >
                <time className="text-[10px]">{formatMessageTime(message.createdAt)}</time>
              </div>
            </div>
          </div>
        ))}
        {/* Ensure scrolling to the last message */}
        <div ref={messageEndRef}></div>
      </div>
      <MessageInput />

      {/* Incoming Call UI */}
      {incomingCall && (
        <div className="fixed bottom-5 left-5 p-5 bg-gray-900 text-white rounded-lg shadow-lg">
          <p>📞 Incoming call from {incomingCall.from}</p>
          <div className="flex gap-3 mt-2">
            <button onClick={acceptCall} className="px-4 py-2 bg-green-500 rounded-md">
              Accept
            </button>
            <button onClick={() => setIncomingCall(null)} className="px-4 py-2 bg-red-500 rounded-md">
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
