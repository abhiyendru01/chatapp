import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!sender.friendRequests.includes(receiverId)) {
      sender.friendRequests.push(receiverId);
      await sender.save();
      return res.status(200).json({ message: "Friend request sent" });
    }

    return res.status(400).json({ message: "Friend request already sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends.push(friendId);
    user.friendRequests = user.friendRequests.filter(id => id !== friendId);

    await user.save();

    friend.friends.push(userId);
    await friend.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
