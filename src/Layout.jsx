import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        html, body, #root {
          background-color: #050508 !important;
          min-height: 100%;
        }
      `}</style>
      {children}
    </>
  );
}