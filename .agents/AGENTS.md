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
