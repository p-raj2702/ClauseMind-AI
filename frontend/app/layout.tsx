// src/app/layout.tsx
import '../src/index.css';  // ✅ correct relative path
import "./globals.css";
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "Insurance AI Query System",
  description: "LLM-powered intelligent document analysis",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-white text-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-900 text-white p-6 space-y-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">💼 InsureAI</h2>
          <nav className="space-y-4">
            <Link href="/" className="block hover:text-blue-300">🏠 Home</Link>
            <Link href="/upload" className="block hover:text-blue-300">📤 Upload</Link>
            <Link href="/query" className="block hover:text-blue-300">🔍 Query</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}