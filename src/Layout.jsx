import React, { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', '#050508', 'important');
    document.body.style.setProperty('background-color', '#050508', 'important');
  }, []);

  return (
    <div style={{ backgroundColor: "#050508", minHeight: "100dvh" }}>
      {children}
    </div>
  );
}