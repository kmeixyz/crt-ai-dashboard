import React, { useState } from "react";
import { Badge, SectionHead, useToast, copyToClipboard } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";
import { promptLibrary, systemPrompt, promptVariables } from "../data/promptLibrary.js";

const VAR_LABEL = Object.fromEntries(promptVariables.map((v) => [v.token, v.from]));

function cleanToken(token) {
  const name = token.replace(/[{}]/g, "").replace(/_/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}
function fillsOf(template) {
  return [...new Set(template.match(/\{\{\w+\}\}/g) || [])];
}

function highlightVars(text) {
  const parts = text.split(/(\{\{\w+\}\})/g);
  return parts.map((p, i) =>
    /^\{\{\w+\}\}$/.test(p) ? (
      <span className="var" key={i}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

// Collapsible dark code container, revealed only on request.
function RawToggle({ code, onCopy }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-ghost btn-sm no-print" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon name="code" size="sm" /> {open ? "Hide raw code" : "View raw code"}
        </button>
        {open && (
          <button className="btn btn-subtle btn-sm no-print" onClick={onCopy}>
            <Icon name="copy" size="sm" /> Copy
          </button>
        )}
      </div>
      <div className={`collapse${open ? " is-open" : ""}`}>
        <div className="collapse__inner">
          <div className="prompt-block" style={{ marginTop: 12 }}>{highlightVars(code)}</div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ tpl, onCopy }) {
  const fills = fillsOf(tpl.template);
  return (
    <div className="card card--lift stack">
      <div className="row between">
        <h3 style={{ margin: 0 }}>{tpl.name}</h3>
      </div>
      <p className="small muted" style={{ margin: 0 }}>{tpl.purpose}</p>
      <div className="tpl">
        <div>
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 6 }}>Pulls from your class profile</div>
          <div className="tpl__fills">
            {fills.map((t) => (
              <span key={t} className="tpl__fill">
                <Icon name="sliders" size="sm" /> {VAR_LABEL[t] || cleanToken(t)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <RawToggle code={tpl.template} onCopy={() => onCopy(tpl.template)} />
      <div className="tiny faint">id: {tpl.id}</div>
    </div>
  );
}

const SYSTEM_RULES = [
  "Treat student cultures, languages, and communities as assets to build on, not gaps to fix.",
  "Anchor abstract STEM ideas in the specific community you describe, without leaning on stereotypes.",
  "Offer more than one way to take in the content and more than one way to show learning.",
  "Honor the reading level, language, low-tech, and neurodiverse supports you set.",
  "Keep the rigor. Relevance and access do not mean easier.",
  "Draft only. Ask the teacher to check it for accuracy and fit before class.",
];

export default function Prompts() {
  const toast = useToast();
  const domains = Object.entries(promptLibrary);
  const copy = (text) => copyToClipboard(text).then(() => toast("Prompt copied"));

  return (
    <div className="page">
      <div className="container stack">
        <SectionHead eyebrow="Under the hood" title="Prompt library">
          Every generator runs on a small set of structured templates. Here is what each one does in
          plain language. If you want the engineering, open the raw code on any card.
        </SectionHead>

        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <div>
              <Badge variant="primary">System prompt</Badge>
              <span className="small muted" style={{ marginLeft: 8 }}>
                the rules every generation inherits
              </span>
            </div>
          </div>
          <ul className="stack small" style={{ margin: "0 0 4px", paddingLeft: 18 }}>
            {SYSTEM_RULES.map((r, i) => (
              <li key={i} className="muted">{r}</li>
            ))}
          </ul>
          <div style={{ marginTop: 12 }}>
            <RawToggle code={systemPrompt} onCopy={() => copy(systemPrompt)} />
          </div>
        </div>

        {domains.map(([key, d]) => (
          <div key={key} className="stack">
            <div className="row" style={{ gap: 10 }}>
              <Badge variant={d.color}>{d.domain}</Badge>
              <span className="tiny faint">
                {d.templates.length} template{d.templates.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-2">
              {d.templates.map((t) => (
                <TemplateCard key={t.id} tpl={t} onCopy={copy} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
