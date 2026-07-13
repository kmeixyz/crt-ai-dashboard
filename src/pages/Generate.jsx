import React, { useState } from "react";
import { Badge, Guardrail, SectionHead, useToast, copyToClipboard, download } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";
import DocView from "../components/DocView.jsx";
import {
  fieldMeta,
  readingLevels,
  resourceLevels,
  learningNeedOptions,
  outputTypes,
} from "../data/inputSchema.js";
import { scenarios } from "../data/scenarios.js";
import { revisionActions } from "../data/promptLibrary.js";
import {
  generate,
  applyRevision,
  runReview,
  outputToMarkdown,
  outputToText,
} from "../engine/mockAI.js";

const contextFields = ["subject", "course", "grade", "topic"];
const anchorFields = ["studentInterests", "communityContext", "culturalAssets"];

const OUTPUT_ICONS = { lesson: "book", activity: "beaker", assessment: "clipboard", feedback: "message" };
const REVISION_ICONS = {
  accessible: "access",
  pbl: "beaker",
  lowtech: "printer",
  multilingual: "language",
  cultural: "sparkles",
};

const assessmentFormats = [
  { value: "quiz", label: "Quiz" },
  { value: "exit", label: "Exit Ticket" },
  { value: "rubric", label: "Project Rubric" },
  { value: "multimodal", label: "Multimodal" },
];
const feedbackFormats = [
  { value: "strengths", label: "Strengths-Based" },
  { value: "growth", label: "Growth-Oriented" },
  { value: "reflection", label: "Reflection Prompts" },
  { value: "family", label: "Family-Friendly" },
];

