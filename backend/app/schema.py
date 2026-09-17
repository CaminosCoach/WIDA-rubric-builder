"""The JSON shape the model must return.

This is the one contract in the project: the LLM is constrained to it, the
frontend renderer walks it, and the .docx exporter reads it. Change it here
and all three follow.

Written as plain JSON Schema so each provider adapter can massage it into
whatever structured-output dialect it needs (see app/llm/).
"""

from typing import Any, Dict

# WIDA levels, highest first — the order the rubric tables are printed in.
LEVELS = [
    (6, "Reaching"),
    (5, "Bridging"),
    (4, "Expanding"),
    (3, "Developing"),
    (2, "Emerging"),
    (1, "Entering"),
]

# Rungs on the vocabulary ladder. Six levels divide it evenly, so each level
# owns three consecutive rungs — enough to give the interpretive and expressive
# tables a different slice of the same band without either repeating a term
# used at another level.
LADDER_RUNGS = 18


def _rubric_table(which: str) -> Dict[str, Any]:
    return {
        "type": "object",
        "description": "The %s six-level WIDA rubric table." % which,
        "properties": {
            "note": {
                "type": "string",
                "description": (
                    "One sentence under the section heading explaining what this "
                    "table measures, referring to the actual anchor text by name."
                ),
            },
            "rows": {
                "type": "array",
                "minItems": 6,
                "maxItems": 6,
                "description": (
                    "Exactly six rows, ordered level 6 down to level 1."
                ),
                "items": {
                    "type": "object",
                    "properties": {
                        "level": {
                            "type": "integer",
                            "description": "WIDA level, 6 through 1.",
                        },
                        "name": {
                            "type": "string",
                            "description": (
                                "WIDA level name: Reaching, Bridging, Expanding, "
                                "Developing, Emerging, or Entering."
                            ),
                        },
                        "discourse": {
                            "type": "string",
                            "description": (
                                "Discourse dimension — organization and cohesion at "
                                "this level, specific to this unit's text and task."
                            ),
                        },
                        "sentence": {
                            "type": "string",
                            "description": (
                                "Sentence dimension — grammatical complexity at this "
                                "level, tied to the teacher's sentence-level goal."
                            ),
                        },
                        "word": {
                            "type": "string",
                            "description": (
                                "Word/Phrase dimension — vocabulary precision at this "
                                "level. Describe the KIND of vocabulary a student at "
                                "this level controls; do not name specific terms here. "
                                "The terms themselves are printed after this sentence, "
                                "assigned from the vocabulary ladder by level."
                            ),
                        },
                    },
                    "required": [
                        "level",
                        "name",
                        "discourse",
                        "sentence",
                        "word",
                    ],
                },
            },
        },
        "required": ["note", "rows"],
    }


