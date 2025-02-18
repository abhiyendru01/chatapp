import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"; // Import Navbar

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Default mobile detection state

  // Detect screen size on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-full bg-base-300 relative">
      {/* Pass isChatSelected to Navbar */}
      <Navbar isChatSelected={selectedUser && isMobile} />

      <div className="flex items-center justify-center pt-16 w-full px-0 2lg:px-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-screen-xl h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden">
            {/* Sidebar: Full width in mobile, fixed width in desktop */}
            {(!selectedUser || !isMobile) ? (
              <Sidebar className="md:w-full w-full md:block flex-1" />
            ) : null}

            {/* ChatContainer with fullscreen behavior */}
            {selectedUser ? (
              <div
                className={`flex-1 flex h-full ${isMobile ? "w-full h-full" : "h-full"}`}
              >
                <ChatContainer className="h-full w-full" />
              </div>
            ) : (
              <NoChatSelected className="h-full w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Footer: Visible only when no user is selected, fixed at the bottom */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0`}>
        {!selectedUser && <Footer />}
      </div>
    </div>
  );
};

export default HomePage;
