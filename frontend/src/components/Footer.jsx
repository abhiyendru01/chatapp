import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings, User, MessageSquare } from "lucide-react";

const Footer = () => {
  const [selected, setSelected] = useState("chat"); 
  return (
    <div className="flex justify-center items-center relative transition-all duration-[450ms] ease-in-out w-full p-4">
      <div className="border border-base-300 w-full ease-in-out duration-500 left-0 rounded-2xl flex shadow-lg bg-primary/25 backdrop-blur-md">
        {/* Settings Option */}
        <Link
          to="/settings"
          onClick={() => setSelected("settings")}
          className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid group flex flex-row gap-3 items-center justify-center text-base-content rounded-xl ${
            selected === "settings" ? "bg-primary/50" : ""
          }`}
        >
          <Settings className="w-6 h-6 peer-hover:scale-110 transition-all duration-300" />
        </Link>

        {/* Chat/Home Option - Circular */}
        <Link
          to="/"
          onClick={() => setSelected("chat")}
          className={`relative w-96 h-16 p-4 ease-in-out duration-300 border-solid group border-primary/30 flex items-center  justify-center text-base-content rounded-3xl cursor-pointer border ${
            selected === "chat" ? "bg-primary/10 hover:bg-primary/50" : "bg-transparent"
          }`}
        >
          <MessageSquare className="w-6 h-6 peer-hover:scale-110 transition-all duration-300" />
        </Link>

        {/* Profile Option */}
        <Link
          to="/profile"
          onClick={() => setSelected("profile")}
          className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid group flex flex-row gap-3 items-center justify-center text-base-content rounded-xl ${
            selected === "profile" ? "bg-primary/50" : ""
          }`}
        >
          <User className="w-6 h-6 peer-hover:scale-110 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
