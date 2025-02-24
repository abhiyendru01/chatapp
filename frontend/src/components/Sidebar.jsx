import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "./Navbar"; // ✅ Import Navbar

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State to store search query

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Sort and filter users based on last interaction and search query
  const sortedAndFilteredUsers = users
    .sort((a, b) => {
      const timeA = a.lastMessagedAt ? new Date(a.lastMessagedAt).getTime() : 0;
      const timeB = b.lastMessagedAt ? new Date(b.lastMessagedAt).getTime() : 0;
      return timeB - timeA; // Sort descending by last interaction
    })
    .filter((user) => {
      const matchesOnlineStatus =
        !showOnlineOnly || onlineUsers.includes(user._id);
      const matchesSearchQuery = user.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesOnlineStatus && matchesSearchQuery;
    });

  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 bg-base-100 flex flex-col">
      {/* ✅ Navbar is added here but only visible on desktop */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="border-b-2 rounded-b-3xl border-primary/40 w-full p-5 bg-primary/20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
        <div className="w-full p-3 lg:px-3 lg:py-2">
          <label className="input p-5 md:p-3 input-bordered input-md border-primary/40 border-4 rounded-2xl px-5 py-5 flex items-center gap-2 w-full backdrop-blur-sm">
            <input
              type="text"
              className="grow placeholder:text-base-content"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3 px-3 flex-grow space-y-1">
        {/* Display filtered users */}
        {sortedAndFilteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-6  lg:p-3 flex items-center gap-3 bg-primary/10 hover:bg-primary/10  hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 border-spacing-0.5 border-primary/25  transition-colors ${
              selectedUser?._id === user._id
                ? "bg-primary/10 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            <div className="hidden lg:block text-left truncate">
              <div className="font-2xl font-semibold">{user.fullName}</div>
              <div className="text-base text-zinc-400 md:visible">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>

            <div className="lg:hidden flex-grow text-left truncate">
              <div className="font-semibold">{user.fullName}</div>
            </div>
          </button>
        ))}

        {/* No users found message */}
        {sortedAndFilteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
