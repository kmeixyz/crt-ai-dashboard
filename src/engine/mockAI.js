// =====================================================================
// Generation engine
// - By default: a deterministic, context-aware MOCK generator so the
//   prototype runs with zero setup or API cost. Outputs are structured,
//   sectioned documents.
// - Optional: if a real LLM is wired up (see callLLM), the same prompt
//   templates and input schema are reused.
// =====================================================================

import { promptLibrary, systemPrompt } from "../data/promptLibrary.js";

// ---- Template filling -------------------------------------------------
export function fillTemplate(template, input) {
  const map = {
    subject: input.subject || "STEM",
    course: input.course || "your course",
    grade: input.grade || "high school",
    topic: input.topic || "the topic",
    student_interests: input.studentInterests || "their interests",
    community_context: input.communityContext || "their community",
    cultural_assets: input.culturalAssets || "students' cultural & linguistic assets",
    reading_level: readable(input.readingLevel),
    language: input.language || "English",
    resource_level: input.resourceLevel || "medium",
    learning_needs: (input.learningNeeds || []).join(", ") || "varied learner needs",
    low_tech: input.lowTech ? "provide a low-tech / offline path" : "device-based is fine",
    work_summary: input.workSummary || "the student's submitted work",
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? `{{${k}}}`);
}

function readable(level) {
  return (
    {
      "below-grade": "below grade level",
      "on-grade": "on grade level",
      "above-grade": "above grade level",
      mixed: "a mixed / wide range",
    }[level] || "on grade level"
  );
}

// ---- Context helpers (make mock output feel specific) -----------------
function firstInterest(input) {
  const list = (input.studentInterests || "").split(/,|;/).map((s) => s.trim()).filter(Boolean);
  return list[0] || "something students already care about";
}
function communityPhrase(input) {
  const c = (input.communityContext || "").trim();
  if (!c) return "the local community";
  // Trim to a usable clause.
  return c.replace(/\.$/, "");
}
function langNote(input) {
  const l = (input.language || "English").toLowerCase();
  if (l.includes("+") || (!l.includes("english") && l.length)) {
    return `Key terms and directions are provided in ${input.language}; sentence frames support multilingual learners.`;
  }
  return "Sentence frames and a bilingual key can be added on request.";
}
function readingNote(input) {
  return {
    "below-grade":
      "Text is chunked into short segments with a vocabulary preview and visuals for every key term.",
    "on-grade": "Text is on grade level with optional extension vocabulary.",
    "above-grade":
      "Includes extension prompts and primary-source style excerpts for depth.",
    mixed:
      "Offered in two reading versions (core + scaffolded) so a wide readiness range accesses the same concept.",
  }[input.readingLevel];
}
function lowTechNote(input) {
  return input.lowTech || input.resourceLevel === "low"
    ? "A fully printable, no-device version is included (paper handout + manipulatives)."
    : "Digital version uses shared or 1:1 devices; a printable fallback is available.";
}

// ---- Generators -------------------------------------------------------
// Each returns { title, meta, sections: [{label, body}] } — body is a
// string or array (rendered as list).

