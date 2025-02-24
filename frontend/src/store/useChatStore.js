import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  friends: [],
  friendRequests: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  addContact: (userId) => set((state) => ({ contacts: [...state.contacts, userId] })),
  isContact: (userId) => get().contacts.includes(userId),

  

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const usersWithTimestamp = res.data.map((user) => ({
        ...user,
        lastMessagedAt: user.lastMessagedAt || null,
      }));
      set({ users: usersWithTimestamp });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("Messages Fetched from API:", res.data); // Debugging

      set({ messages: res.data });

      const updatedUsers = get().users.map((user) =>
        user._id === userId ? { ...user, lastMessagedAt: new Date().toISOString() } : user
      );
      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
},


sendMessage: async (messageData) => {
  const { selectedUser, messages, users } = get();
  try {
      console.log("Sending Message Data:", messageData); // Debugging
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      console.log("Message Sent Response:", res.data); // Debugging

      set({ messages: [...messages, res.data] });

      const updatedUsers = users.map((user) =>
          user._id === selectedUser._id ? { ...user, lastMessagedAt: new Date().toISOString() } : user
      );
      set({ users: updatedUsers });
  } catch (error) {
      toast.error(error.response.data.message);
  }
},


subscribeToMessages: () => {
  const { selectedUser } = get();
  const socket = useAuthStore.getState().socket;
  if (!selectedUser || !socket) return;

  socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);  // ✅ Debugging
      if (newMessage.audio) {
          console.log("Audio message received:", newMessage.audio);
      }
      if (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id) {
          set((state) => ({ messages: [...state.messages, newMessage] }));
      }
  });
},

  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/api/friends/friends"); // Ensure correct API path
  
      console.log("getFriends API Response:", res); // Debugging
  
      if (Array.isArray(res.data)) {
        set({ friends: res.data });
      } else {
        console.error("Error: getFriends API did not return an array:", res.data);
        set({ friends: [] });
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      set({ friends: [] });
      toast.error(error.response?.data?.message || "Error fetching friends");
    }
  },
  

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/api/friends/friend-requests"); // ✅ Ensure correct API route
      set({ friendRequests: res.data || [] }); // ✅ Ensure an array
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching friend requests");
      set({ friendRequests: [] });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post("/api/friends/send-request", { receiverId: userId }); // ✅ Correct API path
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending friend request");
    }
  },

  acceptFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post("/api/friends/accept-request", { senderId }); // ✅ Correct API path
      toast.success("Friend request accepted!");
      get().getFriends(); // Refresh friends list
      get().getFriendRequests(); // Refresh friend requests list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error accepting friend request");
    }
  },

  rejectFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post("/api/friends/reject-request", { senderId }); // ✅ Correct API path
      toast.success("Friend request rejected!");
      get().getFriendRequests(); // Refresh friend requests list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejecting friend request");
    }
  },
  
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
