import { Link } from "react-router-dom";
import { Settings, User } from "lucide-react";

const Footer = () => {
  return (
    <div className="flex justify-center items-center relative transition-all duration-[450ms] ease-in-out w-full p-4">
      <div className="border border-primary-60 w-full ease-in-out duration-500 left-0 rounded-2xl flex shadow-lg bg-primary/25 backdrop-blur-md">
        {/* Dashboard Option */}
        <Link
          to="/settings"
          className="relative w-full h-16 p-4 ease-in-out duration-300 border-solid group flex flex-row gap-3 items-center justify-center text-base-content rounded-xl"
        >
          <Settings className="w-6 h-6 peer-hover:scale-110 transition-all duration-300" />
        </Link>
        <label
          className="relative w-full h-16 p-4 ease-in-out duration-300 border-solid group flex flex-row gap-3 items-center justify-center text-base-300 rounded-xl cursor-pointer"
          htmlFor="dashboard"
        >
          <input id="dashboard" name="path" type="radio" className="hidden peer" />
          <svg
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="peer-hover:scale-110 peer-hover:text-base-300 peer-checked:text-base-300 text-2xl peer-checked:scale-110 transition-all duration-300"
          >
            <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z" />
          </svg>
        </label>

        {/* Settings Option */}
       

        {/* Profile Option */}
        <Link
          to="/profile"
          className="relative w-full h-16 p-4 ease-in-out duration-300 border-solid group flex flex-row gap-3 items-center justify-center text-base-content rounded-xl"
        >
          <User className="w-6 h-6 peer-hover:scale-110 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
