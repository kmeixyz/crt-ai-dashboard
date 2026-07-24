import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Badge,
  useToast,
  copyToClipboard,
  download,
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
  { id: 0, num: "1", label: "Format" },
  { id: 1, num: "2", label: "Class" },
  { id: 2, num: "3", label: "Context" },
];

function OptButton({ selected, onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      className={`quiz-opt${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="quiz-opt__check" aria-hidden="true">
        <Icon name="check" size="sm" />
      </span>
      <span className="quiz-opt__label">{children}</span>
    </button>
  );
}

function Section({ label, action, children, count }) {
  return (
    <div className="quiz-section">
      <div className="quiz-section__head">
        <span className="quiz-section__label">
          {label}
          {typeof count === "number" && (
            <span className="quiz-count"> ({count} selected)</span>
          )}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Generate({ input, setInput }) {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [format, setFormat] = useState("quiz");
  const [genId, setGenId] = useState(0);
  const [step, setStep] = useState(0);
  const [vh, setVh] = useState(null);
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
  const allNeeds = learningNeedOptions.every((n) => input.learningNeeds.includes(n));
  const toggleAllNeeds = () =>
    setInput((p) => ({ ...p, learningNeeds: allNeeds ? [] : [...learningNeedOptions] }));

  const showFormat = input.outputType === "assessment" || input.outputType === "feedback";
  const formats = input.outputType === "assessment" ? assessmentFormats : feedbackFormats;

  useEffect(() => {
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === step) el.removeAttribute("inert");
      else el.setAttribute("inert", "");
    });
  }, [step]);

  useLayoutEffect(() => {
    const el = panelRefs.current[step];
    if (el) setVh(el.offsetHeight);
  }, [step, input, format, showFormat]);

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
    const fmt = showFormat ? format : undefined;
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
  // Progress fills through the completed portion, matching CensusBot's bar.
  const progress = ((step + 1) / STEPS.length) * 100;
  const summaryChips = [
    labelFor(input.outputType),
    input.subject,
    input.grade,
    input.topic,
  ].filter(Boolean);
  const canGenerate = Boolean(input.topic?.trim() || input.subject?.trim());

  return (
    <div className="page page--quiz">
      <div className="container">
        <div className="quiz no-print">
          <h1 className="quiz-title">Resource Builder</h1>

          <div className="quiz-progress">
            <div className="quiz-steps" role="list">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    className={`quiz-step${step === s.id ? " is-active" : ""}${step > s.id ? " is-done" : ""}`}
                    aria-current={step === s.id ? "step" : undefined}
                    onClick={() => setStep(s.id)}
                  >
                    <span className="quiz-step__circle">
                      {step > s.id ? <Icon name="check" size="sm" /> : s.num}
                    </span>
                    <span className="quiz-step__label">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className={`quiz-conn${step > s.id ? " is-done" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="quiz-bar" aria-hidden="true">
              <div className="quiz-bar__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {step > 0 && summaryChips.length > 0 && (
            <div className="quiz-summary">
              <span className="quiz-summary__label">Building:</span>
              {summaryChips.map((c, i) => (
                <span key={i} className="quiz-chip">{c}</span>
              ))}
            </div>
          )}

          <div className="quiz-card">
            <div className="wizard__viewport" style={vh ? { height: vh } : undefined}>
              <div
                className="wizard__track"
                style={{ transform: `translateX(-${step * 100}%)` }}
              >
                {/* Step 1 — Format (Metrics-style pill grids) */}
                <div className="wizard__panel" ref={(el) => (panelRefs.current[0] = el)}>
                  <h2 className="quiz-q">What would you like to create?</h2>
                  <p className="quiz-sub">
                    Choose a format, then the supports your students need.
                  </p>

                  <Section label="Quick start">
                    <div className="quiz-grid quiz-grid--2">
                      {scenarios.map((s) => (
                        <OptButton key={s.id} selected={false} onClick={() => loadScenario(s)}>
                          {s.label}
                        </OptButton>
                      ))}
                    </div>
                  </Section>

                  <Section label="What to make">
                    <div className="quiz-grid quiz-grid--2">
                      {outputTypes.map((o) => (
                        <OptButton
                          key={o.value}
                          selected={input.outputType === o.value}
                          onClick={() => {
                            set("outputType", o.value);
                            if (o.value === "assessment") setFormat("quiz");
                            if (o.value === "feedback") setFormat("strengths");
                          }}
                        >
                          {o.label}
                        </OptButton>
                      ))}
                    </div>
                  </Section>

                  {showFormat && (
                    <Section label="Format">
                      <div className="quiz-grid quiz-grid--2">
                        {formats.map((f) => (
                          <OptButton
                            key={f.value}
                            selected={format === f.value}
                            onClick={() => setFormat(f.value)}
                          >
                            {f.label}
                          </OptButton>
                        ))}
                      </div>
                    </Section>
                  )}

                  <Section label="Reading level">
                    <div className="quiz-grid quiz-grid--2">
                      {readingLevels.map((r) => (
                        <OptButton
                          key={r.value}
                          selected={input.readingLevel === r.value}
                          onClick={() => set("readingLevel", r.value)}
                        >
                          {r.label}
                        </OptButton>
                      ))}
                    </div>
                  </Section>

                  <Section
                    label="Learning needs"
                    count={input.learningNeeds.length}
                    action={
                      <button type="button" className="quiz-selectall" onClick={toggleAllNeeds}>
                        <Icon name="check" size="sm" />
                        {allNeeds ? "Deselect All" : "Select All"}
                      </button>
                    }
                  >
                    <div className="quiz-grid">
                      {learningNeedOptions.map((n) => (
                        <OptButton
                          key={n}
                          selected={input.learningNeeds.includes(n)}
                          onClick={() => toggleNeed(n)}
                        >
                          {n}
                        </OptButton>
                      ))}
                    </div>
                  </Section>

                  <Section label="Additional supports">
                    <div className="quiz-grid quiz-grid--2">
                      <OptButton
                        selected={input.neurodiverseSupport}
                        onClick={() => set("neurodiverseSupport", !input.neurodiverseSupport)}
                      >
                        Neurodiverse supports
                      </OptButton>
                      <OptButton
                        selected={input.lowTech}
                        onClick={() => set("lowTech", !input.lowTech)}
                      >
                        Low-tech / offline
                      </OptButton>
                    </div>
                  </Section>

                  <Section label="Resource / tech level">
                    <div className="quiz-grid">
                      {resourceLevels.map((r) => (
                        <OptButton
                          key={r.value}
                          selected={input.resourceLevel === r.value}
                          onClick={() => set("resourceLevel", r.value)}
                        >
                          {r.label}
                        </OptButton>
                      ))}
                    </div>
                  </Section>
                </div>

                {/* Step 2 — Class (Location-style form) */}
                <div className="wizard__panel" ref={(el) => (panelRefs.current[1] = el)}>
                  <h2 className="quiz-q">What are you teaching?</h2>
                  <p className="quiz-sub">Subject, course, grade, and the topic for this resource.</p>

                  <div className="quiz-fields">
                    <div className="quiz-field quiz-field--full">
                      <label htmlFor="subject">{fieldMeta.subject.label}</label>
                      <input
                        id="subject"
                        className="input"
                        value={input.subject}
                        placeholder={fieldMeta.subject.placeholder}
                        onChange={(e) => set("subject", e.target.value)}
                      />
                    </div>
                    <div className="quiz-field">
                      <label htmlFor="course">{fieldMeta.course.label}</label>
                      <input
                        id="course"
                        className="input"
                        value={input.course}
                        placeholder={fieldMeta.course.placeholder}
                        onChange={(e) => set("course", e.target.value)}
                      />
                    </div>
                    <div className="quiz-field">
                      <label htmlFor="grade">{fieldMeta.grade.label}</label>
                      <input
                        id="grade"
                        className="input"
                        value={input.grade}
                        placeholder={fieldMeta.grade.placeholder}
                        onChange={(e) => set("grade", e.target.value)}
                      />
                    </div>
                    <div className="quiz-field quiz-field--full">
                      <label htmlFor="topic">{fieldMeta.topic.label}</label>
                      <input
                        id="topic"
                        className="input"
                        value={input.topic}
                        placeholder={fieldMeta.topic.placeholder}
                        onChange={(e) => set("topic", e.target.value)}
                      />
                    </div>
                    <div className="quiz-field quiz-field--full">
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
                </div>

                {/* Step 3 — Context (form) */}
                <div className="wizard__panel" ref={(el) => (panelRefs.current[2] = el)}>
                  <h2 className="quiz-q">Who are your students?</h2>
                  <p className="quiz-sub">
                    Be specific. Treat what they bring as an asset (
                    <Term term="CRP">CRP</Term>
                    ).
                  </p>

                  {["studentInterests", "communityContext", "culturalAssets"].map((f) => (
                    <div className="quiz-section" key={f}>
                      <label className="quiz-fieldlabel" htmlFor={f}>
                        {fieldMeta[f].label}
                      </label>
                      <textarea
                        id={f}
                        className="textarea"
                        value={input[f]}
                        placeholder={fieldMeta[f].placeholder}
                        onChange={(e) => set(f, e.target.value)}
                      />
                      {fieldMeta[f].hint && <div className="quiz-hint">{fieldMeta[f].hint}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="quiz-nav">
              {step > 0 ? (
                <button
                  type="button"
                  className="quiz-btn quiz-btn--ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <Icon name="arrowLeft" size="sm" /> Back
                </button>
              ) : (
                <span />
              )}
              {step < 2 ? (
                <button
                  type="button"
                  className="quiz-btn quiz-btn--primary"
                  onClick={() => setStep((s) => Math.min(2, s + 1))}
                >
                  Next <Icon name="arrowRight" size="sm" />
                </button>
              ) : (
                <button
                  type="button"
                  className="quiz-btn quiz-btn--primary"
                  onClick={run}
                  disabled={loading || !canGenerate}
                >
                  {loading ? (
                    "Generating…"
                  ) : (
                    <>
                      Generate <Icon name="arrowRight" size="sm" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="quiz-note">
            Review AI output for accuracy and cultural fit before you use it in class. Never enter
            anything that identifies a specific student.
          </p>
        </div>

        <div ref={outputRef} style={{ marginTop: 28, scrollMarginTop: 84 }}>
          {loading && <SkeletonOutput />}

          {!loading && output && (
            <div className="stack">
              <div className="card no-print">
                <div className="row row-wrap between" style={{ gap: 10 }}>
                  <Badge variant="green">
                    <Icon name="check" size="sm" /> Ready to review
                  </Badge>
                  <div className="row row-wrap" style={{ gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={doReview}
                      aria-expanded={reviewOpen}
                    >
                      <Icon name="shieldCheck" size="sm" />{" "}
                      {reviewOpen ? "Hide review" : "Review for bias & fit"}
                    </button>
                    <button className="btn btn-subtle btn-sm" onClick={doCopy}>
                      <Icon name="copy" size="sm" /> Copy
                    </button>
                    <button className="btn btn-subtle btn-sm" onClick={doMarkdown}>
                      <Icon name="download" size="sm" /> Markdown
                    </button>
                    <button className="btn btn-subtle btn-sm" onClick={doText}>
                      <Icon name="fileText" size="sm" /> Text
                    </button>
                    <button className="btn btn-subtle btn-sm" onClick={doPrint}>
                      <Icon name="printer" size="sm" /> Print
                    </button>
                  </div>
                </div>

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
                              <div className="small" style={{ fontWeight: 600 }}>
                                {r.q}
                              </div>
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
        </div>
      </div>
    </div>
  );
}

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

function labelFor(t) {
  return (
    { lesson: "Lesson Plan", activity: "Activity", assessment: "Assessment", feedback: "Feedback" }[
      t
    ] || ""
  );
}
function fileName(output, ext) {
  const base = (output.title || "output")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "lumen-output"}.${ext}`;
}
