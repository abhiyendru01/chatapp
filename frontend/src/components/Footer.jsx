import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, User, MessageSquare } from "lucide-react";

const Footer = () => {
  const location = useLocation(); // Get the current route

  // Get correct left position for active tab
  const getActiveTabPosition = () => {
    if (location.pathname === "/settings") return "0%";  // Left (Settings)
    if (location.pathname === "/profile") return "66.66%";  // Right (Profile)
    return "33.33%"; // Center (Chat)
  };

  return (
    <div className="flex justify-center items-center relative w-full h-15 p-0 ">
      <div className="relative border border-base-300 w-full rounded-2xl flex shadow-lg bg-primary/25 backdrop-blur-md">
        
        {/*Active Tab Indicator - Slides Correctly */}
        <motion.div
          className="absolute top-0 left-0 w-1/3 h-full bg-primary/20 border border-primary/40 rounded-2xl"
          animate={{ left: getActiveTabPosition() }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        />

        {/*Settings Tab */}
        <Link to="/settings" className="relative w-1/3 h-18 flex items-center justify-center">
          <Settings className="w-6 h-6 transition-all duration-300" />
        </Link>

        {/*Chat/Home Tab */}
        <Link to="/" className="relative w-1/3 h-16 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 transition-all duration-300" />
        </Link>

        {/*Profile Tab */}
        <Link to="/profile" className="relative w-1/3 h-18 flex items-center justify-center">
          <User className="w-6 h-6 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
