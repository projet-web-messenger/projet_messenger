"use client";

import Sidebar from "@/components/app/sidebar";
import { useTheme } from "next-themes";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";

export default function AppearancePage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { setTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-100 font-sans text-gray-800 md:flex-row dark:bg-[#0f172a] dark:text-white">
      {/* ⚙️ Bouton mobile pour afficher la sidebar */}
      <button
        type="button"
        onClick={() => setShowSidebar(true)}
        className="fixed top-4 right-4 z-40 rounded-full bg-white p-2 shadow-md md:hidden dark:bg-white/10"
      >
        <IoSettingsSharp className="text-gray-700 text-xl dark:text-white" />
      </button>

      {/* Overlay sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setShowSidebar(false)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowSidebar(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* MAIN Content */}
      <main className="flex-1 bg-white p-6 md:p-8 dark:bg-white/5">
        <h1 className="mb-6 font-bold text-2xl">Appearance</h1>

        {/* APERCU DU CHAT */}
        <div className="mb-6 max-w-3xl rounded-lg border border-gray-200 bg-white p-4 dark:border-white/20 dark:bg-white/10">
          <div className="mb-2 flex items-start gap-3">
            <div className="text-2xl">🟠</div>
            <div>
              <div className="font-semibold">
                Verdiane <span className="ml-1 text-gray-500 text-sm">11:30 AM</span>
              </div>
              <p className="text-sm">
                Look at me I'm a beautiful butterfly 🦋<br />
                Fluttering in the sunlight 🌞
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🟠</div>
            <div>
              <div className="font-semibold">
                Verdiane <span className="ml-1 text-gray-500 text-sm">11:30 AM</span>
              </div>
              <p className="text-sm">
                Waiting for the day when
                <br />
                Compact mode would be turned on
              </p>
            </div>
          </div>
        </div>

        {/* THEME CHOICES */}
        <section className="max-w-2xl">
          <h2 className="mb-2 font-semibold text-lg">Theme</h2>
          <p className="mb-4 text-gray-600 text-sm dark:text-gray-300">Adjust the color of the interface for better visibility.</p>
          <div className="mb-6 flex gap-4">
            {["#FFFFFF", "#333333"].map((t) => (
              <div
                key={t}
                onClick={() => setTheme(t === "#FFFFFF" ? "light" : "dark")}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setTheme(t === "#FFFFFF" ? "light" : "dark");
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${t} theme`}
                style={{ backgroundColor: t }}
                className="h-10 w-10 cursor-pointer rounded-full border-2 ring-indigo-300 hover:ring-2"
              />
            ))}
            <button
              onClick={() => {
                setTheme("system");
              }}
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-400 text-xl"
            >
              ↻
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm">Dark Sidebar</p>
            <div className="flex h-5 w-10 items-center rounded-full bg-gray-300 px-1">
              <div className="h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
