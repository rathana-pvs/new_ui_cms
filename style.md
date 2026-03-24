---
description: CUBRID Manager Design System — always-on coding rules. Applied to all .tsx, .ts, .css files.
globs:
  - "**/*.tsx"
  - "**/*.ts"
  - "**/*.css"
alwaysApply: true
---

# CUBRID Manager — Design System Rules

## 1. Zero Visual Regression (Highest Priority)
- NEVER change the visual output of any component. Every refactor must be pixel-identical.
- NEVER "optimize", deduplicate, or simplify className strings. Copy them verbatim.
- NEVER replace custom Tailwind arbitrary values with standard ones:
  - `text-[11.5px]` → do NOT change to `text-xs`
  - `ml-[22px]`    → do NOT change to `ml-6`
  - `bg-bk-yellow/5` → do NOT change to `bg-yellow-50`
  - `shadow-[0_0_8px_rgba(217,119,6,0.2)]` → do NOT change to `shadow-md`
- NEVER remove `font-mono` overrides from tree labels or data cells.

## 2. Component Dictionary — Always Use DS Components
Replace native HTML tags with Design System components:
- `<button>`                     → `<Button variant="..." size="...">`
- `<input>`                      → `<Input label="..." error="..." hint="...">`
- `<select>`                     → `<Select options={[]} value={} onChange={}/>`
- `<textarea>`                   → `<Textarea rows={} label="..." />`
- `<input type="checkbox">`      → `<Checkbox label="..." checked={} onChange={}/>`
- `<input type="radio">`         → `<Radio label="..." value={} checked={} onChange={}/>`
- `window.confirm(...)` → NEVER use. Replace with `useConfirm()` hook.
- `window.alert(...)`   → NEVER use. Replace with `useToast()` hook.
- Raw spinner div       → `<Spinner size="sm|md|lg" />`
- Raw toast state       → `const { toast } = useToast()`
- Raw search input      → `<SearchInput value={} onChange={} onClear={}/>`

## 3. Redux Logic — Never Modify
- NEVER change `dispatch()` call sites or their position in the component lifecycle.
- NEVER remove `.unwrap()` or `.catch()` chains.
- NEVER convert lazy `onToggle` fetches into eager `useEffect` fetches.
- NEVER add new `useEffect` dependencies that were not present before.
- Tree `onToggle` must ONLY fire when the user expands a node — never on mount.

## 4. Icons — Material Symbols Outlined Only
- ALWAYS use `<Icon name="..." weight={300} />` — never raw `<span class="material-symbols-outlined">`.
- ALWAYS pass `weight={300}`. Never use 400, 500, or the default weight.
- ALWAYS preserve rotation/transition: `className="group-open:rotate-90 transition-transform duration-150"`.
- `font-variation-settings` string must include `'FILL' 0` — prevents filled icon style.
- Correct size per context:
  - `size="sm"` (16px) → tree expand, inline row actions, badge icons
  - `size="md"` (20px) → toolbar buttons, modal header, alert icon
  - `size="lg"` (24px) → panel header, breadcrumb root
  - `size="xl"` (32px) → empty state hero icon

## 5. Typography — Font Family Rules
- Sans (`Inter` / `system-ui`) → UI chrome only: labels, buttons, headings, hints, tooltips
- Mono (`JetBrains Mono` / `Fira Code`) → all data: tree labels, column names, types, OIDs, SQL, log lines, cell values, timestamps
- Rule of thumb: if it came from the database, it uses `font-mono`.

## 6. Tree System — Indentation is Sacred
- Level 1 (root nodes: databases, logs, brokers): `ml-[22px]` — EXACT value, no exceptions.
- Level 2+ (tables, columns, sub-items): `ml-4`.
- Guide line: `border-l border-slate-200 dark:border-slate-800` — ALWAYS present.
- Active indicator bar: `absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600` — NEVER remove.
- Status dot `animate-ping`: NEVER remove from the "On" state of `<StatusIndicator>`.

## 7. Infrastructure — Always Wrap Panels
- ALWAYS wrap every top-level panel with `<ErrorBoundary>`.
- ALWAYS use `<PermissionGate permission="dba">` where role checks previously existed.
- ALWAYS reference `src/styles/theme.js` for color tokens. Never hardcode hex values.

## 8. TypeScript — No Shortcuts
- NEVER use `any` to work around a type error. Fix the type properly.
- ALWAYS define a TypeScript interface for component props.
- ALWAYS use Function Components — never Class Components.
- EVERY new component must have a corresponding `.test.tsx` file.

## 9. Protected Patterns — Never Delete These
These exact class strings must survive refactoring unchanged:
- `shadow-[0_0_8px_rgba(217,119,6,0.2)]`   — warning glow
- `shadow-[0_0_0_2px_rgba(217,119,6,0.3)]` — active node ring
- `bg-bk-yellow/5`                          — CUBRID brand tint
- `animate-ping`                            — StatusIndicator live state
- `absolute left-[-1px]`                    — active tree node bar