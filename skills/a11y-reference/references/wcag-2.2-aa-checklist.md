# WCAG 2.2 Level A + AA checklist

Normative source: https://www.w3.org/TR/WCAG22/ (W3C Recommendation, 12 December 2024 edition). Understanding docs: https://www.w3.org/WAI/WCAG22/Understanding/

This is a working checklist, not a substitute for the normative text. Wording is paraphrased.

## How to read the "Check" column

- **Auto**: axe-core has rules that can detect common failures. A clean automated result is NOT a Pass by itself; it only means no detectable failure.
- **Partial**: automation catches some failures; a manual check is still required for a Pass.
- **Manual**: needs human judgment, interaction or content review.

Automated tools detect only a portion of WCAG failures. Never derive a conformance claim from them.

## 1. New in WCAG 2.2 (A and AA)

| SC | Level | Requirement (paraphrased) | Common failures | Check |
| --- | --- | --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | AA | When a component receives keyboard focus, it is not entirely hidden by author-created content. | Sticky header/footer, cookie banner or chat widget fully covering the focused element while tabbing. Fix: `scroll-padding-top`/`scroll-padding-bottom` equal to sticky heights, non-modal banners that do not overlap focus. | Manual (scanner `--checks keyboard` flags candidates) |
| 2.5.7 Dragging Movements | AA | Functionality that uses dragging can also be done with a single pointer without dragging, unless dragging is essential. | Sortable lists, sliders, kanban boards, map panning with drag only. Fix: move up/down buttons, click-to-place, input fields. | Manual |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets are at least 24x24 CSS px, **except**: **Spacing** (a 24px-diameter circle centred on the target's bounding box does not intersect another target or its circle); **Equivalent** (the same function is available via another conforming control on the page); **Inline** (target is in a sentence or its size is constrained by line height of non-target text); **User agent control** (size set by the browser, not the author); **Essential** (the presentation is essential or legally required). | Tiny icon buttons packed together, pagination numbers, close "x" icons. Fix: padding to enlarge the hit area without changing the visual icon. | Partial (axe `target-size`) |
| 3.2.6 Consistent Help | A | If help mechanisms (contact details, human contact, self-help, automated contact) are repeated on multiple pages, they appear in the same relative order. | Help link moves between header and footer on different pages. | Manual |
| 3.3.7 Redundant Entry | A | Information already entered or provided in the same process is auto-populated or selectable, unless re-entry is essential, needed for security, or the info is no longer valid. | Asking for the shipping address again for billing with no "same as shipping" option. | Manual |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive function test (remembering, transcribing, solving) for any authentication step, unless an alternative, a mechanism to assist (paste, password managers), object recognition, or personal content recognition is provided. | Blocking paste in password or OTP fields, `autocomplete="off"` on login, puzzle CAPTCHA without alternative. | Manual (check `autocomplete`, paste handlers) |

Removed in 2.2: **4.1.1 Parsing** is obsolete and no longer required for WCAG 2.2. Do not report HTML validation errors as 4.1.1 failures under 2.2 (they may still cause 1.3.1 or 4.1.2 failures).

AAA additions (optional, never report as AA failures): 2.4.12 Focus Not Obscured (Enhanced), 2.4.13 Focus Appearance, 3.3.9 Accessible Authentication (Enhanced).

## 2. All Level A and AA criteria

| SC | Level | Short requirement | Typical failure | Check |
| --- | --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | Text alternative for non-text content; decorative images hidden from AT. | Missing `alt`; `alt="image"`; icon button with no name. | Partial |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | Transcript or equivalent. | Podcast with no transcript. | Manual |
| 1.2.2 Captions (Prerecorded) | A | Captions for prerecorded video with audio. | Auto-captions not reviewed / none. | Manual |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | Audio description or full text alternative. | Visual-only information in video. | Manual |
| 1.2.4 Captions (Live) | AA | Captions for live audio in synchronized media. | Live stream with no captions. | Manual |
| 1.2.5 Audio Description (Prerecorded) | AA | Audio description for prerecorded video. | None provided. | Manual |
| 1.3.1 Info and Relationships | A | Structure and relationships conveyed visually are programmatically determinable. | Fake headings (`<div class="h2">`), tables without headers, inputs without associated labels, groups without `fieldset`. | Partial |
| 1.3.2 Meaningful Sequence | A | Reading order is meaningful. | CSS reordering that breaks DOM order. | Manual |
| 1.3.3 Sensory Characteristics | A | Instructions do not rely only on shape, position, sound. | "Click the round button on the right". | Manual |
| 1.3.4 Orientation | AA | Not locked to portrait/landscape unless essential. | Orientation lock. | Manual |
| 1.3.5 Identify Input Purpose | AA | Inputs collecting user data have programmatic purpose. | Missing/invalid `autocomplete` tokens. | Partial (axe `autocomplete-valid`) |
| 1.4.1 Use of Color | A | Color is not the only visual means of conveying info. | Error shown only by red border; links distinguished only by color in body text. | Partial |
| 1.4.2 Audio Control | A | Auto-playing audio > 3s can be paused/stopped or volume controlled. | Autoplay background audio. | Manual |
| 1.4.3 Contrast (Minimum) | AA | Text 4.5:1; large text (24px, or 18.66px bold) 3:1. | Light grey placeholder-like text. | Auto (cannot evaluate text over images/gradients) |
| 1.4.4 Resize Text | AA | Text resizable to 200% without loss of content or function. | Fixed-height containers clipping text. | Manual |
| 1.4.5 Images of Text | AA | Use real text, not images of text (unless essential/customizable). | Banner text baked into images. | Manual |
| 1.4.10 Reflow | AA | No two-dimensional scrolling at 320 CSS px width (vertical content), except where 2D layout is essential (maps, data tables). | Fixed-width layouts, wide forms. | Partial (scanner `--checks reflow`) |
| 1.4.11 Non-text Contrast | AA | UI component boundaries/states and meaningful graphics 3:1. | Faint input borders, low-contrast focus ring, icon-only controls. | Manual |
| 1.4.12 Text Spacing | AA | No loss of content when users override line height 1.5, paragraph spacing 2x, letter 0.12em, word 0.16em. | Clipped text in fixed-height buttons. | Manual |
| 1.4.13 Content on Hover or Focus | AA | Extra content on hover/focus is dismissible (Esc), hoverable, persistent. | Tooltips that vanish when moving pointer onto them; no Esc. | Manual |
| 2.1.1 Keyboard | A | All functionality operable by keyboard. | Click handlers on `div`; custom widgets without key handling. | Partial |
| 2.1.2 No Keyboard Trap | A | Focus can move away with keyboard. | Embedded widgets, poorly coded modals. | Manual |
| 2.1.4 Character Key Shortcuts | A | Single-character shortcuts can be turned off, remapped, or only active on focus. | Global "s" shortcut. | Manual |
| 2.2.1 Timing Adjustable | A | Time limits can be turned off, adjusted or extended (with exceptions). | Session timeout with no warning. | Manual |
| 2.2.2 Pause, Stop, Hide | A | Moving/blinking/auto-updating content > 5s can be paused/stopped/hidden. | Carousels without pause. | Manual |
| 2.3.1 Three Flashes or Below Threshold | A | No content flashes more than 3 times per second (above thresholds). | Flashing animations. | Manual |
| 2.4.1 Bypass Blocks | A | Mechanism to bypass repeated blocks. A skip link is the common technique; landmarks/headings can also satisfy it. | Long nav with no skip link and no landmarks. | Partial |
| 2.4.2 Page Titled | A | Pages have descriptive titles. | Same `<title>` on every SPA route. | Partial |
| 2.4.3 Focus Order | A | Focus order preserves meaning and operability. | Positive `tabindex`; focus not moved into opened dialog. | Manual |
| 2.4.4 Link Purpose (In Context) | A | Link purpose determinable from link text or context. | "Click here", "Read more" without context. | Partial |
| 2.4.5 Multiple Ways | AA | More than one way to locate a page within a set (except process steps). | No search, sitemap or nav. | Manual |
| 2.4.6 Headings and Labels | AA | Headings and labels describe topic or purpose. | Vague labels. | Manual |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator is visible. | `outline: none` with no replacement. | Partial (scanner `--checks keyboard`) |
| 2.4.11 Focus Not Obscured (Minimum) | AA | See section 1. | | Manual |
| 2.5.1 Pointer Gestures | A | Multipoint/path gestures have single-pointer alternative. | Pinch-only zoom on maps without buttons. | Manual |
| 2.5.2 Pointer Cancellation | A | Single-pointer actions complete on up-event or can be aborted/undone. | Actions on `mousedown`. | Manual |
| 2.5.3 Label in Name | A | Accessible name contains the visible label text. | Visible "Search", `aria-label="Find products"`. | Partial |
| 2.5.4 Motion Actuation | A | Motion-triggered functions have UI alternative and can be disabled. | Shake to undo only. | Manual |
| 2.5.7 Dragging Movements | AA | See section 1. | | Manual |
| 2.5.8 Target Size (Minimum) | AA | See section 1 (with exceptions). | | Partial |
| 3.1.1 Language of Page | A | Default language programmatically set. | Missing/invalid `<html lang>`. | Auto |
| 3.1.2 Language of Parts | AA | Language changes marked up. | Quotes in another language without `lang`. | Manual |
| 3.2.1 On Focus | A | Focus does not trigger change of context. | Opening a new page on focus. | Manual |
| 3.2.2 On Input | A | Changing a setting does not auto-change context without warning. | Select that navigates on change. | Manual |
| 3.2.3 Consistent Navigation | AA | Repeated navigation in the same relative order. | Menu order differs per page. | Manual |
| 3.2.4 Consistent Identification | AA | Same function, same identification. | Same icon labelled differently. | Manual |
| 3.2.6 Consistent Help | A | See section 1. | | Manual |
| 3.3.1 Error Identification | A | Errors identified and described in text. | Red border only. | Manual |
| 3.3.2 Labels or Instructions | A | Labels or instructions provided for user input. | Placeholder as the only label (axe accepts a placeholder as the accessible name, so this passes automated scans; verified with the fixture `form.html`). | Partial |
| 3.3.3 Error Suggestion | AA | Suggest corrections when known. | "Invalid input" with no hint. | Manual |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Reversible, checked, or confirmed submissions. | One-click purchase with no review. | Manual |
| 3.3.7 Redundant Entry | A | See section 1. | | Manual |
| 3.3.8 Accessible Authentication (Minimum) | AA | See section 1. | | Manual |
| 4.1.2 Name, Role, Value | A | Name, role, states programmatically determinable and updated. | Custom toggles without `aria-pressed`/`aria-expanded`; unnamed buttons. | Partial |
| 4.1.3 Status Messages | AA | Status messages announced without focus change. | "Added to cart" not announced. | Manual |

## 3. Best practices that are NOT WCAG failures by themselves

Report these under "Best practice", never as Fail:

- Skipped heading levels (`h2` -> `h4`). 1.3.1 requires headings to be marked up as headings; it does not require a strict sequence. 2.4.6 is about descriptiveness.
- One `<h1>` per page.
- All content inside landmarks (axe `region`).
- Redundant `title` attributes, `aria-label` duplicating visible text (unless it breaks 2.5.3).
- Focus indicator thickness/contrast beyond 1.4.11 and 2.4.7 (2.4.13 is AAA).
