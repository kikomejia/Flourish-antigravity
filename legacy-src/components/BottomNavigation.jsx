import React from 'react';

/**
 * BottomNavigation - Fixed navigation bar at the bottom for main app sections like 'Daily' and 'You'.
 *
 * Auto-generated from captured website.
 * Key elements: nav links, Daily link, You link
 * Styling: fixed positioning, bottom-6, centered with -translate-x-1/2, max-width
 */
const BottomNavigation = ({
  navItems = ''
}) => {
  return (
    <>
      {/* BottomNavigation - Fixed navigation bar at the bottom for main app sections like 'Daily' and 'You'. */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-4 shadow-2xl z-50"><button className="flex flex-col items-center gap-0.5 group relative w-16"><svg aria-hidden="true" className="lucide lucide-calendar w-6 h-6 text-primary" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M3 10h18"></path></svg><span className="text-[10px] font-bold text-primary">Daily</span><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div></button><div className="h-8 w-px bg-slate-700/50"></div><button className="flex flex-col items-center gap-0.5 group relative w-16"><svg aria-hidden="true" className="lucide lucide-user w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><span className="text-[10px] font-bold text-slate-400">You</span></button></nav>
    </>
  );
};

export default BottomNavigation;