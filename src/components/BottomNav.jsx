import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, BookOpen } from "lucide-react";

export default function BottomNav({ active }) {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
      <div
        className="flex rounded-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <Link
          to="/Daily"
          className="flex flex-col items-center px-10 py-3 transition-colors"
          style={{ color: active === "daily" ? "#f3afee" : "rgba(255,255,255,0.35)" }}
        >
          <Calendar size={20} />
          <span className="text-xs mt-0.5">Daily</span>
          {active === "daily" && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#f3afee" }} />}
        </Link>
        <Link
          to="/Learn"
          className="flex flex-col items-center px-10 py-3 transition-colors"
          style={{ color: active === "learn" ? "#f3afee" : "rgba(255,255,255,0.35)" }}
        >
          <BookOpen size={20} />
          <span className="text-xs mt-0.5">Learn</span>
          {active === "learn" && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#f3afee" }} />}
        </Link>
        <Link
          to="/You"
          className="flex flex-col items-center px-10 py-3 transition-colors"
          style={{ color: active === "you" ? "#f3afee" : "rgba(255,255,255,0.35)" }}
        >
          <User size={20} />
          <span className="text-xs mt-0.5">You</span>
          {active === "you" && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#f3afee" }} />}
        </Link>
      </div>
    </div>
  );
}