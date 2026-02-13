# Workflows

## AI Ingestion (Interviews → Staging)

- **Trigger:** Push to `main` with changes under `_content/interviews/`, or manual run.
- **Actions:** Runs `npm run ingestion` (AI pipeline), then opens a PR from a new branch into `staging` with any generated files in `_content/_staging/`.
- **Secrets:** Set `OPENAI_API_KEY` in repository secrets for the ingestion script to call the LLM. Optional: `INGESTION_MODEL` as a repository variable (default `gpt-4o-mini`).
- **Note:** The `staging` branch must exist (e.g. create once from `main`).

## Promote Staging to Main

- **Trigger:** Push to `staging`, or manual run.
- **Actions:** Runs `npm run staging:promote` (moves `_content/_staging/*.md` → `_content/projects/` as `PRJ-xxx.md`, then governance to regenerate `public/master_data.json`). Commits those changes to `staging` and opens or updates a PR from `staging` to `main`.
