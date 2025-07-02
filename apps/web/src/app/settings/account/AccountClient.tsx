"use client";

import Sidebar from "@/components/app/sidebar";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import type { Dict } from "@repo/utils/types";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";

type AccountClientProps = {
  userInfo: KindeUser<Dict>;
};

export default function AccountClient({ userInfo }: AccountClientProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-100 font-sans text-gray-800 md:flex-row dark:bg-[#0f172a] dark:text-white">
      {/* ⚙️ Settings Button (mobile only) */}
      <button
        type="button"
        onClick={() => setShowSidebar(true)}
        className="fixed top-4 right-4 z-40 rounded-full bg-white p-2 shadow-md md:hidden dark:bg-white/10"
      >
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
      <main className="flex-1 p-6 md:p-8">
        <h1 className="mb-6 font-bold text-2xl">My Account</h1>

        {/* Tabs */}
        <div className="mb-4 flex border-gray-300 border-b font-medium text-sm dark:border-white/20">
          <button type="button" className="mr-4 border-indigo-500 border-b-2 pb-2 text-indigo-600 dark:text-indigo-400">
            Security
          </button>
          <button type="button" className="pb-2 text-gray-500 hover:text-indigo-600 dark:text-blue-200 dark:hover:text-indigo-400">
            Standing
          </button>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-white p-6 shadow dark:bg-white/10">
          <div className="relative h-24 rounded-t-xl bg-orange-400 dark:bg-orange-500" />

          <div className="ml-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-orange-500 font-bold text-3xl text-white shadow-md dark:border-white/20">
            🎮
          </div>
          <div className="mt-8 flex-1 text-center md:text-left">
            <h2 className="mt-2 font-semibold text-xl">{`${userInfo?.given_name || ""} ${userInfo?.family_name || ""}`.trim() || "User"}</h2>
          </div>
          <div className="mt-8">
            <button type="button" className="mt-8 rounded-sm bg-blue-500 px-4 py-2 font-medium text-sm text-white transition hover:bg-blue-600">
              Edit User Profile
            </button>
          </div>
        </div>

        {/* Account details */}
        <div className="mt-6 space-y-4">
          {[
            { label: "Display Name", value: "Verdiane" },
            { label: "Username", value: "verdiane." },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-500 text-xs dark:text-blue-200">{label}</p>
                <p className="text-sm">{value}</p>
              </div>
              <button type="button" className="rounded rounded-sm bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20">
                Edit
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 mr-4 flex flex-col items-center gap-1 gap-x-4 pr-8 md:flex-row">
          <button type="button" className="mt-6 w-36 rounded-sm bg-red-500 px-3 py-2 font-medium text-white transition hover:bg-red-600">
            Delete Account
          </button>
          <button type="button" className="mt-6 w-36 rounded-sm bg-red-500 px-3 py-2 font-medium text-white transition hover:bg-red-600">
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
