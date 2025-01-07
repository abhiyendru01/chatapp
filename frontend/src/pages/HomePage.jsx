import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-full bg-base-300">
      <div className="flex items-center justify-center pt-16 w-full px-0 2lg:px-2">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-screen-xl h-[calc(100vh-4rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {selectedUser ? <ChatContainer /> : <NoChatSelected />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
