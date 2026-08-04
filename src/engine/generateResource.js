// Front door for "Generate": tries the real server route (/api/generate →
// Gemini) and falls back to the local mock engine on ANY failure — network
// error, non-2xx (429 quota, 500, etc.), or a malformed/empty payload — so the
// Results screen never renders blank.
//
// Returns the same { kind, title, meta, sections } shape either way, plus a
// `_source` flag ("gemini" | "mock") the UI uses to tell the teacher which one
// they're looking at.
import { generate as mockGenerate } from "./mockAI.js";

export async function generateResource(input, opts = {}) {
  const body = opts.format ? { ...input, format: opts.format } : input;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.sections) || data.sections.length === 0) {
      throw new Error("Malformed generation payload");
    }

    return { ...data, _source: "gemini" };
  } catch (err) {
    // Expected in `vite dev` (no serverless functions) and on quota/network
    // hiccups — degrade gracefully instead of failing the UI.
    console.warn("Live generation unavailable; using local draft engine.", err);
    const mock = await mockGenerate(input, opts);
    return { ...mock, _source: "mock" };
  }
}
