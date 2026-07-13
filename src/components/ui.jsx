import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import Icon from "./Icon.jsx";

// ---- Toast -----------------------------------------------------------
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const notify = useCallback((text) => {
    setMsg(text);
    window.clearTimeout(window.__toastT);
    window.__toastT = window.setTimeout(() => setMsg(null), 2400);
  }, []);
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {msg && (
        <div className="toast" role="status" aria-live="polite">
          <Icon name="check" size="sm" />
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

// ---- Theme (light / dark) -------------------------------------------
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem("lumen-theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("lumen-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle };
}

// ---- Scroll reveal ---------------------------------------------------
// Adds `is-visible` to `.reveal` elements as they enter the viewport.
export function useRevealOnScroll(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

// ---- Small building blocks ------------------------------------------
export function Badge({ children, variant }) {
  return <span className={`badge${variant ? ` badge--${variant}` : ""}`}>{children}</span>;
}

export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="section-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      {children && (
        <p className="muted" style={{ maxWidth: "68ch", margin: "6px 0 0" }}>
          {children}
        </p>
      )}
    </div>
  );
}

export function Guardrail({ children }) {
  return (
    <div className="guardrail" role="note">
      <Icon name="alert" size="sm" style={{ marginTop: 2 }} />
      <div>{children}</div>
    </div>
  );
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

export function download(filename, text, type = "text/markdown") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
