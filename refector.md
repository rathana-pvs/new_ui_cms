# 🏛️ CUBRID Manager — Design System & Refactoring Master Framework

**Role:** Expert ReactJS Frontend Architect  
**Project:** CUBRID Management Tool (Database, Log, Broker, Job Systems)  
**Core Mission:** Refactor legacy code into the new Design System with **Zero Visual Regression**.

---

## 🎯 1. The "Strict Structure" Mandate

| Rule | Detail |
|---|---|
| **Zero Visual Change** | The UI must look 100% identical after refactoring |
| **Preserve Utility Classes** | Transfer all specialized Tailwind classes exactly as-is (e.g., `text-[11.5px]`, `ml-[22px]`, `bg-bk-yellow/5`) |
| **Protected Styles** | Never remove custom shadows like `shadow-[0_0_8px_rgba(217,119,6,0.2)]` or `font-mono` overrides |
| **Logic Mapping** | Keep all Redux `dispatch`, `unwrap()`, and `onToggle` thunk logic intact |
| **No Class Cleanup** | Do **not** "optimize" or de-duplicate className strings during transfer |

---

## 🛠️ 2. Component API Reference (The Dictionary)

### 2.1 Foundation

```tsx
<Button
  variant="primary | secondary | outline | ghost | danger"
  size="sm | md | lg | icon"
  loading={false}
  icon="material_icon"
  iconPosition="left | right"
/>

<Typography
  variant="h1 | h2 | h3 | h4 | h5 | h6 | p | span | label | caption | code"
/>

<Icon
  name="material_icon"
  size="sm | md | lg | xl"
  weight={300}              // ← always 300 unless design specifies otherwise
  className="..."           // ← preserve rotation classes: group-open:rotate-90
/>

// NEW — replaces raw animate-spin divs
<Spinner size="sm | md | lg" />

// NEW — status/category labeling
<Badge
  variant="default | success | warning | danger | info"
  size="sm | md"
/>

// NEW — contextual hover hints
<Tooltip
  content="..."
  placement="top | bottom | left | right"
/>

// NEW — keyboard shortcut display
<Kbd keys={["Ctrl", "S"]} />

// NEW — horizontal/vertical separator with optional label
<Divider label="Optional label" />
```

### 2.2 Forms

```tsx
<Input
  label="Name"
  error="Required"
  hint="Helper text"
  {...nativeInputProps}
/>

<Select
  label="Option"
  options={[{ label, value }] | string[]}
  value={val}
  onChange={(val) => {}}
  placeholder="Select..."
/>

<Checkbox
  label="Check me"
  checked={true}
  onChange={(checked) => {}}
/>

<Toggle
  label="Switch"
  checked={true}
  onChange={(checked) => {}}
/>

<Textarea
  label="Bio"
  error="..."
  rows={4}
/>

// NEW — single radio option
<Radio
  label="Option A"
  value="a"
  checked={true}
  onChange={(val) => {}}
/>

// NEW — radio group with options array
<RadioGroup
  name="group"
  options={[{ label, value }]}
  value={val}
  onChange={(val) => {}}
/>

// NEW — wraps any input for consistent label/error/hint layout
<FormField label="Label" error="Msg" hint="Hint" required>
  {/* any input element */}
</FormField>

// NEW — search with clear button, used on every panel
<SearchInput
  value={query}
  onChange={(q) => {}}
  onClear={() => {}}
  placeholder="Search tables..."
/>

// NEW — for column/tag multi-selection
<MultiSelect
  label="Columns"
  options={[{ label, value }]}
  value={string[]}
  onChange={(vals) => {}}
/>

// NEW — for Job scheduling
<DatePicker
  label="Start date"
  value={date}
  onChange={(date) => {}}
/>

// NEW — for SQL import workflows
<FileUpload
  accept=".sql,.csv"
  onSelect={(files) => {}}
/>
```

### 2.3 Layout & Data

