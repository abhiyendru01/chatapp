import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getFriends, getFriendRequests, friends, friendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useChatStore();
  useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [getFriends, getFriendRequests]);

  // Search for users
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/friends/search?query=${searchQuery}`);
      setSearchResults(res.data);
    } catch {
      toast.error("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 bg-base-100 flex flex-col">
      {/* Header */}
      <div className="border-b-2 rounded-b-3xl border-primary/40 w-full p-5 bg-primary/20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Friends</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full p-3">
        <label className="input input-bordered flex items-center gap-2 border-primary/40 border-4 rounded-2xl px-5 py-2 backdrop-blur-sm">
          <input
            type="text"
            className="grow placeholder:text-base-content"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="btn btn-sm btn-outline">
            Search
          </button>
        </label>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="p-3">
          <h3 className="text-lg font-semibold">Search Results</h3>
          <ul className="mt-2 space-y-2">
            {loading ? (
              <li className="text-center">Loading...</li>
            ) : (
              searchResults.map((user) => (
                <li key={user._id} className="p-2 bg-primary/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-8 object-cover rounded-full" />
                    <span>{user.fullName}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => sendFriendRequest(user._id)}
                  >
                    Add Friend
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="p-3">
          <h3 className="text-lg font-semibold">Friend Requests</h3>
          <ul className="mt-2 space-y-2">
            {friendRequests.map((user) => (
              <li key={user._id} className="p-2 bg-primary/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-8 object-cover rounded-full" />
                  <span>{user.fullName}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => acceptFriendRequest(user._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => rejectFriendRequest(user._id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friends List */}
      <div className="p-3 flex-grow overflow-y-auto">
        <h3 className="text-lg font-semibold">Your Friends</h3>
        <ul className="mt-2 space-y-2">
          {friends.length === 0 ? (
            <li className="text-center">No friends added yet.</li>
          ) : (
            friends.map((friend) => (
              <li key={friend._id} className="p-2 bg-primary/10 rounded-lg flex items-center">
                <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} className="size-8 object-cover rounded-full" />
                <span className="ml-3">{friend.fullName}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
