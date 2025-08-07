"use client";

import React, { useState } from "react";
import {
  Inbox,
  Loader2,
  CheckCircle,
} from "lucide-react";
import ClauseCard from "@/components/ClauseCard";
import VoiceRecorder from "@/components/VoiceRecorder";
import Link from "next/link";

interface Clause {
  text: string;
  justification: string;
  source: string;
  summary: string;
  confidence: number;
}

interface AlternatePlan {
  name: string;
  clause: string;
  confidence: number;
}

interface Decision {
  eligible: boolean;
  reason: string;
  next_eligible_in_days?: number;
  amount?: number;
}

interface QueryResult {
  clauses: Clause[];
  decision?: Decision;
  alternate_plan?: AlternatePlan;
}

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || !file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("pdf", file);

      const response = await fetch("http://127.0.0.1:8000/api/query", {
        method: "POST",
        body: formData,
      });

      const data: QueryResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Query failed", err);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscription = (transcript: string) => {
    setQuery((prev) => (prev ? prev + " " + transcript : transcript));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#fefce8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-[#1e3a8a] tracking-tight">
          🧠 Insurance Query Assistant
        </h1>

        <div className="text-center">
          <Link href="/chat">
            <button className="px-5 py-2 rounded-full bg-[#22c55e] text-white font-semibold shadow hover:bg-[#16a34a] transition">
              💬 Ask a Question
            </button>
          </Link>
        </div>

        <textarea
          className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#60a5fa] focus:outline-none shadow-sm"
          rows={4}
          placeholder="Enter your query (e.g., 46M, knee surgery, Pune, 3-month policy)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* 🎤 Voice Input */}
        <div className="flex items-center justify-between gap-2">
          <VoiceRecorder onTranscription={handleTranscription} />
          {transcribing && (
            <div className="text-sm text-blue-600 flex items-center gap-1">
              <Loader2 className="animate-spin w-4 h-4" /> Transcribing...
            </div>
          )}
        </div>

        <label
          htmlFor="file-upload"
          className="cursor-pointer border-2 border-dashed border-gray-400 bg-white/30 backdrop-blur-md p-6 rounded-xl w-full flex flex-col items-center gap-2 hover:bg-gray-100 transition"
        >
          <Inbox className="h-10 w-10 text-gray-500" />
          <p className="text-gray-800">
            {file ? file.name : "Click to select a PDF policy file"}
          </p>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-[#2563eb] text-white font-medium rounded-xl hover:bg-[#1d4ed8] transition shadow-lg disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "🚀 Submit Query"}
        </button>

        {/* ✅ Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {result?.decision && (
              <div className="bg-white border-l-4 border-green-500 p-4 rounded-xl shadow">
                <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Decision
                </h2>
                <p className="mt-2 text-gray-700">
                  ✅ <strong>Eligible:</strong> {result?.decision?.eligible ? "Yes" : "No"}
                </p>
                <p className="text-gray-700">
                  📌 <strong>Reason:</strong> {result?.decision?.reason || "—"}
                </p>
                {result?.decision?.next_eligible_in_days && (
                  <p className="text-yellow-700 font-medium">
                    🕒 Eligible after {result.decision.next_eligible_in_days} day(s)
                  </p>
                )}
                {result?.decision?.amount && (
                  <p className="text-purple-700 font-bold text-lg">
                    💰 Coverage: ₹{result.decision.amount}
                  </p>
                )}
              </div>
            )}

            {result?.alternate_plan && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  📄 Suggested Alternate Plan
                </h2>
                <p className="text-gray-800 mt-1">
                  📘 <strong>{result.alternate_plan.name}</strong>
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  <strong>Matched Clause:</strong> {result.alternate_plan.clause}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  🔍 Confidence: {result.alternate_plan.confidence}%
                </p>
              </div>
            )}

            {result?.clauses?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">📜 Supporting Clauses</h2>
                <div className="space-y-4">
                  {result.clauses.map((clause, idx) => (
                    <ClauseCard
                      key={idx}
                      clauseText={clause.text}
                      justification={clause.justification}
                      sourceFile={clause.source}
                      summary={clause.summary}
                      confidence={clause.confidence}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}