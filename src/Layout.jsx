import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        html, body, #root {
          background-color: #050508 !important;
          height: 100%;
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#050508", zIndex: -1 }} />
      {children}
    </>
  );
}