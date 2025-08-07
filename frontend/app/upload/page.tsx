"use client";

import React, { useState } from "react";
import { Inbox, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    console.log("Uploading:", file.name);
    // ✅ Replace with your backend upload logic
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
          disabled={!file}
          className="w-full py-5 text-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          🚀 Upload & Process
        </Button>
      </div>
    </div>
  );
}