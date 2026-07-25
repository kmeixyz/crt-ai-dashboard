import React, { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import styles from "../styles/SiteLayout.module.css";

function NavIconMore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="12" cy="19" r="1.9" />
    </svg>
  );
}

function NavIconChat({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function SiteLayout({ children, route, go }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreWrapRef = useRef(null);

  const generateActive = route === "generate";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onPointer = (e) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [menuOpen]);

  const linkClass = (id) =>
    `${styles.navLink} ${route === id ? styles.navLinkActive : ""}`;

  return (
    <div className={styles.shell}>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navLeft}>
          <button type="button" className={styles.logoText} onClick={() => go("landing")}>
            Lumen
          </button>
        </div>
        <div className={styles.navTrailing}>
          <button
            type="button"
            className={`${linkClass("about")} ${styles.desktopNavItem}`}
            onClick={() => go("about")}
          >
            About
          </button>
          <button
            type="button"
            className={`${styles.cta} ${generateActive ? styles.ctaActive : ""} ${styles.desktopNavItem}`}
            onClick={() => go("generate")}
          >
            <NavIconChat />
            Resource Builder
          </button>
          <span className={styles.desktopNavItem}>
            <ThemeToggle />
          </span>

          <div className={styles.moreWrap} ref={moreWrapRef}>
            <button
              type="button"
              className={styles.moreButton}
              aria-label="More"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <NavIconMore />
            </button>
            {menuOpen && (
              <div className={styles.morePopover} role="menu" aria-label="More options">
                <button
                  type="button"
                  className={`${linkClass("about")} ${styles.moreItem}`}
                  role="menuitem"
                  onClick={() => go("about")}
                >
                  About
                </button>
                <div className={styles.moreDivider} aria-hidden />
                <div className={styles.moreThemeRow}>
                  <span className={styles.moreThemeLabel}>Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.main} id="main">
        {children}
      </main>

      <nav className={styles.bottomNav} aria-label="Primary">
        <button
          type="button"
          className={`${styles.bottomNavItem} ${generateActive ? styles.bottomNavItemActive : ""}`}
          onClick={() => go("generate")}
        >
          <NavIconChat size={22} />
          <span>Resource Builder</span>
        </button>
      </nav>
    </div>
  );
}
