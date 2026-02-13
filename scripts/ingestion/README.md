# Ingestion Engine (AI Pipeline)

PRD §2.1: Converts raw inputs into structured project drafts in `_content/_staging/`.

## Steps

1. **Normalization:** Convert PDF/Docx/Audio into plain text (e.g. via pandoc, Whisper, or a cloud API).
2. **Entity Extraction (LLM):** Use a large-context model (e.g. Gemini) with a system prompt such as:
   - "Analyze the provided transcripts. Extract discrete project opportunities. For each, generate a title, a 1-paragraph rationale, and a list of key deliverables."
3. **Heuristic Scoring:** AI assigns Impact and Effort scores from sentiment (e.g. "urgent"/"critical" → High Impact; "complex"/"years" → High Effort).
4. **Output:** Write draft Markdown files to `_content/_staging/` with `confidence_score` in frontmatter.

## Implementation note

A full implementation requires:

- API keys for the chosen LLM provider.
- File parsers for PDF/Docx (e.g. `pdf-parse`, `mammoth`) and optionally speech-to-text for audio.
- A Node or Python script that reads `_content/interviews/`, calls the LLM, and writes to `_content/_staging/`.

Run this pipeline before moving drafts to `_content/projects/` and running the Governance Engine.
