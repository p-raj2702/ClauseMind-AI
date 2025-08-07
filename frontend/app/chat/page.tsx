"use client";

import React, { useState, useRef, useEffect } from "react";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const replyContent = data.reply || "⚠️ No response received.";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: replyContent,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      console.error("Chat error", err);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "❌ Error contacting server.",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
        💬 Insurance Chat Advisor
      </h1>

      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-6 space-y-4">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-green-100 text-left"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="p-3 rounded-lg bg-yellow-100 text-left text-sm">
              ⏳ Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex space-x-2">
          <input
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none"
            type="text"
            placeholder="Type your insurance query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={sendMessage}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}