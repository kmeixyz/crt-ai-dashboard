// Tool scan — existing teacher-AI tools, what they do well, and the gaps a
// culturally responsive tool must fill.

export const toolScan = [
  {
    tool: "MagicSchool",
    focus: "Broad teacher toolbox (60+ generators)",
    strengths: [
      "Huge library of task-specific generators",
      "Lesson plans, rubrics, IEP helpers, emails",
      "Popular, teacher-trusted UI",
    ],
    crpUdl: "Partial. It has an accommodations tool, but culture is not a structured input.",
    gaps: [
      "No structured cultural/community context field",
      "CRP is optional, not a design default",
      "No built-in bias/deficit-language review step",
    ],
  },
  {
    tool: "Khanmigo",
    focus: "Student tutor + teacher assist (Khan Academy)",
    strengths: [
      "Strong Socratic student tutoring",
      "Tight alignment to Khan content",
      "Teacher lesson-hook and standards tools",
    ],
    crpUdl: "Low. Accessibility comes from the Khan platform; culture is not modeled.",
    gaps: [
      "Content-centric, not community-centric",
      "Limited teacher control over cultural framing",
      "Closed content ecosystem",
    ],
  },
  {
    tool: "Diffit",
    focus: "Leveling & differentiating any resource",
    strengths: [
      "Excellent reading-level adaptation",
      "Multilingual output",
      "Vocabulary + question generation from any text/topic",
    ],
    crpUdl: "Medium-high on UDL (representation); low on CRP.",
    gaps: [
      "Differentiation ≠ cultural responsiveness",
      "No community-anchoring of examples",
      "Assessment/feedback are secondary",
    ],
  },
  {
    tool: "Eduaide.ai",
    focus: "100+ resource types + feedback bot",
    strengths: [
      "Wide resource catalog",
      "Feedback and assessment builders",
      "Teacher 'assistant' chat",
    ],
    crpUdl: "Partial. Accessibility options exist, but CRP is not structured.",
    gaps: [
      "Culture handled ad hoc in free-text prompts",
      "No asset-based feedback framing by default",
      "No integrated CRP/UDL review",
    ],
  },
  {
    tool: "Brisk Teaching",
    focus: "Chrome extension layered on Google/Docs/YouTube",
    strengths: [
      "Meets teachers inside existing workflow",
      "Fast leveling, feedback, and 'inspect writing'",
      "Low friction adoption",
    ],
    crpUdl: "Medium on accessibility; low on CRP.",
    gaps: [
      "Workflow tool, not a pedagogical framework",
      "No community-context modeling",
      "Cultural fit left entirely to the teacher",
    ],
  },
  {
    tool: "Playlab.ai",
    focus: "Build/share custom education AI 'apps'",
    strengths: [
      "Flexible, since teachers build their own bots",
      "Nonprofit, education-first, shareable",
      "Prompt logic is transparent/editable",
    ],
    crpUdl: "Depends entirely on the app author.",
    gaps: [
      "No built-in CRP/UDL scaffolding",
      "Requires prompt-engineering skill",
      "Quality varies app-to-app",
    ],
  },
];

// Synthesis: what is MISSING across the market / what our tool adds.
export const marketGaps = [
  {
    title: "Culture as a structured, first-class input",
    detail:
      "Competitors treat cultural context as optional free text. Our dashboard makes community context and cultural anchors required, structured fields that shape every output.",
  },
  {
    title: "Built-in CRP/UDL review, not just generation",
    detail:
      "No mainstream tool checks its own output against a culturally responsive / UDL rubric. Our 'Review for Bias & Fit' step flags deficit language, missing accessibility, and stereotype risk.",
  },
  {
    title: "Asset-based feedback by default",
    detail:
      "Feedback tools default to correction. Ours defaults to strengths-based, growth-oriented, family-friendly framing that avoids deficit language.",
  },
  {
    title: "Low-tech / offline realities of many classrooms",
    detail:
      "Few tools produce genuinely low-tech, printable, no-device versions. Ours offers a low-tech/offline toggle across all generators.",
  },
  {
    title: "One coherent teacher workflow",
    detail:
      "Most tools are collections of disconnected generators. Ours ties context, lesson, activity, assessment, and feedback into a single, reusable class profile.",
  },
];
