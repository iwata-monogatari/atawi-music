# Workspace Rules for ATAWI MUSIC

## CRITICAL: SORT BUTTON AND LAYOUT CONSTRAINTS (SORT_BUTTONS_GUARD)
1. **Sort Buttons Definition and Location**:
   - The "掲載順" (featured) and "新着順" (created_desc) sorting buttons MUST NEVER be placed in the top sorting chips area (`.sort-row`).
   - They MUST be rendered dynamically inside the bottom pagination area (`.pagination`) next to the "すべての記事を見る" button (or alone on the archive page), aligned to the right.
   - The top `.sort-row` MUST only contain the 4 buttons: "曲の新しい順" (release_desc), "曲の古い順" (release_asc), "歌手名順" (artist), and "曲名順" (title).
2. **Implementation Protection**:
   - Do NOT modify the `miniSort()` function or its usage in `render()` inside `assets/js/main.js`.
   - Do NOT change the grid column setup of `.sort-row` (which must remain 4 columns `repeat(4, minmax(0, 1fr))`).
   - Do NOT delete or modify the `.mini-sort` CSS class or any style elements related to bottom sorting alignment.
   - This layout constraint has been explicitly defined by the user and must be strictly preserved across all future updates, enhancements, or bug fixes.

## Immediate Execution Mode for Song Creation/Updates (ATAWI_MUSIC_IMMEDIATE_MODE)
1. **No Planning/Confirmations**:
   - For all ATAWI MUSIC tasks involving adding a new song, updating a YouTube URL, or modifying article content, the agent MUST NOT enter planning mode, MUST NOT create `implementation_plan.md` or `task.md` files, and MUST NOT wait for user approval.
2. **Single-Turn Execution**:
   - The agent MUST execute the requested updates immediately in a single turn.
   - This includes: duplicate check, database registration (`songs.json` / `artists.json`), HTML page creation/update, search index rebuilding (`node tools/build-search-index.mjs`), and Cloudflare Pages deployment.
3. **Commit & Push**:
   - Staging, committing, and pushing the modified files (`songs.json`, `artists.json`, `search-index.json`, and the HTML article file) to the Git repository MUST be done automatically in the same turn without requesting permission.
   - If a push fails due to remote history force-pushes, the agent MUST automatically stash in-flight working tree changes, reset local to remote HEAD (`git reset --hard origin/main`), re-apply the song update, commit, push, and pop the stash, without interrupting the user.
