"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

// 🧠 Props type definition
export interface ClauseCardProps {
  clauseText: string;
  justification: string;
  sourceFile: string;
  summary?: string;
  confidence?: number;
  relevance_score?: number;
  clarity_score?: number;
  explanation_score?: number;
}

const ClauseCard: React.FC<ClauseCardProps> = ({
  clauseText,
  justification,
  sourceFile,
  summary,
  confidence,
  relevance_score,
  clarity_score,
  explanation_score,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const toggleSummary = () => setShowSummary((prev) => !prev);

  const splitIntoSentences = (text: string): string[] => {
    return text
      .split(/(?<=[.?!])\s+(?=<mark>|[A-Z])/) // Keeps highlighted spans & capital sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const sentences = splitIntoSentences(clauseText);

  const renderScoreBar = (
    label: string,
    value: number | undefined,
    color: string
  ) => {
    if (value === undefined) return null;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span>{label}</span>
          <span>{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl p-6 space-y-5 transition duration-300 hover:shadow-blue-300">
      {/* 🔖 Metadata row */}
      <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
        <div>
          📄 <span className="font-semibold text-gray-800">{sourceFile}</span>
        </div>
        {confidence !== undefined && (
          <div
            className="text-blue-700 flex items-center gap-1"
            title="Estimated match confidence"
          >
            <Info className="w-4 h-4" />
            <span className="font-semibold">Confidence:</span>{" "}
            {confidence.toFixed(1)}%
          </div>
        )}
      </div>

      {/* 🧾 Bullet points */}
      <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-xl border border-blue-100">
        <ul className="list-disc pl-6 text-base font-medium text-gray-900 space-y-2">
          {sentences.map((sentence, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: sentence }} />
          ))}
        </ul>
      </div>

      {/* ✅ Justification */}
      <div className="text-green-700 text-sm font-medium">
        ✅ Justification: <span className="text-gray-800">{justification}</span>
      </div>

      {/* 📊 Score bars */}
      <div className="space-y-2">
        {renderScoreBar("📊 Relevance Score", relevance_score, "bg-blue-500")}
        {renderScoreBar("🧠 Clarity Score", clarity_score, "bg-green-500")}
        {renderScoreBar("📈 Explanation Score", explanation_score, "bg-purple-500")}
      </div>

      {/* 📝 Summary toggle */}
      {summary && (
        <div className="mt-4">
          <button
            onClick={toggleSummary}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            title="Toggle summary"
          >
            📝 {showSummary ? "Hide Summary" : "Show Summary"}
            {showSummary ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showSummary && (
            <div className="mt-2 p-3 rounded-md bg-blue-100/70 text-blue-900 text-sm border border-blue-200">
              <span className="font-semibold">Summary:</span> {summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClauseCard;