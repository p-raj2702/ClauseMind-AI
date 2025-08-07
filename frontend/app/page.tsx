"use client";

import React from "react";
import ClauseCard, { ClauseCardProps } from "@/components/ClauseCard";

const sampleClause: ClauseCardProps = {
  clauseText: `<mark>Hospitalisation</mark> is covered for up to ₹50,000 provided prior authorization is received. However, <mark>cosmetic surgeries</mark> and <mark>pre-existing conditions</mark> are excluded unless stated otherwise.`,
  justification:
    "This clause clearly states that only hospitalization with pre-authorization is covered, and excludes cosmetic procedures.",
  sourceFile: "StarHealth-Policy.pdf",
  summary: "Coverage is limited to hospitalization with exclusions for cosmetic or pre-existing issues.",
  confidence: 87.2,
  relevance_score: 90.5,
  clarity_score: 88.0,
  explanation_score: 85.7,
};

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Welcome to ClauseMind-AI 🧠
      </h1>
      <p className="text-gray-700 text-lg mb-8 max-w-2xl">
        We analyze your insurance clauses, summarize them, and help you understand
        your claim eligibility with AI.
      </p>

      <ClauseCard {...sampleClause} />
    </main>
  );
};

export default HomePage;