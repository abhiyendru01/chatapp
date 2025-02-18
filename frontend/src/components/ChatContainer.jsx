import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import './bubble.css';
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { io } from "socket.io-client";  // Import socket.io-client

const socket = io("http://localhost:5001","https://fullstack-chat-app-master-j115.onrender.com"); // Your backend URL

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when the selected user changes
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Listen for new message event
  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      // Update the message list when a new message is received
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [setMessages]);

  // Scroll to the latest message when new messages are received
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
              {/* Text Message */}
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

              {/* Audio (Voice Note) Message */}
              {message.audio && (
                <div className="flex items-center gap-2 mt-3">
                  <audio controls>
                    <source src={message.audio} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Timestamp */}
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
        <div ref={messageEndRef}></div>
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
