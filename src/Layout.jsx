import React, { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    // Inject as the very last style in <head> to win the cascade over everything
    const style = document.createElement('style');
    style.id = 'app-bg-override';
    style.textContent = `
      html, body, #root {
        background-color: #050508 !important;
      }
    `;
    document.head.appendChild(style);
    // Also set inline style directly on html element
    document.documentElement.style.backgroundColor = '#050508';
    document.body.style.backgroundColor = '#050508';
    return () => {
      const el = document.getElementById('app-bg-override');
      if (el) el.remove();
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#050508", minHeight: "100dvh" }}>
      {children}
    </div>
  );
}