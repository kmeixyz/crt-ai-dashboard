import React from "react";
import { Badge, SectionHead, Accordion } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";
import { glossary } from "../data/glossary.js";
import { toolScan, marketGaps } from "../data/toolScan.js";
import { personas } from "../data/personas.js";
import { userStories, journeyMap, featurePriority } from "../data/userStories.js";

function Frameworks() {
  return (
    <div className="acc-pad grid grid-2">
      {glossary.map((g) => (
        <div key={g.term} className="card">
          <h3 style={{ marginBottom: 4 }}>{g.term}</h3>
          <p className="small" style={{ margin: "0 0 8px", fontWeight: 600 }}>{g.short}</p>
          <p className="small muted" style={{ marginBottom: 8 }}>{g.definition}</p>
          <div className="tiny" style={{ padding: "8px 10px", background: "var(--c-primary-soft)", borderRadius: 8, color: "var(--c-primary)" }}>
            <strong>In the product:</strong> {g.inProduct}
          </div>
        </div>
      ))}
    </div>
  );
}

function Personas() {
  return (
    <div className="acc-pad grid grid-3">
      {personas.map((p) => (
        <div key={p.id} className="card stack">
          <div className="row">
            <span className="persona-avatar" style={{ background: p.color }}>{p.initials}</span>
            <div>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <div className="tiny muted">{p.role}</div>
            </div>
          </div>
          <p className="small muted" style={{ margin: 0 }}>{p.context}</p>
          <div className="tiny"><strong>Tech:</strong> <span className="muted">{p.tech}</span></div>
          <div>
            <div className="tiny" style={{ fontWeight: 700, marginBottom: 4 }}>Goals</div>
            <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
              {p.goals.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
          <div>
            <div className="tiny" style={{ fontWeight: 700, marginBottom: 4 }}>Frustrations</div>
            <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
              {p.frustrations.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
          <blockquote className="small" style={{ margin: 0, padding: "8px 12px", borderLeft: `3px solid ${p.color}`, background: "var(--c-surface-alt)", borderRadius: 8, fontStyle: "italic" }}>
            "{p.quote}"
          </blockquote>
          <div className="chips">
            {p.needs.map((n, i) => <span key={i} className="badge badge--primary">{n}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stories() {
  return (
    <div className="acc-pad grid grid-2">
      {userStories.map((group) => (
        <div key={group.theme} className="card">
          <h3>{group.theme}</h3>
          <ul className="stack" style={{ margin: 0, paddingLeft: 18 }}>
            {group.stories.map((s, i) => <li key={i} className="small">{s}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Journey() {
  return (
    <div className="acc-pad">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Stage</th><th>Teacher action</th><th>Thinking</th><th>Feeling</th><th>Design opportunity</th>
            </tr>
          </thead>
          <tbody>
            {journeyMap.map((s, i) => (
              <tr key={i}>
                <td><strong>{s.stage}</strong></td>
                <td>{s.action}</td>
                <td className="muted">{s.thinking}</td>
                <td><Badge>{s.feeling}</Badge></td>
                <td className="muted">{s.opportunity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Features() {
  const cols = [
    { key: "mustHave", label: "Must-have", variant: "green" },
    { key: "niceToHave", label: "Nice-to-have", variant: "primary" },
    { key: "future", label: "Future", variant: "warn" },
  ];
  return (
    <div className="acc-pad grid grid-3">
      {cols.map((c) => (
        <div key={c.key} className="card">
          <Badge variant={c.variant}>{c.label}</Badge>
          <ul className="stack small" style={{ margin: "12px 0 0", paddingLeft: 18 }}>
            {featurePriority[c.key].map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ToolScan() {
  return (
    <div className="acc-pad stack">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tool</th><th>Focus</th><th>Strengths</th><th>CRP / UDL</th><th>Gaps</th>
            </tr>
          </thead>
          <tbody>
            {toolScan.map((t) => (
              <tr key={t.tool}>
                <td><strong>{t.tool}</strong></td>
                <td className="muted">{t.focus}</td>
                <td><ul style={{ margin: 0, paddingLeft: 16 }}>{t.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></td>
                <td className="muted">{t.crpUdl}</td>
                <td><ul style={{ margin: 0, paddingLeft: 16 }}>{t.gaps.map((s, i) => <li key={i}>{s}</li>)}</ul></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{ marginTop: 8 }}>What is missing, and what we add</h3>
      <div className="grid grid-auto">
        {marketGaps.map((g) => (
          <div key={g.title} className="card">
            <strong className="small">{g.title}</strong>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{g.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const ITEMS = [
  { id: "frameworks", title: "The educational frameworks", icon: "bookOpen", content: <Frameworks /> },
  { id: "personas", title: "Who we built it for", icon: "users", content: <Personas /> },
  { id: "stories", title: "What teachers asked for", icon: "message", content: <Stories /> },
  { id: "journey", title: "The teacher's journey", icon: "map", content: <Journey /> },
  { id: "features", title: "What we build first", icon: "layers", content: <Features /> },
  { id: "toolscan", title: "How it compares to other tools", icon: "scan", content: <ToolScan /> },
];

export default function About() {
  return (
    <div className="page">
      <div className="container stack">
        <SectionHead eyebrow="About the tech" title="The thinking behind Lumen">
          Lumen started as research, not a product. Below is the groundwork: the frameworks it
          stands on, the teachers it serves, and how it stacks up against the tools already out
          there. Open any section you want to dig into.
        </SectionHead>

        <Accordion items={ITEMS} defaultOpen={["frameworks"]} />
      </div>
    </div>
  );
}
