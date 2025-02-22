import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import './bubble.css';
import MessageSkeleton from "./skeletons/MessageSkeleton";
import socket from "../socket"; // Assuming you have this imported from socket.js

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setMessages, // Function to update messages in the store
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id); // Get messages when the user is selected
    subscribeToMessages();
    
    socket.on("incomingMessage", (newMessage) => {
      // Append new messages
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, setMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to the last message
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
              {message.audio && (
                <audio controls src={message.audio} className="w-full mt-3 rounded-md shadow-md" />
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
    </div>
  );
};

export default ChatContainer;
