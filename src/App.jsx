import React, { useState, useEffect, useRef } from "react";
import { ToastProvider, useTheme, useRevealOnScroll } from "./components/ui.jsx";
import Icon from "./components/Icon.jsx";
import Landing from "./pages/Landing.jsx";
import Generate from "./pages/Generate.jsx";
import About from "./pages/About.jsx";
import Prompts from "./pages/Prompts.jsx";
import { defaultInput } from "./data/inputSchema.js";

const NAV = [
  { id: "landing", label: "Home" },
  { id: "generate", label: "Dashboard" },
  { id: "prompts", label: "Prompt Library" },
  { id: "about", label: "About the Tech" },
];

export default function App() {
  const [route, setRoute] = useState("landing");
  const [input, setInput] = useState(defaultInput);
  const { theme, toggle } = useTheme();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  useRevealOnScroll(route);

  const go = (id) => {
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Move focus to main content on route change (a11y), skip initial mount.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="topbar">
        <div className="container topbar__inner">
          <button className="brand" onClick={() => go("landing")} aria-label="Lumen home">
            <span className="brand__mark">
              <Icon name="spark" size="sm" style={{ color: "#fff" }} />
            </span>
            <span>Lumen</span>
          </button>
          <div className="spacer" />
          <nav className="nav" aria-label="Primary">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={`nav__link${route === n.id ? " nav__link--active" : ""}`}
                aria-current={route === n.id ? "page" : undefined}
                onClick={() => go(n.id)}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <button
            className="icon-btn"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size="sm" />
          </button>
          <button className="btn btn-primary btn-sm no-print" onClick={() => go("generate")}>
            Open dashboard
          </button>
        </div>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>
        {route === "landing" && <Landing go={go} />}
        {route === "generate" && <Generate input={input} setInput={setInput} />}
        {route === "prompts" && <Prompts />}
        {route === "about" && <About />}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="row row-wrap between" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 10 }}>
              <span className="brand__mark" style={{ width: 28, height: 28, borderRadius: 8 }}>
                <Icon name="spark" size="sm" style={{ color: "#fff" }} />
              </span>
              <div>
                <strong style={{ color: "var(--c-ink)" }}>Lumen</strong>
                <span className="muted"> · Culturally responsive STEM teaching</span>
              </div>
            </div>
            <div className="tiny faint" style={{ maxWidth: "46ch" }}>
              Read AI output for accuracy and cultural fit before you use it in class. Do not enter
              anything that identifies a specific student.
            </div>
          </div>
        </div>
      </footer>
    </ToastProvider>
  );
}
