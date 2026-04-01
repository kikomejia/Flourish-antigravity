import React, { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    // Inject PWA manifest dynamically
    const manifestData = {
      name: "Flourish",
      short_name: "Flourish",
      description: "A daily virtue practice app",
      start_url: "/",
      display: "standalone",
      scope: "/",
      background_color: "#050508",
      theme_color: "#f3afee",
      orientation: "portrait-primary",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestData)], { type: "application/json" });
    const manifestUrl = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = manifestUrl;

    // Add PWA meta tags for fullscreen display
    const addMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    addMetaTag('apple-mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMetaTag('apple-mobile-web-app-title', 'Flourish');

    // Inject as the very last style in <head> to win the cascade over everything
    const style = document.createElement('style');
    style.id = 'app-bg-override';
    style.textContent = `
      html, body, #root {
        background-color: #050508 !important;
      }
      body {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
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