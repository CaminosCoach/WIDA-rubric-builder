"""Make model output safe to render.

Structured output is constrained but not guaranteed — a table can come back
with five rows, or levels out of order, or a level name that does not match
its number. Rather than fail the whole request over a cosmetic slip, repair
what is repairable and leave a visible gap where it is not.

This is also where the document header is built. Title, anchor text, unit,
standards and EL counts are pure echoes of what the teacher typed, so they are
computed here from the brief rather than asked of the model — there is no
upside to letting it restate "12 English Learners" and get it wrong.
"""

from typing import Any, Dict, List

from ..models import RubricBrief
from ..schema import LEVELS

LEVEL_NAMES = dict(LEVELS)


def normalize_rubric(raw: Dict[str, Any], brief: RubricBrief) -> Dict[str, Any]:
    rubric = dict(raw or {})

    rubric["title"] = (rubric.get("title") or "").strip() or _fallback_title(brief)
    rubric["meta"] = _meta(brief)

    ladder = _ladder(rubric, brief)
    rubric["vocabularyLadder"] = {"terms": ladder}
    bands = _bands(ladder)

    rubric["interpretiveRubric"] = _normalize_table(
        rubric.get("interpretiveRubric") or {}, bands, "interpretive")
    rubric["expressiveRubric"] = _normalize_table(
        rubric.get("expressiveRubric") or {}, bands, "expressive")

    rubric["contentObjectives"] = _normalize_listing(
        rubric.get("contentObjectives") or {}, "items")
    rubric["languageObjectives"] = _normalize_objectives(
        rubric.get("languageObjectives") or {})
    rubric["contentEvidence"] = _normalize_listing(
        rubric.get("contentEvidence") or {}, "items")
    rubric["scaffolds"] = _normalize_listing(
        rubric.get("scaffolds") or {}, "bands")
    rubric["assumptions"] = _normalize_listing(
        rubric.get("assumptions") or {}, "items")

    return rubric


def _fallback_title(brief: RubricBrief) -> str:
    grade = brief.gradeLevel.strip()
    return ("%s End-of-Unit WIDA-Aligned FQT Rubric" % grade).strip() \
        if grade else "End-of-Unit WIDA-Aligned FQT Rubric"


def _meta(brief: RubricBrief) -> Dict[str, str]:
    levels = brief.levels_represented()
    kicker = " · ".join(p for p in [brief.gradeLevel, brief.subjectArea] if p)

    learners = brief.totalELs.strip() or "0"
    if levels:
        learners = "%s · Levels %s" % (
            learners, ", ".join(str(level) for level in levels))

    return {
        "kicker": kicker or "—",
        "focusingQuestion": brief.focusingQuestion.strip() or "—",
        "anchorText": brief.anchorText.strip() or "—",
        "unit": brief.unit_label() or "—",
        "standards": ", ".join(brief.standards()) or "—",
        "englishLearners": learners,
        "vocabulary": brief.vocabulary(),
    }


def _ladder(rubric: Dict[str, Any], brief: RubricBrief) -> List[str]:
    """The model's vocabulary ranking, concrete first, cleaned and de-duplicated.

    The teacher's own words are appended if the model dropped any: they are the
    unit's academic targets, so losing one to a modelling slip is worse than
    placing it imperfectly. They go at the abstract end, which is where the
    teacher's terms belong anyway.
    """
    entries = (rubric.get("vocabularyLadder") or {}).get("terms") or []

    terms: List[str] = []
    seen = set()

    for entry in entries:
        term = str((entry or {}).get("term", "")).strip() if isinstance(entry, dict) \
            else str(entry or "").strip()
        key = term.lower()
        if term and key not in seen:
            seen.add(key)
            terms.append(term)

    for word in brief.vocabulary():
        if word.lower() not in seen:
            seen.add(word.lower())
            terms.append(word)

    return terms


