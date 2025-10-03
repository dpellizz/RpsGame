# Prompt for React Accessibility & E2E Test Preparation

Analyze the following React component and enhance it to maximize accessibility and E2E test robustness.

Focus on the following:

1. **Add appropriate ARIA attributes** to identify the roles, states, and properties of UI elements.
2. **Ensure full keyboard navigation support**, including tab order and focus visibility.
3. **Use semantic HTML elements** instead of generic containers (`<div>`, `<span>`) where appropriate.
4. **Assign descriptive `aria-label` or `aria-labelledby` attributes** to elements lacking textual content.
5. **Integrate `data-testid` or `data-qa` attributes** as a fallback for selectors when ARIA or semantics are insufficient.
6. **Provide improved JSX output**, with:
   - Inline comments explaining each accessibility change
   - Justification for replacing or modifying tags and attributes

**ARIA Attributes to Consider:**
- **Labels**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **States**: `aria-expanded`, `aria-checked`, `aria-selected`, `aria-disabled`, `aria-invalid`
- **Properties**: `aria-required`, `aria-readonly`, `aria-hidden`, `aria-live`, `aria-busy`
- **Relationships**: `aria-controls`, `aria-owns`, `aria-activedescendant`
- **Roles**: `role="button"`, `role="dialog"`, `role="alert"`, `role="status"`, `role="navigation"`

**Semantic HTML Priority:**
- Replace `<div>` with semantic alternatives:
  - `<button>` for clickable actions
  - `<nav>` for navigation
  - `<main>` for main content
  - `<header>`, `<footer>` for page sections
  - `<article>`, `<section>` for content grouping
  - `<form>` for user input collection
- Use native form elements (`<input>`, `<select>`, `<textarea>`) instead of custom components when possible.
- Always pair `<label>` with form inputs using `htmlFor` attribute.

**Form Accessibility Pattern:**
```tsx
{/* ✅ Accessible form with labels and error handling */}
<form data-testid="login-form">
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    name="email"
    aria-required="true"
    aria-invalid={hasEmailError}
    aria-describedby={hasEmailError ? 'email-error' : undefined}
    data-testid="email-input"
  />
  {hasEmailError && (
    <span 
      id="email-error" 
      role="alert"
      data-testid="email-error"
    >
      {/* Error message provides context via aria-describedby */}
      Please enter a valid email address
    </span>
  )}
</form>
```

**Button Accessibility Pattern:**
```tsx
{/* ✅ Icon button with proper labeling for screen readers */}
<button
  aria-label="Close dialog"
  onClick={handleClose}
  data-testid="close-dialog-btn"
>
  {/* Icon needs aria-hidden since button has aria-label */}
  <CloseIcon aria-hidden="true" />
</button>

{/* ✅ Toggle button with state announcement */}
<button
  role="switch"
  aria-checked={isEnabled}
  aria-label="Enable notifications"
  onClick={toggleNotifications}
  data-testid="notifications-toggle"
>
  {isEnabled ? 'Enabled' : 'Disabled'}
</button>
```

**Modal/Dialog Accessibility Pattern:**
```tsx
{/* ✅ Accessible modal with focus trap and proper labeling */}
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  data-testid="confirmation-dialog"
>
  <h2 id="dialog-title">
    {/* Title referenced by aria-labelledby */}
    Confirm Delete
  </h2>
  <p id="dialog-description">
    {/* Description referenced by aria-describedby */}
    Are you sure you want to delete this item? This action cannot be undone.
  </p>
  <button 
    onClick={handleCancel}
    data-testid="cancel-btn"
  >
    Cancel
  </button>
  <button 
    onClick={handleConfirm}
    data-testid="confirm-btn"
  >
    Confirm
  </button>
</div>
```

**Dynamic Content Pattern:**
```tsx
{/* ✅ Loading state announced to screen readers */}
<div 
  aria-live="polite" 
  aria-busy={isLoading}
  data-testid="content-container"
>
  {isLoading ? 'Loading data...' : <ContentComponent data={data} />}
</div>

{/* ✅ Error announcement with assertive priority */}
{errorMessage && (
  <div 
    role="alert" 
    aria-live="assertive"
    data-testid="error-alert"
  >
    {/* Alert role + aria-live ensures immediate announcement */}
    {errorMessage}
  </div>
)}
```

**Navigation Pattern:**
```tsx
{/* ✅ Accessible navigation with current page indicator */}
<nav aria-label="Main navigation" data-testid="main-nav">
  <ul role="list">
    <li>
      <a 
        href="/home"
        aria-current={currentPage === 'home' ? 'page' : undefined}
        data-testid="nav-home-link"
      >
        {/* aria-current announces which page is active */}
        Home
      </a>
    </li>
    <li>
      <a 
        href="/products"
        aria-current={currentPage === 'products' ? 'page' : undefined}
        data-testid="nav-products-link"
      >
        Products
      </a>
    </li>
  </ul>
</nav>
```

**Keyboard Navigation Requirements:**
- All interactive elements must be keyboard accessible (tab, enter, space).
- Custom interactive components need `tabIndex={0}` and `onKeyDown` handlers.
- Modal/dialog must trap focus within the component.
- Provide visible focus indicators (don't remove `:focus` styles).

**data-testid Naming Convention:**
- Use consistent, descriptive names: `{component}-{element}-{type}`
- Examples:
  - `login-form`, `email-input`, `submit-btn`
  - `user-profile-card`, `edit-profile-btn`
  - `confirmation-dialog`, `cancel-btn`, `confirm-btn`
  - `error-message`, `success-alert`

**WCAG 2.1 Level AA Compliance Checklist:**
- ✅ All images have `alt` text or `aria-label`
- ✅ Form inputs have associated `<label>` elements
- ✅ Interactive elements are keyboard accessible
- ✅ Color is not the only means of conveying information
- ✅ Error messages are programmatically associated with inputs
- ✅ Focus order is logical and predictable
- ✅ Page has proper heading hierarchy (h1 → h2 → h3)

**Output Format:**
The final version should be:
- **Fully accessible** according to WCAG 2.1 Level AA standards
- **Ready for stable E2E testing** with proper test IDs and semantic locators
- **Maintainable and understandable** by frontend developers
- **Well-documented** with inline comments explaining accessibility decisions

Provide the enhanced JSX with detailed explanations for each change made.