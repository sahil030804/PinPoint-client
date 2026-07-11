# PinPoint UI/UX Audit Report

> **Date**: July 2026
> **Scope**: Full frontend codebase audit — 15 pages, 17 components, 24 hooks, 4 providers
> **Priority**: All items rated P2–P5 per AGENTS.md prioritization (P0/P1 already fixed)

---

## 1. Auth Pages

### 1.1 Registration Page — Manually Styled Inputs (P5)
- **File**: `src/app/auth/register/page.jsx`
- **Issue**: Input fields use manual Tailwind classes (`rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-blue-500 ...`) instead of `<Input />` component from shadcn.
- **Impact**: Inconsistent styling with the rest of the app. If the shadcn Input theme is updated, this page won't update.
- **Fix**: Replace with `<Input />`.

### 1.2 Registration Page — Inline reCAPTCHA Styles (P5)
- **File**: `src/app/auth/register/page.jsx`
- **Issue**: reCAPTCHA wrapper uses inline `style={{ transform: 'scale(0.85)', transformOrigin: '0 0' }}`.
- **Impact**: Breaks if CSP headers are tightened.
- **Fix**: Move to CSS classes.

### 1.3 Setup Workspace Page — Manually Styled (P5)
- **File**: `src/app/auth/setup-workspace/page.jsx`
- **Issue**: Entire form uses manual styling, not shadcn components.
- **Impact**: Inconsistent UX.

---

## 2. Dashboard Pages

### 2.1 Dashboard Page — `key={Math.random()}` Anti-Pattern (P3)
- **File**: `src/app/dashboard/page.jsx`
- **Issue**: Activity list items use `key={Math.random()}`, causing full re-render on every state change.
- **Impact**: Performance degradation. Lost scroll position, focus, and animation state on every update.
- **Fix**: Use actual `activity.id` from the API response.

### 2.2 Dashboard Page — TrendChart Missing Loading State (P4)
- **File**: `src/app/dashboard/page.jsx`
- **Issue**: `<TrendChart />` renders inline `style={{ height: 300 }}` container. No skeleton shown while dynamically imported chunks load.
- **Impact**: Layout shift when `recharts` (~200KB) eventually loads.
- **Fix**: Add a skeleton placeholder matched to the chart dimensions.

### 2.3 Dashboard Page — StatusCards Use Manual Styles (P5)
- **File**: `src/app/dashboard/page.jsx`
- **Issue**: Status cards at the top are manually styled divs, not `<Card />` from shadcn.
- **Fix**: Replace with `<Card>` component.

### 2.4 Dashboard Page — Activity List Emoji Icons (P5)
- **File**: `src/app/dashboard/page.jsx`
- **Issue**: Activity items use literal emoji characters (`📍`, `👤`, `🔄`, etc.) instead of Lucide icons.
- **Impact**: Emoji rendering varies across OS/browser; inconsistent visual weight; no accessibility labels.
- **Fix**: Replace with Lucide `Icon` components.

### 2.5 Inbox Page — Manually Styled Table (P4)
- **File**: `src/app/dashboard/inbox/page.jsx`
- **Issue**: Feedback list uses manually styled `<table>` with inline rendering. Not using `<Table>` from shadcn.
- **Impact**: Inconsistent table styling, missing responsive behavior.
- **Fix**: Replace with `<Table>` or `<DataTable>` component.

### 2.6 Inbox Page — No Bulk Actions (P3)
- **File**: `src/app/dashboard/inbox/page.jsx`
- **Issue**: No select-all checkbox or bulk status update. Each item must be opened individually.
- **Impact**: High friction for triaging >20 feedback items.
- **Fix**: Add checkbox column + floating action bar with "Mark as" dropdown.

### 2.7 Inbox Page — No Empty State (P4)
- **File**: `src/app/dashboard/inbox/page.jsx`
- **Issue**: When no feedback matches filters, an empty table body is shown (no rows) without a message.
- **Impact**: Confusing — user doesn't know if data is loading, empty, or filtered.
- **Fix**: Show `<EmptyState>` component.

### 2.8 Inbox Page — Manual Pagination Styling (P5)
- **File**: `src/app/dashboard/inbox/page.jsx`
- **Issue**: Pagination buttons are manually styled, not using shadcn Button or DataTable pagination.
- **Fix**: Use `DataTable` pagination or shadcn Button variants.

---

## 3. Project Pages

### 3.1 Projects Page — Create Project Modal (P4)
- **File**: `src/app/dashboard/projects/page.jsx`
- **Issue**: Create/edit project uses a manually implemented modal (fixed overlay div) with manually styled inputs.
- **Impact**: Inconsistent with rest of the app. No shared Dialog behavior (no ESC handling tested, no focus trap).
- **Fix**: Use `<Dialog>` from shadcn with `<Input>` component.

