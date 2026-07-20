// User stories, journey map, and feature priority list.

export const userStories = [
  {
    theme: "Cultural Relevance",
    stories: [
      "As a STEM teacher, I want to generate a lesson hook connected to my students' community so the topic feels relevant from minute one.",
      "As a teacher, I want culturally relevant problem contexts (not stereotypes) so examples reflect my specific students.",
      "As a teacher, I want to flag deficit language in generated text so I don't hand out materials that frame students negatively.",
    ],
  },
  {
    theme: "Differentiation",
    stories: [
      "As a teacher, I want to differentiate a task for students with varied reading levels so every learner can access the same concept.",
      "As a teacher, I want a low-tech / offline version so I can teach when devices or wifi aren't available.",
      "As a teacher, I want multilingual supports so my newcomers can engage with rigorous content.",
    ],
  },
  {
    theme: "Assessment & Feedback",
    stories: [
      "As a teacher, I want to create an assessment with multiple response options so students can show learning in different ways.",
      "As a teacher, I want asset-based feedback drafts so I reinforce strengths and next steps, not just errors.",
      "As a teacher, I want family-friendly feedback so I can communicate progress home clearly and respectfully.",
    ],
  },
  {
    theme: "Workflow & Trust",
    stories: [
      "As a teacher, I want to reuse a saved class profile so I don't re-enter context for every generation.",
      "As a teacher, I want to review AI output against a CRP/UDL checklist so I can trust it before classroom use.",
      "As a teacher, I want to export to text/Markdown/PDF so I can drop materials into my existing workflow.",
    ],
  },
];

// Teacher journey map, the core workflow.
export const journeyMap = [
  {
    stage: "1 · Enter Class Context",
    action: "Teacher describes subject, grade, students, community, tech level.",
    thinking: "\"Will this actually fit MY students?\"",
    feeling: "cautiously hopeful",
    opportunity: "Make context structured + reusable so it's entered once, used everywhere.",
  },
  {
    stage: "2 · Choose Output & Design Goals",
    action: "Selects lesson / activity / assessment / feedback and CRP/UDL goals.",
    thinking: "\"I want relevance and accessibility, not extra work.\"",
    feeling: "in control",
    opportunity: "Design goals as toggles, not a blank prompt box.",
  },
  {
    stage: "3 · Generate",
    action: "Dashboard produces a structured, sectioned draft.",
    thinking: "\"Is this any good? Is it safe to use?\"",
    feeling: "skeptical / curious",
    opportunity: "Always show the cultural connection + accessibility explicitly.",
  },
  {
    stage: "4 · Review for Bias & Fit",
    action: "Runs the CRP/UDL checklist; sees flags and passes.",
    thinking: "\"Does this avoid stereotypes and deficit language?\"",
    feeling: "reassured",
    opportunity: "Turn abstract 'trust' into a concrete, visible review step.",
  },
  {
    stage: "5 · Revise",
    action: "Applies one-click revisions like more accessible, low-tech, or multilingual.",
    thinking: "\"Almost there, just tweak this part.\"",
    feeling: "empowered",
    opportunity: "Revision as guided actions, not re-prompting from scratch.",
  },
  {
    stage: "6 · Export & Use",
    action: "Copies / downloads Markdown / prints for class.",
    thinking: "\"Now it fits into what I already do.\"",
    feeling: "relieved / satisfied",
    opportunity: "Multiple export formats incl. print/low-tech.",
  },
];

// Feature priority list.
export const featurePriority = {
  mustHave: [
    "Structured class-context input form (reusable class profile)",
    "Culturally responsive lesson plan generator (end-to-end)",
    "Cultural/community connection section in every output",
    "Accessibility supports: reading level, language, low-tech",
    "CRP/UDL 'Review for Bias & Fit' checklist",
    "Copy / export (text + Markdown)",
    "Guardrail + no-PII messaging",
  ],
  niceToHave: [
    "Assessment generator (quiz, exit ticket, rubric, multimodal)",
    "Asset-based Feedback assistant",
    "Activity / PBL generator",
    "One-click revision actions",
    "PDF / print export",
    "Sample scenario library for quick demos",
  ],
  future: [
    "Live LLM API integration (currently mock + optional key)",
    "Teacher accounts + saved history",
    "Standards alignment (NGSS / state) auto-tagging",
    "Collaborative / district sharing library",
    "Student-facing companion view",
    "Analytics on which supports teachers use most",
  ],
};
