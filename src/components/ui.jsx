import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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

// ---- Custom animated dropdown (accessible <select> replacement) ------
export function Dropdown({ id, value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusBtn = () => ref.current?.querySelector(".dropdown__btn")?.focus();
  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
    focusBtn();
  };

  const onKey = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.min(options.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) setActive((a) => Math.max(0, a - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(options[active]);
        else setOpen(true);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={`dropdown${open ? " dropdown--open" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        className="dropdown__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
      >
        <span>{selected?.label}</span>
        <Icon name="chevronDown" size="sm" className="dropdown__chev" />
      </button>
      {open && (
        <ul
          className="dropdown__menu"
          role="listbox"
          aria-activedescendant={`${id}-opt-${active}`}
          tabIndex={-1}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`dropdown__opt${i === active ? " is-active" : ""}${
                o.value === value ? " is-selected" : ""
              }`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
            >
              <span>{o.label}</span>
              {o.value === value && <Icon name="check" size="sm" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- Contextual acronym tooltip -------------------------------------
const TERM_DEFS = {
  CRP: "Culturally Responsive Pedagogy",
  CRT: "Culturally Responsive Teaching",
  CSP: "Culturally Sustaining Pedagogy",
  UDL: "Universal Design for Learning",
  PBL: "Project-Based Learning",
};
export function Term({ children, term, definition }) {
  const key = term || (typeof children === "string" ? children.trim() : "");
  const def = definition || TERM_DEFS[key] || "";
  if (!def) return <>{children}</>;
  return (
    <span className="term" tabIndex={0} aria-label={`${key}: ${def}`}>
      {children}
      <span className="term__tip" role="tooltip">
        {def}
      </span>
    </span>
  );
}

// ---- Accordion (smooth expand/collapse) -----------------------------
export function Accordion({ items, allowMultiple = false, defaultOpen = [] }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <div className="accordion">
      {items.map((it) => {
        const isOpen = open.has(it.id);
        return (
          <div className={`acc-item${isOpen ? " is-open" : ""}`} key={it.id}>
            <button
              type="button"
              className="acc-head"
              aria-expanded={isOpen}
              onClick={() => toggle(it.id)}
            >
              <span className="acc-head__title">
                {it.icon && (
                  <span className="acc-head__icon">
                    <Icon name={it.icon} size="sm" />
                  </span>
                )}
                <span>{it.title}</span>
              </span>
              <Icon name="chevronDown" size="sm" className="acc-head__chev" />
            </button>
            <div className="acc-body" role="region">
              <div className="acc-body__inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
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