### 3.2 Projects Page — No Empty State (P5)
- **File**: `src/app/dashboard/projects/page.jsx`
- **Issue**: When no projects exist, only a "Create Project" button is shown without guidance.
- **Impact**: New users don't know what projects are or how to get started.
- **Fix**: Add `<EmptyState>` with onboarding copy.

### 3.3 Project Detail — Kanban Missing Drag-and-Drop (P3)
- **File**: `src/app/dashboard/projects/[id]/page.jsx`
- **Issue**: Kanban columns display feedback cards but don't support drag-and-drop to change status.
- **Impact**: Users must click into each feedback to change status — defeats the purpose of a Kanban view.
- **Fix**: Integrate `@dnd-kit/core` for drag-and-drop between columns.

### 3.4 Project Detail — KanbanCard Hover Mismatch (P5)
- **File**: `src/app/dashboard/projects/[id]/page.jsx`
- **Issue**: `KanbanCard` uses `rounded-xl` (12px) while JIRA standard is 3px.
- **Impact**: Visual inconsistency with the rest of the JIRA-themed UI.
- **Fix**: Use `rounded-[3px]`.

---

## 4. Feedback Detail Pages

### 4.1 Feedback Detail — Comment Section No Empty State (P4)
- **File**: `src/app/dashboard/projects/[id]/feedback/[feedbackId]/page.jsx`
- **Issue**: When there are no comments, the comment section is just empty space. No message like "No comments yet."
- **Impact**: Users may not realize they can add the first comment.
- **Fix**: Add `<EmptyState>` with "No comments yet. Be the first to comment."

### 4.2 Feedback Detail — InlineField Dropdown Manual Styling (P5)
- **File**: `src/components/feedback/FeedbackInlineField.jsx`
- **Issue**: The status/priority dropdown is manually implemented with `rounded-lg`, not using `<Select>` from shadcn.
- **Fix**: Replace with shadcn `<Select>` component.

### 4.3 Feedback Detail — Comment Textarea No Auto-Resize (P4)
- **File**: `src/app/dashboard/projects/[id]/feedback/[feedbackId]/page.jsx`
- **Issue**: Comment textarea is fixed height. No auto-grow as user types.
- **Impact**: Poor UX for longer comments — user must scroll within a small textarea.
- **Fix**: Use `textarea` with `rows={1}` + auto-resize via `onInput`.

### 4.4 Feedback Timeline — Emoji Icons (P5)
- **File**: `src/components/feedback/FeedbackTimeline.jsx`
- **Issue**: Uses emoji characters (`📍`, `👤`, `🔄`, etc.) instead of Lucide icons.
- **Impact**: Same as 2.4 — inconsistent rendering, no accessibility labels.
- **Fix**: Replace with Lucide icons.

### 4.5 Feedback Timeline — Comment Preview Truncation (P4)
- **File**: `src/components/feedback/FeedbackTimeline.jsx:51`
- **Issue**: Comment preview hardcodes `"...",` at the end: `"${activity.metadata?.preview || ''}..."`
- **Impact**: Even short comments get `...` appended. No way to see full comment inline.
- **Fix**: Only add `...` if the preview is actually truncated.

### 4.6 ScreenshotThumbnail — No Loading/Error State (P4)
- **File**: `src/components/feedback/ScreenshotThumbnail.jsx`
- **Issue**: `<img>` has no `onError` handler and no loading skeleton/shimmer.
- **Impact**: If the screenshot URL is broken or slow to load, user sees either a broken image icon or a flash of empty space.
- **Fix**: Add `onError` → show fallback icon, add `onLoad` skeleton.

---

## 5. Settings Pages

### 5.1 Settings Tabs Duplicated (P4)
- **Files**: `src/app/dashboard/settings/page.jsx:14-17`, `src/app/dashboard/settings/api-keys/page.jsx:13-16`
- **Issue**: `SETTINGS_TABS` is defined separately in both files with identical content.
- **Impact**: If a new settings tab is added, both files must be updated. Maintenance burden.
- **Fix**: Extract to a shared constants file.

### 5.2 Settings Page — Manually Styled Form (P5)
- **File**: `src/app/dashboard/settings/page.jsx`
- **Issue**: Form sections use manual Tailwind classes for layout and inputs.
- **Impact**: Inconsistent if shadcn Card/Input theme changes.
- **Fix**: Use `<Card>`, `<Input>`, `<Button>` from shadcn.

### 5.3 API Keys Page — Manually Styled Table (P5)
- **File**: `src/app/dashboard/settings/api-keys/page.jsx`
- **Issue**: API keys table is manually styled, not using `<Table>`.
- **Fix**: Use `<Table>` from shadcn.

