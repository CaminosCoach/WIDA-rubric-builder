/* The wizard's answers, plus the small helpers that read across them.

   Every field maps to one question in the six steps. The three attachment
   fields hold both the filename and the text extracted from the file by the
   backend — the model needs the text, the UI shows the name. */

export const state = {
  // Step 1 — Learning goal
  discourse: "Write an informative paragraph that states a main idea and develops it with relevant key details from the text.",
  sentence: "Complex and compound sentences",
  words: "culture, expedition, westward expansion, displacement, reservations",

  // Step 2 — Task & product
  instructions: "Read the anchor text, then write one paragraph that states a main idea about the impact of westward expansion and explains it with key details from the text.",
  focusingQuestion: "How did U.S. westward expansion impact Native American cultures in the West?",
  existingRubric: { name: "", text: "" },
  exemplar: { name: "", text: "" },

  // Step 3 — Align to the standards
  subjectArea: "English Language Arts/Literacy",
  gradeLevel: "5th Grade",
  standardsMethod: "browse", // "type" | "browse"
  manualStandards: ["RI.5.1", "RI.5.2", "RI.5.3", "W.5.2", ""],
  browseDomain: "",
  browseBigIdea: "",
  browseStandardCode: "",
  selectedStandards: [
    { code: "L.GC.2", title: "Syntax", subskills: ["Distinguish correctly structured simple, compound, and complex sentences"] },
    { code: "T.T.2", title: "Expository Techniques", subskills: ["Apply expository techniques to introduce and develop a topic with facts and details"] }
  ],

  // Step 4 — Unit context
  curriculumName: "Wit & Wisdom",
  moduleUnit: "Grade 5, Module 1",
  anchorText: "“Lewis & Clark Expedition,” Handout 1A",
  anchorTextFile: { name: "", text: "" },
  prerequisiteSkills: "Students have studied the Louisiana Purchase and can identify Native Nations of the western territories from earlier lessons.",
  skillsAcquired: "Determining main idea, selecting relevant key details, explaining cause/effect, connecting textual evidence to a broader concept.",

  // Step 5 — Student language proficiency
  totalELs: "12",
  levelCounts: { 1: 2, 2: 2, 3: 3, 4: 2, 5: 2, 6: 1 }
};

/* The rubric the backend last returned, kept so the output view and both
   exports read from one place. */
export const generated = { rubric: null, provider: "", model: "" };

export function setGenerated(payload) {
  generated.rubric = payload.rubric;
  generated.provider = payload.provider;
  generated.model = payload.model;
}

/* Standards typed in and standards picked from the browser, de-duplicated. */
export function combinedStandards() {
  const manual = state.manualStandards.map(s => s.trim()).filter(Boolean);
  const browsed = state.selectedStandards.map(s => s.code);
  return [...new Set([...manual, ...browsed])];
}

export function vocabularyList() {
  return state.words.split(',').map(w => w.trim()).filter(Boolean);
}

/* The payload sent to POST /api/rubric/generate. Browser-only bookkeeping
   (which picker tab is open, which domain is expanded) is left behind. */
export function buildBrief() {
  return {
    discourse: state.discourse,
    sentence: state.sentence,
    words: state.words,
    instructions: state.instructions,
    focusingQuestion: state.focusingQuestion,
    existingRubric: state.existingRubric,
    exemplar: state.exemplar,
    subjectArea: state.subjectArea,
    gradeLevel: state.gradeLevel,
    manualStandards: state.manualStandards,
    selectedStandards: state.selectedStandards,
    curriculumName: state.curriculumName,
    moduleUnit: state.moduleUnit,
    anchorText: state.anchorText,
    anchorTextFile: state.anchorTextFile,
    prerequisiteSkills: state.prerequisiteSkills,
    skillsAcquired: state.skillsAcquired,
    totalELs: state.totalELs,
    levelCounts: Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map(n => [String(n), parseInt(state.levelCounts[n], 10) || 0])
    )
  };
}
