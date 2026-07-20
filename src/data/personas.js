// Teacher personas.

export const personas = [
  {
    id: "urban",
    name: "Marisol Reyes",
    role: "Urban STEM Teacher",
    color: "#4338ca",
    initials: "MR",
    context:
      "10th-grade Biology, large public high school in Chicago. 32 students per class, 5 sections. ~70% Latine, 20% Black, multilingual (Spanish, some Arabic).",
    tech: "1:1 Chromebooks, reliable wifi, Google Workspace district.",
    goals: [
      "Connect genetics and health units to her students' neighborhoods",
      "Support newcomers and multilingual learners without watering down rigor",
      "Save prep time she currently spends re-leveling materials by hand",
    ],
    frustrations: [
      "Generic curriculum uses examples her students don't relate to",
      "Existing AI tools produce culturally flat or stereotyped content",
      "No time to prompt-engineer from scratch every night",
    ],
    quote:
      "My kids are brilliant. I need materials that start from what they already know, not from a textbook suburb.",
    needs: ["Community-anchored hooks", "Multilingual supports", "Fast re-leveling"],
  },
  {
    id: "rural",
    name: "Dale Whitmore",
    role: "Rural, Low-Resource STEM Teacher",
    color: "#b45309",
    initials: "DW",
    context:
      "Teaches Algebra II, Environmental Science, and 'whatever else is needed' in a small rural district. Mixed-grade sections, wide readiness range.",
    tech: "Intermittent wifi, shared laptop cart, frequent printing, some students with no home internet.",
    goals: [
      "Make abstract math concrete using local context (farming, weather, water)",
      "Produce materials that work offline / on paper",
      "Differentiate for a huge readiness spread in one room",
    ],
    frustrations: [
      "Most edtech assumes constant connectivity and 1:1 devices",
      "He is the entire STEM department, with no PLC to lean on",
      "Tools generate device-dependent activities he can't run",
    ],
    quote:
      "If it needs an app and strong wifi for every kid, it doesn't work in my room. Give me something I can print tonight.",
    needs: ["Low-tech / offline output", "Wide-range differentiation", "Local-context examples"],
  },
  {
    id: "ap",
    name: "Priya Anand",
    role: "AP / High-Achieving STEM Teacher",
    color: "#0f766e",
    initials: "PA",
    context:
      "AP Calculus AB/BC and AP Physics at a competitive magnet school. Motivated students, high parent expectations, diverse first-gen and immigrant families.",
    tech: "1:1 devices, strong wifi, LMS-integrated.",
    goals: [
      "Keep rigor high while making content culturally relevant and humane",
      "Broaden who feels they 'belong' in advanced STEM",
      "Build assessments with multiple valid ways to show mastery",
    ],
    frustrations: [
      "Assumption that AP students don't need CRP or accessibility",
      "Deficit framing that pushes some capable students out of the pipeline",
      "Rubrics that reward a single narrow style of response",
    ],
    quote:
      "Rigorous and culturally responsive aren't opposites. My strongest classes need both.",
    needs: ["Rigor-preserving CRP", "Multi-modal assessment", "Belonging & agency"],
  },
];
