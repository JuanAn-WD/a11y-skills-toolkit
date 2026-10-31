# ARIA patterns (based on the WAI-ARIA Authoring Practices Guide)

Source: https://www.w3.org/WAI/ARIA/apg/patterns/ . Prefer native HTML; use these templates only when needed, and implement the full keyboard model, not just the attributes. Framework-neutral HTML is shown; translate to the project's stack.

## 1. Modal dialog

Prefer native `<dialog>` with `showModal()`.

```html
<button type="button" id="open-settings">Settings</button>

<dialog id="settings" aria-labelledby="settings-title">
  <h2 id="settings-title">Settings</h2>
  <form method="dialog">
    <label for="name">Display name</label>
    <input id="name" name="name" autocomplete="nickname" autofocus />
    <button value="cancel">Cancel</button>
    <button value="save">Save</button>
  </form>
</dialog>
```

```js
const trigger = document.getElementById('open-settings');
const dialog = document.getElementById('settings');
trigger.addEventListener('click', () => dialog.showModal());
dialog.addEventListener('close', () => {
  // Most current browsers restore focus to the previously focused element;
  // set it explicitly when the trigger may have been re-rendered (SPAs).
  if (document.activeElement === document.body) trigger.focus();
});
```

What `showModal()` gives you: top-layer rendering, the rest of the document becomes inert (not focusable, hidden from AT), `Esc` fires `cancel` and closes. What it does not: an accessible name (add `aria-labelledby`), a thoughtful initial focus (use `autofocus` on the first field, or on the dialog's least destructive action), scroll locking of the page behind.

Do not add a manual focus trap. Do not open with `show()` when you need modal behaviour (`show()` is non-modal).

Custom `role="dialog"` (only if `<dialog>` cannot be used): `role="dialog" aria-modal="true" aria-labelledby`, move focus in on open, trap Tab/Shift+Tab, `Esc` closes, make background `inert`, return focus to the trigger.

## 2. Disclosure (show/hide) and navigation dropdown

```html
<button type="button" aria-expanded="false" aria-controls="products-panel">Products</button>
<div id="products-panel" hidden>
  <ul>
    <li><a href="/shoes">Shoes</a></li>
    <li><a href="/bags">Bags</a></li>
  </ul>
</div>
```

- Toggle `aria-expanded` and the `hidden` attribute together.
- `Esc` closes the panel and returns focus to the button (when focus is inside or on the button).
- Tab moves through links normally; no focus trap, no arrow-key requirement.
- Site navigation menus should use this pattern, NOT `role="menu"`.
- `<details>/<summary>` is a valid native alternative for simple disclosures.

## 3. Menu button (application menu)

Use only for application-style action menus (like a desktop "File" menu), not for site navigation.

```html
<button type="button" id="actions-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="actions-menu">Actions</button>
<ul id="actions-menu" role="menu" aria-labelledby="actions-btn" hidden>
  <li role="menuitem" tabindex="-1">Rename</li>
  <li role="menuitem" tabindex="-1">Duplicate</li>
  <li role="menuitem" tabindex="-1">Delete</li>
</ul>
```

Keyboard: `Enter`/`Space`/`ArrowDown` opens and focuses the first item; `ArrowUp` opens and focuses the last; `ArrowDown`/`ArrowUp` move (wrap optional); `Home`/`End`; `Esc` closes and returns focus to the button; `Tab` closes the menu. Selecting an item activates it and closes the menu. Use roving `tabindex` or `aria-activedescendant`.

## 4. Tabs

```html
<div role="tablist" aria-label="Account">
  <button role="tab" id="tab-profile" aria-selected="true" aria-controls="panel-profile">Profile</button>
  <button role="tab" id="tab-billing" aria-selected="false" aria-controls="panel-billing" tabindex="-1">Billing</button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" tabindex="0">...</div>
<div role="tabpanel" id="panel-billing" aria-labelledby="tab-billing" tabindex="0" hidden>...</div>
```

- Only the selected tab is in the Tab sequence (`tabindex="-1"` on others).
- `ArrowLeft`/`ArrowRight` move between tabs (`ArrowUp`/`ArrowDown` with `aria-orientation="vertical"`), `Home`/`End` first/last.
- Automatic activation (select on focus) is fine when panels render instantly; use manual activation (`Enter`/`Space`) when switching is slow.
- Update `aria-selected`, `tabindex` and panel `hidden` together.
- `tabindex="0"` on the panel only if it has no focusable content.

## 5. Accordion

```html
<h3>
  <button type="button" aria-expanded="false" aria-controls="sect-shipping" id="acc-shipping">Shipping</button>
</h3>
<div id="sect-shipping" role="region" aria-labelledby="acc-shipping" hidden>...</div>
```

- Each header is a button inside a heading of the right level.
- `Enter`/`Space` toggles. Arrow-key navigation between headers is optional.
- `role="region"` is optional; avoid it when there are many panels (landmark noise).

## 6. Combobox (editable, list autocomplete)

Prefer a native `<select>` or `<input list>` + `<datalist>` when they meet the need, or a vetted library (React Aria, Headless UI, Downshift).

```html
<label for="city">City</label>
<input id="city" type="text" role="combobox" aria-autocomplete="list"
       aria-expanded="false" aria-controls="city-list" autocomplete="off" />
<ul id="city-list" role="listbox" aria-label="Cities" hidden>
  <li role="option" id="city-1" aria-selected="false">Madrid</li>
  <li role="option" id="city-2" aria-selected="false">Málaga</li>
</ul>
<div role="status" aria-live="polite" class="sr-only"></div>
```

- DOM focus stays in the input; set `aria-activedescendant` to the highlighted option id.
- `ArrowDown` opens/moves next, `ArrowUp` previous, `Enter` accepts, `Esc` closes (second `Esc` may clear), `Alt+ArrowDown` opens without moving.
- Toggle `aria-expanded` with the popup; mark the highlighted option `aria-selected="true"`.
- Announce result counts in a polite live region ("5 results").
- `autocomplete="off"` here only disables browser autofill for the search widget; do not use it on login fields (3.3.8).

## 7. Form field with error

```html
<label for="email">Email <span aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
<input id="email" type="email" autocomplete="email" required
       aria-invalid="true" aria-describedby="email-hint email-error" />
<p id="email-hint">We will send the receipt here.</p>
<p id="email-error"><svg aria-hidden="true">...</svg> Enter an email like name@example.com</p>
```

- Error in text plus icon, not color only (1.4.1, 3.3.1). Suggest a fix (3.3.3).
- On submit with errors, move focus to an error summary (with links to fields) or the first invalid field.

## 8. Live status message

```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only" id="cart-status"></div>
```

The region must be in the DOM before its text changes; update `textContent`. Use `role="alert"` only for urgent, time-sensitive errors.

## 9. Visually hidden utility

```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
```

Tailwind ships `sr-only` / `not-sr-only`.
