<!-- # Design System & Component Library Prompt

**Role:** Expert ReactJS Frontend Architect and UI/UX Designer

## Core Objectives

1. **Improve Design Structure:** The architecture must be modular, clean, and highly reusable. Ensure the design system is comprehensive, improving all aspects of the UI—including spacing, layout, interactions, and colors, not just typography or font size. It should be a custom, tailored design, without strictly mirroring existing apps.
2. **Single Source of Truth:** Establish a centralized styling configuration. If a primary color, border radius, or padding needs updating, it should only require a change in one central file, instantly applying across the entire application.

## Scope of Components Required

Please generate the code and folder structure for the following standardized components. They must be able to accept props for different states (e.g., disabled, loading, variants) and share the centralized styling:

### 1. Foundation
* Button
* Typography (Headings/Paragraphs)
* Icon Wrapper

### 2. Forms
* Input
* Select
* Checkbox
* Radio
* Toggle/Switch
* Textarea

### 3. Layout & Data Display
* Table
* Card
* Modal
* Tabs
* Accordion

### 4. Feedback & States
* Toast/Snackbar
* Alert/Banner
* Spinner / Skeleton Loading

### 5. Navigation
* Pagination
* Breadcrumbs

## Output Requirements

1. **Centralized Styling:** Start by defining the central theme/style file (the single source of truth).
2. **Architecture:** Provide the recommended folder structure for this component library.
3. **Implementation:** Provide the code for a complex base component (like `Table` or `Modal`) and a foundational one (like `Button`) to demonstrate how they consume the centralized styles. -->



Act as an Expert ReactJS Refactoring Assistant. Your task is to refactor the provided legacy code to strictly use our new custom Design System components instead of native HTML elements or old hardcoded styles.

**Instructions:**
1. Analyze the `Existing Code` provided below.
2. Replace all standard elements (like `<button>`, `<input>`, `<table>`, etc.) with the corresponding custom components.
3. Strip out any hardcoded styles, inline CSS, or old utility classes that are now handled centrally by the new components.
4. Ensure all existing logic (state, onClick handlers, form submissions) is perfectly preserved and mapped to the new component props.
5. Provide ONLY the fully refactored code block, ready to copy and paste.

**Available Custom Components (Reference):**

### Foundation
- `<Button variant="primary|secondary|outline|ghost|danger" size="sm|md|lg|icon" loading={false} icon="material_icon" iconPosition="left|right">`
- `<Typography variant="h1|h2|h3|h4|h5|h6|p|span|label|caption|code">`
- `<Icon name="material_icon" size="sm|md|lg|xl" weight={300}>`

### Forms
- `<Input label="Name" error="Required" {...props}>` (Native props supported)
- `<Select label="Option" options={[{label, value}]|string[]} value={val} onChange={(val) => {}} placeholder="Select...">`
- `<Checkbox label="Check me" checked={true} onChange={(checked) => {}}>`
- `<Radio label="Option" value="v1" name="grp" checked={true} onChange={(val) => {}}>`
- `<Toggle label="Switch" checked={true} onChange={(checked) => {}}>`
- `<Textarea label="Bio" error="..." rows={4}>`

### Layout
- `<Card title="Header" subtitle="Sub" headerAction={<Button />}>Content</Card>`
- `<Table columns={[{header, accessor, render, width, className}]} data={[]} onRowClick={(row) => {}} emptyMessage="..." headersVisible={true}>`
- `<Modal isOpen={true} onClose={() => {}} title="Title" subtitle="Sub" icon="lock" iconVariant="primary|danger|warning|success" footer={<Button />} maxWidth="max-w-md|max-w-lg|..." centerHeader={false}>`
- `<Tabs tabs={[{id, label, content}]} activeTab={id} onChange={(id) => {}} variant="line|pills">`
- `<Accordion items={[{id, title, content}]} allowMultiple={false}>`

### Feedback & Navigation
- `<Alert variant="info|success|warning|error" title="Warning" onClose={() => {}}>Content</Alert>`
- `<Toast message="Saved" variant="success" isOpen={true} onClose={() => {}} duration={3000}>`
- `<Pagination currentPage={1} totalPages={10} onPageChange={(page) => {}}>`
- `<Breadcrumbs items={[{label, icon}]} onNavigate={(item) => {}}>`

**Existing Code to Refactor:**
[Paste the code from your old file here]