import React from "react";
import { Badge, SectionHead } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";

const FEATURES = [
  {
    icon: "sparkles",
    tone: "accent",
    title: "Culture as a first-class input",
    body: "Community context and cultural anchors are structured, required fields — so every output starts from your students' world, specifically and respectfully.",
  },
  {
    icon: "access",
    tone: "teal",
    title: "Accessibility built in",
    body: "Reading level, language support, neurodiverse supports, and a genuine low-tech / offline path are applied across every generator by default.",
  },
  {
    icon: "shieldCheck",
    tone: "green",
    title: "Review for Bias & Fit",
    body: "A CRP/UDL checklist flags deficit language, missing accessibility, and stereotype risk before anything reaches your classroom.",
  },
  {
    icon: "sliders",
    tone: "rose",
    title: "Differentiation & revision",
    body: "One-click revisions — more accessible, low-tech, multilingual, project-based, or stronger cultural examples — without re-prompting from scratch.",
  },
];

const MODULES = [
  { icon: "book", tone: "primary", name: "Lesson Plan Generator", desc: "Nine-section culturally responsive lessons, community-anchored." },
  { icon: "beaker", tone: "accent", name: "Activity / PBL Generator", desc: "Authentic, community-connected projects with a public product." },
  { icon: "clipboard", tone: "teal", name: "Assessment Generator", desc: "Quiz, exit ticket, project rubric, and multimodal options." },
  { icon: "message", tone: "rose", name: "Feedback Assistant", desc: "Asset-based, growth-oriented, and family-friendly feedback." },
];

const STEPS = [
  { n: "01", title: "Enter class context", body: "Describe your subject, students, community, and tech level once — reuse it everywhere." },
  { n: "02", title: "Generate", body: "Get a structured draft with the cultural connection and accessibility supports always visible." },
  { n: "03", title: "Review & revise", body: "Run the bias & fit check, apply one-click revisions, then export to Markdown, text, or print." },
];

export default function Landing({ go }) {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="reveal">
            <Badge variant="primary">
              <Icon name="spark" size="sm" /> AI for the classroom you actually teach
            </Badge>
          </div>
          <h1 className="reveal" style={{ marginTop: 18 }}>
            Culturally responsive STEM materials, <span className="grad-text">generated in seconds</span>.
          </h1>
          <p className="hero__lead reveal">
            Lumen helps high school STEM teachers create lesson plans, activities, assessments,
            and feedback that are culturally responsive, accessible, and differentiated — with
            cultural responsiveness built in by default, not bolted on.
          </p>
          <div className="row row-wrap reveal" style={{ marginTop: 26 }}>
            <button className="btn btn-primary btn-lg" onClick={() => go("generate")}>
              Open the dashboard <Icon name="arrowRight" size="sm" />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => go("foundations")}>
              Why Lumen
            </button>
          </div>
          <div className="row row-wrap reveal" style={{ marginTop: 22, gap: 8 }}>
            <Badge variant="accent">CRP</Badge>
            <Badge variant="teal">UDL</Badge>
            <Badge variant="primary">CSP</Badge>
            <Badge>Constructivist</Badge>
            <Badge variant="green">Asset-based</Badge>
            <Badge variant="warn">Responsible GenAI</Badge>
          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <div className="container stack-lg">
          <div className="reveal">
            <SectionHead eyebrow="Why it's different" title="Cultural responsiveness by design">
              Most teacher-AI tools treat culture as optional free text and never review their own
              output. Lumen makes cultural responsiveness and accessibility structural.
            </SectionHead>
          </div>

          <div className="grid grid-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="card reveal">
                <div className={`feature-icon fi--${f.tone}`}>
                  <Icon name={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <div className="reveal">
            <SectionHead eyebrow="One coherent workflow" title="Four generators, one class profile">
              Enter your class context once. Reuse it across every module. Review, revise, export.
            </SectionHead>
          </div>

          <div className="grid grid-2">
            {MODULES.map((m) => (
              <button
                key={m.name}
                className="card card--interactive reveal"
                onClick={() => go("generate")}
                style={{ textAlign: "left", font: "inherit", color: "inherit" }}
              >
                <div className="row" style={{ gap: 14 }}>
                  <div className={`feature-icon fi--${m.tone}`} style={{ marginBottom: 0 }}>
                    <Icon name={m.icon} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{m.name}</h3>
                    <p className="muted" style={{ margin: "4px 0 0" }}>{m.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <hr className="divider" />

          <div className="reveal">
            <SectionHead eyebrow="How it works" title="From context to classroom in three steps" />
          </div>
          <div className="grid grid-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card reveal">
                <div className="eyebrow" style={{ fontSize: "var(--text-2xl)", color: "var(--c-line-strong)" }}>
                  {s.n}
                </div>
                <h3 style={{ marginTop: 8 }}>{s.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div
            className="card reveal"
            style={{
              background: "linear-gradient(135deg, var(--c-primary), var(--c-brand))",
              border: "none",
              color: "#fff",
            }}
          >
            <div className="row row-wrap between" style={{ gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "#fff" }}>See it work in seconds</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.85)" }}>
                  Load a sample classroom scenario and generate a full, review-ready lesson.
                </p>
              </div>
              <button
                className="btn btn-lg"
                onClick={() => go("generate")}
                style={{ background: "#fff", color: "var(--c-brand)" }}
              >
                Try the dashboard <Icon name="arrowRight" size="sm" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
