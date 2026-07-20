import React from "react";
import { Badge, SectionHead, Term } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";

const FEATURES = [
  {
    icon: "sparkles",
    tone: "accent",
    title: "Culture is a required field, not a text box",
    body: "Community context and cultural anchors are part of the form, so every draft starts from your students instead of a generic example.",
  },
  {
    icon: "access",
    tone: "teal",
    title: "Access is built in",
    body: "Reading level, language support, neurodiverse supports, and a real low-tech path apply to every generator by default.",
  },
  {
    icon: "shieldCheck",
    tone: "green",
    title: "It checks its own work",
    body: "A short CRP and UDL review flags deficit language, missing accessibility, and stereotype risk before anything reaches your room.",
  },
  {
    icon: "sliders",
    tone: "rose",
    title: "Editing is one click",
    body: "Make it more accessible, low-tech, multilingual, project-based, or more culturally specific without starting the prompt over.",
  },
];

const MODULES = [
  { icon: "book", tone: "primary", name: "Lesson Plan Generator", desc: "A full culturally responsive lesson, anchored in your community context." },
  { icon: "puzzle", tone: "accent", name: "Activity / PBL Generator", desc: "Hands-on, community-connected projects that end in a real product." },
  { icon: "clipboard", tone: "teal", name: "Assessment Generator", desc: "Quizzes, exit tickets, rubrics, and multimodal options." },
  { icon: "message", tone: "rose", name: "Feedback Assistant", desc: "Asset-based, growth-oriented, and family-friendly notes." },
];

const STEPS = [
  { n: "01", title: "Set up your class", body: "Describe your subject, students, community, and tech level once. Reuse it everywhere." },
  { n: "02", title: "Generate", body: "You get a structured draft with the cultural connection and access supports already in place." },
  { n: "03", title: "Review and revise", body: "Run the bias and fit check, apply one-click edits, then export or print." },
];

export default function Landing({ go }) {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="reveal">
            <Badge variant="primary">
              <Icon name="spark" size="sm" /> Built for the classroom you actually teach
            </Badge>
          </div>
          <h1 className="reveal" style={{ marginTop: 18 }}>
            STEM materials that start from <span className="grad-text">your students</span>.
          </h1>
          <p className="hero__lead reveal">
            Lumen helps high school STEM teachers write lesson plans, activities, assessments, and
            feedback that fit their students' communities, reading levels, and the tech they
            actually have. The cultural part is built in, not bolted on.
          </p>
          <div className="row row-wrap reveal" style={{ marginTop: 26 }}>
            <button className="btn btn-primary btn-lg" onClick={() => go("generate")}>
              Open the dashboard <Icon name="arrowRight" size="sm" />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => go("about")}>
              About the tech
            </button>
          </div>
          <div className="row row-wrap reveal" style={{ marginTop: 22, gap: 8 }}>
            <Badge variant="accent"><Term term="CRP">CRP</Term></Badge>
            <Badge variant="teal"><Term term="UDL">UDL</Term></Badge>
            <Badge variant="primary"><Term term="CSP">CSP</Term></Badge>
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
              Most teacher AI tools treat culture as an optional free-text box, and none of them
              check their own output. Lumen makes context and a bias review part of the workflow.
            </SectionHead>
          </div>

          <div className="grid grid-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card--lift reveal">
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
            <SectionHead eyebrow="One workflow" title="Four generators, one class profile">
              Enter your class context once and reuse it across every module. Review, revise, export.
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
            <SectionHead eyebrow="How it works" title="From class context to classroom in three steps" />
          </div>
          <div className="grid grid-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card card--lift reveal">
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
                <h3 style={{ margin: 0, color: "#fff" }}>Try it with a sample class</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.85)" }}>
                  Load a sample classroom and generate a full, review-ready lesson in a few seconds.
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
