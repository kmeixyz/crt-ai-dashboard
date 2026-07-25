// Combobox UX mirrored from CensusBot place search — suggestions are local stubs
// (no network). Used for subject / course / grade fields in Resource Builder.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ex from "../styles/Explore.module.css";

export default function StubCombobox({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Search…",
  emptyNoun = "options",
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [searching, setSearching] = useState(false);
  const listRef = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? options.slice(0, 8)
      : options.filter((o) => o.toLowerCase().includes(q)).slice(0, 10);

  function handleChange(e) {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setCursor(-1);
    setOpen(true);
    // Brief inline "Searching…" status (local data, so simulated) that fades in
    // beside the input and clears once results settle — mirrors CensusBot.
    if (next.trim()) {
      setSearching(true);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setSearching(false), 420);
    } else {
      setSearching(false);
      clearTimeout(searchTimer.current);
    }
  }

  function select(item) {
    setQuery(item);
    onChange(item);
    setOpen(false);
    setCursor(-1);
    setSearching(false);
    clearTimeout(searchTimer.current);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setCursor(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === "Enter" && cursor >= 0 && results[cursor]) {
      e.preventDefault();
      select(results[cursor]);
    }
  }

  useEffect(() => {
    if (cursor < 0 || !listRef.current) return;
    listRef.current.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div className={ex.fieldGroup}>
      <label className={ex.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={ex.searchInputRow}>
        <div className={ex.comboboxWrap} style={{ flex: 1 }}>
          <input
            id={id}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && results.length > 0}
            aria-controls={`${id}-listbox`}
            aria-haspopup="listbox"
            autoComplete="off"
            spellCheck={false}
            className={ex.comboboxInput}
            value={query}
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 160)}
            onKeyDown={handleKeyDown}
          />
          <AnimatePresence>
            {searching && (
              <motion.span
                className={ex.comboSearching}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={ex.comboSpinner} aria-hidden="true" />
                Searching…
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.ul
                id={`${id}-listbox`}
                role="listbox"
                aria-label={label}
                ref={listRef}
                className={ex.comboboxList}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {results.map((item, i) => (
                  <li
                    key={item}
                    role="option"
                    aria-selected={item === value}
                    className={`${ex.comboboxItem}${i === cursor ? ` ${ex.comboboxItemActive}` : ""}${
                      item === value ? ` ${ex.comboboxItemSelected}` : ""
                    }`}
                    onMouseDown={() => select(item)}
                  >
                    {item === value && (
                      <span className={ex.comboboxCheck} aria-hidden>
                        ✓
                      </span>
                    )}
                    <span className={ex.placeResultCity}>{item}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          {open && results.length === 0 && q.length >= 1 && (
            <div className={ex.comboboxEmpty}>
              No {emptyNoun} match &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
