import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Mic, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { sendMessage } = useChatStore();

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

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        audio: audioBlob, // Include the audio blob in the message
      });

      setText("");
      setImagePreview(null);
      setAudioBlob(null); // Clear the audio blob after sending
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
      stopRecording();
    } else {
      startRecording();
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
          <audio controls src={URL.createObjectURL(audioBlob)} />
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