```tsx
<Card
  title="Header"
  subtitle="Sub"
  headerAction={<Button />}
>
  Content
</Card>

<Table
  columns={[{ header, accessor, render, width, className }]}
  data={[]}
  onRowClick={(row) => {}}
  emptyMessage="..."
  headersVisible={true}
  sortable={true}           // NEW prop
  loading={false}           // NEW prop — renders Skeleton rows while fetching
/>

<Modal
  isOpen={true}
  onClose={() => {}}
  title="Title"
  subtitle="Sub"
  icon="lock"
  iconVariant="primary | danger | warning | success"
  footer={<Button />}
  maxWidth="max-w-md | max-w-lg | max-w-xl | max-w-2xl"
/>

<Tabs
  tabs={[{ id, label, content }]}
  activeTab={id}
  onChange={(id) => {}}
  variant="line | pills"
/>

<Accordion
  items={[{ id, title, content }]}
  allowMultiple={false}
/>

// NEW — replaces window.confirm() across 20+ callsites
<ConfirmDialog
  isOpen={true}
  title="Delete user?"
  description="This cannot be undone."
  confirmLabel="Delete"
  variant="danger"
  onConfirm={() => {}}
  onCancel={() => {}}
/>

// NEW — side panel for filters and settings
<Drawer
  isOpen={true}
  onClose={() => {}}
  title="Filter"
  placement="left | right"
  width="w-80 | w-96"
/>

// NEW — contextual overlay anchored to a trigger element
<Popover
  trigger={<Button />}
  content={<div />}
  placement="top | bottom | left | right"
/>

// NEW — main two-column shell for tree + content layout
<SplitPane
  left={<TreePanel />}
  right={<ContentPanel />}
  defaultSize={260}
  minSize={180}
/>

// NEW — zero-data placeholder for all panels
<EmptyState
  icon="table_chart"
  title="No tables found"
  description="Connect a database to begin."
  action={<Button />}
/>

// NEW — syntax-highlighted code display with copy button
<CodeBlock
  language="sql | json | bash"
  value={code}
  copyable={true}
/>

// NEW — loading placeholder while content fetches
<Skeleton
  variant="text | rect | circle"
  width="..."
  height="..."
/>
```

### 2.4 Feedback & Navigation

```tsx
<Alert
  variant="info | success | warning | error"
  title="Warning"
  onClose={() => {}}
>
  Content
</Alert>

<Toast
  message="Saved"
  variant="success"
  isOpen={true}
  onClose={() => {}}
  duration={3000}
/>

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => {}}
/>

<Breadcrumbs
  items={[{ label, icon }]}
  onNavigate={(item) => {}}
/>

// NEW — for backup/restore/import progress
<ProgressBar
  value={65}
  max={100}
  variant="default | success | warning | danger"
  showLabel
/>

// NEW — for multi-step wizards (connection setup, job creation)
<Steps
  steps={[{ id, label, status: "complete | active | pending | error" }]}
  orientation="horizontal | vertical"
/>
```

---

## 🌳 3. Universal Tree System (Database, Log, Broker)

### 3.1 Indentation Rules

| Level | Applies To | Class |
|---|---|---|
| Level 1 | Databases, Log files, Brokers | `ml-[22px]` |
| Level 2+ | Tables, Users, Columns, Sub-brokers | `ml-4` |
| Guide line | All levels | `border-l border-slate-200 dark:border-slate-800` |

### 3.2 Lazy Loading Contract

`onToggle` **must** trigger Redux thunks. Never load children eagerly on mount.

```tsx
// ✅ Correct — fetch only when the node is expanded
const handleToggle = async () => {
  await dispatch(fetchDatabaseUsers({ dbName })).unwrap();
};

// ❌ Wrong — loads everything before the user expands anything
useEffect(() => {
  dispatch(fetchAllUsers());
}, []);
```

### 3.3 Required Visual Patterns

| Pattern | Implementation |
|---|---|
| **Active indicator** | `absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600` |
| **Status ping** | `<StatusIndicator status="on | off" animate />` |
| **Expand icon** | `<Icon name="chevron_right" weight={300} className="group-open:rotate-90 transition-transform" />` |
| **Hover state** | `hover:bg-slate-100 dark:hover:bg-slate-800/60` |
| **Loading node** | `<Skeleton variant="text" width="120px" height="16px" />` |
| **Context menu** | Right-click opens `<ContextMenu>` with node-specific actions |

