import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import './bubble.css';
import MessageSkeleton from "./skeletons/MessageSkeleton";

const ChatContainer = ({ onBack }) => {
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

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onBack={onBack} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
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
          ? "text-neutral-content"
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
        ? "text-neutral-content/70"
        : "text-base-content/60"
    }`}
  >
    <time className="text-[10px]">{formatMessageTime(message.createdAt)}</time>
  </div>
</div>

          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
