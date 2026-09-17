"""Request and response models.

`RubricBrief` mirrors the wizard's state object one-for-one — what the teacher
answered across the six steps. Everything downstream reads from it.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Attachment(BaseModel):
    """An uploaded document after text extraction."""

    name: str = ""
    text: str = ""


class SelectedStandard(BaseModel):
    code: str
    title: str = ""
    subskills: List[str] = Field(default_factory=list)


class RubricBrief(BaseModel):
    # Step 1 — learning goal
    discourse: str = ""
    sentence: str = ""
    words: str = ""

    # Step 2 — task & product
    instructions: str = ""
    focusingQuestion: str = ""
    existingRubric: Attachment = Field(default_factory=Attachment)
    exemplar: Attachment = Field(default_factory=Attachment)

    # Step 3 — standards
    subjectArea: str = ""
    gradeLevel: str = ""
    manualStandards: List[str] = Field(default_factory=list)
    selectedStandards: List[SelectedStandard] = Field(default_factory=list)

    # Step 4 — unit context
    curriculumName: str = ""
    moduleUnit: str = ""
    anchorText: str = ""
    anchorTextFile: Attachment = Field(default_factory=Attachment)
    prerequisiteSkills: str = ""
    skillsAcquired: str = ""

    # Step 5 — student language proficiency
    totalELs: str = ""
    levelCounts: Dict[str, int] = Field(default_factory=dict)

    # --- derived helpers -------------------------------------------------

    def vocabulary(self) -> List[str]:
        return [w.strip() for w in self.words.split(",") if w.strip()]

    def standards(self) -> List[str]:
        manual = [s.strip() for s in self.manualStandards if s.strip()]
        browsed = [s.code for s in self.selectedStandards]
        seen, ordered = set(), []
        for code in manual + browsed:
            if code not in seen:
                seen.add(code)
                ordered.append(code)
        return ordered

    def levels_represented(self) -> List[int]:
        present = []
        for level in range(1, 7):
            if int(self.levelCounts.get(str(level), 0) or 0) > 0:
                present.append(level)
        return present

    def unit_label(self) -> str:
        return ", ".join(p for p in [self.curriculumName, self.moduleUnit] if p)


class GenerateRequest(BaseModel):
    brief: RubricBrief
    provider: Optional[str] = None  # override LLM_PROVIDER for one request


class GenerateResponse(BaseModel):
    rubric: Dict[str, Any]
    provider: str
    model: str


class ExtractResponse(BaseModel):
    name: str
    text: str
    characters: int
    truncated: bool = False
