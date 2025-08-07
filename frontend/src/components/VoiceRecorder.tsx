import React, { useState, useRef } from "react";

const VoiceRecorder: React.FC<{ onTranscription: (text: string) => void }> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendToWhisper(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording...");
    } catch (error) {
      console.error("🎙️ Microphone access error:", error);
      setStatus("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processing...");
    }
  };

  const sendToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const res = await fetch("http://localhost:8000/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.transcript) {
        onTranscription(data.transcript);
        setStatus("✅ Transcription complete.");
      } else {
        setStatus("⚠️ No transcription received.");
      }
    } catch (error) {
      console.error("❌ Whisper API error:", error);
      setStatus("❌ Failed to transcribe.");
    }
  };

  return (
    <div className="my-4 flex items-center space-x-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-lg text-white font-medium ${
          isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isRecording ? "⏹ Stop" : "🎤 Record"}
      </button>
      <span className="text-sm text-gray-600">{status}</span>
    </div>
  );
};

export default VoiceRecorder;