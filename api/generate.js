// Vercel Serverless Function — POST /api/generate
//
// Accepts the Resource Builder form data and asks Gemini (a free-tier flash
// model) to draft a culturally-responsive resource. Runs on the server only: the Gemini
// API key is read from process.env and is NEVER shipped to the browser.
//
// The response is forced into the same { title, meta, sections } shape the
// Results screen already renders (see src/pages/Generate.jsx), and structured
// output (responseMimeType JSON + responseSchema) keeps the model from
// returning prose/gibberish.

import { GoogleGenAI, Type } from "@google/genai";

// Flash-lite tier keeps latency + cost lowest. "gemini-flash-lite-latest" is an
// alias that always resolves to the current stable free-tier flash-lite model,
// so it keeps working on the free tier even when a specific dated version is
// retired. For higher quality (but slower) use "gemini-flash-latest"; to pin a
// fixed version use e.g. "gemini-3.1-flash-lite".
const MODEL = "gemini-flash-lite-latest";

// ── System prompt: the "constitution" every generation inherits. ────────────
// Mirrors src/data/promptLibrary.js so the real LLM path matches the mock one.
const SYSTEM_PROMPT = `You are an instructional co-designer for high school STEM teachers.
You design materials grounded in Culturally Responsive Pedagogy (CRP), Culturally
Sustaining Pedagogy (CSP), and Universal Design for Learning (UDL).

Non-negotiable rules:
1. Treat students' cultures, languages, and communities as ASSETS to build on,
   never deficits to fix. Never use deficit language (e.g. "struggling,"
   "low-level," "these kids can't").
2. Anchor abstract STEM concepts in the SPECIFIC community context provided.
   Be specific and respectful; never rely on cultural stereotypes or generic
   "diverse" filler.
3. Apply UDL: always offer multiple means of representation and multiple ways
   for students to demonstrate learning.
4. Honor accessibility constraints (reading level, language, low-tech/offline,
   neurodiverse supports) as stated.
5. Preserve rigor. Cultural relevance and accessibility never mean lowering
   expectations.
6. You are a drafting assistant. Never invent facts about a specific community
   you weren't given.

OUTPUT CONTRACT:
- Respond with ONLY the JSON object described by the schema. No preamble, no
  markdown, no code fences.
- "title": a specific, human title for the resource.
- "meta": 2-3 short tag strings (e.g. grade + course, alignment).
- "sections": each has a "label" (the section heading), and EITHER a prose
  "body" OR an "items" array of bullet strings — never both. For list-style
  sections (activities, supports, questions) use "items" and set "body" to "".
  For prose sections use "body" and set "items" to [].`;

// Per-deliverable guidance on which sections to produce. Kept faithful to the
// prompt templates in src/data/promptLibrary.js.
const SECTION_GUIDES = {
  lesson: `Produce a full lesson with EXACTLY these sections, in order:
1. Learning Objective (measurable, rigorous)
2. Cultural / Community Connection (specific to the context; explain the link)
3. Warm-Up / Hook (grounded in student interests or community)
4. Main Activity (multiple means of representation) — use items[]
5. Differentiation Supports (for the stated reading levels & needs) — use items[]
6. Accessibility Supports (reading level, language, tech) — use items[]
7. Assessment / Check for Understanding (multiple ways to show learning)
8. Teacher Reflection Question (about equity & fit)`,

  activity: `Produce a hands-on, community-connected task with these sections:
1. Driving Question (real, community-relevant)
2. Student Roles / Collaboration Structure
3. Step-by-Step Task (works at the stated tech level; give a low-tech path) — use items[]
4. Public Product / Share-Out
5. Multiple Ways to Participate (UDL action & expression) — use items[]
6. Materials (note low-cost / no-cost options) — use items[]`,

  assessment: {
    quiz: `Produce a differentiated quiz:
1. Overview (DOK spread, tiering for the reading range)
2. Questions — use items[] (5-6 questions across DOK 1-3; for at least 2, offer write/diagram/explain-aloud options)
3. Answer Key (with acceptable alternative responses) — use items[]`,
    exit: `Produce a 3-question exit ticket:
1. Exit Ticket Questions — use items[] (Q1 recall, Q2 application in the community context, Q3 metacognition)
2. Low-Tech / Paper Version note`,
    rubric: `Produce a 4-level project rubric:
1. Overview (asset-based, growth-oriented language — no "poor/fails")
2. Criteria & Levels — use items[] (reward multiple valid ways to show mastery; include a community-connection criterion)`,
    multimodal: `Produce 3 alternative assessments measuring the SAME objective through different modes:
1. Overview
2. Assessment Options — use items[] (e.g. build/model, oral explanation, visual, community interview; each with a quick scoring guide)`,
  },

  feedback: {
    strengths: `Produce strengths-based feedback:
1. Strengths (2 specific) — use items[]
2. Growth Step (1 concrete, framed positively)`,
    growth: `Produce growth-oriented feedback:
1. What's Working
2. Your Next Power Move (achievable next step, warm and specific)`,
    reflection: `Produce 3 student reflection prompts that build agency and metacognition:
1. Reflection Prompts — use items[]`,
    family: `Produce a short, warm, plain-language message to a family:
1. Message Home (no jargon, asset-based, printable)`,
  },
};