### 3.4 TreeNode Component API *(Formalize this)*

```tsx
<TreeNode
  id="db_mydb"
  label="mydb"
  icon="database"
  level={1}                                         // 1 = top, 2+ = nested
  isActive={activeNode === "db_mydb"}
  isLoading={loadingNodes.includes("db_mydb")}
  hasChildren={true}
  status="on | off | unknown"
  onToggle={() => dispatch(fetchDatabaseUsers({ dbName }))}
  onSelect={() => setActiveNode("db_mydb")}
  onContextMenu={(e) => openContextMenu(e, node)}
>
  {/* children rendered recursively */}
</TreeNode>
```

### 3.5 Tree Variants

Each tree shares the same `<TreeNode>` base but fetches from different Redux slices:

| Tree | Root thunk | Child thunks |
|---|---|---|
| **Database** | `fetchDatabases` | `fetchDatabaseTables`, `fetchDatabaseUsers`, `fetchTableColumns` |
| **Log** | `fetchLogFiles` | `fetchLogEntries` |
| **Broker** | `fetchBrokers` | `fetchBrokerConnections`, `fetchBrokerMetrics` |

---

## 🗄️ 4. CUBRID Domain Components *(New Section)*

These components do not exist in the generic Design System. They must be built as **custom components** that consume DS primitives internally. They live in `src/components/domain/`.

### 4.1 SQLEditor

```tsx
<SQLEditor
  value={sql}
  onChange={(sql) => {}}
  onExecute={(sql) => dispatch(executeQuery(sql))}
  onFormat={() => {}}
  language="sql"
  readOnly={false}
  height="h-48 | h-64 | h-96"
/>
```

**Internals:** Wraps CodeMirror or Monaco with CUBRID SQL dialect. Uses DS `<CodeBlock>` for read-only display. Toolbar uses DS `<Button size="sm">` components.

### 4.2 QueryResultGrid

```tsx
<QueryResultGrid
  columns={string[]}
  rows={Record<string, unknown>[]}
  totalRows={1042}
  executionTime={0.23}       // seconds
  loading={false}
  error={string | null}
  onExport={(format: "csv" | "xlsx") => {}}
/>
```

**Internals:** Wraps DS `<Table>` with a result-count bar, execution time `<Badge>`, and export `<Button>` controls.

### 4.3 LogViewer

```tsx
<LogViewer
  lines={LogLine[]}          // { timestamp: string, level: "error"|"warn"|"info", message: string }
  loading={false}
  autoScroll={true}
  filter={{
    level: "error | warn | info | all",
    search: "",
  }}
  onFilterChange={(filter) => {}}
/>
```

**Internals:** Virtualized list for performance. Level badges use DS `<Badge variant>`. Search uses DS `<SearchInput>`.

### 4.4 JobTimeline

```tsx
<JobTimeline
  jobs={Job[]}               // { id, name, status, startTime, nextRun, cronExpr }
  onRunNow={(jobId) => {}}
  onToggleActive={(jobId, active) => {}}
  onEdit={(job) => {}}
  onDelete={(jobId) => {}}
/>
```

**Internals:** Uses DS `<Table>` rows with inline `<Toggle>` for active state and `<Badge>` for job status. Delete triggers `useConfirm()`.

### 4.5 BrokerChart

```tsx
<BrokerChart
  data={BrokerMetric[]}      // { timestamp: string, activeConnections: number, qps: number, errorRate: number }
  range="1h | 6h | 24h"
  onRangeChange={(range) => {}}
/>
```

**Internals:** Recharts or Chart.js line chart. Range selector uses DS `<Tabs variant="pills">`.

### 4.6 Supporting Domain Atoms

