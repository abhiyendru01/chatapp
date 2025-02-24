import { useState, useRef } from "react";
import { Image, Send, Mic, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";

// Socket for real-time communication
io();

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [, setAudioUrl] = useState(null); // URL for the uploaded audio
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { sendMessage } = useChatStore();

  // Function to send audio to the backend
  const sendAudioToServer = async (audioFile) => {
    const formData = new FormData();
    formData.append("audio", audioFile);
  
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
      
      const response = await fetch(`${API_URL}/api/messages/upload-audio`, {
        method: "POST",
        body: formData,
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const data = await response.json();
      console.log("Audio uploaded successfully:", data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading audio:", error);
      return null;
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;
  
    // Upload the audio to the server and get the URL
    let audioUrl = null;
    if (audioBlob) {
      audioUrl = await sendAudioToServer(audioBlob); // Upload audio
    }
  
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        audio: audioUrl, // Send the audio URL
      });
  
      setText("");
      setImagePreview(null);
      setAudioBlob(null); // Clear the audio blob after sending
      setAudioUrl(null); // Clear the audio URL after sending
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceNoteClick = () => {
    if (isRecording) {
      stopRecording(); // Stop recording if already recording
    } else {
      startRecording(); // Start recording
    }
  };

  return (
    <div className="p-4 w-full border-t bg-base-200 border-base-300 backdrop-blur-md shadow-lg ">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300
              flex items-center justify-center text-sm"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {audioBlob && (
        <div className="mb-3 flex items-center gap-2">
          {/* Display the waveform of the recorded audio */}
          <div className="flex flex-col items-center w-full">
            <div className="text-xs text-base-content/70">Voice Recording</div>
            <div className="w-full h-2 bg-base-300/60 rounded-md mt-1">
              {/* Use a simple bar to simulate the recording progress */}
              <div className="w-full h-full bg-primary/70"></div>
            </div>
          </div>
          <button
            onClick={() => setAudioBlob(null)}
            className="btn btn-circle bg-base-300 hover:bg-base-400 text-base-content"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        {/* Voice Note Button */}
        <button
          type="button"
          className={`btn btn-circle ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-base-100/80 hover:bg-base-200"
          } text-base-content shadow-lg`}
          onClick={handleVoiceNoteClick}
        >
          <Mic size={20} />
        </button>

        {/* Input Field */}
        <div className="flex-1">
          <input
            type="text"
            className="w-full input input-bordered bg-base-100/80 backdrop-blur-md text-base-content rounded-lg placeholder:text-base-content/70"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          type="button"
          className="btn btn-circle bg-base-100/60 hover:bg-base-200 text-base-content shadow-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-circle bg-base-100/60 hover:bg-base-200 text-base-content shadow-lg"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