def _bands(terms: List[str]) -> Dict[int, List[str]]:
    """Cut the ladder into six rising, non-overlapping bands, level 1 lowest.

    Non-overlapping is the whole point: because no term sits in two bands, no
    term can be printed at two different levels of the same table. That is the
    guarantee the prompt alone could never make.

    Any remainder goes to the upper bands — a Reaching student commands more of
    the unit's vocabulary than an Entering one, so the top bands are wider.
    """
    count = len(terms)
    bands: Dict[int, List[str]] = {level: [] for level, _ in LEVELS}

    if not count:
        return bands

    if count < len(LEVELS):
        # Degenerate: fewer terms than levels, so some levels must share. Spread
        # them as evenly as the list allows and let the repeats fall together.
        for level, _ in LEVELS:
            bands[level] = [terms[round((level - 1) * (count - 1) / 5)]]
        return bands

    base, extra = divmod(count, len(LEVELS))
    cursor = 0
    for level, _ in sorted(LEVELS):
        size = base + (1 if level > len(LEVELS) - extra else 0)
        bands[level] = terms[cursor:cursor + size]
        cursor += size

    return bands


def _examples_for(bands: Dict[int, List[str]], level: int, which: str) -> List[str]:
    """Pick a level's printed terms out of its band.

    Students recognise vocabulary well before they can produce it, so the two
    tables take different slices of the same band: interpretive the upper one,
    expressive the lower. They overlap on at most the hinge term, which is
    exactly the term a student at this level is starting to understand but
    cannot yet use.
    """
    band = bands.get(level) or []
    if not band:
        return []

    if which == "expressive":
        return band[:2] if len(band) >= 3 else band[:1]

    if len(band) >= 3:
        return band[1:][:3]
    if len(band) == 2:
        return band[1:]

    # A one-term band leaves no room to slice, so reach into the level above:
    # what this student recognises is what the next level up can produce.
    above = bands.get(level + 1) or []
    return [above[0]] if above else list(band)


def _normalize_table(table: Dict[str, Any], bands: Dict[int, List[str]],
                     which: str) -> Dict[str, Any]:
    """Force exactly six rows, ordered 6 down to 1, each with a matching name."""
    by_level: Dict[int, Dict[str, Any]] = {}
    for row in table.get("rows") or []:
        try:
            level = int(row.get("level"))
        except (TypeError, ValueError):
            continue
        if 1 <= level <= 6 and level not in by_level:
            by_level[level] = row

    rows: List[Dict[str, Any]] = []

    for level, name in LEVELS:
        row = by_level.get(level) or {}
        rows.append({
            "level": level,
            # Trust the number over the name; they disagree occasionally.
            "name": LEVEL_NAMES.get(level, row.get("name", "")),
            "discourse": (row.get("discourse") or "").strip(),
            "sentence": (row.get("sentence") or "").strip(),
            "word": (row.get("word") or "").strip(),
            # Assigned here rather than taken from the model. This is what stops
            # the same term appearing at levels 1, 2, 3 and 5.
            "examples": _examples_for(bands, level, which),
        })

    return {"note": (table.get("note") or "").strip(), "rows": rows}


def _normalize_objectives(data: Dict[str, Any]) -> Dict[str, Any]:
    def column(key: str, default_heading: str) -> Dict[str, str]:
        source = data.get(key) or {}
        return {
            "heading": (source.get("heading") or "").strip() or default_heading,
            "discourse": (source.get("discourse") or "").strip(),
            "sentence": (source.get("sentence") or "").strip(),
            "word": (source.get("word") or "").strip(),
        }

    return {
        "note": (data.get("note") or "").strip(),
        "interpretive": column("interpretive", "Interpretive — reading the anchor text"),
        "expressive": column("expressive", "Expressive — producing the response"),
    }


def _normalize_listing(data: Dict[str, Any], key: str) -> Dict[str, Any]:
    items = data.get(key)
    return {
        "note": (data.get("note") or "").strip(),
        key: items if isinstance(items, list) else [],
    }