```tsx
// Displays a value with an inline copy-to-clipboard button
<CopyableValue
  value="localhost:33000"
  mono                       // applies font-mono
/>

// Colored tag showing active connection name/host with status dot
<ConnectionTag
  name="prod-db"
  host="192.168.1.10"
  status="connected | disconnected | error"
/>

// Uniform On/Off/Unknown status dot with optional animate-ping
<StatusIndicator
  status="on | off | unknown"
  animate={true}             // ← animate-ping must be preserved
  label="Running"
/>

// Right-click context menu anchored to tree nodes
<ContextMenu
  items={[
    { label: "Refresh", icon: "refresh", onClick: () => {} },
    { label: "Drop table", icon: "delete", variant: "danger", onClick: () => {} },
  ]}
  isOpen={true}
  position={{ x: 120, y: 240 }}
  onClose={() => {}}
/>
```

---

## 🔄 5. Step-by-Step Refactoring Protocol

### Step 1 — Pre-flight

Before touching any code:

- [ ] Read the legacy component top-to-bottom
- [ ] List every Redux `dispatch`, `selector`, and `useEffect` — **do not touch these**
- [ ] Copy every `className` string to a scratchpad
- [ ] Take a baseline screenshot

### Step 2 — Tag Swap

Replace native tags with Dictionary components one-by-one.

```tsx
// Before
<button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700">
  Save
</button>

// After — className preserved, logic untouched
<Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700">
  Save
</Button>
```

### Step 3 — Class Transfer (Non-negotiable)

Copy the **exact** `className` string. Never clean or "optimize" it.

```tsx
// ✅ Correct — exact string preserved
<Typography
  variant="caption"
  className="text-[11.5px] font-mono text-slate-400 ml-[22px]"
/>

// ❌ Wrong — classes were silently "optimized"
<Typography
  variant="caption"
  className="text-xs text-slate-400 ml-6"
/>
```

### Step 4 — Icon Sync

```tsx
// Always pass weight={300}. Always preserve rotation and transition classes.
<Icon
  name="chevron_right"
  weight={300}
  className="group-open:rotate-90 transition-transform duration-150"
/>
```

### Step 5 — Logic Integrity Check

After each component refactor, verify:

- All `dispatch()` calls still fire at the same lifecycle moment
- All `unwrap()` chains and `.catch()` error handlers are intact
- `onToggle` is still lazy — does not fire on mount
- No new `useEffect` dependencies were introduced

### Step 6 — Visual Diff

Run a pixel-diff screenshot test (Playwright or Chromatic) against the baseline **before merging**. Zero regression tolerance.

---

## 🧱 6. Infrastructure Layer *(New Section)*

These are not UI components but are **required** for the Design System to function correctly across the whole application. They must be implemented before any component refactoring begins.

### 6.1 ThemeProvider

Wraps the application root. Injects CSS variables from `theme.js` and manages `light | dark | system` mode.

```tsx
// src/main.tsx
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

### 6.2 useToast Hook

Provides an imperative toast API across all panels without prop-drilling `<Toast>` state.

```tsx
const { toast } = useToast();

toast.success("User created");
toast.error("Connection failed", { duration: 5000 });
toast.warning("Broker offline");
toast.info("Query queued");
```

### 6.3 useConfirm Hook

Replaces every `window.confirm()` callsite with the DS `<ConfirmDialog>`.

```tsx
const confirm = useConfirm();

const handleDropTable = async () => {
  const ok = await confirm({
    title: "Drop table?",
    description: "All rows will be permanently deleted. This cannot be undone.",
    variant: "danger",
    confirmLabel: "Drop table",
  });
  if (ok) dispatch(dropTable(tableName));
};
```

### 6.4 PermissionGate

Hides or disables UI based on the current user's CUBRID role.

```tsx
// Renders nothing (or a fallback) if the user lacks the required permission
<PermissionGate
  permission="dba"
  fallback={
    <Alert variant="warning" title="DBA access required">
      Contact your administrator to request access.
    </Alert>
  }
>
  <UserManagementPanel />
