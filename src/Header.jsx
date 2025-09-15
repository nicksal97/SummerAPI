import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoPng from "./logo-1.png";

const FALLBACK_LOGO = "/logo192.png"; // fallback if logo missing

export default function Header({
  isNotificationOpen,
  progress,
  converted,
  setIsNotificationOpen,
  showLoader,
  onBurgerClick,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [broken, setBroken] = useState(false);

  const go = (path) => () => navigate(path);

  const activePill = (isActive) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      isActive ? "bg-white text-indigo-600" : "bg-white/90 text-indigo-700 hover:bg-white"
    }`;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 text-white shadow-md flex items-center"
      style={{
        backgroundImage: "linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)",
        height: "64px",
      }}
      role="banner"
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={go("/")}
          className="flex items-center gap-3 min-w-[180px] focus:outline-none"
          aria-label="Go to Home"
          title="Home"
        >
          <div
            className="h-8 w-8 rounded-md bg-white/10 grid place-items-center overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)" }}
          >
            {!broken ? (
              <img
                src={logoPng}
                alt="must analytics"
                className="h-7 w-7 object-contain select-none"
                draggable="false"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_LOGO;
                  setBroken(true);
                }}
              />
            ) : (
              <img
                src={FALLBACK_LOGO}
                alt="must analytics"
                className="h-7 w-7 object-contain select-none"
                draggable="false"
              />
            )}
          </div>
          <span className="text-lg font-bold whitespace-nowrap">must analytics</span>
        </button>

        {/* Center nav - Removed entirely since Home button is removed */}
        <nav className="hidden md:flex items-center gap-3" aria-label="Primary">
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2" aria-label="User">
          <button
            type="button"
            onClick={go("/notifications")}
            className="bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition"
            title="Notifications"
            aria-label="Notifications"
          >
            🔔
          </button>
          <button
            type="button"
            onClick={go("/account")}
            className="bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition"
            title="Account"
            aria-label="Account"
          >
            👤
          </button>
          <button
            type="button"
            onClick={onBurgerClick}
            className="text-2xl md:hidden"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}