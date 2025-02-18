import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();
const storage = multer.memoryStorage();  // Store the file in memory
const upload = multer({ storage: storage }); // Set multer to use the memory storage


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res); // Generate JWT and optionally set in cookie

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      token, // Send JWT token in response
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body; // Get other profile data
    const userId = req.user._id; // Get the current user's ID

    // Ensure a profile pic is provided
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "images" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }

        // Update the user's profile with the new profile picture URL
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            fullName: fullName || "", // Update full name if provided
            profilePic: result.secure_url, // Cloudinary URL for the profile picture
          },
          { new: true }
        );

        return res.status(200).json(updatedUser);
      }
    );

    // Pipe the file to Cloudinary upload stream
    req.file.stream.pipe(uploadResponse);
  } catch (error) {
    console.error("Error in update profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request is already sent or if they are already friends
    if (sender.friendRequests.includes(receiverId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // Send the friend request
    sender.friendRequests.push(receiverId);
    await sender.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the request from the user's friend requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.friendRequests = sender.friendRequests.filter(id => id.toString() !== userId);

    // Add the sender and user to each other's friend lists
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the request from the user's friend requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    await user.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getFriendsList = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('friends', 'fullName email profilePic');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriendsList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
