// Shared glossary of key terms, used by the in-app reference.

export const glossary = [
  {
    term: "CRP — Culturally Responsive Pedagogy",
    short: "Teaching that connects to students' cultures, languages, and communities.",
    definition:
      "An approach (Gay; Ladson-Billings) that uses students' cultural knowledge, prior experiences, and community assets as conduits for rigorous learning. It affirms identity, holds high expectations, and builds critical consciousness rather than treating culture as an add-on.",
    inProduct:
      "Drives the 'Cultural & Community Anchors' inputs and the 'Cultural/Community Connection' section required in every generated lesson.",
  },
  {
    term: "CSP — Culturally Sustaining Pedagogy",
    short: "Actively sustaining students' cultural and linguistic practices.",
    definition:
      "Paris & Alim's extension of CRP: schooling should sustain — not just respond to — the linguistic, literate, and cultural pluralism of communities as part of its explicit goal, resisting assimilation.",
    inProduct:
      "Framing for prompt language that treats home languages and cultural practices as resources to build on, never to correct.",
  },
  {
    term: "UDL — Universal Design for Learning",
    short: "Designing flexible options so all learners can access and show learning.",
    definition:
      "CAST framework organized around multiple means of Engagement (the 'why'), Representation (the 'what'), and Action & Expression (the 'how'). Reduces barriers up front instead of retrofitting accommodations.",
    inProduct:
      "Maps to 'Accessibility Supports' inputs and the requirement that every output offers multiple modes of representation and expression.",
  },
  {
    term: "Differentiation",
    short: "Adjusting content, process, or product to varied learner readiness.",
    definition:
      "Tomlinson's practice of proactively varying content, process, product, or environment based on students' readiness, interest, and learning profile — while keeping learning goals constant.",
    inProduct:
      "Powers the 'Differentiation Options' controls and the 'Make more accessible / low-tech / multilingual' revision actions.",
  },
  {
    term: "Accessibility",
    short: "Removing barriers so content works for the widest range of learners.",
    definition:
      "Ensuring materials are perceivable, operable, understandable, and robust for students with disabilities, varied reading levels, language backgrounds, and technology access (including low-tech / offline contexts).",
    inProduct:
      "Reading-level, language, neurodiverse, and low-tech/offline toggles applied across all generators.",
  },
  {
    term: "Formative Assessment",
    short: "Low-stakes checks used to adjust teaching in the moment.",
    definition:
      "Assessment for learning — exit tickets, quick checks, observation — whose primary purpose is to give teachers and students actionable information to adjust next steps, not to assign grades.",
    inProduct:
      "The 'Check for Understanding' lesson section and the Assessment module's exit-ticket and quiz templates.",
  },
  {
    term: "Culturally Relevant Examples",
    short: "Problems and contexts drawn from students' real communities.",
    definition:
      "Content examples rooted in students' lived environments (neighborhood data, local industries, community issues) that make abstract STEM concepts concrete and meaningful — done specifically, not as stereotype.",
    inProduct:
      "Generated hooks and problem contexts pull from the teacher's 'Community context' and 'Student interests' fields.",
  },
  {
    term: "Asset-Based Feedback",
    short: "Feedback that names strengths and growth without deficit language.",
    definition:
      "Feedback framed around what students can do and their next growth step, deliberately avoiding deficit framing ('struggling,' 'low,' 'lacks') that positions students or communities as deficient.",
    inProduct:
      "The Feedback Assistant's default strengths-based + growth-oriented templates and the deficit-language flag in the review checklist.",
  },
  {
    term: "PBL — Project-Based Learning",
    short: "Learning through sustained, authentic projects.",
    definition:
      "Students build knowledge by working over time on an authentic, often community-connected problem culminating in a public product. A core lever for engagement and transfer in STEM.",
    inProduct:
      "The Activity/PBL generator and the 'Add project-based activity' revision action.",
  },
  {
    term: "Constructivism",
    short: "Learners build understanding on prior knowledge and experience.",
    definition:
      "Learning theory (Piaget, Vygotsky) holding that learners actively construct knowledge by connecting new information to existing schema and social interaction — the theoretical basis for anchoring new STEM ideas in familiar community contexts.",
    inProduct:
      "Justifies the 'anchor first, abstract second' structure of the lesson hook and main activity.",
  },
  {
    term: "Responsible GenAI Use",
    short: "Human-in-the-loop, privacy-aware, bias-checked AI use in schools.",
    definition:
      "Using generative AI as a drafting assistant that a teacher always reviews for accuracy, bias, and fit; never entering student PII; and being transparent that outputs are AI-generated and fallible.",
    inProduct:
      "Guardrail banners, the 'Review for Bias & Fit' step, and the no-PII input warning throughout the dashboard.",
  },
];