</PermissionGate>
```

### 6.5 ErrorBoundary

Wraps every top-level panel. Renders a DS-styled fallback instead of a blank crash screen.

```tsx
<ErrorBoundary
  fallback={
    <EmptyState
      icon="error_outline"
      title="Something went wrong"
      description="Reload the panel or contact support."
      action={<Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>}
    />
  }
>
  <DatabasePanel />
</ErrorBoundary>
```

---

## 🌐 7. Single Source of Truth (SSOT)

All design tokens live in `src/styles/theme.js`. A single value change **propagates to all trees simultaneously** — Database, Log, and Broker share these tokens by reference.

```js
// src/styles/theme.js
export const theme = {
  colors: {
    // Active/selected state — used by all three tree systems
    primary:           "amber-600",
    primaryHover:      "amber-700",

    // Tree guide lines
    treeBorder:        "slate-200",   // light mode  → border-l
    treeBorderDark:    "slate-800",   // dark mode   → border-l

    // StatusIndicator dots
    statusOn:          "green-500",
    statusOff:         "slate-400",
    statusUnknown:     "yellow-500",
  },

  tree: {
    levelOneIndent:    "ml-[22px]",   // Database / Log / Broker root nodes
    levelDeepIndent:   "ml-4",        // Tables, columns, sub-brokers
    activeBarColor:    "bg-amber-600",
    activeBarClass:    "absolute left-[-1px] top-0 bottom-0 w-[2px]",
    hoverClass:        "hover:bg-slate-100 dark:hover:bg-slate-800/60",
  },

  typography: {
    treeLabel:         "text-[11.5px] font-mono",
    columnDetail:      "text-[11px] text-slate-400",
    statusLabel:       "text-[11px] font-medium uppercase tracking-wide",
  },

  shadows: {
    // Protected — do not remove or change
    warningGlow:       "shadow-[0_0_8px_rgba(217,119,6,0.2)]",
    activeNodeRing:    "shadow-[0_0_0_2px_rgba(217,119,6,0.3)]",
  },
};
```

---

## ✅ 8. Refactoring Checklist (Per Component)

Run this checklist for every component before marking it as done.

**Logic**
- [ ] All `dispatch()` calls preserved at the same lifecycle moment
- [ ] All `unwrap()` chains and `.catch()` error handlers intact
- [ ] `onToggle` is lazy — does not fire on mount
- [ ] No new `useEffect` dependencies introduced
- [ ] `window.confirm()` replaced with `useConfirm()`
- [ ] Direct `<Toast>` state replaced with `useToast()`

**Styles**
- [ ] `className` strings copied verbatim — no optimization
- [ ] Custom Tailwind utilities preserved (`text-[11.5px]`, `ml-[22px]`, etc.)
- [ ] Custom shadows preserved (`shadow-[0_0_8px_...]`)
- [ ] `font-mono` overrides not removed
- [ ] `bg-bk-yellow/5` and other theme-specific colors intact

**Components**
- [ ] `<Icon weight={300}>` set on all Icon instances
- [ ] Rotation/transition classes preserved on expand icons (`group-open:rotate-90`)
- [ ] Active indicator absolute bar present on all selected tree nodes
- [ ] `animate-ping` preserved on `<StatusIndicator>` for On/Off states
- [ ] `<ErrorBoundary>` wraps the refactored panel
- [ ] `<PermissionGate>` applied where role checks existed in legacy code

**Quality**
- [ ] Baseline screenshot taken before refactor
- [ ] Post-refactor screenshot diff passes — zero pixel regression
- [ ] No console errors or warnings introduced
- [ ] TypeScript types satisfied — no `any` escapes added

---

## 📋 9. Component Priority Backlog

Implement in this order. P0 blocks all other work.

| Priority | Component | Category | Reason |
|---|---|---|---|
| 🔴 **P0** | `ThemeProvider` | Infrastructure | Required before any DS tokens resolve |
| 🔴 **P0** | `useToast` | Infrastructure | Blocks all success/error feedback |
| 🔴 **P0** | `useConfirm` | Infrastructure | Replaces `window.confirm()` at 20+ callsites |
| 🔴 **P0** | `ConfirmDialog` | Layout | Required by `useConfirm` |
| 🔴 **P0** | `ErrorBoundary` | Infrastructure | Prevents blank crash screens in production |
| 🟠 **P1** | `TreeNode` | Domain | Standardizes all 3 tree systems |
| 🟠 **P1** | `SplitPane` | Layout | Main two-column application shell |
| 🟠 **P1** | `SearchInput` | Forms | Used on every panel header |
| 🟠 **P1** | `EmptyState` | Layout | Required for all zero-data states |
| 🟠 **P1** | `SQLEditor` | Domain | Core database workflow |
| 🟠 **P1** | `QueryResultGrid` | Domain | Core database workflow |
| 🟠 **P1** | `ContextMenu` | Domain | Required by all tree nodes |
| 🟡 **P2** | `LogViewer` | Domain | Log panel |
| 🟡 **P2** | `JobTimeline` | Domain | Job panel |
| 🟡 **P2** | `BrokerChart` | Domain | Broker panel |
| 🟡 **P2** | `CodeBlock` | Layout | SQL display, config files |
| 🟡 **P2** | `Skeleton` | Feedback | Loading states for all async data |
| 🟡 **P2** | `Spinner` | Feedback | Button loading, inline async |
| 🟡 **P2** | `Drawer` | Layout | Filter/settings side panels |
| 🟡 **P2** | `Popover` | Layout | Inline help, column info |
| 🟡 **P2** | `PermissionGate` | Infrastructure | Role-based UI gating |
| 🟢 **P3** | `Radio` / `RadioGroup` | Forms | Config option forms |
| 🟢 **P3** | `MultiSelect` | Forms | Column/tag selection |
| 🟢 **P3** | `DatePicker` | Forms | Job scheduling forms |
| 🟢 **P3** | `FileUpload` | Forms | SQL import |
| 🟢 **P3** | `FormField` | Forms | Consistent label/error layout |
| 🟢 **P3** | `ProgressBar` | Feedback | Backup/restore/import progress |
| 🟢 **P3** | `Steps` | Feedback | Multi-step wizards |
| 🟢 **P3** | `Badge` | Foundation | Status/category labeling |
| 🟢 **P3** | `Tooltip` | Foundation | Hover hints on icons and truncated text |
| 🟢 **P3** | `Divider` | Foundation | Section separators |
| 🟢 **P3** | `Kbd` | Foundation | Keyboard shortcut display |

---

## 📁 10. Suggested File Structure

```
src/
├── styles/
│   └── theme.js                    ← SSOT for all design tokens
│
├── components/
│   ├── ds/                         ← Generic Design System components
│   │   ├── foundation/
│   │   │   ├── Button.tsx
│   │   │   ├── Typography.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Kbd.tsx
│   │   │   └── Divider.tsx
│   │   ├── forms/
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── MultiSelect.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── layout/
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Popover.tsx
│   │   │   ├── SplitPane.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   └── Skeleton.tsx
│   │   └── feedback/
│   │       ├── Alert.tsx
│   │       ├── Toast.tsx
│   │       ├── Pagination.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Steps.tsx
│   │
│   └── domain/                     ← CUBRID-specific components
│       ├── tree/
│       │   ├── TreeNode.tsx
│       │   └── ContextMenu.tsx
│       ├── database/
│       │   ├── SQLEditor.tsx
│       │   └── QueryResultGrid.tsx
│       ├── log/
│       │   └── LogViewer.tsx
│       ├── broker/
│       │   └── BrokerChart.tsx
│       ├── job/
│       │   └── JobTimeline.tsx
│       └── atoms/
│           ├── StatusIndicator.tsx
│           ├── CopyableValue.tsx
│           └── ConnectionTag.tsx
│
├── infrastructure/
│   ├── ThemeProvider.tsx
│   ├── ErrorBoundary.tsx
│   ├── PermissionGate.tsx
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── useConfirm.ts
│   └── context/
│       ├── ToastContext.tsx
│       └── ConfirmContext.tsx
│
└── features/
    ├── database/
    ├── log/
    ├── broker/
    └── job/
```