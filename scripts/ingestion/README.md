# Ingestion Engine (AI Pipeline)

PRD §2.1: Converts raw inputs into structured project drafts in `_content/_staging/`.

## Steps

1. **Normalization:** Convert PDF/Docx/Audio into plain text (e.g. via pandoc, Whisper, or a cloud API).
   - Implemented: `.txt` and `.md` read as UTF-8; `.pdf` via `pdf-parse`; `.docx`/`.doc` via `mammoth`.
2. **Entity Extraction (LLM):** Use a large-context model (e.g. OpenAI GPT-4o-mini) with a system prompt such as:
   - "Analyze the provided transcripts. Extract discrete project opportunities. For each, generate a title, a 1-paragraph rationale, and a list of key deliverables."
3. **Heuristic Scoring:** AI assigns Impact and Effort scores from sentiment (e.g. "urgent"/"critical" → High Impact; "complex"/"years" → High Effort).
4. **Output:** Write draft Markdown files to `_content/_staging/` with `confidence_score` in frontmatter.

## Usage

From the repo root:

```bash
# Set your OpenAI API key (required for the LLM step)
export OPENAI_API_KEY="sk-..."

# Run the full pipeline: normalize interviews → extract projects → write drafts
npm run ingestion
```

Optional environment variables:

- `OPENAI_API_KEY` — **Required** for entity extraction. Get a key from [OpenAI](https://platform.openai.com/api-keys).
- `INGESTION_MODEL` — Model name (default: `gpt-4o-mini`). Use `gpt-4o` for higher quality.

## Inputs

- **Drop zone:** `_content/interviews/`
- Supported files: `.txt`, `.md`, `.pdf`, `.docx`, `.doc`
- Place transcript or meeting-note files here. The pipeline concatenates all supported files and sends the combined text to the LLM.

## Outputs

- **Staging:** `_content/_staging/`
- One Markdown file per extracted project opportunity:
  - Frontmatter includes `id` (e.g. `STG-001`), `title`, `slug`, `owner`, `department`, `phase`, `status: Backlog`, `confidence_score`, `scores` (strategic_value, complexity, confidence), placeholder `dates` and `financials`.
  - Body: Executive Summary (rationale) and Deliverables checklist.

## Workflow

1. Add or update files in `_content/interviews/`.
2. Run `npm run ingestion`.
3. Review drafts in `_content/_staging/`. Edit as needed (dates, costs, related projects).
4. Move approved drafts to `_content/projects/`: run `npm run staging:promote`. This assigns the next `PRJ-XXX` ID, writes each file as `PRJ-XXX.md`, and removes it from staging.
5. Run the Governance Engine: `npm run governance` (or `npm run build`, which runs it as prebuild).

## Implementation notes

- The pipeline uses the **OpenAI** API by default. For a different provider (e.g. Gemini), you would swap the client in `scripts/ingestion/extract.mjs` and set the appropriate env vars.
- PDF/Docx parsing depends on `pdf-parse` and `mammoth`; if parsing fails for a file, that file is skipped and a warning is logged.
- Staging drafts use placeholder dates and zero financials; these must be updated before promoting to `_content/projects/` and running governance.
