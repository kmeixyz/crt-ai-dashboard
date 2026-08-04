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
  defaultInput,
} from "../data/inputSchema.js";
import { scenarios } from "../data/scenarios.js";
import { revisionActions } from "../data/promptLibrary.js";
import {
  applyRevision,
  runReview,
  outputToMarkdown,
  outputToText,
} from "../engine/mockAI.js";
import { generateResource } from "../engine/generateResource.js";
import ex from "../styles/Explore.module.css";

// The builder has two flows that share a Results screen:
//   • template → review → results   (Path A: pick a pre-built template)
//   • target → environment → output → results   (Path B: build from scratch)
// A "fork" screen chooses between them.
const CUSTOM_STEPS = ["Target", "Environment", "Output", "Results"];
const TEMPLATE_STEPS = ["Review", "Results"];
const PROGRESS = {
  fork: 0,
  target: 25,
  environment: 50,
  output: 75,
  review: 50,
  results: 100,
};
const CUSTOM_INDEX = { target: 1, environment: 2, output: 3, results: 4 };
const CUSTOM_NAV = { 1: "target", 2: "environment", 3: "output" };
const TEMPLATE_INDEX = { review: 1, results: 2 };

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

const supportOptions = [
  { key: "neurodiverseSupport", label: "Neurodiverse supports" },
  { key: "lowTech", label: "Low-tech / offline" },
];

// Review-screen text fields, grouped to mirror the custom builder's chronology.
const TARGET_TEXT = [
  { key: "subject", label: fieldMeta.subject.label, placeholder: fieldMeta.subject.placeholder },
  { key: "course", label: fieldMeta.course.label, placeholder: fieldMeta.course.placeholder },
  { key: "grade", label: fieldMeta.grade.label, placeholder: fieldMeta.grade.placeholder },
  { key: "topic", label: fieldMeta.topic.label, placeholder: fieldMeta.topic.placeholder },
];
const ENV_TEXT = [
  {
    key: "studentInterests",
    label: fieldMeta.studentInterests.label,
    placeholder: fieldMeta.studentInterests.placeholder,
    textarea: true,
  },
  {
    key: "communityContext",
    label: fieldMeta.communityContext.label,
    placeholder: fieldMeta.communityContext.placeholder,
    textarea: true,
  },
  {
    key: "culturalAssets",
    label: fieldMeta.culturalAssets.label,
    placeholder: fieldMeta.culturalAssets.placeholder,
    textarea: true,
  },
  { key: "language", label: "Language support", placeholder: "e.g. English, English + Spanish" },
];

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

