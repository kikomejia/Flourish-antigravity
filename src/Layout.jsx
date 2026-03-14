import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        html {
          background-color: #050508 !important;
          height: 100%;
        }
        body, #root {
          background-color: #050508 !important;
          min-height: 100%;
          min-height: -webkit-fill-available;
        }
      `}</style>
      {children}
    </>
  );
}