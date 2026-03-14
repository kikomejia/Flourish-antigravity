import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        html, body, #root {
          background-color: #050508 !important;
          min-height: 100%;
          overscroll-behavior: none;
        }
        body::before, body::after {
          content: '';
          display: block;
          position: fixed;
          left: 0;
          right: 0;
          height: 50vh;
          background-color: #050508;
          z-index: -1;
        }
        body::before { top: -50vh; }
        body::after { bottom: -50vh; }
      `}</style>
      {children}
    </>
  );
}