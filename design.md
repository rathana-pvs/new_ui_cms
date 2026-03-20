# Modern DevTool UI System (Spotify Colorway)
**Project Context:** Web-based CUBRID Database Management Interface
**Aesthetic:** High-density Developer Tool layout with Spotify's "Encore" Color Palette.
**Theme Support:** Light Mode (Default) and Dark Mode (`dark:` variants)

---

## 1. Color Tokens (The "Spotify Dev" Palette)

| Element | Light Mode (Default) | Dark Mode (`dark:`) |
| :--- | :--- | :--- |
| **Primary Accent** | `#1ED760` (Spotify Green) | `#1ED760` (Spotify Green) |
| **Accent Hover** | `#1DB954` | `#1DB954` |
| **Background Base** | `#FFFFFF` | `#121212` (Deep Black) |
| **Elevated Surface** | `#F8F8F8` (Cards, Modals) | `#181818` (Cards, Modals) |
| **Hover Surface** | `#EAEAEA` (Rows, Menus) | `#2A2A2A` (Rows, Menus) |
| **Borders / Dividers** | `#D9D9D9` | `#282828` |
| **Primary Text** | `#000000` | `#FFFFFF` |
| **Secondary Text** | `#535353` | `#A7A7A7` or `#B3B3B3` |

**Semantic Status Colors (For Database Events):**
* **Success / Commit:** `#1ED760` (Matches Primary)
* **Error / Rollback:** `#E91429` (Spotify Red)
* **Warning / Lock:** `#FFA42B` (Spotify Orange)

---

## 2. Typography (Pro Structure)
* **UI Font:** `'Inter', system-ui, -apple-system, sans-serif`
  * *Use for:* Menus, Buttons, Settings, Navigation Tree, Modals, Tabs.
* **Code & Data Font:** `'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace`
  * *Use for:* SQL Editors, Database Table Cells, Connection Strings, Badges.
* **Sizing Strategy:**
  * Small/Badges: `12px` (Line height: `16px`)
  * Data/SQL: `14px` (Line height: `20px`)
  * Standard UI / Nav Tree: `13px` or `14px` (Line height: `24px`)
  * Section Headers: `18px` (Line height: `28px`)

---

## 3. Form Fields, Inputs & Selects
* **Dimensions:** Height `36px`, Padding `0 12px`, Border Radius `6px`, Font `14px`.
* **Light Mode:** Background `#FFFFFF`, Border `1px solid #D9D9D9`, Focus `outline: 2px solid #1ED760`. Placeholder `#535353`.
* **Dark Mode:** Background `#242424`, Border `1px solid transparent`, Focus `outline: 2px solid #1ED760`. Placeholder `#A7A7A7`.
* **Select Fields:** Appearance `none` (hide OS arrows). Custom SVG chevron right-aligned.

---

## 4. Buttons
* **Standard:** Height `36px`, Padding `0 16px`, Font `14px`, Medium weight (500), Border Radius `6px`.
* **Primary Style:** Background `#1ED760`, Text `#000000` (Always Black on Green), Border `none`.
* **Secondary Style:** Background `transparent`, Border `1px solid` (Light: `#D9D9D9`, Dark: `#727272`), Text matches Primary Text. 
* **Danger Style:** Background `#E91429`, Text `#FFFFFF`.

---

## 5. Tables & Data Grids
* **Header (TH):** Height `36px`, Padding `0 12px`, Font `12px` Medium, Uppercase (UI Font). Color: Secondary Text.
* **Row (TR/TD):** Height `36px` (Dense), Padding `0 12px`, Font `14px` (Strictly Monospace Font).
* **Borders:** Right and bottom border on every cell to separate columns (Light: `1px solid #D9D9D9`, Dark: `1px solid #282828`). Apply Hover Surface background to `TR` on hover.

---

## 6. Navigation Tree (Schema Browser)
* **Dimensions:** Item Height `28px`, Font Size `13px` (UI Font). Indentation `12px` per level.
* **Default State:** Text matches Secondary Text. Background `transparent`.
* **Hover State:** Background changes to Hover Surface. Text Primary Text. Border Radius `4px`.
* **Active/Selected State:**
  * Light Mode: Background `rgba(30, 215, 96, 0.1)`, Text `#1DB954`, Font Medium.
  * Dark Mode: Background `rgba(30, 215, 96, 0.1)`, Text `#1ED760`, Font Medium.

