"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
import { FaFacebookF, FaInstagram, FaPinterestP } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="left-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]">
      <div className="flex w-2/3 max-w-4xl flex-col overflow-hidden rounded-3xl bg-white/5 shadow-2xl backdrop-blur-xl lg:flex-row">
        {/* Left Panel */}
        <div className="hidden w-full flex-col justify-center p-10 text-white lg:flex lg:w-1/2">
          <h1 className="mb-4 font-bold text-5xl">Welcome!</h1>
          <p className="text-blue-100 text-sm">Connect with your team and collaborate instantly.</p>
        </div>

        {/* Right Panel - Login */}
        <div className="w-full p-10 lg:w-1/2">
          <h2 className="mb-6 text-center font-semibold text-3xl text-white">Sign in</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="mb-1 block text-blue-100 text-sm">
                User Name
              </label>
              <input
                id="username"
                type="text"
                placeholder="Your username"
                className="w-full rounded-md border border-transparent bg-white/10 px-4 py-2 text-white placeholder:text-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {/* <div>
              <label htmlFor="password" className="mb-1 block text-blue-100 text-sm">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-md border border-transparent bg-white/10 px-4 py-2 text-white placeholder:text-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div> */}

            {/* Submit */}
            <LoginLink
              className="w-full rounded-md bg-gradient-to-r from-blue-500 to-blue-400 px-4 py-2 text-center font-bold text-sm text-white shadow-lg transition hover:opacity-90"
              type="LoginLink"
            >
              Submit
            </LoginLink>

            {/* Sign in with Google */}
            <div className="mt-4 text-center">
              <LoginLink
                authUrlParams={{ connection_id: "google" }}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-2 font-semibold text-sm text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M533.5 278.4c0-18.3-1.5-36.1-4.4-53.2H272v100.8h146.9c-6.4 34.6-25.5 63.9-54.4 83.6l88 68.4c51.4-47.3 80.9-117 80.9-199.6z"
                    fill="#4285F4"
                  />
                  <path
                    d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-88-68.4c-24.4 16.4-55.6 26.1-90.1 26.1-69 0-127.4-46.6-148.3-109.1l-91.7 70.8c42.7 84.1 130.5 145.9 239.9 145.9z"
                    fill="#34A853"
                  />
                  <path d="M123.7 327.5c-10.1-30-10.1-62.5 0-92.5L32 164.2C-10.7 248.4-10.7 359.9 32 444.1l91.7-70.8z" fill="#FBBC05" />
                  <path
                    d="M272 107.7c37.3-.6 73.3 12.9 101 37.8l75.4-75.4C404.3 24.4 340.2-1.3 272 0 162.6 0 74.7 61.8 32 145.9l91.7 70.8C144.6 154.2 203 107.7 272 107.7z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </LoginLink>
            </div>
          </form>

          {/* Social Icons */}
          <div className="mt-6 flex justify-center gap-4 text-white">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
              <FaFacebookF />
            </a>
            <a href="/" className="hover:text-blue-300">
              <FaInstagram />
            </a>
            <a href="/" className="hover:text-blue-300">
              <FaPinterestP />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
