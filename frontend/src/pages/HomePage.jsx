import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const isMobile = window.innerWidth < 768; 

  return (
    <div className="h-screen w-full bg-base-300 relative">
      <div className="flex items-center justify-center pt-16 w-full px-0 2lg:px-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-screen-xl h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden">
            {/* Sidebar: Full width in mobile, fixed width in desktop */}
            {!selectedUser || window.innerWidth >= 768 ? (
              <Sidebar className="md:w-full w-full md:block flex-1" />
            ) : null}

            {/* ChatContainer with Framer Motion for slide-up effect only on mobile */}
            {selectedUser ? (
              isMobile ? (
                <motion.div
                  className="flex-1 flex h-full"
                  initial={{ y: "100%", opacity: 0 }}  
                  animate={{ y: 0, opacity: 1 }}    
                  exit={{ y: "100%", opacity: 0 }}    
                  transition={{
                    type: "spring",                 
                    stiffness: 50,                   
                    damping: 20,                    
                    mass: 1,                         
                    duration: 0.5,                   
                  }}
                >
                  <ChatContainer className="h-full w-full" />
                </motion.div>
              ) : (
                <div className="flex-1 flex h-full">
                  <ChatContainer className="h-full w-full" />
                </div>
              )
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
