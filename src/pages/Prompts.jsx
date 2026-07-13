import React, { useState } from "react";
import { Badge, SectionHead, useToast, copyToClipboard } from "../components/ui.jsx";
import { promptLibrary, systemPrompt, promptVariables } from "../data/promptLibrary.js";

function highlightVars(text) {
  const parts = text.split(/(\{\{\w+\}\})/g);
  return parts.map((p, i) =>
    /^\{\{\w+\}\}$/.test(p) ? <span className="var" key={i}>{p}</span> : <span key={i}>{p}</span>
  );
}

export default function Prompts() {
  const toast = useToast();
  const domains = Object.entries(promptLibrary);
  const copy = (text) => copyToClipboard(text).then(() => toast("Prompt copied"));

  return (
    <div className="page">
      <div className="container stack">
        <SectionHead eyebrow="Prompt Engineering" title="Prompt Library">
          Versioned, structured prompt templates for the four dashboard domains. Variables in{" "}
          <code>{"{{braces}}"}</code> are filled from the class-context form. The same templates
          feed the mock engine and (optionally) a real LLM.
        </SectionHead>

        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <div>
              <Badge variant="primary">System Prompt</Badge>
              <span className="small muted" style={{ marginLeft: 8 }}>
                The "constitution" every generation inherits
              </span>
            </div>
            <button className="btn btn-subtle btn-sm no-print" onClick={() => copy(systemPrompt)}>Copy</button>
          </div>
          <div className="prompt-block">{systemPrompt}</div>
        </div>

        <div className="card">
          <strong className="small">Variable glossary</strong>
          <div className="chips" style={{ marginTop: 10 }}>
            {promptVariables.map((v) => (
              <span key={v.token} className="badge">
                <code style={{ color: "var(--c-accent)" }}>{v.token}</code>
                <span className="faint">← {v.from}</span>
              </span>
            ))}
          </div>
        </div>

        {domains.map(([key, d]) => (
          <div key={key} className="stack">
            <div className="row" style={{ gap: 10 }}>
              <Badge variant={d.color}>{d.domain}</Badge>
              <span className="tiny faint">{d.templates.length} template{d.templates.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-2">
              {d.templates.map((t) => (
                <div key={t.id} className="card stack">
                  <div className="row between">
                    <h3 style={{ margin: 0 }}>{t.name}</h3>
                    <button className="btn btn-subtle btn-sm no-print" onClick={() => copy(t.template)}>Copy</button>
                  </div>
                  <p className="small muted" style={{ margin: 0 }}>{t.purpose}</p>
                  <div className="prompt-block">{highlightVars(t.template)}</div>
                  <div className="tiny faint">id: {t.id}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