export function generateLesson(input) {
  const interest = firstInterest(input);
  const place = communityPhrase(input);
  const topic = input.topic || "the topic";
  return {
    kind: "lesson",
    title: `${topic}: Connecting ${input.course || "STEM"} to ${capitalize(place)}`,
    meta: [`${input.grade || "HS"} · ${input.course || input.subject}`, "CRP + UDL aligned"],
    sections: [
      {
        label: "Learning Objective",
        body: `Students will be able to explain and apply ${topic.toLowerCase()} and justify their reasoning using a real context drawn from ${place}. (Rigor preserved: analysis & application, not just recall.)`,
      },
      {
        label: "Cultural / Community Connection",
        body: `This lesson frames ${topic.toLowerCase()} through ${place}. Rather than a generic textbook example, students investigate how the concept shows up in their own environment and interests (${input.studentInterests || interest}). Students' cultural and linguistic backgrounds (${input.culturalAssets || "their home knowledge and languages"}) are treated as expertise they bring to the problem.`,
      },
      {
        label: "Warm-Up / Hook (8 min)",
        body: `Open with a quick, relatable prompt tied to ${interest}: "Where have you seen ${topic.toLowerCase()} show up in ${place}?" Students turn-and-talk, then share. This surfaces prior knowledge and signals that their world is the starting point.`,
      },
      {
        label: "Main Activity (25 min)",
        body: [
          `Mini-lesson: introduce ${topic.toLowerCase()} using a concrete example from ${place}.`,
          `Guided practice with a data set or scenario connected to ${interest}.`,
          `Collaborative task: students work in pairs/small groups to model or solve a ${place}-based problem.`,
          `Multiple representations offered: numeric, visual/diagram, and verbal explanation (UDL).`,
        ],
      },
      {
        label: "Differentiation Supports",
        body: [
          readingNote(input),
          (input.learningNeeds || []).includes("Wide readiness range")
            ? "Tiered task cards: an entry version, a core version, and a challenge extension. Same concept, different scaffolding."
            : "Optional challenge extension for students ready to go deeper.",
          "Students choose their grouping and product format where possible (agency).",
        ],
      },
      {
        label: "Accessibility Supports",
        body: [langNote(input), lowTechNote(input),
          input.neurodiverseSupport
            ? "Predictable structure, visual timer, and a step checklist support neurodiverse learners; movement break built in."
            : "Clear step-by-step directions and a visual agenda.",
        ],
      },
      {
        label: "Assessment / Check for Understanding",
        body: `Exit ticket with a choice of response modes: (a) solve a short ${place}-based problem, (b) draw/diagram the concept, or (c) explain it aloud/record a voice note. All three demonstrate the same objective.`,
      },
      {
        label: "Teacher Reflection Question",
        body: `Did the ${place} framing feel authentic to my specific students, or did it drift toward a generic stereotype? Which students showed engagement they don't usually show, and why?`,
      },
    ],
  };
}

export function generateActivity(input) {
  const place = communityPhrase(input);
  const topic = input.topic || "the topic";
  return {
    kind: "activity",
    title: `${capitalize(place)} Challenge: Applying ${topic}`,
    meta: [`${input.grade || "HS"} · ${input.course || input.subject}`, "Project-Based · UDL"],
    sections: [
      {
        label: "Driving Question",
        body: `How can we use ${topic.toLowerCase()} to understand or improve something real in ${place}?`,
      },
      {
        label: "The Task",
        body: [
          `Teams investigate a genuine ${place} issue connected to ${topic.toLowerCase()}.`,
          `They gather or are given local data (${input.studentInterests || "student-relevant sources"}).`,
          `They build a model, recommendation, or design that applies the concept.`,
          `They present to an authentic audience (class, family night, or community partner).`,
        ],
      },
      {
        label: "Student Roles (collaboration)",
        body: ["Data lead", "Design/build lead", "Communication & storytelling lead", "Community-connection lead"],
      },
      {
        label: "Multiple Ways to Participate (UDL)",
        body: `Students can take part by building, calculating, writing, designing visuals, or explaining out loud, and every role reaches the same objective.`,
      },
      {
        label: "Low-Tech / Resource Path",
        body: lowTechNote(input) + " Materials favor low-cost or no-cost options; a paper-and-manipulatives version fully replaces the digital one.",
      },
      {
        label: "Public Product",
        body: `A short pitch + artifact (poster, model, slide, or recorded explanation) shared with a real audience so the work matters beyond a grade.`,
      },
    ],
  };
}

