import React from "react";

// Renders a generated output { title, meta, sections:[{label,body}] } as
// separate component cards. With `progressive`, the cards ripple in from the
// bottom one after another (0.1s stagger).
export default function DocView({ output, progressive = false }) {
  if (!output) return null;
  const anim = (i) =>
    progressive ? { animationDelay: `${i * 0.1}s` } : { animation: "none", opacity: 1 };

  return (
    <div className="out-grid">
      <div className="out-card out-card--header" style={anim(0)}>
        <h2 style={{ margin: 0 }}>{output.title}</h2>
        {output.meta && (
          <div className="row row-wrap" style={{ gap: 6, marginTop: 10 }}>
            {output.meta.map((m, i) => (
              <span key={i} className="badge">{m}</span>
            ))}
          </div>
        )}
      </div>

      {output.sections.map((s, i) => {
        const isList = Array.isArray(s.body);
        const cls = [
          "out-card",
          isList ? "out-card--full" : "",
          s._revised ? "out-card--revised" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div className={cls} key={i} style={anim(i + 1)}>
            <span className="out-card__label">{s.label}</span>
            <div className="out-card__body">
              {isList ? (
                <ul>
                  {s.body.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>{s.body}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