// A row on the Review screen: uppercase label (+ "Auto" badge when the template
// filled it) beside its inline-editable control.
function ReviewRow({ label, auto, children }) {
  return (
    <div className={ex.reviewRow}>
      <div className={ex.reviewRowLabel}>
        {label}
        {auto && <span className={ex.autoBadge}>Auto</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// Single-select chip group (reading level, resource level, output type, format).
function ChipGroup({ options, value, onSelect, prefill }) {
  return (
    <div className={ex.reviewChips}>
      {options.map((o) => {
        const sel = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            className={`${ex.reviewChip}${sel ? ` ${ex.reviewChipSelected}` : ""}${
              sel && prefill ? ` ${ex.reviewChipPrefill}` : ""
            }`}
            aria-pressed={sel}
            onClick={() => onSelect(o.value)}
          >
            {o.label}
          </button>
        );
      })}
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

export default function Generate({ input, setInput }) {
  const toast = useToast();
  const [flow, setFlow] = useState(null); // "template" | "custom" | null (fork)
  const [screen, setScreen] = useState("fork");
  const [prefilled, setPrefilled] = useState(() => new Set());
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

  const targetProgress = PROGRESS[screen] ?? 0;
  const showFormat = input.outputType === "assessment" || input.outputType === "feedback";
  const formats = input.outputType === "assessment" ? assessmentFormats : feedbackFormats;

  const set = (k, v) => setInput((p) => ({ ...p, [k]: v }));
  // On the Review screen, editing a prefilled field clears its "auto-filled"
  // highlight — the teacher has taken ownership of that value.
  const clearPrefill = (k) =>
    setPrefilled((p) => {
      if (!p.has(k)) return p;
      const n = new Set(p);
      n.delete(k);
      return n;
    });
  const setField = (k, v) => {
    set(k, v);
    clearPrefill(k);
  };
  const toggleNeed = (n) => {
    setInput((p) => ({
      ...p,
      learningNeeds: p.learningNeeds.includes(n)
        ? p.learningNeeds.filter((x) => x !== n)
        : [...p.learningNeeds, n],
    }));
    clearPrefill("learningNeeds");
  };
  const allNeeds = learningNeedOptions.every((n) => input.learningNeeds.includes(n));
  const toggleAllNeeds = () => {
    setInput((p) => ({ ...p, learningNeeds: allNeeds ? [] : [...learningNeedOptions] }));
    clearPrefill("learningNeeds");
  };
  const setOutputType = (v) => {
    setField("outputType", v);
    if (v === "assessment") setFormat("quiz");
    if (v === "feedback") setFormat("strengths");
  };

  const contextLabels = useMemo(() => {
    return [labelFor(input.outputType), input.subject, input.grade, input.topic].filter(Boolean);
  }, [input.outputType, input.subject, input.grade, input.topic]);

  const canGenerate = Boolean(input.topic?.trim() || input.subject?.trim());
  const canLeaveTarget = Boolean(input.subject?.trim() || input.topic?.trim());

  const steps = flow === "template" ? TEMPLATE_STEPS : CUSTOM_STEPS;
  const stepIndex = (flow === "template" ? TEMPLATE_INDEX : CUSTOM_INDEX)[screen] ?? 1;
  const showChrome = screen !== "fork";

  useEffect(() => {
    setProgressWidth(fromProgress);
    const id = requestAnimationFrame(() => setProgressWidth(targetProgress));
    return () => cancelAnimationFrame(id);
  }, [fromProgress, targetProgress, screen]);

  useEffect(() => () => clearTimeout(exitTimerRef.current), []);

  function go(next, direction) {
    setExitDir(direction);
    clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setFromProgress(PROGRESS[screen] ?? 0);
      setScreen(next);
      setExitDir(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  }

  function handleWizardNav(targetIdx) {
    if (flow === "custom") {
      const cur = CUSTOM_INDEX[screen];
      if (targetIdx < cur && CUSTOM_NAV[targetIdx]) go(CUSTOM_NAV[targetIdx], 1);
    } else if (flow === "template") {
      if (targetIdx === 1 && screen === "results") go("review", 1);
    }
  }

  const chooseTemplate = (s) => {
    setInput({ ...defaultInput, ...s.input });
    setPrefilled(new Set(Object.keys(s.input)));
    setFlow("template");
    setOutput(null);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    if (s.input.outputType === "assessment") setFormat("quiz");
    else if (s.input.outputType === "feedback") setFormat("strengths");
    else setFormat("quiz");
    go("review", -1);
    toast(`Loaded ${s.title || s.label}`);
  };

  const startCustom = () => {
    setInput({ ...defaultInput });
    setPrefilled(new Set());
    setFlow("custom");
    setFormat("quiz");
    setOutput(null);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    go("target", -1);
  };

  const backToFork = () => {
    setFlow(null);
    go("fork", 1);
  };

  const run = async () => {
    setLoading(true);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    go("results", -1);
    const fmt = showFormat ? format : undefined;
    const out = await generateResource(input, { format: fmt });
    if (out._source === "mock") {
      toast("Live AI is unavailable right now — showing a local draft.");
    }
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

  const resultsBack = () => go(flow === "template" ? "review" : "output", 1);

  const restart = () => {
    setOutput(null);
    setReview(null);
    setReviewOpen(false);
    setShowRevise(false);
    setPrefilled(new Set());
    setFlow(null);
    setFromProgress(0);
    go("fork", 1);
  };

  const passCount = review ? review.filter((r) => r.pass).length : 0;
  const resultsTitle = input.topic?.trim() || input.subject?.trim() || "your class";

  return (
    <div className={ex.wizardPage}>
      <h1 className={ex.pageTitle}>Resource Builder</h1>

      {showChrome && (
        <div className={ex.progressBlock}>
          <WizardSteps current={stepIndex} onNavigate={handleWizardNav} steps={steps} />
          <div className={ex.progressTrack}>
            <div className={ex.progressFill} style={{ width: `${progressWidth}%` }} />
          </div>
        </div>
      )}

      <motion.div
        key={screen}
        className={ex.wizardContent}
        initial={{ opacity: 0, x: fromProgress > targetProgress ? -48 : 48 }}
        animate={
          exitDir !== 0
            ? { opacity: 0, x: exitDir * 48, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
            : { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
        }
      >
        {["environment", "output", "review"].includes(screen) && contextLabels.length > 0 && (
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

        {/* ══ Fork: choose a template or build from scratch ══ */}
        {screen === "fork" && (
          <>
            <div className={ex.forkIntro}>
              <p className={ex.question}>How do you want to start?</p>
              <p className={ex.questionSub}>
                Begin from a pre-built template, or build a resource from scratch.
              </p>
            </div>

            <motion.section
              className={ex.pathSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            >
              <div className={ex.pathHeader}>
                <span className={ex.pathKicker}>A</span>
                <span className={ex.pathTitle}>Use a pre-built template</span>
                <span className={ex.pathSub}>— jump straight to a ready-to-tweak summary</span>
              </div>
              <div className={ex.templateGrid}>
                {scenarios.map((s) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    className={ex.templateCard}
                    onClick={() => chooseTemplate(s)}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  >
                    {s.tag && <span className={ex.templateCardTag}>{s.tag}</span>}
                    <span className={ex.templateCardTitle}>{s.title || s.label}</span>
                    {s.blurb && <span className={ex.templateCardBlurb}>{s.blurb}</span>}
                    <span className={ex.templateCardCta}>Use template →</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            <motion.section
              className={ex.pathSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.06 },
              }}
            >
              <div className={ex.pathHeader}>
                <span className={ex.pathKicker}>B</span>
                <span className={ex.pathTitle}>Build from scratch</span>
                <span className={ex.pathSub}>— a blank canvas, in three quick steps</span>
              </div>
              <button type="button" className={ex.scratchCard} onClick={startCustom}>
                <span className={ex.scratchIcon}>
                  <Icon name="sparkles" size="md" />
                </span>
                <span className={ex.scratchText}>
                  <span className={ex.scratchTitle}>Start a blank resource</span>
                  <span className={ex.scratchSub}>
                    Target → Environment → Output. You choose what to make at the end.
                  </span>
                </span>
                <span className={ex.scratchArrow} aria-hidden="true">
                  →
                </span>
              </button>
            </motion.section>

            <p className={ex.excludedNote}>
              Review AI output for accuracy and cultural fit before you use it in class. Never enter
              anything that identifies a specific student.
            </p>
          </>
        )}

        {/* ══ Template Review: single unified, inline-editable summary ══ */}
        {screen === "review" && (
          <>
            <div className={ex.forkIntro}>
              <p className={ex.question}>Review &amp; tweak your template</p>
              <p className={ex.questionSub}>
                Everything below was pre-filled. Edit any field, then generate.
              </p>
            </div>

            <div className={ex.reviewLegend}>
              <span className={ex.reviewLegendSwatch} aria-hidden="true" />
              <span>
                Highlighted fields were filled in by the template. Click any field to change it — the
                highlight clears once you do.
              </span>
            </div>

            <div className={ex.reviewGroups}>
              <div className={ex.card}>
                <p className={ex.reviewGroupTitle}>The Target — who &amp; what</p>
                {TARGET_TEXT.map((f) => {
                  const auto = prefilled.has(f.key);
                  return (
                    <ReviewRow key={f.key} label={f.label} auto={auto}>
                      <input
                        className={`${ex.comboboxInput}${auto ? ` ${ex.prefill}` : ""}`}
                        value={input[f.key]}
                        placeholder={f.placeholder}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    </ReviewRow>
                  );
                })}
                <ReviewRow label="Reading level" auto={prefilled.has("readingLevel")}>
                  <ChipGroup
                    options={readingLevels}
                    value={input.readingLevel}
                    prefill={prefilled.has("readingLevel")}
                    onSelect={(v) => setField("readingLevel", v)}
                  />
                </ReviewRow>
              </div>

              <div className={ex.card}>
                <p className={ex.reviewGroupTitle}>The Environment — context &amp; needs</p>
                {ENV_TEXT.map((f) => {
                  const auto = prefilled.has(f.key);
                  return (
                    <ReviewRow key={f.key} label={f.label} auto={auto}>
                      {f.textarea ? (
                        <textarea
                          className={`${ex.textArea}${auto ? ` ${ex.prefill}` : ""}`}
                          value={input[f.key]}
                          placeholder={f.placeholder}
                          onChange={(e) => setField(f.key, e.target.value)}
                          style={{ minHeight: "4.5rem" }}
                        />
                      ) : (
                        <input
                          className={`${ex.comboboxInput}${auto ? ` ${ex.prefill}` : ""}`}
                          value={input[f.key]}
                          placeholder={f.placeholder}
                          onChange={(e) => setField(f.key, e.target.value)}
                        />
                      )}
                    </ReviewRow>
                  );
                })}
                <ReviewRow label="Learning needs" auto={prefilled.has("learningNeeds")}>
                  <div className={ex.reviewChips}>
                    {learningNeedOptions.map((n) => {
                      const sel = input.learningNeeds.includes(n);
                      const pf = sel && prefilled.has("learningNeeds");
                      return (
                        <button
                          key={n}
                          type="button"
                          className={`${ex.reviewChip}${sel ? ` ${ex.reviewChipSelected}` : ""}${
                            pf ? ` ${ex.reviewChipPrefill}` : ""
                          }`}
                          aria-pressed={sel}
                          onClick={() => toggleNeed(n)}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </ReviewRow>
                <ReviewRow label="Resource / tech level" auto={prefilled.has("resourceLevel")}>
                  <ChipGroup
                    options={resourceLevels}
                    value={input.resourceLevel}
                    prefill={prefilled.has("resourceLevel")}
                    onSelect={(v) => setField("resourceLevel", v)}
                  />
                </ReviewRow>
                <ReviewRow label="Additional supports">
                  <div className={ex.reviewChips}>
                    {supportOptions.map((o) => {
                      const sel = input[o.key];
                      const pf = sel && prefilled.has(o.key);
                      return (
                        <button
                          key={o.key}
                          type="button"
                          className={`${ex.reviewChip}${sel ? ` ${ex.reviewChipSelected}` : ""}${
                            pf ? ` ${ex.reviewChipPrefill}` : ""
                          }`}
                          aria-pressed={Boolean(sel)}
                          onClick={() => setField(o.key, !sel)}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </ReviewRow>
              </div>

              <div className={ex.card}>
                <p className={ex.reviewGroupTitle}>The Output — the deliverable</p>
                <ReviewRow label="What to make" auto={prefilled.has("outputType")}>
                  <ChipGroup
                    options={outputTypes}
                    value={input.outputType}
                    prefill={prefilled.has("outputType")}
                    onSelect={setOutputType}
                  />
                </ReviewRow>
                {showFormat && (
                  <ReviewRow label="Format">
                    <ChipGroup options={formats} value={format} onSelect={setFormat} />
                  </ReviewRow>
                )}
              </div>
            </div>

            <div className={ex.footerNav} style={{ maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={backToFork}>
                ← Templates
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
          </>
        )}

        {/* ══ Custom Step 1 · Target (who & what) ══ */}
        {screen === "target" && (
          <div className={ex.card}>
            <p className={ex.question}>What are you teaching, and to whom?</p>
            <p className={ex.questionSub}>
              Subject, course, grade, topic, and reading level for this resource.
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
            </div>

            <div className={ex.fieldGroup}>
              <label className={ex.fieldLabel}>Reading level</label>
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
            </div>

            <div className={ex.footerNav} style={{ marginTop: "1.25rem", maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={backToFork}>
                ← Back
              </button>
              <button
                type="button"
                className={`${ex.btnPrimary}${canLeaveTarget ? ` ${ex.btnPrimaryActive}` : ""}`}
                disabled={!canLeaveTarget}
                onClick={() => go("environment", -1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ══ Custom Step 2 · Environment (context & needs) ══ */}
        {screen === "environment" && (
          <div className={ex.card}>
            <p className={ex.question}>Who are your students, and what do they need?</p>
            <p className={ex.questionSub}>
              Ground the lesson in reality. Treat what students bring as an asset (
              <Term term="CRP">CRP</Term>).
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

            <div className={ex.fieldGroup}>
              <div className={ex.metricGroupHeader} style={{ marginBottom: "0.6rem" }}>
                <label className={ex.fieldLabel} style={{ marginBottom: 0 }}>
                  Multilingual / neurodiverse needs
                </label>
                <button
                  type="button"
                  className={`${ex.selectAllBtn} ${
                    input.learningNeeds.length > 0 ? ex.selectAllBtnActive : ""
                  }`}
                  onClick={toggleAllNeeds}
                >
                  {allNeeds ? "Deselect All" : "Select All"}
                </button>
              </div>
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
            </div>

            <div className={ex.fieldGroup}>
              <label className={ex.fieldLabel}>Additional supports</label>
              <div className={ex.choiceList}>
                {supportOptions.map((o) => (
                  <Choice
                    key={o.key}
                    selected={input[o.key]}
                    onClick={() => set(o.key, !input[o.key])}
                  >
                    {o.label}
                  </Choice>
                ))}
              </div>
            </div>

            <div className={ex.fieldGroup}>
              <label className={ex.fieldLabel}>Resource / tech level</label>
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
            </div>

            <div className={ex.footerNav} style={{ marginTop: "1.25rem", maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={() => go("target", 1)}>
                ← Back
              </button>
              <button
                type="button"
                className={`${ex.btnPrimary} ${ex.btnPrimaryActive}`}
                onClick={() => go("output", -1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ══ Custom Step 3 · Output (the deliverable) ══ */}
        {screen === "output" && (
          <div className={ex.card}>
            <p className={ex.question}>What should we make?</p>
            <p className={ex.questionSub}>
              Choose the deliverable — everything above is folded into it.
            </p>

            <div className={ex.fieldGroup}>
              <label className={ex.fieldLabel}>What to make</label>
              <div className={ex.choiceList}>
                {outputTypes.map((o) => (
                  <Choice
                    key={o.value}
                    selected={input.outputType === o.value}
                    onClick={() => setOutputType(o.value)}
                  >
                    {o.label}
                  </Choice>
                ))}
              </div>
            </div>

            {showFormat && (
              <div className={ex.fieldGroup}>
                <label className={ex.fieldLabel}>Format</label>
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
              </div>
            )}

            <div className={ex.footerNav} style={{ marginTop: "1.25rem", maxWidth: "none" }}>
              <button type="button" className={ex.btnBack} onClick={() => go("environment", 1)}>
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

            <p className={ex.excludedNote}>
              Review AI output for accuracy and cultural fit before you use it in class. Never enter
              anything that identifies a specific student.
            </p>
          </div>
        )}

        {/* ══ Results (shared by both flows) ══ */}
        {screen === "results" && (
          <>
            <div className={ex.card}>
              <p className={ex.question}>Draft for {resultsTitle}</p>
              <div className={ex.footerNav} style={{ marginTop: "1.5rem", maxWidth: "none" }}>
                <button type="button" className={ex.btnBack} onClick={resultsBack}>
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

            <div role="status" aria-live="polite" aria-atomic="true" className={ex.srOnly}>
              {loading ? "Generating your draft…" : output ? "Draft ready." : ""}
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
                  <div className={ex.statCard} style={{ marginBottom: "1rem", animationDelay: "0ms" }}>
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
                    <div className={ex.statCard} style={{ animationDelay: "40ms" }}>
                      <div className={ex.statMeta}>
                        <span className={ex.statLabel}>Draft</span>
                        {output._source && (
                          <span
                            className={`${ex.sourceBadge}${
                              output._source === "mock" ? ` ${ex.sourceBadgeMock}` : ""
                            }`}
                            title={
                              output._source === "gemini"
                                ? "Generated live by the Gemini API."
                                : "The live AI was unavailable, so this is a local template draft (run `vercel dev` or deploy to use Gemini)."
                            }
                          >
                            {output._source === "gemini" ? "✨ Live AI" : "Local draft"}
                          </span>
                        )}
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