export function generateAssessment(input, format = "quiz") {
  const place = communityPhrase(input);
  const topic = input.topic || "the topic";
  const base = {
    kind: "assessment",
    meta: [`${input.grade || "HS"} · ${input.course || input.subject}`, `Format: ${format}`],
  };
  if (format === "exit") {
    return {
      ...base,
      title: `Exit Ticket: ${topic}`,
      sections: [
        { label: "Q1 · Recall", body: `Define or state one key idea about ${topic.toLowerCase()}.` },
        { label: "Q2 · Apply (in context)", body: `Use ${topic.toLowerCase()} to answer a quick question set in ${place}.` },
        { label: "Q3 · Metacognition", body: `What still feels unclear about ${topic.toLowerCase()}? What would help?` },
        { label: "Low-Tech Version", body: "Provided as a quarter-page paper slip; no device required." },
      ],
    };
  }
  if (format === "rubric") {
    return {
      ...base,
      title: `Project Rubric: ${topic}`,
      sections: [
        { label: "Concept Mastery", body: "Four levels: Emerging, Developing, Proficient, then Extending. Each level describes what the student can do, not what they lack." },
        { label: "Application to Context", body: `Rewards authentic connection of ${topic.toLowerCase()} to ${place}.` },
        { label: "Communication", body: "Multiple valid modes accepted: written, visual, oral, or built (UDL)." },
        { label: "Collaboration & Agency", body: "Credits student ownership, role contribution, and reflection." },
      ],
    };
  }
  if (format === "multimodal") {
    return {
      ...base,
      title: `Alternative Assessments: ${topic}`,
      sections: [
        { label: "Option A · Build / Model", body: `Construct a physical or digital model demonstrating ${topic.toLowerCase()}.` },
        { label: "Option B · Explain Aloud", body: `Record or deliver a 2-minute explanation using a ${place} example.` },
        { label: "Option C · Community Interview", body: `Connect the concept to a family or community member's knowledge and report back.` },
        { label: "Shared Scoring Guide", body: "All three options are scored against the same objective and rubric." },
      ],
    };
  }
  // default: quiz
  return {
    ...base,
    title: `Differentiated Quiz: ${topic}`,
    sections: [
      { label: "Q1 (DOK 1)", body: `Identify/define a core term in ${topic.toLowerCase()}.` },
      { label: "Q2 (DOK 2)", body: `Solve a straightforward problem using ${topic.toLowerCase()}.` },
      { label: "Q3 (DOK 2) · context", body: `Apply the concept to a ${place} scenario.` },
      { label: "Q4 (DOK 3) · choice", body: `Justify your reasoning. Respond in writing, with a diagram, or by recording an explanation.` },
      { label: "Q5 (DOK 3) · extension", body: `Predict/critique using ${input.studentInterests || "a student-relevant context"}.` },
      { label: "Answer Key & Alternatives", body: "Includes acceptable alternative responses so multiple valid approaches earn credit." },
      { label: "Access Notes", body: [readingNote(input), langNote(input)] },
    ],
  };
}

export function generateFeedback(input, format = "strengths") {
  const topic = input.topic || "this work";
  const work = input.workSummary || `the student's work on ${topic.toLowerCase()}`;
  const templates = {
    strengths: {
      title: "Strengths-Based Feedback",
      sections: [
        { label: "What you did well", body: `You showed your thinking clearly on ${topic.toLowerCase()}, especially the way you connected it to your own example. Your effort to explain your reasoning stands out.` },
        { label: "Your next power move", body: `Try extending one idea a step further: add a second example or check your reasoning against a real ${communityPhrase(input)} case. You're closer than you think.` },
        { label: "Tone check", body: "Warm, specific, zero deficit language. Reading level & language matched to the student." },
      ],
    },
    growth: {
      title: "Growth-Oriented Feedback",
      sections: [
        { label: "You're building", body: `Based on ${work}, you've got the foundation of ${topic.toLowerCase()} in place.` },
        { label: "Next step", body: "Your next move is one concrete, achievable action, framed as growth rather than correction." },
      ],
    },
    reflection: {
      title: "Student Reflection Prompts",
      sections: [
        { label: "Prompt 1", body: `What part of ${topic.toLowerCase()} clicked for you, and what helped it click?` },
        { label: "Prompt 2", body: `Where did you get stuck, and what did you try?` },
        { label: "Prompt 3", body: `How does ${topic.toLowerCase()} connect to something you care about (${input.studentInterests || "your life"})?` },
      ],
    },
    family: {
      title: "Family-Friendly Note",
      sections: [
        { label: "Message home", body: `Your student is doing meaningful work in ${input.course || "class"} on ${topic.toLowerCase()}. They showed real strength recently and have a clear next step we're supporting. Thank you for all you do at home.` },
        { label: "Language & format", body: `${langNote(input)} Formatted to print and send home.` },
      ],
    },
  };
  return { kind: "feedback", meta: [`${input.grade || "HS"} · ${input.course || ""}`, format], ...templates[format] };
}

