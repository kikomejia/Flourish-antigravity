import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react";

const fontStyle = `
  @import url('https://api.fontshare.com/v2/css?f[]=recoleta@400,500,700&display=swap');
  * { font-family: 'Recoleta', serif !important; }
`;

function usePWAManifest() {
  useEffect(() => {
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

    const addMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) { meta = document.createElement('meta'); meta.name = name; document.head.appendChild(meta); }
      meta.content = content;
    };
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'Flourish');
    addMeta('mobile-web-app-capable', 'yes');
  }, []);
}
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import Daily from "./pages/Daily";
import You from "./pages/You";
import Learn from "./pages/Learn";
import Settings from "./pages/Settings";
import Act from "./pages/Act";


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_complete")
  );

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding_complete", "true");
    setShowOnboarding(false);
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#050508" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Daily" replace />} />
      <Route path="/Daily" element={<Daily />} />
      <Route path="/You" element={<You />} />
      <Route path="/Learn" element={<Learn />} />
      <Route path="/Act" element={<Act />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  usePWAManifest();
  return (
    <AuthProvider>
      <ThemeProvider>
        <style>{fontStyle}</style>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App