/* Wizard configuration — the six steps, and the option lists they draw on.

   A step either declares `fields` (rendered generically by ui/fields.js) or a
   `custom` key naming a hand-built renderer in ui/. */

export const GRADE_OPTIONS = [
  "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade"
];

export const SUBJECT_OPTIONS = [
  "English Language Arts/Literacy", "Math", "Social Studies", "Science"
];

export const LEVEL_LABELS = {
  1: "Level 1 — Entering",
  2: "Level 2 — Emerging",
  3: "Level 3 — Developing",
  4: "Level 4 — Expanding",
  5: "Level 5 — Bridging",
  6: "Level 6 or reclassified — Reaching"
};

export const STEP_LABELS = [
  "Learning goals", "Task & product", "Standards",
  "Unit context", "Language proficiency", "Review"
];

export const steps = [
  {
    eyebrow: "Step 1 of 6",
    title: "Set the learning goal",
    sub: "These three answers anchor the entire rubric — what students produce, how they must structure it, and the vocabulary they need to do it.",
    fields: [
      { key: "discourse", type: "textarea", q: "What is the product you expect students to produce at the end of the unit or module?", hint: "This becomes the Discourse-level goal." },
      { key: "sentence", type: "text", q: "What sentence structures do you want students to use?", hint: "This becomes the Sentence-level goal." },
      { key: "words", type: "textarea", q: "List 3–5 content-area vocabulary words students should use.", hint: "Separate with commas. This becomes the Word/Phrase-level goal." }
    ]
  },
  {
    eyebrow: "Step 2 of 6",
    title: "Describe the task",
    sub: "Tell us exactly what students are asked to do, and share anything you already have — an existing rubric or a model response — so the output matches your classroom.",
    fields: [
      { key: "instructions", type: "textarea", q: "What are the assignment instructions or question prompt?", hint: "What guidance will students be given to complete the task?" },
      { key: "focusingQuestion", type: "textarea", q: "What is the focusing question task?", hint: "The specific question students must answer in their response." },
      { key: "existingRubric", type: "file", q: "Existing rubric (optional)", hint: "Attach one if you have it — we read it and align to your structure instead of starting from scratch." },
      { key: "exemplar", type: "file", q: "Exemplar of the final product (optional)", hint: "A strong sample response helps calibrate the top proficiency levels." }
    ]
  },
  {
    eyebrow: "Step 3 of 6",
    title: "Align to the standards",
    sub: "Choose the subject and grade, then add standards by typing them in or browsing Georgia's domain → big idea → standard structure.",
    custom: "standards"
  },
  {
    eyebrow: "Step 4 of 6",
    title: "Unit context",
    sub: "This grounds the rubric in your curriculum, anchor text, and what students already know — so descriptors stay specific instead of generic.",
    fields: [
      { key: "curriculumName", type: "text", q: "Curriculum name", hint: "e.g. the program or publisher name." },
      { key: "moduleUnit", type: "text", q: "Module or unit", hint: "e.g. Grade 5, Module 1." },
      { key: "anchorText", type: "text", q: "Anchor text (title and author)", hint: "The text, video, or source students read, watch, or listen to." },
      { key: "anchorTextFile", type: "file", q: "Attach the anchor text (optional)", hint: "Attaching the full text lets descriptors quote what students actually read." },
      { key: "prerequisiteSkills", type: "textarea", q: "What prerequisite knowledge do students bring to the unit?" },
      { key: "skillsAcquired", type: "textarea", q: "What subskills will students learn throughout the unit or module?" }
    ]
  },
  {
    eyebrow: "Step 5 of 6",
    title: "Student language proficiency",
    sub: "Tell us how many English Learners are in the classroom and which WIDA levels are represented — this shapes how much scaffolding each level of the rubric needs.",
    custom: "proficiency"
  },
  {
    eyebrow: "Step 6 of 6",
    title: "Review summary",
    sub: "This is the complete brief we'll use to build your rubric. Use Edit to jump back and adjust anything before generating.",
    custom: "review"
  }
];

/* Output view — section anchors for the "Jump to" menu. */
export const RUBRIC_SECTIONS = [
  { id: 'task-summary',        label: 'Task & context summary' },
  { id: 'content-objectives',  label: 'Content objectives' },
  { id: 'language-objectives', label: 'Interpretive & expressive language objectives' },
  { id: 'interpretive-rubric', label: 'Interpretive / Process rubric' },
  { id: 'expressive-rubric',   label: 'Expressive / Product rubric' },
  { id: 'content-evidence',    label: 'Content evidence checklist' },
  { id: 'scaffolds',           label: 'Scaffolds & supports' },
  { id: 'assumptions',         label: 'Assumptions & implementation notes' }
];