### 5.4 API Keys Page — Create Modal Manual (P5)
- **File**: `src/app/dashboard/settings/api-keys/page.jsx`
- **Issue**: Create API key modal and revoke confirmation are manually implemented.
- **Impact**: Same as 3.1 — no shared Dialog behavior.
- **Fix**: Use `<Dialog>` from shadcn.

### 5.5 Settings — No Members Management Page (P3)
- **File**: Not found
- **Issue**: There is no members/team management page. `SETTINGS_TABS` only lists "General" and "API Keys". Invitation is handled via a banner on the dashboard.
- **Impact**: Workspace owners cannot see/manage their team members' roles or remove members.
- **Fix**: Add `/dashboard/settings/members` page using `useWorkspaceMembers` / `useInviteMember` / `useUpdateMember` / `useRemoveMember`.

### 5.6 Settings — No Notifications Page (P3)
- **File**: Not found
- **Issue**: `useNotifications` and `useMarkNotificationRead` hooks exist but there is no notifications page.
- **Impact**: Notifications cannot be browsed or managed.
- **Fix**: Add `/dashboard/settings/notifications` page.

### 5.7 Settings — Webhook Section Uses Non-JIRA Colors (P5)
- **File**: `src/app/dashboard/settings/page.jsx`
- **Issue**: `bg-green-50`, `bg-red-50`, `bg-purple-50`, `bg-gradient-to-r from-purple-50 to-blue-50` — these are Tailwind defaults, not JIRA palette colors.
- **Impact**: Visual inconsistency with the JIRA-themed UI.
- **Fix**: Use JIRA palette colors (G50, R50, P50, B50).

---

## 6. Global/Shared Components

### 6.1 RadixSelect — Wrong Border Radius (P5)
- **File**: `src/components/common/RadixSelect.jsx:9,16`
- **Issue**: Uses `rounded-lg` (8px) instead of JIRA's 3px.
- **Impact**: Visual inconsistency.
- **Fix**: Change to `rounded-[3px]`.

### 6.2 ErrorBoundary — Improper Icon (P5)
- **File**: `src/components/common/ErrorBoundary.jsx:19`
- **Issue**: Uses literal `!` character instead of a proper icon component.
- **Impact**: Unpolished feel. No dark mode consideration for the icon.
- **Fix**: Use `AlertTriangle` from Lucide.

### 6.3 Toast — Only Success/Error Types (P4)
- **File**: `src/providers/ToastProvider.jsx`, `src/components/common/Toast.jsx`
- **Issue**: Toast only supports `success` (green) and `error` (red) types. No `info` (blue) or `warning` (yellow).
- **Impact**: Cannot show informational toasts (e.g., "Background sync in progress").
- **Fix**: Add `info` and `warning` toast types.

### 6.4 ThemeProvider — No Transition on Theme Switch (P5)
- **File**: `src/providers/ThemeProvider.jsx`
- **Issue**: Dark/light mode change is instant with no CSS transition.
- **Impact**: Jarring visual switch.
- **Fix**: Add `transition-colors duration-300` to `<html>` or a root element.

### 6.5 QueryProvider — `refetchOnWindowFocus` Default `false` (P2)
- **File**: `src/providers/QueryProvider.jsx:14`
- **Issue**: Default is `refetchOnWindowFocus: false`. While `useWebsiteFeedback` and `useWorkspaceFeedback` override this to `true`, many other queries do not.
- **Impact**: If two browser tabs are open, changes in one tab won't auto-refresh in the other for most queries.
- **Fix**: Change default to `true` and selectively disable for expensive queries.

### 6.6 Invitation Banner — Non-JIRA Colors (P5)
- **File**: `src/app/dashboard/layout.jsx`
- **Issue**: Invitation banner uses `border-amber-500 bg-amber-50` — Tailwind defaults.
- **Impact**: Visual inconsistency.
- **Fix**: Use JIRA palette (Y50/Y500 equivalents).

---

## 7. Overall Style Inconsistencies

### 7.1 Mixed Border Radii (P5)
- **Scope**: Throughout the entire codebase
- **Issue**: Multiple border-radius conventions coexist:
  - `rounded-[3px]` — JIRA theme (correct, used in globals.css and some components)
  - `rounded-lg` — 8px (most common, used in manual styles)
  - `rounded-xl` — 12px (KanbanCard)
  - `rounded-full` — pills/badges (correct)
  - `rounded-md` — 6px (occasional)
- **Impact**: Visual inconsistency. Some elements look rounded-soft while others are JIRA-sharp.
- **Fix**: Audit every file for border-radius and standardize on `rounded-[3px]` for cards, inputs, buttons, modals. Keep `rounded-full` only for badges and pills.