const LABELS = {
  lesson: "Lesson Plan",
  activity: "Activity",
  assessment: "Assessment",
  feedback: "Feedback",
};

function readable(readingLevel) {
  return (
    {
      "below-grade": "below grade level",
      "on-grade": "on grade level",
      "above-grade": "above grade level",
      mixed: "a mixed / wide range",
    }[readingLevel] || "on grade level"
  );
}

function sectionGuide(input) {
  const guide = SECTION_GUIDES[input.outputType] || SECTION_GUIDES.lesson;
  if (typeof guide === "string") return guide;
  // assessment / feedback are keyed by format
  return guide[input.format] || Object.values(guide)[0];
}

function buildUserPrompt(input) {
  const deliverable = LABELS[input.outputType] || "resource";
  const lines = [
    `Draft a ${deliverable} for a high school STEM class.`,
    ``,
    `CLASS CONTEXT`,
    `- Subject: ${input.subject || "STEM"}`,
    `- Course: ${input.course || "(unspecified)"}`,
    `- Grade / level: ${input.grade || "high school"}`,
    `- Topic / standard: ${input.topic || "(unspecified)"}`,
    ``,
    `STUDENTS & COMMUNITY`,
    `- Student interests: ${input.studentInterests || "(none given)"}`,
    `- Community context: ${input.communityContext || "(none given)"}`,
    `- Cultural / linguistic assets: ${input.culturalAssets || "(none given)"}`,
    ``,
    `ACCESSIBILITY & DIFFERENTIATION`,
    `- Reading level: ${readable(input.readingLevel)}`,
    `- Language support: ${input.language || "English"}`,
    `- Learning needs: ${
      (input.learningNeeds || []).join(", ") || "varied learner needs"
    }`,
    `- Neurodiverse supports: ${input.neurodiverseSupport ? "yes" : "not specified"}`,
    `- Tech level: ${input.resourceLevel || "medium"}${
      input.lowTech ? " (provide a low-tech / offline path)" : ""
    }`,
  ];

  if (input.outputType === "feedback" && input.workSummary) {
    lines.push(``, `STUDENT WORK SUMMARY`, `- ${input.workSummary}`);
  }

  lines.push(
    ``,
    `WHAT TO PRODUCE`,
    sectionGuide(input),
    ``,
    `Avoid deficit language. Keep rigor high. Return only the JSON object.`
  );

  return lines.join("\n");
}

// Structured-output schema. Forcing this shape is what prevents gibberish.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    meta: { type: Type.ARRAY, items: { type: Type.STRING } },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          body: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["label", "body", "items"],
        propertyOrdering: ["label", "body", "items"],
      },
    },
  },
  required: ["title", "meta", "sections"],
  propertyOrdering: ["title", "meta", "sections"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Never leak details; just signal a config problem.
    return res.status(500).json({ error: "Server is not configured for generation." });
  }

  // Vercel parses JSON bodies automatically, but guard against a raw string.
  let input;
  try {
    input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  if (!input.subject?.trim() && !input.topic?.trim()) {
    return res.status(400).json({ error: "Provide at least a subject or a topic." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2, // low → deterministic, structured output
        responseMimeType: "application/json",
        responseSchema,
        maxOutputTokens: 4096,
      },
    });

    let data;
    try {
      data = JSON.parse(response.text);
    } catch {
      return res.status(502).json({ error: "The model returned malformed output. Try again." });
    }

    // Collapse { body, items } → the UI's body: string | string[] contract.
    const sections = Array.isArray(data.sections)
      ? data.sections.map((s) => ({
          label: s.label,
          body: Array.isArray(s.items) && s.items.length ? s.items : s.body || "",
        }))
      : [];

    return res.status(200).json({
      kind: input.outputType || "lesson",
      title: data.title || "Draft",
      meta: Array.isArray(data.meta) ? data.meta : [],
      sections,
    });
  } catch (err) {
    // The @google/genai SDK surfaces the upstream HTTP status on err.status.
    const status = err?.status;
    console.error("Gemini generate failed:", err?.message || err);
    if (status === 429) {
      res.setHeader("Retry-After", "20");
      return res
        .status(429)
        .json({ error: "Rate limit or quota exceeded — check your Gemini plan/billing, then retry." });
    }
    if (status === 401 || status === 403) {
      return res.status(502).json({ error: "The generation service rejected the API key." });
    }
    return res.status(500).json({ error: "Generation failed. Please try again." });
  }
}
