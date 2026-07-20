import React, { useState, useRef, useEffect } from "react";
import {
  Badge,
  Guardrail,
  SectionHead,
  useToast,
  copyToClipboard,
  download,
  Dropdown,
  Term,
} from "../components/ui.jsx";
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

const OUTPUT_ICONS = { lesson: "book", activity: "puzzle", assessment: "clipboard", feedback: "message" };
const REVISION_ICONS = {
  accessible: "access",
  pbl: "puzzle",
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

const STEPS = [
  { id: 0, num: "1", label: "Core Target" },
  { id: 1, num: "2", label: "Classroom Context" },
  { id: 2, num: "3", label: "Accommodations & Formats" },
];

export default function Generate({ input, setInput }) {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [format, setFormat] = useState("quiz");
  const [genId, setGenId] = useState(0);
  const [step, setStep] = useState(0);
  const panelRefs = useRef([]);
  const outputRef = useRef(null);

  const set = (k, v) => setInput((p) => ({ ...p, [k]: v }));
  const toggleNeed = (n) =>
    setInput((p) => ({
      ...p,
      learningNeeds: p.learningNeeds.includes(n)
        ? p.learningNeeds.filter((x) => x !== n)
        : [...p.learningNeeds, n],
    }));

  // Keep off-screen wizard panels out of the tab order for accessibility.
  useEffect(() => {
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === step) el.removeAttribute("inert");
      else el.setAttribute("inert", "");
    });
  }, [step]);

  const loadScenario = (s) => {
    setInput((p) => ({ ...p, ...s.input }));
    setOutput(null);
    setReview(null);
    setStep(0);
    toast(`Loaded ${s.label}`);
  };

  const run = async () => {
    setLoading(true);
    setReview(null);
    setReviewOpen(false);
    const fmt = input.outputType === "assessment" || input.outputType === "feedback" ? format : undefined;
    const out = await generate(input, { format: fmt });
    setOutput(out);
    setGenId((n) => n + 1);
    setLoading(false);
    requestAnimationFrame(() =>
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const revise = (actionId) => {
    if (!output) return;
    setOutput(applyRevision(output, input, actionId));
    setReview(null);
    setReviewOpen(false);
    toast("Revision applied");
  };

  const doReview = () => {
    if (reviewOpen) {
      setReviewOpen(false);
      return;
    }
    setReview(runReview(output, input));
    setReviewOpen(true);
  };

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
        <SectionHead eyebrow="The Dashboard" title="Build a classroom asset in three steps">
          Set up your class once, choose what you want to make, then review it and export.
        </SectionHead>

        <div style={{ marginBottom: 20 }}>
          <Guardrail>
            <strong>Before you use it:</strong> read AI output for accuracy and cultural fit
            first. Do not type anything that identifies a specific student.
          </Guardrail>
        </div>

        {/* Quick start */}
        <div className="card no-print" style={{ marginBottom: 20 }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <strong className="small">Quick start</strong>
            <span className="tiny faint">load a sample classroom</span>
          </div>
          <div className="chips">
            {scenarios.map((s) => (
              <button key={s.id} className="chip" onClick={() => loadScenario(s)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- WIZARD ---------- */}
        <div className="card wizard no-print">
          <div className="stepper">
            {STEPS.map((s) => (
              <button
                key={s.id}
                className={`stepper__item${step === s.id ? " is-active" : ""}${step > s.id ? " is-done" : ""}`}
                onClick={() => setStep(s.id)}
                aria-current={step === s.id ? "step" : undefined}
              >
                <span className="stepper__bar" />
                <span className="stepper__label">
                  <span className="stepper__num">
                    {step > s.id ? <Icon name="check" size="sm" /> : s.num}
                  </span>
                  <span>{s.label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="wizard__viewport">
            <div className="wizard__track" style={{ transform: `translateX(-${step * 100}%)` }}>
              {/* Step 1 — Core Target */}
              <div className="wizard__panel" ref={(el) => (panelRefs.current[0] = el)}>
                <div className="wizard__head">
                  <h3>Core target</h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    The subject and topic you are teaching.
                  </p>
                </div>
                {["subject", "course", "grade", "topic"].map((f) => (
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

              {/* Step 2 — Classroom Context */}
              <div className="wizard__panel" ref={(el) => (panelRefs.current[1] = el)}>
                <div className="wizard__head">
                  <h3>Classroom context</h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    This is the part most tools skip. Be specific, and treat what students bring as
                    an asset (<Term term="CRP">CRP</Term>).
                  </p>
                </div>
                {["studentInterests", "communityContext", "culturalAssets"].map((f) => (
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

              {/* Step 3 — Accommodations & Formats */}
              <div className="wizard__panel" ref={(el) => (panelRefs.current[2] = el)}>
                <div className="wizard__head">
                  <h3>Accommodations and formats</h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    Reduce barriers up front (<Term term="UDL">UDL</Term>), then pick what to make.
                  </p>
                </div>

                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="readingLevel">Reading level</label>
                    <Dropdown
                      id="readingLevel"
                      ariaLabel="Reading level"
                      value={input.readingLevel}
                      options={readingLevels}
                      onChange={(v) => set("readingLevel", v)}
                    />
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
                </div>

                <div className="field">
                  <label>Learning needs</label>
                  <div className="chips">
                    {learningNeedOptions.map((n) => (
                      <button
                        key={n}
                        className="chip"
                        aria-pressed={input.learningNeeds.includes(n)}
                        onClick={() => toggleNeed(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Supports</label>
                    <div className="chips">
                      <button className="chip" aria-pressed={input.neurodiverseSupport} onClick={() => set("neurodiverseSupport", !input.neurodiverseSupport)}>
                        Neurodiverse
                      </button>
                      <button className="chip" aria-pressed={input.lowTech} onClick={() => set("lowTech", !input.lowTech)}>
                        Low-tech / offline
                      </button>
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="resourceLevel">Resource / tech level</label>
                    <Dropdown
                      id="resourceLevel"
                      ariaLabel="Resource or tech level"
                      value={input.resourceLevel}
                      options={resourceLevels}
                      onChange={(v) => set("resourceLevel", v)}
                    />
                  </div>
                </div>

                <div className="field" style={{ marginTop: 20, marginBottom: 0 }}>
                  <label>What do you want to make?</label>
                  <div className="out-select">
                    {outputTypes.map((o) => {
                      const active = input.outputType === o.value;
                      return (
                        <button
                          key={o.value}
                          className={`out-opt${active ? " is-selected" : ""}`}
                          aria-pressed={active}
                          onClick={() => {
                            set("outputType", o.value);
                            if (o.value === "assessment") setFormat("quiz");
                            if (o.value === "feedback") setFormat("strengths");
                          }}
                        >
                          <svg className="out-opt__border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <rect x="1" y="1" width="98" height="98" rx="14" pathLength="100" />
                          </svg>
                          <span className="out-opt__icon">
                            <Icon name={OUTPUT_ICONS[o.value]} />
                          </span>
                          <span>
                            <strong className="small" style={{ display: "block" }}>{o.label}</strong>
                            <span className="tiny muted">{o.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
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
              </div>
            </div>
          </div>

          {/* Wizard navigation */}
          <div className="wizard__nav">
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <Icon name="arrowLeft" size="sm" /> Back
            </button>
            {step < 2 ? (
              <button className="btn btn-primary" onClick={() => setStep((s) => Math.min(2, s + 1))}>
                Next <Icon name="arrowRight" size="sm" />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={run} disabled={loading}>
                {loading ? "Generating…" : (<><Icon name="sparkles" size="sm" /> Generate {labelFor(input.outputType)}</>)}
              </button>
            )}
          </div>
        </div>

        {/* ---------- OUTPUT ---------- */}
        <div ref={outputRef} style={{ marginTop: 28, scrollMarginTop: 84 }}>
          {loading && <SkeletonOutput />}

          {!loading && output && (
            <div className="stack">
              <div className="card no-print">
                <div className="row row-wrap between" style={{ gap: 10 }}>
                  <Badge variant="green"><Icon name="check" size="sm" /> Ready to review</Badge>
                  <div className="row row-wrap" style={{ gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={doReview} aria-expanded={reviewOpen}>
                      <Icon name="shieldCheck" size="sm" /> {reviewOpen ? "Hide review" : "Review for bias & fit"}
                    </button>
                    <button className="btn btn-subtle btn-sm" onClick={doCopy}><Icon name="copy" size="sm" /> Copy</button>
                    <button className="btn btn-subtle btn-sm" onClick={doMarkdown}><Icon name="download" size="sm" /> Markdown</button>
                    <button className="btn btn-subtle btn-sm" onClick={doText}><Icon name="fileText" size="sm" /> Text</button>
                    <button className="btn btn-subtle btn-sm" onClick={doPrint}><Icon name="printer" size="sm" /> Print</button>
                  </div>
                </div>

                {/* Collapsible review slides down from the top of the output */}
                <div className={`collapse${reviewOpen ? " is-open" : ""}`}>
                  <div className="collapse__inner">
                    {review && (
                      <div style={{ paddingTop: 16 }}>
                        <div className="row" style={{ marginBottom: 8 }}>
                          <Badge variant={passCount === review.length ? "green" : "warn"}>
                            {passCount} of {review.length} checks passed
                          </Badge>
                        </div>
                        {review.map((r, i) => (
                          <div className={`check-item${r.pass ? " is-pass" : ""}`} key={i}>
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
                </div>
              </div>

              <DocView key={genId} output={output} progressive />

              <div className="card no-print">
                <strong className="small">Revise this output</strong>
                <p className="tiny muted" style={{ margin: "4px 0 12px" }}>
                  Guided edits you apply with one click, so you never start the prompt over.
                </p>
                <div className="chips">
                  {revisionActions.map((a) => (
                    <button key={a.id} className="chip" onClick={() => revise(a.id)}>
                      <Icon name={REVISION_ICONS[a.id]} size="sm" /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !output && <EmptyState />}
        </div>
      </div>
    </div>
  );
}

// Skeleton wireframe that mirrors the modular output layout.
function SkeletonOutput() {
  return (
    <div className="out-grid" aria-hidden="true">
      <div className="skel-card out-card--header">
        <div className="skel skel-title" />
        <div className="skel-chips">
          <div className="skel skel-chip" />
          <div className="skel skel-chip" style={{ width: 96 }} />
        </div>
      </div>
      {[
        [92, 74],
        [96, 88, 60],
        [90, 80],
        [94, 70],
      ].map((lines, i) => (
        <div className="skel-card" key={i}>
          <div className="skel skel-label" />
          {lines.map((w, j) => (
            <div className="skel skel-line" key={j} style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card center" style={{ padding: "56px 28px" }}>
      <svg className="empty-illo" viewBox="0 0 132 96" fill="none" aria-hidden="true">
        <rect x="26" y="10" width="80" height="76" rx="8" stroke="currentColor" strokeWidth="2.5" />
        <line className="pulse" x1="40" y1="30" x2="92" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line className="pulse" x1="40" y1="44" x2="80" y2="44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "0.3s" }} />
        <line className="pulse" x1="40" y1="58" x2="88" y2="58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "0.6s" }} />
        <line className="pulse" x1="40" y1="72" x2="66" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "0.9s" }} />
        <path d="M104 18c.7 3.4 2.3 5 5.7 5.7-3.4.7-5 2.3-5.7 5.7-.7-3.4-2.3-5-5.7-5.7 3.4-.7 5-2.3 5.7-5.7Z" fill="var(--c-primary)" opacity="0.9" />
      </svg>
      <h3 style={{ marginTop: 0 }}>Your material shows up here</h3>
      <p className="muted" style={{ margin: "0 auto", maxWidth: "42ch" }}>
        Work through the three steps above and press Generate. We will build your customized asset
        right here, one card at a time.
      </p>
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
