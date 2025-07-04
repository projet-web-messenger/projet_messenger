"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "My Account",
      href: "/settings/account",
    },
    {
      title: "Profile",
      href: "/settings/profile",
    },
  ];

  const appSettings = [
    {
      title: "Appearance",
      href: "/settings/appearance",
    },
    {
      title: "Chat",
      href: "/settings/chat",
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
    },
  ];

  const isActive = (href: string) => pathname === href;

  const linkClasses = (active: boolean) =>
    `${active ? "bg-gray-200 dark:bg-white/20 px-3 py-2 rounded-sm" : "hover:bg-gray-100 py-2 px-3 rounded-sm dark:hover:bg-white/10 rounded-sm px-2 py-2"} text-left`;

  return (
    <>
      {/* Overlay mobile */}
      {show && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onClose();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed z-40 h-screen w-48 transform border-r bg-white p-4 transition-transform duration-300 md:static dark:border-white/10 dark:bg-white/10 ${
          show ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-500 text-xs dark:text-blue-100">USER SETTINGS</h2>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl md:hidden dark:text-white">
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2 font-medium text-sm">
          {navItems.map(({ title, href }) => (
            <Link href={href} key={href} className={linkClasses(isActive(href))}>
              {title}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-gray-200 border-t pt-4 dark:border-white/10">
          <h2 className="mb-2 font-bold text-gray-500 text-xs dark:text-blue-100">APP SETTINGS</h2>
          <nav className="flex flex-col gap-2 font-medium text-sm">
            {appSettings.map(({ title, href }) => (
              <Link href={href} key={href} className={linkClasses(isActive(href))}>
                {title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