// ---- Revision --------------------------------------------------------
export function applyRevision(output, input, actionId) {
  const clone = structuredClone(output);
  const add = (label, body) => clone.sections.push({ label, body, _revised: true });
  switch (actionId) {
    case "accessible":
      add("Added: Accessibility Boost", "Text is simplified with a vocabulary preview, visuals for each key term, and sentence frames. Directions are broken into numbered steps.");
      break;
    case "pbl":
      add("Added: Project-Based Extension", `Extend it into a mini-project: teams apply ${input.topic || "the concept"} to a real ${communityPhrase(input)} problem and present a recommendation.`);
      break;
    case "lowtech":
      add("Added: Low-Tech / Offline Version", "A fully printable, no-device path using paper handouts and simple manipulatives. Nothing needs wifi.");
      break;
    case "multilingual":
      add("Added: Multilingual Support", `Key terms, directions, and sentence frames are provided in ${input.language && input.language !== "English" ? input.language : "students' home languages"}, with cognates highlighted.`);
      break;
    case "cultural":
      add("Strengthened: Cultural Examples", `Examples are re-grounded specifically in ${communityPhrase(input)} and student interests (${input.studentInterests || "student-named topics"}), so nothing reads as generic or stereotyped.`);
      break;
    default:
      break;
  }
  return clone;
}

// ---- CRP / UDL review checklist --------------------------------------
export function runReview(output, input) {
  const text = JSON.stringify(output).toLowerCase();
  const deficitWords = ["struggling", "low-level", "slow learner", "can't", "at-risk", "deficient", "poor students"];
  const hasDeficit = deficitWords.find((w) => text.includes(w));
  const hasContext = Boolean((input.communityContext || "").trim());
  const hasMultiMode = /multiple|choice|diagram|aloud|record|option|visual/.test(text);
  const hasAccess =
    Boolean(input.lowTech) || input.language !== "English" || /accessib|reading level|sentence frame|printable/.test(text);

  return [
    {
      q: "Does the output reflect the specific student & community context?",
      pass: hasContext,
      note: hasContext
        ? "Community context was provided and woven through the output."
        : "No community context was entered, so add one or the output stays generic.",
    },
    {
      q: "Does it avoid deficit language?",
      pass: !hasDeficit,
      note: hasDeficit ? `Possible deficit phrase detected: "${hasDeficit}". Rephrase.` : "No deficit-language flags detected.",
    },
    {
      q: "Does it allow multiple ways to demonstrate learning (UDL)?",
      pass: hasMultiMode,
      note: hasMultiMode ? "Multiple response modes are offered." : "Add choice in how students respond.",
    },
    {
      q: "Is it accessible (reading level / language / low-tech)?",
      pass: hasAccess,
      note: hasAccess ? "Accessibility supports are present." : "Consider adding reading-level, language, or low-tech supports.",
    },
    {
      q: "Does it support student agency & avoid stereotypes?",
      pass: true,
      note: "Reminder: you know your students best, so check that the cultural framing is specific and not a stereotype.",
    },
  ];
}

// ---- Unified async entry point ---------------------------------------
// Simulates latency; swap in callLLM() to use a real model.
export async function generate(input, opts = {}) {
  await delay(opts.instant ? 0 : 650 + Math.random() * 500);
  switch (input.outputType) {
    case "activity":
      return generateActivity(input);
    case "assessment":
      return generateAssessment(input, opts.format || "quiz");
    case "feedback":
      return generateFeedback(input, opts.format || "strengths");
    case "lesson":
    default:
      return generateLesson(input);
  }
}

// ---- Optional real LLM hook ------------------------------------------
// Wire a key via a .env / server proxy in production. Left unused by
// default so the prototype needs zero configuration.
export async function callLLM(input, templateId, apiKey) {
  const domain = Object.values(promptLibrary).find((d) =>
    d.templates.some((t) => t.id === templateId)
  );
  const tpl = domain?.templates.find((t) => t.id === templateId);
  if (!tpl) throw new Error("Unknown template");
  const userPrompt = fillTemplate(tpl.template, input);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ---- Export helpers --------------------------------------------------
export function outputToMarkdown(output) {
  let md = `# ${output.title || "Generated Output"}\n\n`;
  if (output.meta) md += `_${output.meta.join(" · ")}_\n\n`;
  for (const s of output.sections) {
    md += `## ${s.label}\n\n`;
    if (Array.isArray(s.body)) md += s.body.map((b) => `- ${b}`).join("\n") + "\n\n";
    else md += `${s.body}\n\n`;
  }
  md += `\n---\n_Generated by Lumen. Review AI output for accuracy and cultural fit before classroom use._\n`;
  return md;
}

export function outputToText(output) {
  return outputToMarkdown(output).replace(/[#_]/g, "");
}

// ---- utils ------------------------------------------------------------
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
