import React from "react";

// Renders a generated output object { title, meta, sections:[{label,body}] }.
export default function DocView({ output }) {
  if (!output) return null;
  return (
    <article className="doc">
      <h2 style={{ marginBottom: 6 }}>{output.title}</h2>
      {output.meta && (
        <div className="row row-wrap" style={{ gap: 6, marginBottom: 12 }}>
          {output.meta.map((m, i) => (
            <span key={i} className="badge">{m}</span>
          ))}
        </div>
      )}
      {output.sections.map((s, i) => (
        <div
          className="doc__section"
          key={i}
          style={s._revised ? { background: "var(--c-primary-soft)", borderRadius: 10, padding: 12 } : undefined}
        >
          <span className="doc__label">{s.label}</span>
          {Array.isArray(s.body) ? (
            <ul>
              {s.body.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0 }}>{s.body}</p>
          )}
        </div>
      ))}
    </article>
  );
}
