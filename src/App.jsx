import React, { useState, useEffect, useRef } from "react";
import { ToastProvider, useRevealOnScroll } from "./components/ui.jsx";
import SiteLayout from "./components/SiteLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Generate from "./pages/Generate.jsx";
import About from "./pages/About.jsx";
import Learn from "./pages/Learn.jsx";
import { defaultInput } from "./data/inputSchema.js";

// URL paths for each route. Home stays at the root URL; the others get clean
// paths so they're linkable and survive refresh (Vite's SPA fallback serves
// index.html for these).
const ROUTE_TO_PATH = {
  landing: "/",
  generate: "/builder",
  about: "/about",
  learn: "/method",
};
const PATH_TO_ROUTE = {
  "/": "landing",
  "/builder": "generate",
  "/about": "about",
  "/method": "learn",
};

function routeFromLocation() {
  return PATH_TO_ROUTE[window.location.pathname] || "landing";
}

export default function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [input, setInput] = useState(defaultInput);
  const firstRender = useRef(true);

  useRevealOnScroll(route);

  const go = (id) => {
    setRoute(id);
    const path = ROUTE_TO_PATH[id] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState({ route: id }, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keep route in sync with browser back/forward navigation.
  useEffect(() => {
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById("main")?.focus?.({ preventScroll: true });
  }, [route]);

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteLayout route={route} go={go}>
        {route === "landing" && <Landing go={go} />}
        {route === "generate" && <Generate input={input} setInput={setInput} />}
        {route === "about" && <About />}
        {route === "learn" && <Learn />}
      </SiteLayout>
    </ToastProvider>
  );
}