---

## 7. Dropdown & Context Menus
* **Menu Wrapper:** Border Radius `6px`, Min Width `160px`, Padding `4px`.
  * Light Mode: Background `#FFFFFF`, Border `1px solid #D9D9D9`, Shadow `shadow-lg`.
  * Dark Mode: Background `#181818`, Border `1px solid #282828`, Shadow `shadow-2xl shadow-black`.
* **Menu Items:** Height `32px`, Padding `0 12px`, Border Radius `4px`, Font `13px` UI Font.
  * Default Hover: Background `#EAEAEA` (Light) / `#2A2A2A` (Dark).
* **Destructive Items (e.g., "Drop Table"):** Hover Background `rgba(233, 20, 41, 0.1)`, Text `#E91429`.

---

## 8. Modals & Dialogs
* **Backdrop:** Deep black with partial opacity (`bg-black/60 backdrop-blur-sm`).
* **Modal Container:** Border Radius `8px`, Padding `0`.
* **Header/Footer:** Flexbox layouts with borders (`#D9D9D9` Light / `#282828` Dark).
* **Theming:**
  * Light Mode: Container `#FFFFFF`, Shadow `shadow-2xl`.
  * Dark Mode: Container `#181818`, Shadow `shadow-2xl shadow-black`.

---

## 9. Advanced UI Components
* **Tabs (Query Editors):** Height `36px`, Font `13px`. Active State: Text `#1ED760`, Border-bottom `2px solid #1ED760`.
* **Badges (Data Types):** Height `20px`, Font `11px` Monospace.
* **Splitters (Resizers):** 1px width/height. Expands to 4px on hover.
* **Toasts (Notifications):** Left border `4px solid` mapping to semantic colors (e.g., `#1ED760` for success).
* **Custom Scrollbars:** Width/Height `8px`. Track `transparent`. Thumb `#B3B3B3` (Light) / `#5A5A5A` (Dark).

---

## AI Generation Prompt: Execute UI Overhaul

**Instructions for AI Agent:**
Act as an expert ReactJS and Tailwind CSS UI/UX developer. I am building a web-based CUBRID database management tool. Overhaul the UI to match a high-density Developer Tool structure, but strictly use the Spotify-inspired color tokens defined above.

**Theme Requirement: Support Light and Dark Mode**
Implement this UI using Tailwind CSS, supporting both light and dark themes. Default classes should be Light Mode; use Tailwind's `dark:` variant for Dark Mode. Use arbitrary values (e.g., `bg-[#121212]`, `text-[#1ED760]`) for the Spotify colors if they are not mapped in the Tailwind config.

**Key Implementation Requirements:**
1. **Typography Separation:** Strictly apply `font-sans` for the UI (sidebar, buttons, menus, modals, tabs) and `font-mono text-[14px]` for the SQL Query Editor, badges, and all Data Table cells.
2. **Navigation Tree:** Build a recursive sidebar menu (`h-8`, `text-[13px]`) for Databases > Tables. The "Active" table must use a subtle `#1ED760` (Green) tinted background with Green text.
3. **Data Tables:** Build a highly structured table with `h-9` rows, `text-xs uppercase` headers, and `border-r border-b` on all cells to mimic a real database grid.
4. **Context Menus:** Build a floating dropdown (`p-1 rounded-md border shadow-lg`). Include a "Destructive" state (`text-[#E91429] hover:bg-[#E91429]/10`) for "Drop Table".
5. **Forms & Selects:** Inputs must be dense (`h-9 rounded-md`). Focus rings MUST use the Spotify green: `focus:outline-none focus:ring-2 focus:ring-[#1ED760]`.
6. **Modals & Dialogs:** Build a reusable modal. The container uses `rounded-lg shadow-2xl`, with a distinct header/footer. The backdrop must obscure the app using `bg-black/60 backdrop-blur-sm`.
7. **Advanced Polish:** Implement custom webkit scrollbars. Include a draggable Resizer/Splitter to divide the sidebar and main content. Integrate top Tabs for managing multiple open SQL queries, using `#1ED760` for the active tab bottom border.

**Current Task:**
Read these rules carefully, then rewrite the React code and Tailwind classes for my main application layout, including the sidebar navigation tree, a header, and the primary SQL execution table.