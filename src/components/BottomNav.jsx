import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";

export default function BottomNav({ active }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex rounded-full overflow-hidden"
        style={{ background: "rgba(20,10,30,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          to="/Daily"
          className="flex flex-col items-center px-10 py-3 transition-colors"
          style={{ color: active === "daily" ? "white" : "rgba(255,255,255,0.35)" }}
        >
          <Calendar size={20} />
          <span className="text-xs mt-0.5">Daily</span>
          {active === "daily" && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
        </Link>
        <Link
          to="/You"
          className="flex flex-col items-center px-10 py-3 transition-colors"
          style={{ color: active === "you" ? "white" : "rgba(255,255,255,0.35)" }}
        >
          <User size={20} />
          <span className="text-xs mt-0.5">You</span>
          {active === "you" && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
        </Link>
      </div>
    </div>
  );
}