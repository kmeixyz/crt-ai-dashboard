import React from "react";
import Icon from "../components/Icon.jsx";

const MODULES = [
  { icon: "book", label: "Lesson Plan" },
  { icon: "puzzle", label: "Activity / PBL" },
  { icon: "clipboard", label: "Assessment" },
  { icon: "message", label: "Feedback" },
];

export default function Landing({ go }) {
  return (
    <div className="home">
      <div className="container">
        <section className="home-hero">
          <h1 className="home-hero__title">
            Build culturally responsive STEM materials in plain language.
          </h1>
          <p className="home-hero__lead">
            Describe your class once. Get a lesson, activity, assessment, or feedback note that
            starts from your students and their community.
          </p>
          <div className="home-hero__cta">
            <button className="btn btn-primary btn-lg" onClick={() => go("generate")}>
              <Icon name="sparkles" size="sm" /> Open Resource Builder
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__head">
            <h2 className="home-section__title">Start building</h2>
            <button type="button" className="home-section__link" onClick={() => go("generate")}>
              Open builder →
            </button>
          </div>
          <div className="home-grid">
            {MODULES.map((m) => (
              <button
                key={m.label}
                type="button"
                className="home-tile"
                onClick={() => go("generate")}
              >
                <span className="home-tile__icon">
                  <Icon name={m.icon} />
                </span>
                <span className="home-tile__label">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-about">
          <h2 className="home-about__title">About Lumen</h2>
          <p className="home-about__body">
            Lumen is a drafting assistant for high school STEM teachers. Cultural context and
            accessibility supports are part of the workflow, not an afterthought. Always review
            AI output before you use it with students.
          </p>
          <button type="button" className="home-about__link" onClick={() => go("about")}>
            Learn more →
          </button>
        </section>
      </div>
    </div>
  );
}
