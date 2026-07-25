import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast, copyToClipboard, download, Term } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";
import WizardSteps from "../components/WizardSteps.jsx";
import StubCombobox from "../components/StubCombobox.jsx";
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
import ex from "../styles/Explore.module.css";

const WIZARD_STEPS = ["Format", "Class", "Context", "Results"];
const PROGRESS = { 1: 25, 2: 50, 3: 75, 4: 100 };

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

const SUBJECT_OPTIONS = [
  "Science",
  "Mathematics",
  "Computer Science",
  "Engineering",
  "Physics",
  "Chemistry",
  "Biology",
  "Environmental Science",
];
const COURSE_OPTIONS = [
  "Algebra I",
  "Algebra II",
  "Geometry",
  "AP Calculus AB",
  "AP Calculus BC",
  "Biology",
  "Chemistry",
  "Physics",
  "Environmental Science",
  "AP Computer Science A",
  "Intro to Engineering",
];
const GRADE_OPTIONS = ["9", "10", "11", "12", "9-10", "10-11", "11-12"];

function Choice({ selected, onClick, children }) {
  return (
    <motion.button
      type="button"
      className={`${ex.choice} ${selected ? ex.choiceSelected : ""}`}
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 500, damping: 22 } }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            className={ex.choiceCheck}
            aria-hidden="true"
            style={{ minWidth: 0, overflow: "hidden", display: "inline-flex" }}
            initial={{ opacity: 0, scale: 0.3, width: 0, x: -4 }}
            animate={{ opacity: 1, scale: 1, width: "1em", x: 0 }}
            exit={{ opacity: 0, scale: 0.3, width: 0, x: -4 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

function MetricGroup({ label, count, action, children }) {
  return (
    <motion.div
      className={ex.metricGroup}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <div className={ex.metricGroupHeader}>
        <span className={ex.metricGroupLabel}>
          {label}
          {typeof count === "number" ? ` (${count} selected)` : ""}
        </span>
        {action}
      </div>
      {children}
    </motion.div>
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

export default function Generate({ input, setInput }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [fromProgress, setFromProgress] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const exitTimerRef = useRef(null);

  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [format, setFormat] = useState("quiz");
  const [genId, setGenId] = useState(0);
  const [showRevise, setShowRevise] = useState(false);

  const targetProgress = PROGRESS[step] ?? 25;
  const showFormat = input.outputType === "assessment" || input.outputType === "feedback";
  const formats = input.outputType === "assessment" ? assessmentFormats : feedbackFormats;

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
    setInput((p) => ({
      ...p,
      learningNeeds: allNeeds ? [] : [...learningNeedOptions],
    }));

  const contextLabels = useMemo(() => {
    const labels = [labelFor(input.outputType), input.subject, input.grade, input.topic].filter(
      Boolean
    );
    return labels;
  }, [input.outputType, input.subject, input.grade, input.topic]);

  const canGenerate = Boolean(input.topic?.trim() || input.subject?.trim());
  const canLeaveFormat = Boolean(input.outputType);
  const canLeaveClass = Boolean(input.subject?.trim() || input.topic?.trim());

  useEffect(() => {
    setProgressWidth(fromProgress);
    const id = requestAnimationFrame(() => setProgressWidth(targetProgress));
    return () => cancelAnimationFrame(id);
  }, [fromProgress, targetProgress, step]);

  useEffect(() => () => clearTimeout(exitTimerRef.current), []);

  function goToStep(next, direction) {
    setExitDir(direction);
    clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setFromProgress(PROGRESS[step] ?? 0);
      setStep(next);
      setExitDir(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  }

  function handleWizardNav(target) {
    if (target >= step) return;
    if (target === 1 || target === 2 || target === 3) {
      goToStep(target, 1);
    }
  }

  const loadScenario = (s) => {
    setInput((p) => ({ ...p, ...s.input }));
    setOutput(null);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    toast(`Loaded ${s.label}`);
  };

  const run = async () => {
    setLoading(true);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    goToStep(4, -1);
    const fmt = showFormat ? format : undefined;
    const out = await generate(input, { format: fmt });
    setOutput(out);
    setGenId((n) => n + 1);
    setLoading(false);
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

  const restart = () => {
    setOutput(null);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    setFromProgress(0);
    goToStep(1, 1);
  };

  const passCount = review ? review.filter((r) => r.pass).length : 0;
  const resultsTitle = input.topic?.trim() || input.subject?.trim() || "your class";

  return (
    <div className={ex.wizardPage}>
      <h1 className={ex.pageTitle}>Resource Builder</h1>

      <div className={ex.progressBlock}>
        <WizardSteps current={step} onNavigate={handleWizardNav} steps={WIZARD_STEPS} />
        <div className={ex.progressTrack}>
          <div className={ex.progressFill} style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      <motion.div
        key={step}
        className={ex.wizardContent}
        initial={{ opacity: 0, x: fromProgress > targetProgress ? -48 : 48 }}
        animate={
          exitDir !== 0
            ? { opacity: 0, x: exitDir * 48, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
            : { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
        }
      >
        {step > 1 && step < 4 && contextLabels.length > 0 && (
          <AnimatePresence>
            <motion.div
              className={ex.contextBadgeStrip}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <span className={ex.contextBadgeLabel}>Building:</span>
              {contextLabels.map((label, i) => (
                <motion.span
                  key={`${label}-${i}`}
                  className={ex.contextBadge}
                  initial={{ opacity: 0, scale: 0.78, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26, delay: i * 0.05 }}
                >
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Step 1: Format (metrics-style choice grids) ── */}
        {step === 1 && (
          <>
            <div className={ex.card}>
              <p className={ex.question}>What would you like to create?</p>
              <p className={ex.questionSub}>
                Choose a format, then the supports your students need.
              </p>

              <motion.div
                className={ex.metricGroups}
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              >
                <MetricGroup label="Quick start">
                  <div className={ex.choiceList}>
                    {scenarios.map((s) => (
                      <Choice key={s.id} selected={false} onClick={() => loadScenario(s)}>
                        {s.label}
                      </Choice>
                    ))}
                  </div>
                </MetricGroup>

                <MetricGroup label="What to make">
                  <div className={ex.choiceList}>
                    {outputTypes.map((o) => (
                      <Choice
                        key={o.value}
                        selected={input.outputType === o.value}
                        onClick={() => {
                          set("outputType", o.value);
                          if (o.value === "assessment") setFormat("quiz");
                          if (o.value === "feedback") setFormat("strengths");
                        }}
                      >
                        {o.label}
                      </Choice>
                    ))}
                  </div>
                </MetricGroup>

                {showFormat && (
                  <MetricGroup label="Format">
                    <div className={ex.choiceList}>
                      {formats.map((f) => (
                        <Choice
                          key={f.value}
                          selected={format === f.value}
                          onClick={() => setFormat(f.value)}
                        >
                          {f.label}
                        </Choice>
                      ))}
                    </div>
                  </MetricGroup>
                )}

                <MetricGroup label="Reading level">
                  <div className={ex.choiceList}>
                    {readingLevels.map((r) => (
                      <Choice
                        key={r.value}
                        selected={input.readingLevel === r.value}
                        onClick={() => set("readingLevel", r.value)}
                      >
                        {r.label}
                      </Choice>
                    ))}
                  </div>
                </MetricGroup>

                <MetricGroup
                  label="Learning needs"
                  count={input.learningNeeds.length}
                  action={
                    <button
                      type="button"
                      className={`${ex.selectAllBtn} ${
                        input.learningNeeds.length > 0 ? ex.selectAllBtnActive : ""
                      }`}
                      onClick={toggleAllNeeds}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {allNeeds ? "Deselect All" : "Select All"}
                    </button>
                  }
                >
                  <div className={ex.choiceList}>
                    {learningNeedOptions.map((n) => (
                      <Choice
                        key={n}
                        selected={input.learningNeeds.includes(n)}
                        onClick={() => toggleNeed(n)}
                      >
                        {n}
                      </Choice>
                    ))}
                  </div>
                </MetricGroup>

                <MetricGroup label="Additional supports">
                  <div className={ex.choiceList}>
                    <Choice
                      selected={input.neurodiverseSupport}
                      onClick={() => set("neurodiverseSupport", !input.neurodiverseSupport)}
                    >
                      Neurodiverse supports
                    </Choice>
                    <Choice
                      selected={input.lowTech}
                      onClick={() => set("lowTech", !input.lowTech)}
                    >
                      Low-tech / offline
                    </Choice>
                  </div>
                </MetricGroup>

                <MetricGroup label="Resource / tech level">
                  <div className={ex.choiceList}>
                    {resourceLevels.map((r) => (
                      <Choice
                        key={r.value}
                        selected={input.resourceLevel === r.value}
                        onClick={() => set("resourceLevel", r.value)}
                      >
                        {r.label}
                      </Choice>
                    ))}
                  </div>
                </MetricGroup>
              </motion.div>
            </div>

            <div className={ex.footerNav} style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className={`${ex.btnPrimary}${canLeaveFormat ? ` ${ex.btnPrimaryActive}` : ""}`}
                disabled={!canLeaveFormat}
                onClick={() => goToStep(2, -1)}
              >
                Next →
              </button>
            </div>

            <p className={ex.excludedNote}>
              Review AI output for accuracy and cultural fit before you use it in class. Never enter
              anything that identifies a specific student.
            </p>
          </>
        )}

        {/* ── Step 2: Class (location-style form + comboboxes) ── */}
        {step === 2 && (
          <div className={ex.card}>
            <p className={ex.question}>What are you teaching?</p>
            <p className={ex.questionSub}>
              Subject, course, grade, and the topic for this resource.
            </p>

            <div className={ex.fieldsGrid}>
              <div className={ex.fieldsGridFull}>
                <StubCombobox
                  id="subject"
                  label={fieldMeta.subject.label}
                  value={input.subject}
                  onChange={(v) => set("subject", v)}
                  options={SUBJECT_OPTIONS}
                  placeholder={fieldMeta.subject.placeholder}
                  emptyNoun="subjects"
                />
              </div>
              <StubCombobox
                id="course"
                label={fieldMeta.course.label}
                value={input.course}
                onChange={(v) => set("course", v)}
                options={COURSE_OPTIONS}
                placeholder={fieldMeta.course.placeholder}
                emptyNoun="courses"
              />
              <StubCombobox
                id="grade"
                label={fieldMeta.grade.label}
                value={input.grade}
                onChange={(v) => set("grade", v)}
                options={GRADE_OPTIONS}
                placeholder={fieldMeta.grade.placeholder}
                emptyNoun="grades"
              />
              <div className={ex.fieldsGridFull}>
                <div className={ex.fieldGroup}>
                  <label className={ex.fieldLabel} htmlFor="topic">
                    {fieldMeta.topic.label}
                  </label>
                  <input
                    id="topic"
                    className={ex.comboboxInput}
                    value={input.topic}
                    placeholder={fieldMeta.topic.placeholder}
                    onChange={(e) => set("topic", e.target.value)}
                  />
                </div>
              </div>
              <div className={ex.fieldsGridFull}>
                <div className={ex.fieldGroup}>
                  <label className={ex.fieldLabel} htmlFor="language">
                    Language support
                  </label>
                  <input
                    id="language"
                    className={ex.comboboxInput}
                    value={input.language}
                    placeholder="e.g. English, English + Spanish"
                    onChange={(e) => set("language", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={ex.footerNav} style={{ marginTop: "1.25rem", maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={() => goToStep(1, 1)}>
                ← Back
              </button>
              <button
                type="button"
                className={`${ex.btnPrimary}${canLeaveClass ? ` ${ex.btnPrimaryActive}` : ""}`}
                disabled={!canLeaveClass}
                onClick={() => goToStep(3, -1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Context ── */}
        {step === 3 && (
          <div className={ex.card}>
            <p className={ex.question}>Who are your students?</p>
            <p className={ex.questionSub}>
              Be specific. Treat what they bring as an asset (<Term term="CRP">CRP</Term>).
            </p>

            {["studentInterests", "communityContext", "culturalAssets"].map((f) => (
              <div className={ex.fieldGroup} key={f}>
                <label className={ex.fieldLabel} htmlFor={f}>
                  {fieldMeta[f].label}
                </label>
                <textarea
                  id={f}
                  className={ex.textArea}
                  value={input[f]}
                  placeholder={fieldMeta[f].placeholder}
                  onChange={(e) => set(f, e.target.value)}
                />
                {fieldMeta[f].hint && <div className={ex.fieldHint}>{fieldMeta[f].hint}</div>}
              </div>
            ))}

            <div className={ex.footerNav} style={{ marginTop: "1.25rem", maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={() => goToStep(2, 1)}>
                ← Back
              </button>
              <button
                type="button"
                className={`${ex.btnPrimary}${canGenerate ? ` ${ex.btnPrimaryActive}` : ""}`}
                disabled={loading || !canGenerate}
                onClick={run}
              >
                {loading ? <span className={ex.spinner} /> : "Generate →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {step === 4 && (
          <>
            <div className={ex.card}>
              <p className={ex.question}>Draft for {resultsTitle}</p>
              <div className={ex.footerNav} style={{ marginTop: "1.5rem", maxWidth: "none" }}>
                <button type="button" className={ex.btnBack} onClick={() => goToStep(3, 1)}>
                  ← Back
                </button>
                <button type="button" className={ex.btnBack} disabled={loading} onClick={restart}>
                  ↺ New Builder
                </button>
              </div>
              {!loading && output && (
                <div className={ex.resultActions}>
                  <button
                    type="button"
                    className={`${ex.resultActionBtn}${reviewOpen ? ` ${ex.resultActionBtnActive}` : ""}`}
                    onClick={doReview}
                    aria-expanded={reviewOpen}
                  >
                    <Icon name="shieldCheck" size="sm" />{" "}
                    {reviewOpen ? "Hide review" : "Review for bias & fit"}
                  </button>
                  <button type="button" className={ex.resultActionBtn} onClick={doCopy}>
                    <Icon name="copy" size="sm" /> Copy
                  </button>
                  <button type="button" className={ex.resultActionBtn} onClick={doMarkdown}>
                    <Icon name="download" size="sm" /> Markdown
                  </button>
                  <button type="button" className={ex.resultActionBtn} onClick={doText}>
                    <Icon name="fileText" size="sm" /> Text
                  </button>
                  <button type="button" className={ex.resultActionBtn} onClick={doPrint}>
                    <Icon name="printer" size="sm" /> Print
                  </button>
                </div>
              )}
            </div>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={ex.srOnly}
            >
              {loading
                ? "Generating your draft…"
                : output
                  ? "Draft ready."
                  : ""}
            </div>

            <section className={ex.resultsSection} aria-label="Generated draft">
              <h2 className={ex.resultsTitle}>Results</h2>

              {loading && (
                <>
                  <motion.div
                    className={ex.typingIndicator}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className={ex.typingDots} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>Drafting your {labelFor(input.outputType) || "resource"}…</span>
                  </motion.div>
                  <div className={ex.resultStack} aria-hidden="true">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={ex.skeletonCard}
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <div className={`${ex.skelLine} ${ex.skelLabel}`} />
                        <div className={`${ex.skelLine} ${ex.skelHeading}`} />
                        <div className={ex.skelLine} />
                        <div className={ex.skelLine} style={{ width: "92%" }} />
                        <div className={ex.skelLine} style={{ width: "78%" }} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!loading && output && (
                <>
                  {/* Trend-expand adaptation: bias/fit review accordion */}
                  <div
                    className={ex.statCard}
                    style={{ marginBottom: "1rem", animationDelay: "0ms" }}
                  >
                    <div className={ex.statMeta}>
                      <span className={ex.statLabel}>Bias &amp; fit review</span>
                    </div>
                    <button
                      type="button"
                      className={`${ex.statChartBtn}${reviewOpen ? ` ${ex.statChartBtnActive}` : ""}`}
                      onClick={doReview}
                      aria-expanded={reviewOpen}
                    >
                      {reviewOpen ? "↑ Hide Review" : "↓ Show Review"}
                    </button>
                    <div className={`${ex.chartCollapse} ${reviewOpen ? ex.chartCollapseOpen : ""}`}>
                      <div className={ex.chartCollapseInner}>
                        {review && (
                          <div className={ex.inlineChart}>
                            <p className={ex.trendSummary}>
                              {passCount} of {review.length} checks passed
                            </p>
                            <div className={ex.checkList}>
                              {review.map((r, i) => (
                                <div className={ex.checkRow} key={i}>
                                  <span
                                    className={`${ex.checkMark}${r.pass ? "" : ` ${ex.checkMarkFail}`}`}
                                    aria-hidden
                                  >
                                    {r.pass ? "✓" : "!"}
                                  </span>
                                  <div>
                                    <div className={ex.checkTitle}>{r.q}</div>
                                    <div className={ex.checkNote}>{r.note}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={ex.resultStack} key={genId}>
                    <div
                      className={ex.statCard}
                      style={{ animationDelay: "40ms" }}
                    >
                      <div className={ex.statMeta}>
                        <span className={ex.statLabel}>Draft</span>
                      </div>
                      <div className={ex.statValue} style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                        {output.title}
                      </div>
                      {output.meta?.length > 0 && (
                        <div className={ex.contextBadgeStrip} style={{ marginTop: "0.75rem" }}>
                          {output.meta.map((m, i) => (
                            <span key={i} className={ex.contextBadge}>
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {output.sections.map((s, i) => {
                      const isList = Array.isArray(s.body);
                      return (
                        <div
                          key={i}
                          className={ex.statCard}
                          style={{
                            animationDelay: `${(i + 2) * 70}ms`,
                            opacity: s._revised ? 1 : undefined,
                            boxShadow: s._revised ? "var(--result-glow)" : undefined,
                          }}
                        >
                          <div className={ex.statMeta}>
                            <span className={ex.statLabel}>{s.label}</span>
                          </div>
                          <div className={ex.docSectionBody}>
                            {isList ? (
                              <ul>
                                {s.body.map((b, j) => (
                                  <li key={j}>{b}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{s.body}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            {/* Compare adaptation: revise panel */}
            {!loading && output && (
              <div className={ex.compareSection}>
                <AnimatePresence mode="wait" initial={false}>
                  {!showRevise ? (
                    <motion.button
                      key="revise-toggle"
                      type="button"
                      className={ex.btnCompare}
                      onClick={() => setShowRevise(true)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      ＋ Revise This Draft
                    </motion.button>
                  ) : (
                    <motion.div
                      key="revise-card"
                      style={{ overflow: "hidden" }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        height: { type: "spring", stiffness: 260, damping: 30 },
                        opacity: { duration: 0.25 },
                      }}
                    >
                      <div className={ex.compareCard}>
                        <p className={ex.compareTitle}>Revise with</p>
                        <p className={ex.fieldHint} style={{ marginTop: 0, marginBottom: "0.85rem" }}>
                          Guided edits you apply with one click — no need to restart the prompt.
                        </p>
                        <div className={ex.reviseChoiceList}>
                          {revisionActions.map((a) => (
                            <Choice key={a.id} selected={false} onClick={() => revise(a.id)}>
                              <Icon name={REVISION_ICONS[a.id]} size="sm" /> {a.label}
                            </Choice>
                          ))}
                        </div>
                        <div className={ex.compareActions}>
                          <button
                            type="button"
                            className={ex.btnBack}
                            onClick={() => setShowRevise(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!loading && output && (
              <div className={ex.bottomActions}>
                <button type="button" className={ex.btnStartNew} onClick={restart}>
                  ↺ Start a New Builder
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
