"use client";

import Sidebar from "@/components/app/sidebar";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";

export default async function Page() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [displayName, setDisplayName] = useState("Toto");
  const [pronouns, setPronouns] = useState("Sonia");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-100 font-sans text-gray-800 md:flex-row dark:bg-[#0f172a] dark:text-white">
      {/* ⚙️ Settings Button (mobile only) */}
      <button type="button" onClick={() => setShowSidebar(true)} className="fixed top-4 right-4 z-40 rounded-full bg-white p-2 md:hidden dark:bg-white/10">
        <IoSettingsSharp className="text-gray-700 text-xl dark:text-white" />
      </button>

      {/* Sidebar Overlay (mobile only) */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setShowSidebar(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowSidebar(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 dark:bg-white/10">
        <h1 className="mb-6 font-bold text-2xl">My Account</h1>
        {/* Onglets (Security / Standing) */}
        <div className="mb-6 flex gap-6 border-gray-300 border-b font-medium text-sm dark:border-white/20">
          <button type="button" className="border-black border-b-2 pb-2 text-black dark:text-white">
            Security
          </button>
          <button type="button" className="pb-2 text-gray-500 hover:text-black dark:text-blue-200 dark:hover:text-white">
            Standing
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white px-4 py-4">
          <div className="grid grid-cols-1 gap-8 px-2 py-4 md:grid-cols-2">
            {/* 📝 Formulaire */}
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Informations validées !");
              }}
            >
              <div className="border-gray-200 border-b pb-6 dark:border-white/10">
                <label htmlFor="displayName" className="mb-1 block font-medium text-gray-700 text-sm dark:text-blue-100">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm focus:outline-none dark:bg-white/10"
                />
              </div>

              <div className="border-gray-200 border-b pb-6 dark:border-white/10">
                <label htmlFor="pronouns" className="mb-1 block font-medium text-gray-700 text-sm dark:text-blue-100">
                  Pronouns
                </label>
                <input
                  id="pronouns"
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="Add your pronouns"
                  className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm focus:outline-none dark:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <button type="submit" className="rounded-sm bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
                  Valider
                </button>
                {/* <button
                                type="submit"
                                className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-sm transition"
                            >
                                Valider
                            </button> */}
              </div>
            </form>

            {/* 👁️ Aperçu Dynamique */}
            <div>
              <h2 className="mb-2 font-medium text-gray-700 text-sm dark:text-blue-100">Preview</h2>

              <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-gray-300 shadow-lg dark:bg-white/10">
                <div className="relative h-20 rounded-t-xl bg-orange-400 dark:bg-orange-500">
                  <div className="-bottom-6 absolute left-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white dark:border-white/20">
                    <img src="/discord-logo.svg" alt="Avatar" className="h-8 w-8" />
                    <span className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                  </div>
                </div>

                <div className="pt-10 text-left">
                  <h3 className="font-semibold text-lg">{displayName || "Your Name"}</h3>
                  <h4 className="font-semibold text-lg">{pronouns || "Your Name"}</h4>
                  <button
                    type="button"
                    className="rounded-sm bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  >
                    Example Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
