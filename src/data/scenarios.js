// Sample classroom scenarios — power the "Load a sample" quick-start in the
// input form.

export const scenarios = [
  {
    id: "ap-calc",
    label: "AP Calculus — Derivatives",
    input: {
      subject: "Mathematics",
      course: "AP Calculus AB",
      grade: "11-12",
      topic: "Derivatives as rates of change",
      studentInterests: "sneaker resale, music streaming, sports analytics",
      communityContext:
        "Competitive urban magnet school; many first-gen college-bound students from immigrant families.",
      learningNeeds: ["Multiple response options", "Neurodiverse supports"],
      resourceLevel: "high",
      readingLevel: "on-grade",
      language: "English",
      outputType: "lesson",
    },
  },
  {
    id: "algebra-rural",
    label: "Algebra — Linear Functions (rural)",
    input: {
      subject: "Mathematics",
      course: "Algebra I",
      grade: "9",
      topic: "Linear functions & slope",
      studentInterests: "farming, trucks, hunting, local weather",
      communityContext:
        "Small rural district; agriculture-centered community; intermittent internet; many students without home wifi.",
      learningNeeds: ["Wide readiness range", "Low-tech / offline"],
      resourceLevel: "low",
      readingLevel: "below-grade",
      language: "English",
      outputType: "lesson",
    },
  },
  {
    id: "env-sci",
    label: "Environmental Science — Climate Resilience",
    input: {
      subject: "Science",
      course: "Environmental Science",
      grade: "10-11",
      topic: "Climate resilience & urban heat islands",
      studentInterests: "gardening, basketball courts, local parks, TikTok",
      communityContext:
        "Neighborhood with few green spaces and documented summer heat; environmental-justice concerns raised by families.",
      learningNeeds: ["Project-based", "Multilingual"],
      resourceLevel: "medium",
      readingLevel: "mixed",
      language: "English + Spanish",
      outputType: "activity",
    },
  },
  {
    id: "bio-genetics",
    label: "Biology — Genetics & Community Health",
    input: {
      subject: "Science",
      course: "Biology",
      grade: "10",
      topic: "Inheritance, traits & community health",
      studentInterests: "family recipes, quinceañeras, community clinics, soccer",
      communityContext:
        "Predominantly Latine neighborhood; multigenerational households; community health center is a trusted institution.",
      learningNeeds: ["Multilingual", "Reading-level support"],
      resourceLevel: "medium",
      readingLevel: "mixed",
      language: "English + Spanish",
      outputType: "lesson",
    },
  },
];
