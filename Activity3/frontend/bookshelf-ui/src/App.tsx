import { useState } from "react";
import Books from "./Books";
import Authors from "./Authors";
import Categories from "./Categories";
import ManageBooks from "./ManageBooks";
import {
  BookOpen,
  Settings,
  User,
  Tag,
  Library,
} from "lucide-react";

export default function App() {
  const [tab, setTab] = useState<
    "books" | "authors" | "categories" | "manage"
  >("books");

  const tabs = [
    { id: "books", label: "Books", icon: <Library size={18} /> },
    { id: "manage", label: "Manage Books", icon: <Settings size={18} /> },
    { id: "authors", label: "Authors", icon: <User size={18} /> },
    { id: "categories", label: "Categories", icon: <Tag size={18} /> },
  ] as const;

  return (
    <div className="relative min-h-screen p-6 overflow-hidden">

      {/* ✅ Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 animate-[gradient_10s_ease_infinite] bg-[length:200%_200%]"></div>

      {/* ✅ Floating Decoration Shapes */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-ping"></div>

      {/* ✅ MAIN CONTENT */}
      <div className="relative max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg">
            📚 Bookshelf Library
          </h1>
          <p className="text-gray-700 mt-2 text-sm tracking-wide">
            Explore, manage, and organize your digital library.
          </p>

          {/* ✅ Mini Shelf Bar under header */}
          <div className="mx-auto mt-4 w-64 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
        </header>

        {/* NAVIGATION */}
        <nav className="mb-8">
          <div className="flex bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden relative">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center justify-center gap-2 px-6 py-4 w-full font-medium text-sm transition-all duration-300
                    ${
                      active
                        ? "bg-indigo-600 text-white shadow-inner scale-[1.03]"
                        : "text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 hover:scale-[1.01]"
                    }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}

            {/* ✅ Sliding Active Underline */}
            <div
              className="absolute bottom-0 h-[3px] bg-indigo-600 transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                left: `${tabs.findIndex((t) => t.id === tab) * (100 / tabs.length)}%`,
              }}
            ></div>
          </div>
        </nav>

        {/* ✅ CONTENT CARD WITH ANIMATION */}
        <main
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40 animate-[fadeUp_0.6s_ease]"
        >
          {tab === "books" && <Books />}
          {tab === "manage" && <ManageBooks />}
          {tab === "authors" && <Authors />}
          {tab === "categories" && <Categories />}
        </main>
      </div>

      {/* ✅ TAILWIND KEYFRAMES */}
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
