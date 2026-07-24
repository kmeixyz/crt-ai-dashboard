import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { glossary } from "../data/glossary.js";
import { toolScan, marketGaps } from "../data/toolScan.js";
import { personas } from "../data/personas.js";
import { promptLibrary, systemPrompt } from "../data/promptLibrary.js";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "frameworks", label: "Frameworks" },
  { id: "teachers", label: "Teachers" },
  { id: "prompts", label: "Prompts" },
  { id: "compare", label: "How it compares" },
];

export default function About() {
  const [section, setSection] = useState("overview");

  return (
    <div className="page about-page">
      <div className="container about-layout">
        <aside className="about-side">
          <h2 className="about-side__title">About Lumen</h2>
          <nav className="about-side__nav" aria-label="About sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`about-side__link${section === s.id ? " is-active" : ""}`}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="about-meta">
            <div className="about-meta__block">
              <div className="about-meta__label">Built for</div>
              <div className="about-meta__value">High school STEM teachers</div>
            </div>
            <div className="about-meta__block">
              <div className="about-meta__label">Grounded in</div>
              <div className="about-meta__value">CRP, CSP, and UDL</div>
            </div>
            <div className="about-meta__block">
              <div className="about-meta__label">Note</div>
              <div className="about-meta__value">AI drafts only. Always review before class.</div>
            </div>
          </div>
        </aside>

        <div className="about-main">
          {section === "overview" && (
            <>
              <h1 className="about-h1">Overview</h1>
              <p className="about-lead">Build STEM materials around the students you actually teach.</p>
              <p className="about-body">
                Lumen is a drafting assistant for high school STEM teachers. You describe your class,
                community, and access needs once. It returns a structured lesson, activity,
                assessment, or feedback note that starts from that context.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <h3>Guided builder</h3>
                  <p>Pick a format, enter class details, add community context, then generate.</p>
                </div>
                <div className="about-feature">
                  <h3>Built-in review</h3>
                  <p>Check the draft against a short CRP and UDL list before you use it.</p>
                </div>
                <div className="about-feature">
                  <h3>One-click revisions</h3>
                  <p>Make it more accessible, low-tech, multilingual, or more local without starting over.</p>
                </div>
              </div>

              <h2 className="about-h2">How it works</h2>
              <p className="about-body">
                The dashboard uses a mock AI engine by default, so demos run with no API key. The
                same prompt templates can later connect to a live model.
              </p>
              <div className="about-tags">
                <div className="about-tags__row">
                  <span className="about-tags__label">Frontend</span>
                  <span className="about-tag">React</span>
                  <span className="about-tag">Vite</span>
                  <span className="about-tag">CSS variables</span>
                </div>
                <div className="about-tags__row">
                  <span className="about-tags__label">Method</span>
                  <span className="about-tag">CRP</span>
                  <span className="about-tag">CSP</span>
                  <span className="about-tag">UDL</span>
                </div>
                <div className="about-tags__row">
                  <span className="about-tags__label">AI</span>
                  <span className="about-tag">Mock engine</span>
                  <span className="about-tag">Prompt templates</span>
                </div>
              </div>
            </>
          )}

          {section === "frameworks" && (
            <>
              <h1 className="about-h1">Frameworks</h1>
              <p className="about-body">
                These are the ideas behind every draft Lumen writes.
              </p>
              <div className="about-list">
                {glossary.map((g) => (
                  <div className="about-list__item" key={g.term}>
                    <h3>{g.term}</h3>
                    <p className="about-list__short">{g.short}</p>
                    <p className="about-body">{g.definition}</p>
                    <p className="about-inproduct">
                      <strong>In the product:</strong> {g.inProduct}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "teachers" && (
            <>
              <h1 className="about-h1">Teachers</h1>
              <p className="about-body">
                Three teacher profiles shaped the product: urban public school, rural low-resource,
                and AP / magnet.
              </p>
              <div className="about-team">
                {personas.map((p) => (
                  <div className="about-team__card" key={p.id}>
                    <span className="about-team__avatar" style={{ background: p.color }}>
                      {p.initials}
                    </span>
                    <div>
                      <div className="about-team__name">{p.name}</div>
                      <div className="about-team__role">{p.role}</div>
                      <p className="about-body" style={{ marginTop: 8, marginBottom: 0 }}>
                        {p.context}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "prompts" && (
            <>
              <h1 className="about-h1">Prompts</h1>
              <p className="about-body">
                Every generator runs on a small set of structured templates. The rules below shape
                every draft.
              </p>
              <p className="about-body" style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: "var(--c-surface-alt)", padding: 16, borderRadius: 12 }}>
                {systemPrompt}
              </p>
              <div className="about-tags" style={{ marginTop: 24 }}>
                {Object.values(promptLibrary).map((d) => (
                  <div className="about-tags__row" key={d.domain}>
                    <span className="about-tags__label">{d.domain}</span>
                    {d.templates.map((t) => (
                      <span className="about-tag" key={t.id}>{t.name}</span>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "compare" && (
            <>
              <h1 className="about-h1">How it compares</h1>
              <p className="about-body">
                Other teacher AI tools are useful. Most still treat culture as optional free text
                and skip a built-in bias review.
              </p>
              <div className="about-list">
                {marketGaps.map((g) => (
                  <div className="about-list__item" key={g.title}>
                    <h3>{g.title}</h3>
                    <p className="about-body">{g.detail}</p>
                  </div>
                ))}
              </div>
              <h2 className="about-h2">Tools we looked at</h2>
              <div className="about-tags">
                {toolScan.map((t) => (
                  <div className="about-tags__row" key={t.tool}>
                    <span className="about-tags__label">{t.tool}</span>
                    <span className="about-tag">{t.focus}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