RUBRIC_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "description": "A complete WIDA-aligned end-of-unit language rubric.",
    "properties": {
        "title": {
            "type": "string",
            "description": (
                "Document title, e.g. '5th Grade End-of-Unit WIDA-Aligned FQT Rubric'."
            ),
        },
        "vocabularyLadder": {
            "type": "object",
            "description": (
                "Not printed as a section. The unit's vocabulary ranked from most "
                "concrete to most abstract. The example terms shown under every "
                "Word/Phrase descriptor are assigned from this ladder by position, "
                "so its ordering is the only thing making those examples progress "
                "from Entering to Reaching. Build it before writing either table."
            ),
            "properties": {
                "terms": {
                    "type": "array",
                    "minItems": LADDER_RUNGS,
                    "maxItems": LADDER_RUNGS,
                    "description": (
                        "Exactly %d terms, ordered from the most concrete and "
                        "picturable at index 0 — a word an Entering student can "
                        "attach to an image and say in isolation — to the most "
                        "abstract and academic at the end, a word a Reaching student "
                        "uses precisely. Each rung is one genuine step up in "
                        "linguistic demand. Every term must be one a student could "
                        "actually use when answering this unit's focusing question. "
                        "No duplicates and no near-duplicates: 'settler' and "
                        "'settlers' are one rung, not two." % LADDER_RUNGS
                    ),
                    "items": {
                        "type": "object",
                        "properties": {
                            "term": {
                                "type": "string",
                                "description": (
                                    "The word or short phrase, lowercase unless it "
                                    "is a proper noun."
                                ),
                            },
                            "source": {
                                "type": "string",
                                "description": (
                                    "Exactly one of: 'teacher' if this is one of the "
                                    "teacher's listed vocabulary words, 'anchor' if "
                                    "it was drawn from the anchor text, or 'added' "
                                    "if neither supplied it and you supplied it."
                                ),
                            },
                        },
                        "required": ["term", "source"],
                    },
                }
            },
            "required": ["terms"],
        },
        "contentObjectives": {
            "type": "object",
            "description": (
                "Section 01 — what students must know and do, kept separate from "
                "language so content knowledge is not obscured by English proficiency."
            ),
            "properties": {
                "note": {"type": "string", "description": "One-sentence section note."},
                "items": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 6,
                    "items": {
                        "type": "object",
                        "properties": {
                            "label": {
                                "type": "string",
                                "description": "Short objective name, e.g. 'Determine the main idea'.",
                            },
                            "detail": {
                                "type": "string",
                                "description": "One sentence expanding the objective for this unit.",
                            },
                        },
                        "required": ["label", "detail"],
                    },
                },
            },
            "required": ["note", "items"],
        },
        "languageObjectives": {
            "type": "object",
            "description": (
                "Section 02 — interpretive (what students understand from the text) "
                "and expressive (what they produce) objectives at all three levels."
            ),
            "properties": {
                "note": {"type": "string", "description": "One-sentence section note."},
                "interpretive": {
                    "type": "object",
                    "properties": {
                        "heading": {
                            "type": "string",
                            "description": "Column heading, e.g. 'Interpretive — reading the anchor text'.",
                        },
                        "discourse": {"type": "string"},
                        "sentence": {"type": "string"},
                        "word": {"type": "string"},
                    },
                    "required": ["heading", "discourse", "sentence", "word"],
                },
                "expressive": {
                    "type": "object",
                    "properties": {
                        "heading": {
                            "type": "string",
                            "description": "Column heading, e.g. 'Expressive — producing the response'.",
                        },
                        "discourse": {"type": "string"},
                        "sentence": {"type": "string"},
                        "word": {"type": "string"},
                    },
                    "required": ["heading", "discourse", "sentence", "word"],
                },
            },
            "required": ["note", "interpretive", "expressive"],
        },
        "interpretiveRubric": _rubric_table("interpretive / process"),
        "expressiveRubric": _rubric_table("expressive / product"),
        "contentEvidence": {
            "type": "object",
            "description": (
                "Section 05 — meets / not-yet content criteria, tracked apart from "
                "WIDA language levels so the two are never averaged together."
            ),
            "properties": {
                "note": {"type": "string", "description": "One-sentence section note."},
                "items": {
                    "type": "array",
                    "minItems": 4,
                    "maxItems": 7,
                    "description": "Checklist statements, each one observable criterion.",
                    "items": {"type": "string"},
                },
            },
            "required": ["note", "items"],
        },
        "scaffolds": {
            "type": "object",
            "description": (
                "Section 06 — supports that reduce linguistic load without reducing "
                "the conceptual goal, grouped into three proficiency bands."
            ),
            "properties": {
                "note": {"type": "string", "description": "One-sentence section note."},
                "bands": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 3,
                    "description": "Exactly three bands: Levels 1-2, Levels 3-4, Levels 5-6.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "label": {
                                "type": "string",
                                "description": "Band label, e.g. 'Levels 1–2'.",
                            },
                            "items": {
                                "type": "array",
                                "minItems": 3,
                                "maxItems": 8,
                                "description": "Short scaffold names, not sentences.",
                                "items": {"type": "string"},
                            },
                        },
                        "required": ["label", "items"],
                    },
                },
            },
            "required": ["note", "bands"],
        },
        "assumptions": {
            "type": "object",
            "description": (
                "Section 07 — implementation caveats a teacher should verify."
            ),
            "properties": {
                "items": {
                    "type": "array",
                    "minItems": 4,
                    "maxItems": 7,
                    "items": {
                        "type": "object",
                        "properties": {
                            "tag": {
                                "type": "string",
                                "description": (
                                    "One lowercase word categorizing the note, e.g. "
                                    "grade, standards, proficiency, review, scope."
                                ),
                            },
                            "note": {
                                "type": "string",
                                "description": "The caveat itself, one sentence.",
                            },
                        },
                        "required": ["tag", "note"],
                    },
                }
            },
            "required": ["items"],
        },
    },
    "required": [
        "title",
        "vocabularyLadder",
        "contentObjectives",
        "languageObjectives",
        "interpretiveRubric",
        "expressiveRubric",
        "contentEvidence",
        "scaffolds",
        "assumptions",
    ],
}
