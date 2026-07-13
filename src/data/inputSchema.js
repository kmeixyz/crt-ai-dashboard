// Structured teacher-input schema.
// This is the single source of truth for the input form and the shape of
// data passed into every prompt template.

export const defaultInput = {
  // --- Class Context ---
  subject: "",
  course: "",
  grade: "",
  topic: "",
  // --- Cultural & Community Anchors ---
  studentInterests: "",
  communityContext: "",
  culturalAssets: "",
  // --- Accessibility Supports ---
  readingLevel: "on-grade", // below-grade | on-grade | above-grade | mixed
  language: "English",
  neurodiverseSupport: false,
  lowTech: false,
  // --- Differentiation Options ---
  learningNeeds: [], // multi-select tags
  resourceLevel: "medium", // low | medium | high
  // --- What to generate ---
  outputType: "lesson", // lesson | activity | assessment | feedback
};

export const fieldMeta = {
  subject: { label: "Subject", group: "context", placeholder: "e.g. Science, Mathematics" },
  course: { label: "Course", group: "context", placeholder: "e.g. Biology, Algebra I, AP Calculus" },
  grade: { label: "Grade / Level", group: "context", placeholder: "e.g. 9, 10-11" },
  topic: {
    label: "Topic / Standard",
    group: "context",
    placeholder: "e.g. Linear functions & slope",
  },
  studentInterests: {
    label: "Student interests",
    group: "anchors",
    placeholder: "e.g. music, sports, gaming, local food, family businesses",
    hint: "What are your students actually into? Be specific.",
  },
  communityContext: {
    label: "Community context",
    group: "anchors",
    placeholder:
      "e.g. rural agriculture town; urban neighborhood near a river; strong community clinic",
    hint: "The neighborhood, industries, institutions, and issues your students live in.",
  },
  culturalAssets: {
    label: "Cultural & linguistic assets",
    group: "anchors",
    placeholder: "e.g. bilingual (Spanish), multigenerational households, oral storytelling",
    hint: "Optional. Assets to build on — never to 'fix'.",
  },
};

export const readingLevels = [
  { value: "below-grade", label: "Below grade" },
  { value: "on-grade", label: "On grade" },
  { value: "above-grade", label: "Above grade" },
  { value: "mixed", label: "Mixed / wide range" },
];

export const resourceLevels = [
  { value: "low", label: "Low (little/no tech, printing)" },
  { value: "medium", label: "Medium (shared devices)" },
  { value: "high", label: "High (1:1 devices, wifi)" },
];

export const learningNeedOptions = [
  "Multilingual",
  "Reading-level support",
  "Neurodiverse supports",
  "Wide readiness range",
  "Multiple response options",
  "Low-tech / offline",
  "Project-based",
];

export const outputTypes = [
  { value: "lesson", label: "Lesson Plan", desc: "Full culturally responsive lesson" },
  { value: "activity", label: "Activity / PBL", desc: "Hands-on or project-based task" },
  { value: "assessment", label: "Assessment", desc: "Quiz, exit ticket, or rubric" },
  { value: "feedback", label: "Feedback", desc: "Asset-based student feedback" },
];
