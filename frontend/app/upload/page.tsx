"use client";

import React, { useState } from "react";
import { Inbox, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log("✅ Upload successful:", data);
      setMessage("✅ Upload successful! Parsed " + data.num_clauses + " clauses.");
    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefce8] via-[#fef3c7] to-[#fde68a] flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-100 p-10 w-full max-w-xl space-y-8 transition duration-300">
        <h1 className="text-4xl font-extrabold text-center text-[#78350f] tracking-tight">
          📤 Upload Policy Document
        </h1>

        <label
          htmlFor="file-upload"
          className="cursor-pointer border-2 border-dashed border-yellow-300 bg-white/50 backdrop-blur-sm p-8 rounded-xl w-full flex flex-col items-center justify-center space-y-3 hover:shadow-lg transition"
        >
          {file ? (
            <>
              <FileText className="h-10 w-10 text-yellow-700" />
              <p className="text-yellow-800 font-semibold text-center">{file.name}</p>
            </>
          ) : (
            <>
              <Inbox className="h-12 w-12 text-yellow-600" />
              <p className="text-yellow-800 mt-2 font-medium">Click to select a PDF file</p>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-5 text-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
        </Button>

        {message && (
          <div className="text-center text-sm font-medium text-yellow-800 mt-2">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}