### 7.2 Mixed shadcn and Manual Implementations (P4)
- **Scope**: Throughout
- **Issue**: Some pages use shadcn components (`<Button>`, `<Badge>`, `<Card>`, `<Table>`), others use completely manual Tailwind styling with identical visual intent.
- **Impact**: Theme changes require updating both shadcn component classes AND manual inline classes. Maintenance burden grows with every new page.
- **Fix**: Replace manual implementations with shadcn components systematically.

### 7.3 Inconsistent Skeleton/Loading Patterns (P4)
- **Scope**: Throughout
- **Issue**: Skeleton loading varies:
  - `animate-pulse` with gray blocks (most common)
  - Nothing (ScreenshotThumbnail)
  - Loading spinner in center (some pages)
- **Impact**: Inconsistent loading experience.
- **Fix**: Create a `<Skeleton>` component (or use shadcn's) and use it everywhere.

### 7.4 Missing Lucide Icons for Actions (P5)
- **Scope**: Throughout manual modals and buttons
- **Issue**: Buttons like "Cancel", "Create", "Save", "Delete" are text-only in many places. No icon prefix.
- **Impact**: Less scannable UI.
- **Fix**: Add Lucide icons to action buttons (`X` for Cancel, `Plus` for Create, `Trash2` for Delete).

---

## 8. Accessibility Issues

### 8.1 No Focus Trap in Modals (P2)
- **Files**: All manual modal implementations
- **Issue**: Manual modals (Create Project, Create API Key, Revoke Confirmation) don't trap keyboard focus. Tab navigation escapes the modal.
- **Impact**: Keyboard-only users can't use these dialogs. WCAG 2.4.3 violation.
- **Fix**: Use `<Dialog>` from shadcn which includes `@radix-ui/react-dialog` with built-in focus management.

### 8.2 No ARIA Labels on Emoji Icons (P4)
- **Files**: `FeedbackTimeline.jsx`, `Dashboard page.jsx`
- **Issue**: Emoji icons used as action indicators have no `role="img"` or `aria-label`.
- **Impact**: Screen readers read the emoji name (e.g., "pinching hand" for `📍`), which is confusing.
- **Fix**: Replace with Lucide icons (which have native SVG title support) or add `aria-label`.

### 8.3 No `htmlFor` on Some Labels (P5)
- **Files**: Various manual forms
- **Issue**: Some `<label>` elements don't have `htmlFor` attributes linking to `<input id="...">`.
- **Impact**: Screen readers can't associate labels with inputs.
- **Fix**: Add matching `htmlFor`/`id` pairs.

---

## 9. Performance Issues

### 9.1 No Dedicated Empty States — Unnecessary Re-renders (P4)
- **Scope**: Multiple pages
- **Issue**: Instead of early-returning `<EmptyState>`, some pages render empty tables/lists that require conditional rendering checks throughout the template.
- **Impact**: More complex rendering logic.
- **Fix**: Always use `<EmptyState>` pattern for zero-data cases.

### 9.2 TanStack Query Default `refetchOnWindowFocus: false` (P2) *(Repeated from 6.5)*
- Already documented above as P2 priority.
- **Impact**: Stale data in multi-tab scenarios.

---

## Summary

| Area | P2 | P3 | P4 | P5 |
|------|----|----|----|----|
| Auth Pages | 0 | 0 | 0 | 3 |
| Dashboard | 0 | 1 | 1 | 3 |
| Inbox | 0 | 1 | 2 | 1 |
| Projects | 0 | 1 | 1 | 1 |
| Feedback Detail | 0 | 0 | 3 | 2 |
| Settings | 0 | 2 | 1 | 4 |
| Global/Shared | 1 | 0 | 2 | 3 |
| Overall | 0 | 0 | 2 | 3 |
| Accessibility | 1 | 0 | 1 | 1 |
| Performance | 1 | 0 | 1 | 0 |
| **Total** | **3** | **5** | **14** | **21** |

**43 issues total** — 3 P2, 5 P3, 14 P4, 21 P5.

### Recommended Immediate Actions (P2)
1. ✅ Already fixed: Stale data after mutations (P0) — cache invalidation + optimistic updates
2. ✅ Already fixed: Stale server cache keys (P0) — SCAN pattern fix
3. **6.5/9.2**: Change `refetchOnWindowFocus` default to `true` — multi-tab data freshness
4. **8.1**: Add focus trap to all modals — keyboard accessibility

### Recommended Short-term (P3)
1. **2.1**: Fix `key={Math.random()}` anti-pattern
2. **2.6**: Add bulk actions to inbox
3. **3.3**: Add drag-and-drop to Kanban
4. **5.5**: Add members management page
5. **5.6**: Add notifications page