export default function Generate({ input, setInput }) {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [format, setFormat] = useState("quiz");

  const set = (k, v) => setInput((p) => ({ ...p, [k]: v }));
  const toggleNeed = (n) =>
    setInput((p) => ({
      ...p,
      learningNeeds: p.learningNeeds.includes(n)
        ? p.learningNeeds.filter((x) => x !== n)
        : [...p.learningNeeds, n],
    }));

  const loadScenario = (s) => {
    setInput((p) => ({ ...p, ...s.input }));
    setOutput(null);
    setReview(null);
    toast(`Loaded: ${s.label}`);
  };

  const run = async () => {
    setLoading(true);
    setReview(null);
    const fmt = input.outputType === "assessment" || input.outputType === "feedback" ? format : undefined;
    const out = await generate(input, { format: fmt });
    setOutput(out);
    setLoading(false);
  };

  const revise = (actionId) => {
    if (!output) return;
    setOutput(applyRevision(output, input, actionId));
    setReview(null);
    toast("Revision applied");
  };

  const doReview = () => setReview(runReview(output, input));

  const doCopy = async () => {
    await copyToClipboard(outputToText(output));
    toast("Copied to clipboard");
  };
  const doMarkdown = () => {
    download(fileName(output, "md"), outputToMarkdown(output));
    toast("Downloaded Markdown");
  };
  const doText = () => {
    download(fileName(output, "txt"), outputToText(output), "text/plain");
    toast("Downloaded text");
  };
  const doPrint = () => window.print();

  const passCount = review ? review.filter((r) => r.pass).length : 0;
  const showFormat = input.outputType === "assessment" || input.outputType === "feedback";
  const formats = input.outputType === "assessment" ? assessmentFormats : feedbackFormats;

  return (
    <div className="page">
      <div className="container">
        <SectionHead eyebrow="The Dashboard" title="Generate culturally responsive materials">
          Enter your class context once, choose what to generate, then review, revise, and export.
        </SectionHead>

        <div style={{ marginBottom: 20 }}>
          <Guardrail>
            <strong>Responsible use:</strong> Review AI outputs for accuracy and cultural fit
            before classroom use. <strong>Never enter personally identifiable student
            information.</strong>
          </Guardrail>
        </div>

        <div className="split">
          {/* ---------- LEFT: input form ---------- */}
          <div className="stack">
            <div className="card no-print">
              <div className="row between" style={{ marginBottom: 10 }}>
                <strong className="small">Quick start</strong>
                <span className="tiny faint">load a sample scenario</span>
              </div>
              <div className="chips">
                {scenarios.map((s) => (
                  <button key={s.id} className="chip" onClick={() => loadScenario(s)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Context */}
            <div className="group group--context">
              <div className="group__title">
                <span className="group__num gn--context">1</span> Class Context
              </div>
              <div className="group__desc">Who and what you're teaching.</div>
              {contextFields.map((f) => (
                <div className="field" key={f}>
                  <label htmlFor={f}>{fieldMeta[f].label}</label>
                  <input
                    id={f}
                    className="input"
                    value={input[f]}
                    placeholder={fieldMeta[f].placeholder}
                    onChange={(e) => set(f, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Cultural & Community Anchors */}
            <div className="group group--anchors">
              <div className="group__title">
                <span className="group__num gn--anchors">2</span> Cultural &amp; Community Anchors
              </div>
              <div className="group__desc">
                The heart of CRP — build from students' world, specifically.
              </div>
              {anchorFields.map((f) => (
                <div className="field" key={f}>
                  <label htmlFor={f}>{fieldMeta[f].label}</label>
                  <textarea
                    id={f}
                    className="textarea"
                    value={input[f]}
                    placeholder={fieldMeta[f].placeholder}
                    onChange={(e) => set(f, e.target.value)}
                  />
                  {fieldMeta[f].hint && <div className="hint">{fieldMeta[f].hint}</div>}
                </div>
              ))}
            </div>

            {/* Accessibility Supports */}
            <div className="group group--access">
              <div className="group__title">
                <span className="group__num gn--access">3</span> Accessibility Supports
              </div>
              <div className="group__desc">UDL — reduce barriers up front.</div>
              <div className="field">
                <label htmlFor="readingLevel">Reading level</label>
                <select id="readingLevel" className="select" value={input.readingLevel} onChange={(e) => set("readingLevel", e.target.value)}>
                  {readingLevels.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="language">Language support</label>
                <input
                  id="language"
                  className="input"
                  value={input.language}
                  placeholder="e.g. English, English + Spanish"
                  onChange={(e) => set("language", e.target.value)}
                />
              </div>
              <div className="chips" style={{ marginTop: 4 }}>
                <button className="chip" aria-pressed={input.neurodiverseSupport} onClick={() => set("neurodiverseSupport", !input.neurodiverseSupport)}>
                  Neurodiverse supports
                </button>
                <button className="chip" aria-pressed={input.lowTech} onClick={() => set("lowTech", !input.lowTech)}>
                  Low-tech / offline
                </button>
              </div>
            </div>

            {/* Differentiation */}
            <div className="group group--diff">
              <div className="group__title">
                <span className="group__num gn--diff">4</span> Differentiation Options
              </div>
              <div className="group__desc">Match varied readiness and needs.</div>
              <div className="field">
                <label>Learning needs</label>
                <div className="chips">
                  {learningNeedOptions.map((n) => (
                    <button key={n} className="chip" aria-pressed={input.learningNeeds.includes(n)} onClick={() => toggleNeed(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="resourceLevel">Resource / tech level</label>
                <select id="resourceLevel" className="select" value={input.resourceLevel} onChange={(e) => set("resourceLevel", e.target.value)}>
                  {resourceLevels.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ---------- RIGHT: generate + output ---------- */}
          <div className="stack">
            <div className="card no-print">
              <label className="small" style={{ fontWeight: 700, display: "block", marginBottom: 12 }}>
                What do you want to generate?
              </label>
              <div className="grid grid-2" style={{ gap: 10 }}>
                {outputTypes.map((o) => {
                  const active = input.outputType === o.value;
                  return (
                    <button
                      key={o.value}
                      className="card card--interactive"
                      aria-pressed={active}
                      style={{
                        padding: 14,
                        textAlign: "left",
                        borderColor: active ? "var(--c-primary)" : undefined,
                        background: active ? "var(--c-primary-soft)" : undefined,
                      }}
                      onClick={() => {
                        set("outputType", o.value);
                        if (o.value === "assessment") setFormat("quiz");
                        if (o.value === "feedback") setFormat("strengths");
                      }}
                    >
                      <div className="row" style={{ gap: 10 }}>
                        <Icon name={OUTPUT_ICONS[o.value]} style={{ color: active ? "var(--c-primary)" : "var(--c-ink-soft)" }} />
                        <div>
                          <strong className="small">{o.label}</strong>
                          <div className="tiny muted">{o.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showFormat && (
                <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
                  <label>Format</label>
                  <div className="chips">
                    {formats.map((f) => (
                      <button key={f.value} className="chip" aria-pressed={format === f.value} onClick={() => setFormat(f.value)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 18 }} onClick={run} disabled={loading}>
                {loading ? "Generating…" : (<><Icon name="sparkles" size="sm" /> Generate {labelFor(input.outputType)}</>)}
              </button>
            </div>

            {loading && <LoadingCard />}

            {!loading && output && (
              <>
                <div className="card">
                  <div className="row row-wrap between no-print" style={{ marginBottom: 14, gap: 10 }}>
                    <Badge variant="green"><Icon name="check" size="sm" /> Generated draft</Badge>
                    <div className="row row-wrap" style={{ gap: 6 }}>
                      <button className="btn btn-subtle btn-sm" onClick={doCopy}><Icon name="copy" size="sm" /> Copy</button>
                      <button className="btn btn-subtle btn-sm" onClick={doMarkdown}><Icon name="download" size="sm" /> Markdown</button>
                      <button className="btn btn-subtle btn-sm" onClick={doText}><Icon name="fileText" size="sm" /> Text</button>
                      <button className="btn btn-subtle btn-sm" onClick={doPrint}><Icon name="printer" size="sm" /> Print</button>
                    </div>
                  </div>
                  <DocView output={output} />
                </div>

                <div className="card no-print">
                  <strong className="small">Revise this output</strong>
                  <p className="tiny muted" style={{ margin: "4px 0 12px" }}>
                    Guided revisions — no re-prompting from scratch.
                  </p>
                  <div className="chips">
                    {revisionActions.map((a) => (
                      <button key={a.id} className="chip" onClick={() => revise(a.id)}>
                        <Icon name={REVISION_ICONS[a.id]} size="sm" /> {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card no-print">
                  <div className="row between" style={{ gap: 12 }}>
                    <div>
                      <strong className="small">Review for Bias &amp; Fit</strong>
                      <p className="tiny muted" style={{ margin: "4px 0 0" }}>
                        CRP / UDL checklist before classroom use.
                      </p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={doReview}>
                      <Icon name="shieldCheck" size="sm" /> {review ? "Re-run" : "Run review"}
                    </button>
                  </div>
                  {review && (
                    <div style={{ marginTop: 14 }}>
                      <div className="row" style={{ marginBottom: 8 }}>
                        <Badge variant={passCount === review.length ? "green" : "warn"}>
                          {passCount}/{review.length} checks passed
                        </Badge>
                      </div>
                      {review.map((r, i) => (
                        <div className="check-item" key={i}>
                          <span className={`check-mark${r.pass ? "" : " check-mark--flag"}`}>
                            <Icon name={r.pass ? "check" : "alert"} size="sm" />
                          </span>
                          <div>
                            <div className="small" style={{ fontWeight: 600 }}>{r.q}</div>
                            <div className="tiny muted">{r.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && !output && (
              <div className="card center" style={{ padding: "56px 24px" }}>
                <div className="feature-icon fi--primary" style={{ margin: "0 auto 12px", width: 52, height: 52 }}>
                  <Icon name="sparkles" size="lg" />
                </div>
                <h3 style={{ marginTop: 0 }}>Your generated material appears here</h3>
                <p className="muted" style={{ margin: 0 }}>
                  Fill in the class context (or load a sample) and press Generate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 16 }}>
        <span className="thinking"><span /><span /><span /></span>
        <span className="small muted">Drafting a culturally responsive output…</span>
      </div>
      {[70, 100, 90, 100, 60].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 12, width: `${w}%`, marginBottom: 10 }} />
      ))}
    </div>
  );
}

function labelFor(t) {
  return { lesson: "Lesson Plan", activity: "Activity", assessment: "Assessment", feedback: "Feedback" }[t] || "";
}
function fileName(output, ext) {
  const base = (output.title || "output").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${base || "lumen-output"}.${ext}`;
}
