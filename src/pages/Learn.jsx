import React, { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import { glossary } from "../data/glossary.js";
import { marketGaps, toolScan } from "../data/toolScan.js";
import { promptLibrary } from "../data/promptLibrary.js";

const DOCS = [
  {
    id: "how-it-works",
    tag: "Method",
    tagTone: "blue",
    title: "How Lumen works",
    summary:
      "A guided Resource Builder collects class context, then a mock AI engine returns modular drafts you can revise and review.",
    body: [
      "Teachers move through three steps: choose a format, describe the class, and add community context. Lumen generates a structured draft with cultural anchors and accessibility supports already woven in.",
      "The dashboard uses a mock AI engine by default, so demos run with no API key. The same prompt templates can later connect to a live model.",
      "Every draft includes a short bias and accessibility review. Always check AI output for accuracy and cultural fit before you use it with students.",
    ],
  },
  ...glossary.map((g) => ({
    id: g.term.split(":")[0].trim().toLowerCase().replace(/\s+/g, "-"),
    tag: "Framework",
    tagTone: "teal",
    title: g.term,
    summary: g.short,
    body: [g.definition, `In the product: ${g.inProduct}`],
  })),
  {
    id: "how-it-compares",
    tag: "Comparison",
    tagTone: "amber",
    title: "How Lumen compares",
    summary:
      "Other teacher AI tools are useful. Most still treat culture as optional free text and skip a built-in bias review.",
    body: [
      ...marketGaps.map((g) => `${g.title}: ${g.detail}`),
      `Tools we looked at: ${toolScan.map((t) => `${t.tool} (${t.focus})`).join("; ")}.`,
    ],
  },
  {
    id: "prompts",
    tag: "Prompts",
    tagTone: "blue",
    title: "Prompt templates",
    summary:
      "Every generator runs on a small set of structured templates that keep culture and access in every draft.",
    body: Object.values(promptLibrary).map(
      (d) => `${d.domain}: ${d.templates.map((t) => t.name).join(", ")}.`
    ),
  },
];

export default function Learn() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCS;
    return DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q) ||
        d.body.some((b) => b.toLowerCase().includes(q))
    );
  }, [query]);

  const active = DOCS.find((d) => d.id === activeId) || null;

  return (
    <div className="page learn-page">
      <div className="container">
        <header className="learn-hero">
          <h1 className="learn-hero__title">How Lumen works</h1>
          <div className="learn-search">
            <label className="learn-search__field">
              <Icon name="search" size="sm" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search docs… (e.g. “UDL”, “how it works”, “prompts”)'
                aria-label="Search methodology docs"
              />
            </label>
          </div>
        </header>

        {active ? (
          <article className="learn-detail">
            <button type="button" className="learn-detail__back" onClick={() => setActiveId(null)}>
              ← All documents
            </button>
            <div className="learn-detail__tag" data-tone={active.tagTone}>
              {active.tag}
            </div>
            <h2 className="learn-detail__title">{active.title}</h2>
            <p className="learn-detail__summary">{active.summary}</p>
            {active.body.map((para, i) => (
              <p className="learn-detail__body" key={i}>
                {para}
              </p>
            ))}
          </article>
        ) : (
          <section className="learn-docs">
            <div className="learn-docs__head">
              <h2 className="learn-docs__title">All documents</h2>
              <p className="learn-docs__sub">
                {filtered.length === 1
                  ? "1 source on method, frameworks, and prompts."
                  : `${filtered.length} sources on method, frameworks, and prompts.`}
              </p>
            </div>
            <div className="learn-grid">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="learn-card"
                  data-tone={d.tagTone}
                  onClick={() => setActiveId(d.id)}
                >
                  <span className="learn-card__face">
                    <span className="learn-card__accent" aria-hidden="true" />
                    <span className="learn-card__inner">
                      <span className="learn-card__tag" data-tone={d.tagTone}>
                        {d.tag}
                      </span>
                      <span className="learn-card__title">{d.title}</span>
                      <span className="learn-card__summary">{d.summary}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="learn-empty">No documents match that search.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
